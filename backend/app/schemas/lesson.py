from pydantic import BaseModel
from typing import List, Optional, Dict

class QuestionOption(BaseModel):
    id: str
    text: str

class Question(BaseModel):
    id: int
    type: str  # MCQ, TFNG, Completion
    text: str
    options: Optional[List[str]] = None
    answer: str

class LessonGenerateRequest(BaseModel):
    skill: str # 'reading' or 'listening'
    topic: str
    cefr_level: str = "B2"

class ReadingLesson(BaseModel):
    title: str
    passage: str
    questions: List[Question]
    answer_key: Dict[str, Dict[str, str]]

class ListeningLesson(BaseModel):
    title: str
    audio_script: str
    questions: List[Question]
    answer_key: Dict[str, Dict[str, str]]

class AssessmentRequest(BaseModel):
    task_type: str # 'writing_task1', 'writing_task2', 'speaking_part2'
    user_content: str
    prompt_context: Optional[str] = None

class BandScores(BaseModel):
    overall: float
    lexical_resource: float
    grammatical_range: float
    coherence_cohesion: float
    task_response: float

class AssessmentResponse(BaseModel):
    band_scores: BandScores
    feedback: str
    detailed_breakdown: Dict[str, str]
    suggestions: List[str]
