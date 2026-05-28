import redis.asyncio as redis
import os

ALPHA = 0.3 # smoothing factor
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

# Fixed baseline for new users until EWMA calibrates
BOOTSTRAP_THRESHOLD = 50 
BOOTSTRAP_BASELINE = 5000.0 

async def get_spike_ratio(user_id: str, model_id: str, tokens_in: int) -> dict:
    """
    TSH-030: Spike detector (pre-check).
    Calculates ratio without updating the EWMA (update happens post-request).
    """
    # TSH-032: Per-model EWMA keys
    ewma_key = f'spike:{user_id}:{model_id}:ewma'
    count_key = f'spike:{user_id}:{model_id}:count'
    
    ewma_val = await redis_client.get(ewma_key)
    count_val = await redis_client.get(count_key)
    
    count = int(count_val) if count_val else 0
    
    # Bootstrap period logic
    if count < BOOTSTRAP_THRESHOLD:
        baseline = BOOTSTRAP_BASELINE
    else:
        baseline = float(ewma_val) if ewma_val else BOOTSTRAP_BASELINE
        
    ratio = tokens_in / max(baseline, 1.0)
    
    severity = 'normal'
    if ratio >= 20.0:
        severity = 'emergency'
    elif ratio >= 10.0:
        severity = 'critical'
    elif ratio >= 5.0:
        severity = 'warning'
    elif ratio >= 3.0:
        severity = 'low_alert'
        
    return {
        'is_spike': ratio >= 5.0,
        'ratio': round(ratio, 2),
        'severity': severity,
        'baseline': round(baseline, 2)
    }

async def update_ewma(user_id: str, model_id: str, total_tokens: int) -> float:
    """
    TSH-029: EWMA calculator (runs asynchronously after request).
    """
    ewma_key = f'spike:{user_id}:{model_id}:ewma'
    count_key = f'spike:{user_id}:{model_id}:count'
    
    prev = await redis_client.get(ewma_key)
    
    if prev is None:
        new_ewma = float(total_tokens)
    else:
        new_ewma = ALPHA * total_tokens + (1 - ALPHA) * float(prev)
        
    # Increment bootstrap count and set TTLs (300 seconds as per specs)
    await redis_client.incr(count_key)
    await redis_client.setex(ewma_key, 300, new_ewma)
    await redis_client.expire(count_key, 300)
    
    return new_ewma

# Alias for backwards compatibility with proxy
async def detect_spike(user_id: str, model_id: str, tokens: int) -> dict:
    return await get_spike_ratio(user_id, model_id, tokens)
