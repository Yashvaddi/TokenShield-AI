from celery import Celery
from celery.schedules import crontab
import os

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")

celery_app = Celery("tokenshield", broker=redis_url, backend=redis_url)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

import asyncio
from app.alerts.slack_alerter import send_slack_alert
from app.alerts.email_alerter import send_email_alert
from app.alerts.sms_alerter import send_sms_alert
from app.alerts.webhooks import send_teams_alert, send_discord_alert, send_generic_webhook, send_pagerduty_alert

import json
import redis
sync_redis = redis.from_url(redis_url)

@celery_app.task
def process_alert(alert_data: dict):
    # Publish to SSE stream (TSH-052)
    sync_redis.publish("anomaly_alerts", json.dumps(alert_data))
    
    # Running async functions in sync celery worker
    loop = asyncio.get_event_loop()
    channels = alert_data.get("channels", [])
    
    if "slack" in channels:
        channel = "#llm-alerts"
        loop.run_until_complete(send_slack_alert(channel, alert_data))
        
    if "email" in channels:
        to_email = "admin@tokenshield.ai"
        loop.run_until_complete(send_email_alert(to_email, alert_data))
        
    if "sms" in channels:
        to_number = "+1234567890" # should come from user config
        loop.run_until_complete(send_sms_alert(to_number, alert_data))
        
    if "teams" in channels:
        loop.run_until_complete(send_teams_alert(alert_data))
        
    if "discord" in channels:
        loop.run_until_complete(send_discord_alert(alert_data))
        
    if "webhook" in channels:
        loop.run_until_complete(send_generic_webhook(alert_data))
        
    if "pagerduty" in channels or alert_data.get("severity") == "emergency":
        loop.run_until_complete(send_pagerduty_alert(alert_data))

from app.analytics.forecasting import run_cost_forecasting

@celery_app.task
def generate_cost_forecasts(org_ids: list):
    loop = asyncio.get_event_loop()
    for org_id in org_ids:
        loop.run_until_complete(run_cost_forecasting(org_id))

# Setup Celery Beat schedule for nightly forecasting
@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Executes every night at 2:00 AM UTC
    sender.add_periodic_task(
        crontab(hour=2, minute=0),
        generate_cost_forecasts.s([os.getenv("DEFAULT_ORG_ID", "default-org-id")]),
    )

