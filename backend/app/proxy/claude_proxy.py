import httpx
from fastapi import APIRouter, Request, Depends, HTTPException
import os

from app.api.auth import require_role
from app.models.domain import User
from app.proxy.tracker import track_tokens
from app.rules.evaluator import evaluate_rules
from app.detectors.spike_detector import detect_spike
from app.detectors.loop_detector import detect_loop
from app.detectors.injection_detector import score_prompt
from app.detectors.key_leak_detector import detect_key_compromise
from app.worker import celery_app
import tiktoken

router = APIRouter()

# In production this would come from a secure vault or database
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

def count_tokens(messages: list, model: str = "gpt-3.5-turbo") -> int:
    """Rough approximation of tokens. Use tiktoken or anthropic counters."""
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")
    
    num_tokens = 0
    full_prompt_text = ""
    for message in messages:
        num_tokens += 4
        for key, value in message.items():
            if isinstance(value, str):
                num_tokens += len(encoding.encode(value))
                full_prompt_text += f"{value}\n"
    num_tokens += 2
    return num_tokens, full_prompt_text

@router.post("/v1/messages")
async def proxy_claude(request: Request, user: User = Depends(require_role(["admin", "manager", "developer"]))):
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    messages = body.get("messages", [])
    model = body.get("model", "claude-3-opus-20240229")
    
    # Pre-computation of input tokens
    tokens_in, full_prompt_text = count_tokens(messages, "gpt-3.5-turbo")

    # DETECTORS
    user_id_str = str(user.id)
    client_ip = request.headers.get("X-Forwarded-For", request.client.host)
    
    # 1. Key Leak Check
    # (In reality, we'd use the hashed API key used in auth)
    compromise_score = await detect_key_compromise(user_id_str, client_ip, model)
    if compromise_score > 85:
        raise HTTPException(status_code=403, detail="API Key compromise detected. Key blocked.")
        
    # 2. Injection Scanner
    injection_result = score_prompt(full_prompt_text)
    if injection_result['blocked']:
        raise HTTPException(status_code=403, detail="Prompt Injection Detected. Request blocked.")

    # 3. Infinite Loop
    is_loop = await detect_loop(user_id_str, full_prompt_text)
    if is_loop:
        raise HTTPException(status_code=429, detail="Infinite loop detected. Too many identical prompts.")
        
    # 4. Context Size Limiter
    if tokens_in > 190000:
        raise HTTPException(status_code=429, detail="Maximum context window exceeded.")
    elif tokens_in > 100000 and "opus" not in model.lower():
        pass # Log warning

    # 5. Token Spike Detection
    spike_result = await detect_spike(user_id_str, tokens_in)
    if spike_result['is_spike'] and spike_result['severity'] in ['critical', 'emergency']:
        alert_data = {
            "severity": spike_result['severity'],
            "rule_name": "Massive Token Spike Detected",
            "user_id": user_id_str,
            "tokens_used": tokens_in,
            "action_taken": "Logged",
            "channels": ["slack", "discord"]
        }
        celery_app.send_task("app.worker.process_alert", args=[alert_data])

    # Forward to Anthropic API
    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=500, detail="Anthropic API key not configured")

    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": request.headers.get("anthropic-version", "2023-06-01"),
        "content-type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        try:
            anthropic_response = await client.post(
                "https://api.anthropic.com/v1/messages",
                json=body,
                headers=headers,
                timeout=60.0
            )
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Error contacting Anthropic: {str(e)}")

    if anthropic_response.status_code != 200:
        return anthropic_response.json() # Pass the error through

    response_data = anthropic_response.json()
    
    # Extract usage from Anthropic's response
    usage = response_data.get("usage", {})
    tokens_out = usage.get("output_tokens", 0)
    actual_tokens_in = usage.get("input_tokens", tokens_in) # Use their exact count

    # Record usage
    await track_tokens(str(user.id), actual_tokens_in, tokens_out, model)
    await evaluate_rules(str(user.id), actual_tokens_in + tokens_out)

    return response_data
