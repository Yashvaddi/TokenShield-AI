import httpx
from fastapi import APIRouter, Request, Depends, HTTPException
import os
import tiktoken

from app.api.auth import get_current_user, require_role
from app.models.domain import User
from app.proxy.tracker import track_tokens
from app.rules.evaluator import evaluate_rules
from app.detectors.spike_detector import detect_spike
from app.detectors.loop_detector import detect_loop
from app.detectors.injection_detector import score_prompt
from app.detectors.key_leak_detector import detect_key_compromise
from app.worker import celery_app

router = APIRouter()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def count_openai_tokens(messages: list, model: str) -> int:
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

@router.post("/chat/completions")
async def proxy_openai(request: Request, user: User = Depends(require_role(["admin", "manager", "developer"]))):
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    messages = body.get("messages", [])
    model = body.get("model", "gpt-3.5-turbo")
    
    tokens_in, full_prompt_text = count_openai_tokens(messages, model)
    user_id_str = str(user.id)
    client_ip = request.headers.get("X-Forwarded-For", request.client.host)
    
    # DETECTORS
    compromise_score = await detect_key_compromise(user_id_str, client_ip, model)
    if compromise_score > 85:
        raise HTTPException(status_code=403, detail="API Key compromise detected.")
        
    injection_result = score_prompt(full_prompt_text)
    if injection_result['blocked']:
        raise HTTPException(status_code=403, detail={"error": "prompt_rejected", "score": injection_result['score']})

    session_id = request.headers.get("X-Session-ID")
    parent_request_id = request.headers.get("X-Parent-Request-ID")
    loop_result = await detect_loop(user_id_str, full_prompt_text, session_id, parent_request_id)
    if loop_result['blocked']:
        raise HTTPException(status_code=429, detail={"error": loop_result['reason']})
        
    if tokens_in > 128000:
        raise HTTPException(status_code=429, detail="Maximum context window exceeded.")

    spike_result = await detect_spike(user_id_str, model, tokens_in)
    if spike_result['is_spike'] and spike_result['severity'] in ['critical', 'emergency']:
        alert_data = {
            "severity": spike_result['severity'],
            "rule_name": "Massive Token Spike Detected (OpenAI)",
            "user_id": user_id_str,
            "tokens_used": tokens_in,
            "action_taken": "Logged",
            "channels": ["slack"]
        }
        celery_app.send_task("app.worker.process_alert", args=[alert_data])

    if not OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        try:
            openai_response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                json=body,
                headers=headers,
                timeout=60.0
            )
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Error contacting OpenAI: {str(e)}")

    if openai_response.status_code != 200:
        return openai_response.json()

    response_data = openai_response.json()
    usage = response_data.get("usage", {})
    tokens_out = usage.get("completion_tokens", 0)
    actual_tokens_in = usage.get("prompt_tokens", tokens_in)
    total_tokens = actual_tokens_in + tokens_out

    # Post-request Tracking & Analytics
    from app.detectors.spike_detector import update_ewma
    await update_ewma(user_id_str, model, total_tokens)
    await track_tokens(str(user.id), actual_tokens_in, tokens_out, model)
    await evaluate_rules(str(user.id), total_tokens)

    return response_data
