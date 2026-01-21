from sqlalchemy import Column, String, Integer, Numeric, DateTime, Boolean, Text, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from ..db.base import Base


class UserLessonProgress(Base):
    __tablename__ = "user_lesson_progress"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    lesson_id = Column(UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(20))
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    time_spent_minutes = Column(Integer, default=0)
    score = Column(Numeric(5, 2))
    attempts = Column(Integer, default=0)
    last_attempt_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="progress")
    lesson = relationship("Lesson", back_populates="user_progress")


class UserAnswer(Base):
    __tablename__ = "user_answers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    lesson_id = Column(UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    user_answer = Column(Text)
    is_correct = Column(Boolean)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())


class UserSubmission(Base):
    __tablename__ = "user_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    lesson_id = Column(UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    skill_type = Column(String(20), nullable=False)
    submission_text = Column(Text)
    audio_url = Column(String(500))
    transcription = Column(Text)
    word_count = Column(Integer)
    submitted_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="submissions")
    assessment = relationship("AIAssessment", back_populates="submission", uselist=False, cascade="all, delete-orphan")


class AIAssessment(Base):
    __tablename__ = "ai_assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id = Column(UUID(as_uuid=True), ForeignKey("user_submissions.id", ondelete="CASCADE"), unique=True, nullable=False)
    overall_band_score = Column(Numeric(2, 1))

    # IELTS criteria scores
    task_achievement_score = Column(Numeric(2, 1))
    coherence_cohesion_score = Column(Numeric(2, 1))
    lexical_resource_score = Column(Numeric(2, 1))
    grammatical_range_score = Column(Numeric(2, 1))

    # Speaking specific
    fluency_score = Column(Numeric(2, 1))
    pronunciation_score = Column(Numeric(2, 1))

    # Detailed feedback
    detailed_feedback = Column(JSONB)
    strengths = Column(ARRAY(Text))
    weaknesses = Column(ARRAY(Text))
    improvement_suggestions = Column(ARRAY(Text))

    ai_model = Column(String(50))
    processing_time_seconds = Column(Numeric(5, 2))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    submission = relationship("UserSubmission", back_populates="assessment")
