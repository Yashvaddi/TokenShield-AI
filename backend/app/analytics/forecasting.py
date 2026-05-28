import os
import httpx
from datetime import datetime, timedelta
import redis.asyncio as redis
import asyncio

CLICKHOUSE_URL = os.getenv("CLICKHOUSE_URL", "http://localhost:8123")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Simple ClickHouse client using HTTP interface
async def fetch_historical_costs(org_id: str, days: int = 30):
    query = f"""
    SELECT toDate(timestamp) as date, sum(cost_usd) as daily_cost 
    FROM tokenshield.usage_events 
    WHERE org_id = '{org_id}' AND timestamp >= subtractDays(now(), {days})
    GROUP BY date
    ORDER BY date ASC
    FORMAT JSON
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(CLICKHOUSE_URL, data=query, timeout=10.0)
            if response.status_code == 200:
                data = response.json()
                return data.get('data', [])
    except Exception as e:
        print(f"Error querying ClickHouse: {e}")
    return []

def calculate_linear_regression(data):
    if not data or len(data) < 2:
        return None
    
    # x = days (0 to n), y = daily cost
    n = len(data)
    sum_x = sum(range(n))
    sum_y = sum(float(row['daily_cost']) for row in data)
    sum_xy = sum(i * float(data[i]['daily_cost']) for i in range(n))
    sum_x_squared = sum(i * i for i in range(n))

    denominator = (n * sum_x_squared - sum_x * sum_x)
    if denominator == 0:
        return None

    slope = (n * sum_xy - sum_x * sum_y) / denominator
    intercept = (sum_y - slope * sum_x) / n
    return slope, intercept

async def run_cost_forecasting(org_id: str):
    print(f"Running ML forecasting for org: {org_id}")
    data = await fetch_historical_costs(org_id, days=14)
    
    if len(data) < 3:
        print("Not enough data to run ML forecast model.")
        return None
        
    regression = calculate_linear_regression(data)
    if not regression:
        return None
        
    slope, intercept = regression
    
    # Predict next 30 days total cost
    predicted_monthly_cost = 0.0
    current_day_index = len(data)
    
    for i in range(30):
        daily_prediction = (slope * (current_day_index + i)) + intercept
        predicted_monthly_cost += max(0, daily_prediction) # cost can't be negative
        
    print(f"Forecast complete. Next 30 day projected spend: ${predicted_monthly_cost:.2f}")
    
    # Store result in Redis for the dashboard API to read instantly
    r = redis.from_url(REDIS_URL, decode_responses=True)
    await r.setex(f"forecast:org:{org_id}:monthly", 86400, round(predicted_monthly_cost, 2))
    await r.close()
    
    return predicted_monthly_cost
