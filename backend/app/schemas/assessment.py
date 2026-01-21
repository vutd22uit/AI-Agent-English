"""
Pydantic schemas for Assessment-related requests and responses
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


# =====================================================
# SUBMISSION SCHEMAS
# =====================================================

class WritingSubmissionRequest(BaseModel):
    """Request to submit writing for assessment"""
    lesson_id: UUID
    submission_text: str = Field(..., min_length=50)
    prompt_text: str
    task_type: str = Field(..., pattern="^(task1|task2)$")


class SpeakingSubmissionRequest(BaseModel):
    """Request to submit speaking for assessment"""
    lesson_id: UUID
    transcription: str = Field(..., min_length=20)
    audio_url: Optional[str] = None
    prompt_text: str
    part_number: int = Field(..., ge=1, le=3)


# =====================================================
# ASSESSMENT RESPONSE SCHEMAS
# =====================================================

class AssessmentCriteriaScores(BaseModel):
    """IELTS assessment criteria scores"""
    task_achievement: Optional[float] = Field(None, ge=0, le=9)
    coherence_cohesion: Optional[float] = Field(None, ge=0, le=9)
    lexical_resource: Optional[float] = Field(None, ge=0, le=9)
    grammatical_range: Optional[float] = Field(None, ge=0, le=9)
    fluency: Optional[float] = Field(None, ge=0, le=9)
    pronunciation: Optional[float] = Field(None, ge=0, le=9)


class AssessmentResponse(BaseModel):
    """Complete assessment response"""
    submission_id: UUID
    assessment_id: UUID
    overall_band_score: float = Field(..., ge=0, le=9)
    criteria_scores: AssessmentCriteriaScores
    detailed_feedback: Dict[str, Any]
    strengths: List[str]
    weaknesses: List[str]
    improvement_suggestions: List[str]
    word_count: Optional[int] = None


class AssessmentHistoryItem(BaseModel):
    """Single item in assessment history"""
    id: UUID
    submission_id: UUID
    skill_type: str
    overall_band_score: float
    created_at: datetime
    lesson_id: UUID

    class Config:
        from_attributes = True


class AssessmentHistoryResponse(BaseModel):
    """User's assessment history"""
    assessments: List[AssessmentHistoryItem]
    total: int
    average_score: Optional[float] = None


# =====================================================
# DETAILED ASSESSMENT
# =====================================================

class DetailedAssessmentResponse(BaseModel):
    """Detailed assessment with all information"""
    id: UUID
    submission_id: UUID
    overall_band_score: float

    # Criteria scores
    task_achievement_score: Optional[float] = None
    coherence_cohesion_score: Optional[float] = None
    lexical_resource_score: Optional[float] = None
    grammatical_range_score: Optional[float] = None
    fluency_score: Optional[float] = None
    pronunciation_score: Optional[float] = None

    # Feedback
    detailed_feedback: Dict[str, Any]
    strengths: List[str]
    weaknesses: List[str]
    improvement_suggestions: List[str]

    # Metadata
    ai_model: str
    processing_time_seconds: float
    created_at: datetime

    class Config:
        from_attributes = True


# =====================================================
# PROGRESS SCHEMAS
# =====================================================

class UserProgressSummary(BaseModel):
    """Summary of user's progress"""
    total_lessons_completed: int
    total_assessments: int
    average_band_score: Optional[float] = None

    # By skill
    listening_completed: int
    reading_completed: int
    writing_completed: int
    speaking_completed: int

    # Average scores by skill
    listening_avg_score: Optional[float] = None
    reading_avg_score: Optional[float] = None
    writing_avg_score: Optional[float] = None
    speaking_avg_score: Optional[float] = None


class SkillProficiencyResponse(BaseModel):
    """User's skill proficiency"""
    skill_type: str
    sub_skill: str
    proficiency_level: Optional[str] = None
    proficiency_score: float
    band_score_equivalent: float
    confidence_level: Optional[float] = None
    sample_size: int
    last_assessed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
