"""
Lessons API endpoints for retrieving and generating IELTS lessons
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
import uuid
from datetime import datetime

from app.db.base import get_db
from app.core.dependencies import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.lesson import Lesson, Topic, ReadingPassage, Question
from app.services.content_generator import content_generator
from app.schemas import (
    LessonResponse,
    CompleteLessonResponse,
    GenerateReadingRequest,
    GenerateListeningRequest,
    GenerateWritingRequest,
    GenerateSpeakingRequest,
)

router = APIRouter()


@router.get("/", response_model=List[LessonResponse])
async def get_lessons(
    skill_type: Optional[str] = Query(None, description="Filter by skill type (listening, reading, writing, speaking)"),
    cefr_level: Optional[str] = Query(None, description="Filter by CEFR level (A1-C2)"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Get all lessons with optional filters

    - Optional authentication (shows personalized results if logged in)
    - Filters by skill type and CEFR level
    - Pagination support
    """
    query = db.query(Lesson)

    # Apply filters
    if skill_type:
        query = query.filter(Lesson.skill_type == skill_type)
    if cefr_level:
        query = query.filter(Lesson.cefr_level == cefr_level)

    # Order by created date (newest first)
    query = query.order_by(Lesson.created_at.desc())

    # Pagination
    lessons = query.offset(offset).limit(limit).all()

    return [LessonResponse.model_validate(lesson) for lesson in lessons]


@router.get("/{lesson_id}", response_model=CompleteLessonResponse)
async def get_lesson(
    lesson_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Get lesson by ID with complete details

    - Returns lesson with passage/script and questions
    - Optional authentication
    """
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()

    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )

    # Load related data
    topic = db.query(Topic).filter(Topic.id == lesson.topic_id).first() if lesson.topic_id else None
    reading_passage = db.query(ReadingPassage).filter(ReadingPassage.lesson_id == lesson.id).first()
    questions = db.query(Question).filter(Question.lesson_id == lesson.id).order_by(Question.question_number).all()

    lesson_dict = {
        **lesson.__dict__,
        "topic": topic,
        "reading_passage": reading_passage,
        "questions": questions
    }

    return CompleteLessonResponse.model_validate(lesson_dict)


@router.post("/generate/reading", response_model=CompleteLessonResponse, status_code=status.HTTP_201_CREATED)
async def generate_reading_lesson(
    request: GenerateReadingRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Generate a complete reading lesson with AI

    - Generates passage based on topic and level
    - Automatically creates comprehension questions
    - Saves to database
    - Optional authentication (tracks who generated it)
    """
    # Generate complete lesson using AI
    result = await content_generator.generate_complete_reading_lesson(
        topic=request.topic,
        cefr_level=request.cefr_level,
        passage_type=request.passage_type
    )

    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate lesson: {result['error']}"
        )

    # Create or get topic
    topic = db.query(Topic).filter(Topic.name == request.topic).first()
    if not topic:
        topic = Topic(
            id=uuid.uuid4(),
            name=request.topic,
            difficulty_level=request.cefr_level,
            created_at=datetime.utcnow()
        )
        db.add(topic)
        db.flush()

    # Create lesson
    passage_data = result.get("passage", {})
    lesson = Lesson(
        id=uuid.uuid4(),
        skill_type="reading",
        topic_id=topic.id,
        title=passage_data.get("title", f"Reading: {request.topic}"),
        cefr_level=request.cefr_level,
        estimated_duration_minutes=passage_data.get("reading_time_minutes", 15),
        difficulty_score=passage_data.get("vocabulary_complexity", 5.0),
        is_generated=True,
        content={"passage_type": request.passage_type},
        metadata=result.get("metadata", {}),
        created_at=datetime.utcnow()
    )
    db.add(lesson)
    db.flush()

    # Create reading passage
    reading_passage = ReadingPassage(
        id=uuid.uuid4(),
        lesson_id=lesson.id,
        passage_text=passage_data.get("passage_text", ""),
        word_count=passage_data.get("word_count", 0),
        reading_time_minutes=passage_data.get("reading_time_minutes", 15),
        passage_type=request.passage_type,
        vocabulary_complexity=passage_data.get("vocabulary_complexity", 5.0),
        created_at=datetime.utcnow()
    )
    db.add(reading_passage)

    # Create questions
    questions = []
    for q_data in result.get("questions", []):
        question = Question(
            id=uuid.uuid4(),
            lesson_id=lesson.id,
            question_number=q_data.get("question_number", 1),
            question_type=q_data.get("question_type", "multiple_choice"),
            question_text=q_data.get("question_text", ""),
            options=q_data.get("options"),
            correct_answer=q_data.get("correct_answer"),
            explanation=q_data.get("explanation"),
            points=q_data.get("points", 1),
            created_at=datetime.utcnow()
        )
        db.add(question)
        questions.append(question)

    db.commit()
    db.refresh(lesson)

    # Return complete lesson
    lesson_dict = {
        **lesson.__dict__,
        "topic": topic,
        "reading_passage": reading_passage,
        "questions": questions
    }

    return CompleteLessonResponse.model_validate(lesson_dict)


