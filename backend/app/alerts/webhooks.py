import os
import httpx

TEAMS_WEBHOOK_URL = os.getenv("TEAMS_WEBHOOK_URL")
DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL")

async def send_teams_alert(alert_data: dict):
    if not TEAMS_WEBHOOK_URL:
        return
        
    severity = alert_data.get("severity", "alert").upper()
    rule_name = alert_data.get("rule_name", "Unknown")
    
    payload = {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": "FF0000" if severity in ["CRITICAL", "EMERGENCY"] else "FFA500",
        "summary": f"TokenShield Alert: {rule_name}",
        "sections": [{
            "activityTitle": f"[{severity}] {rule_name}",
            "facts": [
                {"name": "User", "value": str(alert_data.get("user_id"))},
                {"name": "Budget %", "value": f"{alert_data.get('budget_pct', 0):.1f}%"},
                {"name": "Action", "value": str(alert_data.get("action_taken"))}
            ]
        }]
    }
    
    async with httpx.AsyncClient() as client:
        try:
            await client.post(TEAMS_WEBHOOK_URL, json=payload)
        except Exception as e:
            print(f"Teams webhook failed: {e}")

async def send_discord_alert(alert_data: dict):
    if not DISCORD_WEBHOOK_URL:
        return
        
    severity = alert_data.get("severity", "alert").upper()
    rule_name = alert_data.get("rule_name", "Unknown")
    
    color = 16711680 if severity in ["CRITICAL", "EMERGENCY"] else 16753920
    
    payload = {
        "embeds": [{
            "title": f"[{severity}] TokenShield Alert: {rule_name}",
            "color": color,
            "fields": [
                {"name": "User", "value": str(alert_data.get("user_id")), "inline": True},
                {"name": "Budget %", "value": f"{alert_data.get('budget_pct', 0):.1f}%", "inline": True},
                {"name": "Action Taken", "value": str(alert_data.get("action_taken")), "inline": False}
            ]
        }]
    }
    
    async with httpx.AsyncClient() as client:
        try:
            await client.post(DISCORD_WEBHOOK_URL, json=payload)
        except Exception as e:
            print(f"Discord webhook failed: {e}")

import hmac
import hashlib
import json
from datetime import datetime

GENERIC_WEBHOOK_URL = os.getenv("GENERIC_WEBHOOK_URL")
GENERIC_WEBHOOK_SECRET = os.getenv("GENERIC_WEBHOOK_SECRET", "default_secret").encode()
PAGERDUTY_ROUTING_KEY = os.getenv("PAGERDUTY_ROUTING_KEY")

async def send_generic_webhook(alert_data: dict):
    if not GENERIC_WEBHOOK_URL:
        return
        
    payload = {
        "event_id": alert_data.get("event_id", f"evt_{int(datetime.utcnow().timestamp())}"),
        "rule_name": alert_data.get("rule_name", "Unknown"),
        "severity": alert_data.get("severity", "alert"),
        "user_id": alert_data.get("user_id"),
        "org_id": alert_data.get("org_id", "default-org"),
        "metric_name": alert_data.get("metric_name", "tokens"),
        "metric_value": alert_data.get("metric_value", 0),
        "action_taken": alert_data.get("action_taken", "None"),
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    payload_bytes = json.dumps(payload).encode()
    signature = hmac.new(GENERIC_WEBHOOK_SECRET, payload_bytes, hashlib.sha256).hexdigest()
    
    headers = {
        "Content-Type": "application/json",
        "X-TokenShield-Signature": signature
    }
    
    async with httpx.AsyncClient() as client:
        try:
            await client.post(GENERIC_WEBHOOK_URL, json=payload, headers=headers)
        except Exception as e:
            print(f"Generic webhook failed: {e}")

async def send_pagerduty_alert(alert_data: dict):
    if not PAGERDUTY_ROUTING_KEY:
        return
        
    severity = alert_data.get("severity", "alert").lower()
    if severity != "emergency":
        return
        
    payload = {
        "routing_key": PAGERDUTY_ROUTING_KEY,
        "event_action": "trigger",
        "payload": {
            "summary": f"TokenShield EMERGENCY: {alert_data.get('rule_name')}",
            "source": "tokenshield-proxy",
            "severity": "critical", # PagerDuty severity mapping
            "custom_details": alert_data
        }
    }
    
    async with httpx.AsyncClient() as client:
        try:
            await client.post("https://events.pagerduty.com/v2/enqueue", json=payload)
        except Exception as e:
            print(f"PagerDuty alert failed: {e}")

