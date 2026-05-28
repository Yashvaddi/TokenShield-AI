from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.api.auth import get_current_user
from app.models.domain import User, ApiKey
from pydantic import BaseModel
import secrets
import hashlib

router = APIRouter()

class ApiKeyCreate(BaseModel):
    provider: str

class ApiKeyResponse(BaseModel):
    key: str # Only returned once
    provider: str
    status: str

@router.post("/keys", response_model=ApiKeyResponse)
async def create_api_key(
    req: ApiKeyCreate, 
    user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    raw_key = f"sk-tsh-{secrets.token_urlsafe(32)}"
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    
    new_key = ApiKey(
        user_id=user.id,
        key_hash=key_hash,
        provider=req.provider,
        status="active"
    )
    db.add(new_key)
    await db.commit()
    
    return ApiKeyResponse(
        key=raw_key,
        provider=new_key.provider,
        status=new_key.status
    )

from sqlalchemy.future import select

@router.get("/keys")
async def get_api_keys(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ApiKey).where(ApiKey.user_id == user.id))
    keys = result.scalars().all()
    return [{"id": str(k.id), "key": f"ts_{k.provider}_{k.key_hash[:8]}...", "provider": k.provider, "status": k.status, "name": getattr(k, 'name', 'API Key')} for k in keys]

@router.delete("/keys/{key_id}")
async def delete_api_key(key_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ApiKey).where(ApiKey.id == key_id, ApiKey.user_id == user.id))
    db_key = result.scalars().first()
    if not db_key:
        raise HTTPException(status_code=404, detail="Key not found")
    
    await db.delete(db_key)
    await db.commit()
    return {"status": "success"}

from app.models.domain import AlertRule

class RuleCreate(BaseModel):
    name: str
    condition_type: str
    threshold: float
    window_seconds: int
    actions: list
    enabled: bool

class RuleUpdate(BaseModel):
    name: str
    condition_type: str
    threshold: float
    window_seconds: int
    actions: list
    enabled: bool

@router.get("/rules")
async def get_rules(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AlertRule))
    rules = result.scalars().all()
    return [
        {
            "id": str(r.id),
            "name": r.name,
            "condition": f"{r.condition_type} > {r.threshold} (in {r.window_seconds}s)",
            "condition_type": r.condition_type,
            "threshold": float(r.threshold) if r.threshold else 0.0,
            "window_seconds": r.window_seconds,
            "action": ", ".join(r.actions) if r.actions else "None",
            "actions": r.actions or [],
            "status": "active" if r.enabled else "inactive",
            "enabled": r.enabled,
            "matches": 0
        }
        for r in rules
    ]

@router.post("/rules")
async def create_rule(rule: RuleCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    new_rule = AlertRule(
        name=rule.name,
        condition_type=rule.condition_type,
        threshold=rule.threshold,
        window_seconds=rule.window_seconds,
        actions=rule.actions,
        enabled=rule.enabled,
        org_id=user.org_id
    )
    db.add(new_rule)
    await db.commit()
    return {"status": "success", "id": str(new_rule.id)}

@router.put("/rules/{rule_id}")
async def update_rule(rule_id: str, rule: RuleUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AlertRule).where(AlertRule.id == rule_id))
    db_rule = result.scalars().first()
    if not db_rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    db_rule.name = rule.name
    db_rule.condition_type = rule.condition_type
    db_rule.threshold = rule.threshold
    db_rule.window_seconds = rule.window_seconds
    db_rule.actions = rule.actions
    db_rule.enabled = rule.enabled
    
    await db.commit()
    return {"status": "success"}

@router.delete("/rules/{rule_id}")
async def delete_rule(rule_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AlertRule).where(AlertRule.id == rule_id))
    db_rule = result.scalars().first()
    if not db_rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    await db.delete(db_rule)
    await db.commit()
    return {"status": "success"}

from fastapi.responses import StreamingResponse
import asyncio
import json
from app.proxy.tracker import redis_client

