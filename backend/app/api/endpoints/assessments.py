"""
Assessments API endpoints for submitting and retrieving IELTS assessments
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.db.base import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.progress import AIAssessment, UserSubmission
from app.models.adaptive import SkillProficiency
from app.models.lesson import Lesson
from app.services.assessment_service import assessment_service
from app.schemas import (
    WritingSubmissionRequest,
    SpeakingSubmissionRequest,
    AssessmentResponse,
    AssessmentHistoryResponse,
    DetailedAssessmentResponse,
    UserProgressSummary,
    SkillProficiencyResponse,
    AssessmentCriteriaScores,
)

router = APIRouter()


@router.post("/submit/writing", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
async def submit_writing(
    submission: WritingSubmissionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit writing for AI assessment

    - Requires authentication
    - Analyzes essay with AI examiner
    - Returns detailed band scores and feedback
    - Automatically updates skill proficiency
    """
    # Verify lesson exists
    lesson = db.query(Lesson).filter(Lesson.id == submission.lesson_id).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )

    # Get user's CEFR level for context
    from app.models.user import UserProfile
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    cefr_level = profile.current_cefr_level if profile else None

    # Assess submission
    result = await assessment_service.assess_writing_submission(
        db=db,
        user_id=current_user.id,
        lesson_id=submission.lesson_id,
        submission_text=submission.submission_text,
        prompt_text=submission.prompt_text,
        task_type=submission.task_type,
        cefr_level=cefr_level
    )

    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Assessment failed: {result['error']}"
        )

    # Format response
    return AssessmentResponse(
        submission_id=uuid.UUID(result["submission_id"]),
        assessment_id=uuid.UUID(result["assessment_id"]),
        overall_band_score=result["overall_band_score"],
        criteria_scores=AssessmentCriteriaScores(**result["criteria_scores"]),
        detailed_feedback=result["detailed_feedback"],
        strengths=result["strengths"],
        weaknesses=result["weaknesses"],
        improvement_suggestions=result["improvement_suggestions"],
        word_count=result.get("word_count")
    )


@router.post("/submit/speaking", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
async def submit_speaking(
    submission: SpeakingSubmissionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit speaking for AI assessment

    - Requires authentication
    - Analyzes transcribed speech with AI examiner
    - Returns detailed band scores and feedback
    - Automatically updates skill proficiency
    """
    # Verify lesson exists
    lesson = db.query(Lesson).filter(Lesson.id == submission.lesson_id).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )

    # Get user's CEFR level
    from app.models.user import UserProfile
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    cefr_level = profile.current_cefr_level if profile else None

    # Assess submission
    result = await assessment_service.assess_speaking_submission(
        db=db,
        user_id=current_user.id,
        lesson_id=submission.lesson_id,
        transcription=submission.transcription,
        audio_url=submission.audio_url,
        prompt_text=submission.prompt_text,
        part_number=submission.part_number,
        cefr_level=cefr_level
    )

    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Assessment failed: {result['error']}"
        )

    # Format response
    return AssessmentResponse(
        submission_id=uuid.UUID(result["submission_id"]),
        assessment_id=uuid.UUID(result["assessment_id"]),
        overall_band_score=result["overall_band_score"],
        criteria_scores=AssessmentCriteriaScores(**result["criteria_scores"]),
        detailed_feedback=result["detailed_feedback"],
        strengths=result["strengths"],
        weaknesses=result["weaknesses"],
        improvement_suggestions=result["improvement_suggestions"]
    )


@router.get("/{assessment_id}", response_model=DetailedAssessmentResponse)
async def get_assessment(
    assessment_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get assessment result by ID

    - Requires authentication
    - Returns complete assessment details
    - Users can only view their own assessments
    """
    assessment = db.query(AIAssessment).filter(AIAssessment.id == assessment_id).first()

    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )

    # Verify ownership
    submission = db.query(UserSubmission).filter(UserSubmission.id == assessment.submission_id).first()
    if not submission or submission.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this assessment"
        )

    return DetailedAssessmentResponse.model_validate(assessment)


