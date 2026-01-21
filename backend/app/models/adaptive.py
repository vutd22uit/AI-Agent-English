from sqlalchemy import Column, String, Integer, Numeric, DateTime, Date, ForeignKey, ARRAY, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from ..db.base import Base


class SkillProficiency(Base):
    __tablename__ = "skill_proficiency"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    skill_type = Column(String(20), nullable=False)
    sub_skill = Column(String(100))
    proficiency_level = Column(String(2))
    proficiency_score = Column(Numeric(5, 2))
    band_score_equivalent = Column(Numeric(2, 1))
    confidence_level = Column(Numeric(3, 2))
    sample_size = Column(Integer, default=0)
    last_assessed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="skill_proficiencies")


class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    current_phase = Column(String(50))
    recommended_cefr_level = Column(String(2))
    weekly_goal_lessons = Column(Integer)
    total_lessons_completed = Column(Integer, default=0)
    estimated_completion_date = Column(Date)
    last_recalculated_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="roadmap")


class RecommendedLesson(Base):
    __tablename__ = "recommended_lessons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    lesson_id = Column(UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    recommendation_rank = Column(Integer)
    reason = Column(Text)
    predicted_difficulty = Column(Numeric(3, 2))
    estimated_benefit_score = Column(Numeric(5, 2))
    skill_gaps_addressed = Column(ARRAY(Text))
    expires_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class LearningAnalytics(Base):
    __tablename__ = "learning_analytics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)

    # Daily metrics
    lessons_completed = Column(Integer, default=0)
    time_studied_minutes = Column(Integer, default=0)
    questions_answered = Column(Integer, default=0)
    questions_correct = Column(Integer, default=0)
    accuracy_rate = Column(Numeric(5, 2))

    # Skill-specific time
    listening_minutes = Column(Integer, default=0)
    reading_minutes = Column(Integer, default=0)
    writing_minutes = Column(Integer, default=0)
    speaking_minutes = Column(Integer, default=0)

    # Engagement
    streak_days = Column(Integer, default=0)
    avg_session_duration_minutes = Column(Numeric(5, 2))

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="analytics")