@router.get("/anomalies/stream")
async def stream_anomalies(user: User = Depends(get_current_user)):
    """
    TSH-052: Anomaly feed SSE endpoint using Redis PubSub.
    """
    async def event_generator():
        pubsub = redis_client.pubsub()
        await pubsub.subscribe("anomaly_alerts")
        
        try:
            while True:
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message:
                    data = message["data"]
                    if isinstance(data, bytes):
                        data = data.decode('utf-8')
                    yield f"data: {data}\n\n"
                await asyncio.sleep(0.1)
        except asyncio.CancelledError:
            await pubsub.unsubscribe("anomaly_alerts")
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/anomalies")
async def get_anomalies(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Legacy sync endpoint for initial load
    return []

from app.models.domain import Organization

class ProjectCreate(BaseModel):
    name: str
    plan: str

@router.post("/projects")
async def create_project(project: ProjectCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    new_org = Organization(name=project.name, plan=project.plan)
    db.add(new_org)
    await db.commit()
    return {"status": "success", "message": f"Workspace {project.name} created", "id": str(new_org.id)}

@router.get("/projects")
async def get_projects(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Organization))
    orgs = result.scalars().all()
    return [{"id": str(o.id), "name": o.name, "plan": o.plan, "monthly_budget": float(o.monthly_budget) if o.monthly_budget else 0} for o in orgs]

class ProjectUpdate(BaseModel):
    name: str
    plan: str
    monthly_budget: float

@router.put("/projects/{project_id}")
async def update_project(project_id: str, project: ProjectUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Organization).where(Organization.id == project_id))
    db_org = result.scalars().first()
    if not db_org:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db_org.name = project.name
    db_org.plan = project.plan
    db_org.monthly_budget = project.monthly_budget
    await db.commit()
    return {"status": "success"}

@router.delete("/projects/{project_id}")
async def delete_project(project_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Organization).where(Organization.id == project_id))
    db_org = result.scalars().first()
    if not db_org:
        raise HTTPException(status_code=404, detail="Project not found")
    
    await db.delete(db_org)
    await db.commit()
    return {"status": "success"}

class UserCreate(BaseModel):
    email: str
    role: str

