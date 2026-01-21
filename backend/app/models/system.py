from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.sql import func

from ..db.base import Base


class AIPrompt(Base):
    __tablename__ = "ai_prompts"

    prompt_name = Column(String(100), primary_key=True)
    prompt_type = Column(String(50))
    skill_type = Column(String(20))
    prompt_template = Column(Text, nullable=False)
    version = Column(String(20))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class SystemConfig(Base):
    __tablename__ = "system_config"

    key = Column(String(100), primary_key=True)
    value = Column(Text, nullable=False)
    description = Column(Text)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
