from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
import json

from app.api.auth import get_current_user
from app.models.domain import User
from app.proxy.tracker import redis_client

router = APIRouter()

DEFAULT_SETTINGS = {
    "slackWebhook": "",
    "discordWebhook": "",
    "twilioSid": "",
    "twilioToken": "",
    "twilioFrom": "",
    "smtpHost": "",
    "smtpPort": "",
    "smtpUser": "",
    "smtpPass": "",
    "autoBlockThreshold": 80,
    "maxContextWindow": 128000,
    "ssoEnabled": False,
    "ssoProvider": "",
    "dataResidency": "us-east",
    "kmsUrl": ""
}

class SettingsPayload(BaseModel):
    slackWebhook: Optional[str] = None
    discordWebhook: Optional[str] = None
    twilioSid: Optional[str] = None
    twilioToken: Optional[str] = None
    twilioFrom: Optional[str] = None
    smtpHost: Optional[str] = None
    smtpPort: Optional[str] = None
    smtpUser: Optional[str] = None
    smtpPass: Optional[str] = None
    autoBlockThreshold: Optional[int] = None
    maxContextWindow: Optional[int] = None
    ssoEnabled: Optional[bool] = None
    ssoProvider: Optional[str] = None
    dataResidency: Optional[str] = None
    kmsUrl: Optional[str] = None

@router.get("/")
async def get_settings(user: User = Depends(get_current_user)):
    org_id = getattr(user, 'org_id', 'default-org-id')
    raw = await redis_client.get(f"settings:org:{org_id}")
    if raw:
        return json.loads(raw)
    return DEFAULT_SETTINGS

@router.post("/")
async def update_settings(payload: SettingsPayload, user: User = Depends(get_current_user)):
    org_id = getattr(user, 'org_id', 'default-org-id')
    raw = await redis_client.get(f"settings:org:{org_id}")
    
    current_settings = json.loads(raw) if raw else DEFAULT_SETTINGS.copy()
    update_data = payload.dict(exclude_unset=True)
    current_settings.update(update_data)
    
    await redis_client.set(f"settings:org:{org_id}", json.dumps(current_settings))
    
    return {"status": "success", "message": "Settings saved successfully", "data": current_settings}
