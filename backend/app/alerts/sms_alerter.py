import os
from twilio.rest import Client

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_FROM_NUMBER = os.getenv("TWILIO_FROM_NUMBER")

async def send_sms_alert(to_number: str, alert_data: dict):
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
        print(f"Skipping SMS alert (no token): {alert_data}")
        return

    severity = alert_data.get("severity", "alert").upper()
    rule_name = alert_data.get("rule_name", "Unknown Rule")
    user_id = alert_data.get("user_id", "Unknown User")
    pct = alert_data.get("budget_pct", 0)
    action = alert_data.get("action_taken", "None")

    body = f"[TokenShield] {severity}: {rule_name} | User: {user_id} | {pct:.0f}% budget used | Action: {action}"

    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        client.messages.create(
            body=body,
            from_=TWILIO_FROM_NUMBER,
            to=to_number
        )
    except Exception as e:
        print(f"Error sending SMS alert: {e}")
