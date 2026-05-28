import redis.asyncio as redis
import os
import time

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

async def track_tokens(user_id: str, tokens_in: int, tokens_out: int, model: str):
    total_tokens = tokens_in + tokens_out
    
    pipeline = redis_client.pipeline()
    
    # 1 minute counter
    key_1m = f"user:{user_id}:tokens:1m"
    pipeline.incrby(key_1m, total_tokens)
    pipeline.expire(key_1m, 60, nx=True) # Set expire only if key doesn't exist
    
    # 1 hour counter
    key_1h = f"user:{user_id}:tokens:1h"
    pipeline.incrby(key_1h, total_tokens)
    pipeline.expire(key_1h, 3600, nx=True)
    
    # 1 day counter
    key_1d = f"user:{user_id}:tokens:1d"
    pipeline.incrby(key_1d, total_tokens)
    pipeline.expire(key_1d, 86400, nx=True)
    
    # Cumulative project cost (simplified to total tokens for now, cost calc later)
    key_total = f"user:{user_id}:tokens:total"
    pipeline.incrby(key_total, total_tokens)
    
    await pipeline.execute()
