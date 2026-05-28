from sqlalchemy import Column, String, Numeric, Integer, Boolean, ForeignKey, DateTime, ARRAY, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone
from app.database import Base

class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    plan = Column(String, default="starter")
    monthly_budget = Column(Numeric, nullable=True)

    users = relationship("User", back_populates="organization")
    rules = relationship("AlertRule", back_populates="organization")


class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    email = Column(String, unique=True, index=True)
    role = Column(String, default="developer") # admin, manager, developer, viewer
    hashed_password = Column(String)

    organization = relationship("Organization", back_populates="users")
    api_keys = relationship("ApiKey", back_populates="user")


class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    key_hash = Column(String, unique=True, index=True)
    provider = Column(String) # anthropic, openai, gemini
    status = Column(String, default="active") # active, blocked, rotated
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    revoked_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="api_keys")


class UsageEvent(Base):
    __tablename__ = "usage_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), index=True)
    api_key_id = Column(UUID(as_uuid=True), index=True)
    model = Column(String)
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    cost_usd = Column(Numeric(10, 6), default=0)
    request_latency_ms = Column(Integer)
    prompt_risk_score = Column(Integer, default=0)
    anomaly_flags = Column(ARRAY(String), default=list)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)


class AlertRule(Base):
    __tablename__ = "alert_rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    name = Column(String)
    condition_type = Column(String) # budget_used_pct, ewma_ratio
    threshold = Column(Numeric)
    window_seconds = Column(Integer)
    actions = Column(JSON) # e.g. ["slack_alert", "throttle_50pct"]
    channels = Column(JSON) # e.g. ["slack", "email"]
    cooldown_seconds = Column(Integer)
    enabled = Column(Boolean, default=True)

    organization = relationship("Organization", back_populates="rules")


class AlertEvent(Base):
    __tablename__ = "alert_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rule_id = Column(UUID(as_uuid=True), ForeignKey("alert_rules.id"))
    user_id = Column(UUID(as_uuid=True))
    triggered_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    action_taken = Column(String)
    notified_channels = Column(ARRAY(String))

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    action = Column(String, nullable=False) # e.g., 'API_KEY_CREATED', 'RULE_UPDATED'
    target_resource = Column(String) # e.g., 'rule: 1234'
    ip_address = Column(String)
    user_agent = Column(String)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    details = Column(JSON) # Store old vs new state here

class Lead(Base):
    __tablename__ = "leads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    company = Column(String, nullable=False)
    status = Column(String, default="New") # New, Contacted, Qualified, Lost
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    nodes = Column(JSON, default=list)
    edges = Column(JSON, default=list)

class Prompt(Base):
    __tablename__ = "prompts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    name = Column(String, nullable=False)
    description = Column(String)
    content = Column(String)
    tags = Column(ARRAY(String), default=list)
    version = Column(String, default="v1.0.0")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class KnowledgeFile(Base):
    __tablename__ = "knowledge_files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    size = Column(String, nullable=False)
    status = Column(String, default="Processing")
    uploaded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
