from slack_sdk import WebClient
import os

SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN")

async def send_slack_alert(channel: str, alert_data: dict):
    if not SLACK_BOT_TOKEN:
        print(f"Skipping Slack alert (no token): {alert_data}")
        return
        
    client = WebClient(token=SLACK_BOT_TOKEN)
    blocks = [
        {'type': 'header', 'text': {'type': 'plain_text', 'text': f"■ {alert_data.get('severity', 'ALERT').upper()}: {alert_data.get('rule_name')}"}},
        {'type': 'section', 'fields': [
            {'type': 'mrkdwn', 'text': f"*User:* {alert_data.get('user_id')}"},
            {'type': 'mrkdwn', 'text': f"*Tokens Used:* {alert_data.get('tokens_used', 0):,}"},
            {'type': 'mrkdwn', 'text': f"*Budget %:* {alert_data.get('budget_pct', 0.0):.1f}%"},
            {'type': 'mrkdwn', 'text': f"*Action:* {alert_data.get('action_taken', 'None')}"},
        ]},
        {'type': 'actions', 'elements': [
            {'type': 'button', 'text': {'type': 'plain_text', 'text': 'Unblock Account'}, 'style': 'danger', 'value': str(alert_data.get('user_id'))}
        ]}
    ]
    
    try:
        client.chat_postMessage(channel=channel, blocks=blocks)
    except Exception as e:
        print(f"Error sending slack alert: {e}")
