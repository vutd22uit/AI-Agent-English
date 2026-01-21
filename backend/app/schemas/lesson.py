"""
Pydantic schemas for Lesson-related requests and responses
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


# =====================================================
# TOPIC SCHEMAS
# =====================================================

class TopicBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    category: Optional[str] = Field(None, max_length=100)
    difficulty_level: Optional[str] = Field(None, pattern="^(A1|A2|B1|B2|C1|C2)$")
    keywords: Optional[List[str]] = None


class TopicCreate(TopicBase):
    pass


class TopicResponse(TopicBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# =====================================================
# LESSON SCHEMAS
# =====================================================

class LessonBase(BaseModel):
    skill_type: str = Field(..., pattern="^(listening|reading|writing|speaking)$")
    title: str = Field(..., min_length=2, max_length=255)
    cefr_level: Optional[str] = Field(None, pattern="^(A1|A2|B1|B2|C1|C2)$")
    estimated_duration_minutes: Optional[int] = Field(None, ge=1, le=180)
    difficulty_score: Optional[float] = Field(None, ge=0, le=10)


class LessonCreate(LessonBase):
    topic_id: Optional[UUID] = None
    content: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None


class LessonResponse(LessonBase):
    id: UUID
    topic_id: Optional[UUID] = None
    is_generated: bool
    created_at: datetime
    updated_at: datetime
    content: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


# =====================================================
# READING PASSAGE SCHEMAS
# =====================================================

class ReadingPassageBase(BaseModel):
    passage_text: str = Field(..., min_length=100)
    word_count: Optional[int] = None
    reading_time_minutes: Optional[int] = None
    passage_type: Optional[str] = Field(None, max_length=50)
    vocabulary_complexity: Optional[float] = Field(None, ge=0, le=10)


class ReadingPassageCreate(ReadingPassageBase):
    lesson_id: UUID


class ReadingPassageResponse(ReadingPassageBase):
    id: UUID
    lesson_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# =====================================================
# QUESTION SCHEMAS
# =====================================================

class QuestionBase(BaseModel):
    question_number: int = Field(..., ge=1)
    question_type: str = Field(..., max_length=50)
    question_text: str = Field(..., min_length=5)
    options: Optional[Dict[str, Any]] = None
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None
    points: int = Field(default=1, ge=1)


class QuestionCreate(QuestionBase):
    lesson_id: UUID


class QuestionResponse(QuestionBase):
    id: UUID
    lesson_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# =====================================================
# COMPLETE LESSON SCHEMAS
# =====================================================

class CompleteLessonResponse(LessonResponse):
    """Lesson with all related content"""
    topic: Optional[TopicResponse] = None
    reading_passage: Optional[ReadingPassageResponse] = None
    questions: List[QuestionResponse] = []

    class Config:
        from_attributes = True


# =====================================================
# LESSON GENERATION REQUEST
# =====================================================

class GenerateReadingRequest(BaseModel):
    """Request to generate a reading lesson"""
    topic: str = Field(..., min_length=2, max_length=200)
    cefr_level: str = Field(..., pattern="^(A1|A2|B1|B2|C1|C2)$")
    passage_type: str = Field(default="expository", pattern="^(descriptive|argumentative|narrative|expository)$")
    word_count_target: int = Field(default=800, ge=400, le=1200)


class GenerateListeningRequest(BaseModel):
    """Request to generate a listening lesson"""
    topic: str = Field(..., min_length=2, max_length=200)
    cefr_level: str = Field(..., pattern="^(A1|A2|B1|B2|C1|C2)$")
    section_type: str = Field(default="social_daily")
    speaker_count: int = Field(default=2, ge=1, le=4)
    accent: str = Field(default="British", pattern="^(British|American|Australian)$")
    duration_minutes: int = Field(default=5, ge=3, le=10)


class GenerateWritingRequest(BaseModel):
    """Request to generate a writing prompt"""
    topic: str = Field(..., min_length=2, max_length=200)
    cefr_level: str = Field(..., pattern="^(A1|A2|B1|B2|C1|C2)$")
    task_type: str = Field(..., pattern="^(task1|task2)$")
    prompt_format: Optional[str] = None


class GenerateSpeakingRequest(BaseModel):
    """Request to generate a speaking prompt"""
    topic: str = Field(..., min_length=2, max_length=200)
    cefr_level: str = Field(..., pattern="^(A1|A2|B1|B2|C1|C2)$")
    part_number: int = Field(..., ge=1, le=3)


# =====================================================
# LESSON FILTERS
# =====================================================

class LessonFilterParams(BaseModel):
    """Query parameters for filtering lessons"""
    skill_type: Optional[str] = Field(None, pattern="^(listening|reading|writing|speaking)$")
    cefr_level: Optional[str] = Field(None, pattern="^(A1|A2|B1|B2|C1|C2)$")
    topic_id: Optional[UUID] = None
    is_generated: Optional[bool] = None
    limit: int = Field(default=20, ge=1, le=100)
    offset: int = Field(default=0, ge=0)