@router.post("/users")
async def create_user(user_req: UserCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    new_user = User(email=user_req.email, role=user_req.role, org_id=user.org_id)
    db.add(new_user)
    await db.commit()
    return {"status": "success", "message": f"User {user_req.email} invited with role {user_req.role}"}

@router.get("/users")
async def get_users(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    users = result.scalars().all()
    return [{"id": str(u.id), "email": u.email, "role": getattr(u, 'role', 'developer')} for u in users]

class UserUpdate(BaseModel):
    role: str

@router.put("/users/{user_id}")
async def update_user(user_id: str, user_req: UserUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    db_user = result.scalars().first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_user.role = user_req.role
    await db.commit()
    return {"status": "success"}

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    db_user = result.scalars().first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.delete(db_user)
    await db.commit()
    return {"status": "success"}

@router.get("/audit")
async def get_audit(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    from app.models.domain import AuditLog
    try:
        result = await db.execute(select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(50))
        logs = result.scalars().all()
        return [{"id": str(l.id), "action": l.action, "actor": l.actor, "resource": l.resource, "ip": getattr(l, 'ip_address', ''), "time": l.timestamp.isoformat(), "status": l.status} for l in logs]
    except Exception:
        return []

from app.models.domain import KnowledgeFile, Prompt

class PromptCreate(BaseModel):
    name: str
    description: str = ""
    content: str = ""
    tags: list[str] = []

@router.get("/prompts")
async def get_prompts(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Prompt).where(Prompt.org_id == user.org_id).order_by(Prompt.created_at.desc()))
    prompts = result.scalars().all()
    return [{"id": str(p.id), "name": p.name, "description": p.description, "content": p.content, "tags": p.tags, "version": p.version, "updated": p.created_at.strftime("%b %d, %Y")} for p in prompts]

@router.post("/prompts")
async def create_prompt(prompt: PromptCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    new_prompt = Prompt(
        org_id=user.org_id,
        name=prompt.name,
        description=prompt.description,
        content=prompt.content,
        tags=prompt.tags
    )
    db.add(new_prompt)
    await db.commit()
    return {"status": "success"}

@router.put("/prompts/{prompt_id}")
async def update_prompt(prompt_id: str, prompt: PromptCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Prompt).where(Prompt.id == prompt_id, Prompt.org_id == user.org_id))
    db_prompt = result.scalars().first()
    if not db_prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    db_prompt.name = prompt.name
    db_prompt.description = prompt.description
    db_prompt.content = prompt.content
    db_prompt.tags = prompt.tags
    await db.commit()
    return {"status": "success"}

@router.delete("/prompts/{prompt_id}")
async def delete_prompt(prompt_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Prompt).where(Prompt.id == prompt_id, Prompt.org_id == user.org_id))
    db_prompt = result.scalars().first()
    if not db_prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    await db.delete(db_prompt)
    await db.commit()
    return {"status": "success"}


class KnowledgeFileCreate(BaseModel):
    name: str
    type: str = "Document"
    size: str = "Unknown"

@router.get("/knowledge")
async def get_knowledge(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(KnowledgeFile).where(KnowledgeFile.org_id == user.org_id).order_by(KnowledgeFile.uploaded_at.desc()))
    files = result.scalars().all()
    return [{"id": str(f.id), "name": f.name, "type": f.type, "size": f.size, "status": f.status, "uploadedAt": f.uploaded_at.strftime("%b %d, %Y")} for f in files]

@router.post("/knowledge")
async def upload_knowledge(file: KnowledgeFileCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    new_file = KnowledgeFile(
        org_id=user.org_id,
        name=file.name,
        type=file.type,
        size=file.size
    )
    db.add(new_file)
    await db.commit()
    return {"status": "success"}

@router.delete("/knowledge/{file_id}")
async def delete_knowledge(file_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(KnowledgeFile).where(KnowledgeFile.id == file_id, KnowledgeFile.org_id == user.org_id))
    db_file = result.scalars().first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    await db.delete(db_file)
    await db.commit()
    return {"status": "success"}

from app.models.domain import Lead

class LeadCreate(BaseModel):
    name: str
    email: str
    company: str
    status: str = "New"

@router.post("/leads")
async def create_lead(lead: LeadCreate, db: AsyncSession = Depends(get_db)):
    new_lead = Lead(name=lead.name, email=lead.email, company=lead.company, status=lead.status)
    db.add(new_lead)
    await db.commit()
    
    from app.worker import celery_app
    celery_app.send_task("generate_cost_forecasts", args=[["default-org-id"]])
    
    return {"status": "success", "message": "Lead captured successfully"}

@router.get("/leads")
async def get_leads(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lead).order_by(Lead.created_at.desc()))
    leads = result.scalars().all()
    return [{"id": str(l.id), "name": l.name, "email": l.email, "company": l.company, "status": l.status, "date": l.created_at.isoformat()} for l in leads]

class LeadUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    company: str | None = None
    status: str | None = None

@router.put("/leads/{lead_id}")
async def update_lead(lead_id: str, lead: LeadUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    db_lead = result.scalars().first()
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    if lead.name is not None:
        db_lead.name = lead.name
    if lead.email is not None:
        db_lead.email = lead.email
    if lead.company is not None:
        db_lead.company = lead.company
    if lead.status is not None:
        db_lead.status = lead.status
        
    await db.commit()
    return {"status": "success"}

@router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    db_lead = result.scalars().first()
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    await db.delete(db_lead)
    await db.commit()
    return {"status": "success"}

from app.models.domain import Workflow

class WorkflowPayload(BaseModel):
    nodes: list
    edges: list

@router.get("/workflows")
async def get_workflows(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Workflow).where(Workflow.org_id == user.org_id))
    workflow = result.scalars().first()
    if workflow:
        return {"nodes": workflow.nodes, "edges": workflow.edges}
    return {"nodes": [], "edges": []}

@router.post("/workflows")
async def save_workflow(payload: WorkflowPayload, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Workflow).where(Workflow.org_id == user.org_id))
    workflow = result.scalars().first()
    if workflow:
        workflow.nodes = payload.nodes
        workflow.edges = payload.edges
    else:
        new_workflow = Workflow(org_id=user.org_id, nodes=payload.nodes, edges=payload.edges)
        db.add(new_workflow)
    await db.commit()
    return {"status": "success", "message": "Workflow saved successfully"}
