from fastapi import APIRouter, Depends
from app.api.auth import require_role
from app.models.domain import User
from app.proxy.tracker import redis_client

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(user: User = Depends(require_role(["admin", "manager"]))):
    user_id_str = str(user.id)
    
    # Retrieve from Redis
    tokens_1m = await redis_client.get(f"user:{user_id_str}:tokens:1m")
    tokens_1h = await redis_client.get(f"user:{user_id_str}:tokens:1h")
    total_tokens = await redis_client.get(f"user:{user_id_str}:tokens:total")
    
    tokens_1m = int(tokens_1m) if tokens_1m else 0
    tokens_1h = int(tokens_1h) if tokens_1h else 0
    total_tokens = int(total_tokens) if total_tokens else 0
    
    # Very basic cost estimation (assuming $0.01 per 1k tokens average)
    estimated_cost = (total_tokens / 1000) * 0.01
    
    # Fetch predicted cost from our Celery ClickHouse model
    org_id = getattr(user, 'org_id', os.getenv("DEFAULT_ORG_ID", "default-org-id"))
    forecast_key = f"forecast:org:{org_id}:monthly"
    predicted_cost = await redis_client.get(forecast_key)
    predicted_cost = float(predicted_cost) if predicted_cost else 0.0

    return {
        "tokens1m": tokens_1m,
        "tokens1h": tokens_1h,
        "totalTokens": total_tokens,
        "costUsd": round(estimated_cost, 2),
        "predictedCostUsd": round(predicted_cost, 2),
        "anomalies": 0 # We'd fetch this from AlertEvent DB
    }
