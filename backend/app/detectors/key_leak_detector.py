import httpx
from app.proxy.tracker import redis_client
from app.worker import celery_app

# TSH-041: Integrate ip-api.com for free GeoIP
async def get_geo_info(ip: str) -> dict:
    # Use cached geoip if available
    cache_key = f'geoip:{ip}'
    cached = await redis_client.hgetall(cache_key)
    if cached:
        return {"country": cached.get("country", "Unknown"), "continent": cached.get("continent", "Unknown")}
        
    try:
        # Ignore localhost/private IPs
        if ip.startswith("127.") or ip.startswith("192.168.") or ip.startswith("10."):
            return {"country": "Local", "continent": "Local"}
            
        async with httpx.AsyncClient() as client:
            # fields: countryCode, continentCode
            res = await client.get(f"http://ip-api.com/json/{ip}?fields=countryCode,continentCode", timeout=2.0)
            if res.status_code == 200:
                data = res.json()
                country = data.get("countryCode", "Unknown")
                continent = data.get("continentCode", "Unknown")
                
                # Cache for 24 hours
                await redis_client.hset(cache_key, mapping={"country": country, "continent": continent})
                await redis_client.expire(cache_key, 86400)
                
                return {"country": country, "continent": continent}
    except Exception:
        pass
        
    return {"country": "Unknown", "continent": "Unknown"}

async def detect_key_compromise(user_id: str, request_ip: str, model: str) -> int:
    """
    TSH-042 to TSH-044: Baseline profiler, Compromise Scoring, and Auto-Revocation trigger.
    Returns a compromise score 0-100.
    """
    score = 0
    
    # 1. Baseline Profiler (TSH-042)
    # Using Redis sets for speed on the hot path
    baseline_countries_key = f'baseline:{user_id}:countries'
    baseline_continents_key = f'baseline:{user_id}:continents'
    baseline_models_key = f'baseline:{user_id}:models'
    bootstrap_count_key = f'baseline:{user_id}:count'
    
    # Get current state
    bootstrap_count = await redis_client.incr(bootstrap_count_key)
    geo_info = await get_geo_info(request_ip)
    
    country = geo_info["country"]
    continent = geo_info["continent"]
    
    # If in bootstrap phase (first 10 requests), just record and return 0 risk
    if bootstrap_count <= 10:
        await redis_client.sadd(baseline_countries_key, country)
        await redis_client.sadd(baseline_continents_key, continent)
        await redis_client.sadd(baseline_models_key, model)
        return 0

    # 2. Compromise Score (TSH-043)
    is_known_country = await redis_client.sismember(baseline_countries_key, country)
    is_known_continent = await redis_client.sismember(baseline_continents_key, continent)
    is_known_model = await redis_client.sismember(baseline_models_key, model)
    
    if not is_known_continent:
        score += 50
    elif not is_known_country:
        score += 35
        
    if not is_known_model:
        score += 20
        
    # Check concurrent IPs
    key_ips = f'key:{user_id}:ips:15m'
    await redis_client.sadd(key_ips, request_ip)
    await redis_client.expire(key_ips, 900)
    
    active_ips = await redis_client.scard(key_ips)
    if active_ips > 3:
        score += 30
        
    final_score = min(score, 100)
    
    # 3. Auto-revocation (TSH-044)
    # If score >= 85, we trigger a background task to revoke the key so it doesn't block this single request
    # but immediately blocks subsequent ones.
    if final_score >= 85:
        # Trigger Celery alert/revocation task asynchronously
        alert_data = {
            "severity": "emergency",
            "rule_name": "API Key Compromise Detected (Score >= 85)",
            "user_id": user_id,
            "metric_value": final_score,
            "action_taken": "key_revoke",
            "channels": ["slack", "email"]
        }
        celery_app.send_task("app.worker.process_alert", args=[alert_data])
        
    return final_score
