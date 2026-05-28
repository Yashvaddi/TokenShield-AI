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

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def count_gemini_tokens(contents: list) -> int:
    # Approximate tokens using cl100k_base until Gemini specific counting is integrated
    encoding = tiktoken.get_encoding("cl100k_base")
    num_tokens = 0
    full_prompt_text = ""
    
    for content in contents:
        parts = content.get("parts", [])
        for part in parts:
            text = part.get("text", "")
            if text:
                num_tokens += len(encoding.encode(text))
                full_prompt_text += f"{text}\n"
    
    return num_tokens, full_prompt_text

@router.post("/{model}:generateContent")
async def proxy_gemini(model: str, request: Request, user: User = Depends(require_role(["admin", "manager", "developer"]))):
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    contents = body.get("contents", [])
    
    tokens_in, full_prompt_text = count_gemini_tokens(contents)
    user_id_str = str(user.id)
    client_ip = request.headers.get("X-Forwarded-For", request.client.host)
    
    # DETECTORS
    compromise_score = await detect_key_compromise(user_id_str, client_ip, model)
    if compromise_score > 85:
        raise HTTPException(status_code=403, detail="API Key compromise detected.")
        
    injection_result = score_prompt(full_prompt_text)
    if injection_result['blocked']:
        raise HTTPException(status_code=403, detail="Prompt Injection Detected.")

    is_loop = await detect_loop(user_id_str, full_prompt_text)
    if is_loop:
        raise HTTPException(status_code=429, detail="Infinite loop detected.")
        
    if tokens_in > 1000000: # Gemini Pro 1.5 supports 1M/2M
        raise HTTPException(status_code=429, detail="Maximum context window exceeded.")

    spike_result = await detect_spike(user_id_str, tokens_in)
    if spike_result['is_spike'] and spike_result['severity'] in ['critical', 'emergency']:
        alert_data = {
            "severity": spike_result['severity'],
            "rule_name": "Massive Token Spike Detected (Gemini)",
            "user_id": user_id_str,
            "tokens_used": tokens_in,
            "action_taken": "Logged",
            "channels": ["slack"]
        }
        celery_app.send_task("app.worker.process_alert", args=[alert_data])

    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")

    async with httpx.AsyncClient() as client:
        try:
            # Reconstruct the URL for Google AI Studio endpoint
            gemini_response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}",
                json=body,
                headers={"Content-Type": "application/json"},
                timeout=60.0
            )
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Error contacting Gemini: {str(e)}")

    if gemini_response.status_code != 200:
        return gemini_response.json()

    response_data = gemini_response.json()
    usage = response_data.get("usageMetadata", {})
    tokens_out = usage.get("candidatesTokenCount", 0)
    actual_tokens_in = usage.get("promptTokenCount", tokens_in)

    await track_tokens(str(user.id), actual_tokens_in, tokens_out, model)
    await evaluate_rules(str(user.id), actual_tokens_in + tokens_out)

    return response_data