@router.get("/user/{user_id}/history", response_model=AssessmentHistoryResponse)
async def get_user_assessments(
    user_id: uuid.UUID,
    skill_type: str = None,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's assessment history

    - Requires authentication
    - Users can only view their own history
    - Optional filter by skill type
    - Returns list of assessments with summary statistics
    """
    # Verify user can only view their own history
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this user's history"
        )

    # Get assessments
    assessments = assessment_service.get_user_assessment_history(
        db=db,
        user_id=user_id,
        skill_type=skill_type,
        limit=limit
    )

    # Calculate average score
    if assessments:
        scores = [a.overall_band_score for a in assessments if a.overall_band_score]
        average_score = sum(scores) / len(scores) if scores else None
    else:
        average_score = None

    # Format response
    from app.schemas.assessment import AssessmentHistoryItem
    history_items = []
    for assessment in assessments:
        submission = db.query(UserSubmission).filter(
            UserSubmission.id == assessment.submission_id
        ).first()

        if submission:
            history_items.append(AssessmentHistoryItem(
                id=assessment.id,
                submission_id=assessment.submission_id,
                skill_type=submission.skill_type,
                overall_band_score=assessment.overall_band_score,
                created_at=assessment.created_at,
                lesson_id=submission.lesson_id
            ))

    return AssessmentHistoryResponse(
        assessments=history_items,
        total=len(history_items),
        average_score=average_score
    )


@router.get("/user/{user_id}/progress", response_model=UserProgressSummary)
async def get_user_progress(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's learning progress summary

    - Requires authentication
    - Returns overall progress statistics
    - Includes per-skill breakdown
    """
    # Verify authorization
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this user's progress"
        )

    # Get all assessments by skill type
    from sqlalchemy import func

    # Total assessments
    total_assessments = db.query(func.count(AIAssessment.id)).join(UserSubmission).filter(
        UserSubmission.user_id == user_id
    ).scalar()

    # Average score
    avg_score = db.query(func.avg(AIAssessment.overall_band_score)).join(UserSubmission).filter(
        UserSubmission.user_id == user_id
    ).scalar()

    # Per-skill stats
    def get_skill_stats(skill: str):
        count = db.query(func.count(AIAssessment.id)).join(UserSubmission).filter(
            UserSubmission.user_id == user_id,
            UserSubmission.skill_type == skill
        ).scalar()

        avg = db.query(func.avg(AIAssessment.overall_band_score)).join(UserSubmission).filter(
            UserSubmission.user_id == user_id,
            UserSubmission.skill_type == skill
        ).scalar()

        return count or 0, float(avg) if avg else None

    listening_count, listening_avg = get_skill_stats("listening")
    reading_count, reading_avg = get_skill_stats("reading")
    writing_count, writing_avg = get_skill_stats("writing")
    speaking_count, speaking_avg = get_skill_stats("speaking")

    # TODO: Get completed lessons from user_lesson_progress table
    total_lessons_completed = total_assessments  # Simplified for now

    return UserProgressSummary(
        total_lessons_completed=total_lessons_completed,
        total_assessments=total_assessments or 0,
        average_band_score=float(avg_score) if avg_score else None,
        listening_completed=listening_count,
        reading_completed=reading_count,
        writing_completed=writing_count,
        speaking_completed=speaking_count,
        listening_avg_score=listening_avg,
        reading_avg_score=reading_avg,
        writing_avg_score=writing_avg,
        speaking_avg_score=speaking_avg
    )


@router.get("/user/{user_id}/proficiency", response_model=List[SkillProficiencyResponse])
async def get_user_proficiency(
    user_id: uuid.UUID,
    skill_type: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's skill proficiency breakdown

    - Requires authentication
    - Returns proficiency for all skills and sub-skills
    - Optional filter by skill type
    """
    # Verify authorization
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this user's proficiency"
        )

    # Query proficiency
    query = db.query(SkillProficiency).filter(SkillProficiency.user_id == user_id)

    if skill_type:
        query = query.filter(SkillProficiency.skill_type == skill_type)

    proficiencies = query.order_by(
        SkillProficiency.skill_type,
        SkillProficiency.sub_skill
    ).all()

    return [SkillProficiencyResponse.model_validate(p) for p in proficiencies]
