from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from app.schemas.lesson import ReadingLesson, ListeningLesson, LessonGenerateRequest, AssessmentRequest, AssessmentResponse
from app.services import llm

router = APIRouter()


@router.get("/")
async def get_lessons(
    skill_type: Optional[str] = Query(None, description="Filter by skill type"),
    cefr_level: Optional[str] = Query(None, description="Filter by CEFR level")
):
    """Get all lessons with optional filters"""
    return {
        "message": "Get lessons endpoint",
        "filters": {"skill_type": skill_type, "cefr_level": cefr_level}
    }


@router.post("/generate/reading", response_model=ReadingLesson)
async def generate_reading_lesson(request: LessonGenerateRequest):
    """Generate a reading lesson based on topic and level"""
    try:
        return await llm.generate_reading_lesson(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate/listening", response_model=ListeningLesson)
async def generate_listening_lesson(request: LessonGenerateRequest):
    """Generate a listening lesson based on topic and level"""
    try:
        return await llm.generate_listening_lesson(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/assessment/grade", response_model=AssessmentResponse)
async def grade_assessment(request: AssessmentRequest):
    """Grade writing or speaking assessment using AI Teacher"""
    try:
        return await llm.grade_assessment(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{lesson_id}")
async def get_lesson(lesson_id: str):
    """Get lesson by ID"""
    return {"message": f"Get lesson {lesson_id} endpoint"}


@router.get("/recommended/{user_id}")
async def get_recommended_lessons(user_id: str):
    """Get recommended lessons for user"""
    return {"message": f"Get recommended lessons for user {user_id}"}
