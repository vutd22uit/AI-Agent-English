from sqlalchemy import Column, String, Boolean, DateTime, Integer, Numeric, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from ..db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime(timezone=True))

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    progress = relationship("UserLessonProgress", back_populates="user", cascade="all, delete-orphan")
    submissions = relationship("UserSubmission", back_populates="user", cascade="all, delete-orphan")
    skill_proficiencies = relationship("SkillProficiency", back_populates="user", cascade="all, delete-orphan")
    roadmap = relationship("LearningRoadmap", back_populates="user", uselist=False, cascade="all, delete-orphan")
    analytics = relationship("LearningAnalytics", back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    current_cefr_level = Column(String(2))
    target_band_score = Column(Numeric(2, 1))
    target_exam_date = Column(Date)
    native_language = Column(String(50))
    study_hours_per_week = Column(Integer)
    preferred_study_time = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="profile")
