import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
ALERT_FROM_EMAIL = os.getenv("ALERT_FROM_EMAIL", "alerts@tokenshield.ai")

async def send_email_alert(to_email: str, alert_data: dict):
    if not SENDGRID_API_KEY:
        print(f"Skipping Email alert (no token): {alert_data}")
        return

    severity = alert_data.get("severity", "alert").upper()
    rule_name = alert_data.get("rule_name", "Unknown Rule")
    user_id = alert_data.get("user_id", "Unknown User")
    pct = alert_data.get("budget_pct", 0)
    
    html_content = f"""
    <h2>TokenShield AI Alert: {severity}</h2>
    <p><strong>Rule:</strong> {rule_name}</p>
    <p><strong>User:</strong> {user_id}</p>
    <p><strong>Budget Used:</strong> {pct:.1f}%</p>
    <p><strong>Action Taken:</strong> {alert_data.get('action_taken', 'None')}</p>
    """

    message = Mail(
        from_email=ALERT_FROM_EMAIL,
        to_emails=to_email,
        subject=f"[TokenShield] {severity} — {rule_name}",
        html_content=html_content
    )
    
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
    except Exception as e:
        print(f"Error sending email alert: {e}")