@router.post("/generate/listening", response_model=CompleteLessonResponse, status_code=status.HTTP_201_CREATED)
async def generate_listening_lesson(
    request: GenerateListeningRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Generate a complete listening lesson with AI

    - Generates listening script
    - Creates comprehension questions
    - Saves to database
    """
    # Generate complete lesson
    result = await content_generator.generate_complete_listening_lesson(
        topic=request.topic,
        cefr_level=request.cefr_level,
        section_type=request.section_type
    )

    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate lesson: {result['error']}"
        )

    # Create or get topic
    topic = db.query(Topic).filter(Topic.name == request.topic).first()
    if not topic:
        topic = Topic(
            id=uuid.uuid4(),
            name=request.topic,
            difficulty_level=request.cefr_level,
            created_at=datetime.utcnow()
        )
        db.add(topic)
        db.flush()

    # Create lesson
    script_data = result.get("script", {})
    lesson = Lesson(
        id=uuid.uuid4(),
        skill_type="listening",
        topic_id=topic.id,
        title=script_data.get("title", f"Listening: {request.topic}"),
        cefr_level=request.cefr_level,
        estimated_duration_minutes=script_data.get("duration_seconds", 300) // 60,
        is_generated=True,
        content={"script_text": script_data.get("script_text", "")},
        metadata=result.get("metadata", {}),
        created_at=datetime.utcnow()
    )
    db.add(lesson)
    db.flush()

    # Create questions
    questions = []
    for q_data in result.get("questions", []):
        question = Question(
            id=uuid.uuid4(),
            lesson_id=lesson.id,
            question_number=q_data.get("question_number", 1),
            question_type=q_data.get("question_type", "multiple_choice"),
            question_text=q_data.get("question_text", ""),
            options=q_data.get("options"),
            correct_answer=q_data.get("correct_answer"),
            explanation=q_data.get("explanation"),
            points=q_data.get("points", 1),
            created_at=datetime.utcnow()
        )
        db.add(question)
        questions.append(question)

    db.commit()
    db.refresh(lesson)

    lesson_dict = {
        **lesson.__dict__,
        "topic": topic,
        "questions": questions
    }

    return CompleteLessonResponse.model_validate(lesson_dict)


@router.post("/generate/writing", response_model=LessonResponse, status_code=status.HTTP_201_CREATED)
async def generate_writing_prompt(
    request: GenerateWritingRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Generate a writing prompt with AI

    - Creates IELTS Writing Task 1 or Task 2 prompt
    - Saves to database
    """
    result = await content_generator.generate_writing_prompt(
        task_type=request.task_type,
        topic=request.topic,
        cefr_level=request.cefr_level,
        prompt_format=request.prompt_format
    )

    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate prompt: {result['error']}"
        )

    # Create or get topic
    topic = db.query(Topic).filter(Topic.name == request.topic).first()
    if not topic:
        topic = Topic(
            id=uuid.uuid4(),
            name=request.topic,
            difficulty_level=request.cefr_level,
            created_at=datetime.utcnow()
        )
        db.add(topic)
        db.flush()

    # Create lesson
    lesson = Lesson(
        id=uuid.uuid4(),
        skill_type="writing",
        topic_id=topic.id,
        title=f"Writing {request.task_type.upper()}: {request.topic}",
        cefr_level=request.cefr_level,
        estimated_duration_minutes=result.get("time_limit_minutes", 40),
        is_generated=True,
        content={"prompt_text": result.get("prompt_text", ""), "task_type": request.task_type},
        metadata=result,
        created_at=datetime.utcnow()
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)

    return LessonResponse.model_validate(lesson)


@router.post("/generate/speaking", response_model=LessonResponse, status_code=status.HTTP_201_CREATED)
async def generate_speaking_prompt(
    request: GenerateSpeakingRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Generate a speaking prompt with AI

    - Creates IELTS Speaking Part 1, 2, or 3 prompt
    - Saves to database
    """
    result = await content_generator.generate_speaking_prompt(
        part_number=request.part_number,
        topic=request.topic,
        cefr_level=request.cefr_level
    )

    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate prompt: {result['error']}"
        )

    # Create or get topic
    topic = db.query(Topic).filter(Topic.name == request.topic).first()
    if not topic:
        topic = Topic(
            id=uuid.uuid4(),
            name=request.topic,
            difficulty_level=request.cefr_level,
            created_at=datetime.utcnow()
        )
        db.add(topic)
        db.flush()

    # Create lesson
    lesson = Lesson(
        id=uuid.uuid4(),
        skill_type="speaking",
        topic_id=topic.id,
        title=f"Speaking Part {request.part_number}: {request.topic}",
        cefr_level=request.cefr_level,
        estimated_duration_minutes=result.get("speaking_time_seconds", 120) // 60,
        is_generated=True,
        content={"prompt_text": result.get("prompt_text", ""), "part_number": request.part_number},
        metadata=result,
        created_at=datetime.utcnow()
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)

    return LessonResponse.model_validate(lesson)


@router.get("/recommended/{user_id}")
async def get_recommended_lessons(
    user_id: uuid.UUID,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get recommended lessons for user based on adaptive learning

    - Requires authentication
    - Returns personalized lesson recommendations
    - Uses adaptive algorithm based on:
      - Skill proficiency gaps
      - Learning history
      - Optimal difficulty progression
      - Balanced skill development
    """
    # Verify user can only get their own recommendations
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view recommendations for this user"
        )

    from app.services.recommendation_service import get_user_recommendations

    try:
        recommendations = get_user_recommendations(db, user_id, limit)
        return recommendations
    except Exception as e:
        # Fallback to simple recommendations if algorithm fails
        from app.models.user import UserProfile

        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        cefr_level = profile.current_cefr_level if profile else "B1"

        lessons = db.query(Lesson).filter(
            Lesson.cefr_level == cefr_level
        ).order_by(Lesson.created_at.desc()).limit(limit).all()

        return [
            {
                "id": str(lesson.id),
                "title": lesson.title,
                "skill_type": lesson.skill_type,
                "cefr_level": lesson.cefr_level,
                "estimated_duration_minutes": lesson.estimated_duration_minutes,
                "reason": "Matches your current level",
                "benefit_score": 50.0,
                "skill_gaps_addressed": [lesson.skill_type]
            }
            for lesson in lessons
        ]
