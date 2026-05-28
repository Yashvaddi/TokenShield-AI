import hashlib
import time
from app.proxy.tracker import redis_client

MAX_PROMPT_COUNT = 10
MAX_AGENT_DEPTH = 12
LOOP_WINDOW_SEC = 300

async def detect_loop(user_id: str, prompt: str, session_id: str = None, parent_request_id: str = None) -> dict:
    """
    TSH-033 to TSH-036: Loop and Recursive Agent Detection with Circuit Breaker
    """
    breaker_key = f'circuit_breaker:{user_id}'
    breaker_state = await redis_client.get(breaker_key)
    
    # Check circuit breaker (TSH-036)
    if breaker_state:
        state, timestamp = breaker_state.split(':')
        if state == "OPEN":
            if time.time() - float(timestamp) > 300:
                # 5 min passed, transition to HALF-OPEN
                await redis_client.set(breaker_key, f"HALF-OPEN:{time.time()}")
            else:
                return {"blocked": True, "reason": "circuit_breaker_open"}
    
    # 1. Prompt Loop Detection (TSH-033)
    # Hash first 512 chars
    h = hashlib.sha256(prompt[:512].encode()).hexdigest()[:16]
    loop_key = f'loop:{user_id}:hashes'
    
    count = await redis_client.hincrby(loop_key, h, 1)
    await redis_client.expire(loop_key, LOOP_WINDOW_SEC)
    
    if int(count) > MAX_PROMPT_COUNT:
        await _trip_breaker(user_id)
        return {"blocked": True, "reason": "loop_detected"}
        
    # 2. Recursive Agent Detection (TSH-035)
    if session_id and parent_request_id:
        chain_key = f'session:{session_id}:chain'
        await redis_client.rpush(chain_key, parent_request_id)
        await redis_client.expire(chain_key, 1800) # 30 mins
        
        depth = await redis_client.llen(chain_key)
        if depth > MAX_AGENT_DEPTH:
            await _trip_breaker(user_id)
            return {"blocked": True, "reason": "recursive_depth_exceeded"}

    # If we get here and state was HALF-OPEN, the test request succeeded. Reset to CLOSED.
    if breaker_state and breaker_state.startswith("HALF-OPEN"):
        await redis_client.delete(breaker_key)
        
    return {"blocked": False}

async def _trip_breaker(user_id: str):
    breaker_key = f'circuit_breaker:{user_id}'
    await redis_client.set(breaker_key, f"OPEN:{time.time()}")
