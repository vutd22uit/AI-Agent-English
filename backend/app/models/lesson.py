from sqlalchemy import Column, String, Integer, Numeric, DateTime, Boolean, Text, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from ..db.base import Base


class Topic(Base):
    __tablename__ = "topics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    category = Column(String(100))
    difficulty_level = Column(String(2))
    keywords = Column(ARRAY(Text))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    lessons = relationship("Lesson", back_populates="topic")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    skill_type = Column(String(20), nullable=False)
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id", ondelete="SET NULL"))
    title = Column(String(255), nullable=False)
    cefr_level = Column(String(2))
    estimated_duration_minutes = Column(Integer)
    difficulty_score = Column(Numeric(3, 2))
    content = Column(JSONB)
    metadata = Column(JSONB)
    is_generated = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    topic = relationship("Topic", back_populates="lessons")
    reading_passage = relationship("ReadingPassage", back_populates="lesson", uselist=False, cascade="all, delete-orphan")
    listening_script = relationship("ListeningScript", back_populates="lesson", uselist=False, cascade="all, delete-orphan")
    writing_prompt = relationship("WritingPrompt", back_populates="lesson", uselist=False, cascade="all, delete-orphan")
    speaking_prompt = relationship("SpeakingPrompt", back_populates="lesson", uselist=False, cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="lesson", cascade="all, delete-orphan")
    user_progress = relationship("UserLessonProgress", back_populates="lesson", cascade="all, delete-orphan")


class ReadingPassage(Base):
    __tablename__ = "reading_passages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lesson_id = Column(UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), unique=True, nullable=False)
    passage_text = Column(Text, nullable=False)
    word_count = Column(Integer)
    reading_time_minutes = Column(Integer)
    passage_type = Column(String(50))
    vocabulary_complexity = Column(Numeric(3, 2))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    lesson = relationship("Lesson", back_populates="reading_passage")


class ListeningScript(Base):
    __tablename__ = "listening_scripts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lesson_id = Column(UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), unique=True, nullable=False)
    script_text = Column(Text, nullable=False)
    audio_url = Column(String(500))
    duration_seconds = Column(Integer)
    speaker_count = Column(Integer)
    accent = Column(String(50))
    speech_rate = Column(String(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    lesson = relationship("Lesson", back_populates="listening_script")


class WritingPrompt(Base):
    __tablename__ = "writing_prompts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lesson_id = Column(UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), unique=True, nullable=False)
    prompt_text = Column(Text, nullable=False)
    task_type = Column(String(20))
    word_count_requirement = Column(Integer)
    time_limit_minutes = Column(Integer)
    sample_answer = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    lesson = relationship("Lesson", back_populates="writing_prompt")


class SpeakingPrompt(Base):
    __tablename__ = "speaking_prompts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lesson_id = Column(UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), unique=True, nullable=False)
    part_number = Column(Integer)
    prompt_text = Column(Text, nullable=False)
    follow_up_questions = Column(ARRAY(Text))
    time_limit_seconds = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    lesson = relationship("Lesson", back_populates="speaking_prompt")


class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lesson_id = Column(UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    question_number = Column(Integer, nullable=False)
    question_type = Column(String(50))
    question_text = Column(Text, nullable=False)
    options = Column(JSONB)
    correct_answer = Column(Text)
    explanation = Column(Text)
    points = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    lesson = relationship("Lesson", back_populates="questions")
