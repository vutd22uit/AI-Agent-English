"""
Assessment Service for grading IELTS Writing and Speaking submissions
"""
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from app.services.ai_service import ai_service
from app.models.progress import UserSubmission, AIAssessment
from app.models.adaptive import SkillProficiency


class AssessmentService:
    """Service for assessing and grading IELTS submissions"""

    async def assess_writing_submission(
        self,
        db: Session,
        user_id: uuid.UUID,
        lesson_id: uuid.UUID,
        submission_text: str,
        prompt_text: str,
        task_type: str,
        cefr_level: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Assess a writing submission and save to database

        Args:
            db: Database session
            user_id: User ID
            lesson_id: Lesson ID
            submission_text: Student's essay
            prompt_text: Writing prompt
            task_type: "task1" or "task2"
            cefr_level: Student's current CEFR level

        Returns:
            Assessment result with band scores
        """
        # Calculate word count
        word_count = len(submission_text.split())

        # Create submission record
        submission = UserSubmission(
            id=uuid.uuid4(),
            user_id=user_id,
            lesson_id=lesson_id,
            skill_type="writing",
            submission_text=submission_text,
            word_count=word_count,
            submitted_at=datetime.utcnow()
        )
        db.add(submission)
        db.flush()  # Get submission ID

        # Get AI assessment
        ai_result = await ai_service.assess_writing(
            submission_text=submission_text,
            task_type=task_type,
            prompt_text=prompt_text,
            cefr_level=cefr_level
        )

        if "error" in ai_result:
            return {
                "error": ai_result["error"],
                "submission_id": str(submission.id)
            }

        # Create assessment record
        assessment = AIAssessment(
            id=uuid.uuid4(),
            submission_id=submission.id,
            overall_band_score=ai_result.get("overall_band_score"),
            task_achievement_score=ai_result.get("task_achievement_score"),
            coherence_cohesion_score=ai_result.get("coherence_cohesion_score"),
            lexical_resource_score=ai_result.get("lexical_resource_score"),
            grammatical_range_score=ai_result.get("grammatical_range_score"),
            detailed_feedback=ai_result.get("detailed_feedback"),
            strengths=ai_result.get("strengths", []),
            weaknesses=ai_result.get("weaknesses", []),
            improvement_suggestions=ai_result.get("improvement_suggestions", []),
            ai_model=ai_result.get("ai_model"),
            processing_time_seconds=ai_result.get("processing_time_seconds")
        )
        db.add(assessment)

        # Update user's skill proficiency
        await self._update_writing_proficiency(
            db=db,
            user_id=user_id,
            band_score=ai_result.get("overall_band_score"),
            criteria_scores={
                "task_achievement": ai_result.get("task_achievement_score"),
                "coherence_cohesion": ai_result.get("coherence_cohesion_score"),
                "lexical_resource": ai_result.get("lexical_resource_score"),
                "grammatical_range": ai_result.get("grammatical_range_score")
            }
        )

        db.commit()

        return {
            "submission_id": str(submission.id),
            "assessment_id": str(assessment.id),
            "overall_band_score": assessment.overall_band_score,
            "criteria_scores": {
                "task_achievement": assessment.task_achievement_score,
                "coherence_cohesion": assessment.coherence_cohesion_score,
                "lexical_resource": assessment.lexical_resource_score,
                "grammatical_range": assessment.grammatical_range_score
            },
            "detailed_feedback": assessment.detailed_feedback,
            "strengths": assessment.strengths,
            "weaknesses": assessment.weaknesses,
            "improvement_suggestions": assessment.improvement_suggestions,
            "word_count": word_count
        }

    async def assess_speaking_submission(
        self,
        db: Session,
        user_id: uuid.UUID,
        lesson_id: uuid.UUID,
        transcription: str,
        audio_url: Optional[str],
        prompt_text: str,
        part_number: int,
        cefr_level: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Assess a speaking submission (from audio transcription)

        Args:
            db: Database session
            user_id: User ID
            lesson_id: Lesson ID
            transcription: STT output
            audio_url: URL to audio file
            prompt_text: Speaking prompt
            part_number: IELTS Speaking part (1, 2, or 3)
            cefr_level: Student's current CEFR level

        Returns:
            Assessment result with band scores
        """
        word_count = len(transcription.split())

        # Create submission record
        submission = UserSubmission(
            id=uuid.uuid4(),
            user_id=user_id,
            lesson_id=lesson_id,
            skill_type="speaking",
            submission_text=None,
            audio_url=audio_url,
            transcription=transcription,
            word_count=word_count,
            submitted_at=datetime.utcnow()
        )
        db.add(submission)
        db.flush()

        # Get AI assessment
        ai_result = await ai_service.assess_speaking(
            transcription=transcription,
            prompt_text=prompt_text,
            part_number=part_number,
            cefr_level=cefr_level
        )

        if "error" in ai_result:
            return {
                "error": ai_result["error"],
                "submission_id": str(submission.id)
            }

        # Create assessment record
        assessment = AIAssessment(
            id=uuid.uuid4(),
            submission_id=submission.id,
            overall_band_score=ai_result.get("overall_band_score"),
            fluency_score=ai_result.get("fluency_score"),
            lexical_resource_score=ai_result.get("lexical_resource_score"),
            grammatical_range_score=ai_result.get("grammatical_range_score"),
            pronunciation_score=ai_result.get("pronunciation_score"),
            detailed_feedback=ai_result.get("detailed_feedback"),
            strengths=ai_result.get("strengths", []),
            weaknesses=ai_result.get("weaknesses", []),
            improvement_suggestions=ai_result.get("improvement_suggestions", []),
            ai_model=ai_result.get("ai_model"),
            processing_time_seconds=ai_result.get("processing_time_seconds")
        )
        db.add(assessment)

        # Update user's skill proficiency
        await self._update_speaking_proficiency(
            db=db,
            user_id=user_id,
            band_score=ai_result.get("overall_band_score"),
            criteria_scores={
                "fluency": ai_result.get("fluency_score"),
                "lexical_resource": ai_result.get("lexical_resource_score"),
                "grammatical_range": ai_result.get("grammatical_range_score"),
                "pronunciation": ai_result.get("pronunciation_score")
            }
        )

        db.commit()

        return {
            "submission_id": str(submission.id),
            "assessment_id": str(assessment.id),
            "overall_band_score": assessment.overall_band_score,
            "criteria_scores": {
                "fluency": assessment.fluency_score,
                "lexical_resource": assessment.lexical_resource_score,
                "grammatical_range": assessment.grammatical_range_score,
                "pronunciation": assessment.pronunciation_score
            },
            "detailed_feedback": assessment.detailed_feedback,
            "strengths": assessment.strengths,
            "weaknesses": assessment.weaknesses,
            "improvement_suggestions": assessment.improvement_suggestions
        }

    async def _update_writing_proficiency(
        self,
        db: Session,
        user_id: uuid.UUID,
        band_score: Optional[float],
        criteria_scores: Dict[str, Optional[float]]
    ):
        """Update user's writing skill proficiency based on assessment"""
        if not band_score:
            return

        # Update overall writing proficiency
        overall_prof = db.query(SkillProficiency).filter(
            SkillProficiency.user_id == user_id,
            SkillProficiency.skill_type == "writing",
            SkillProficiency.sub_skill == "overall"
        ).first()

        if overall_prof:
            # Update existing
            overall_prof.band_score_equivalent = band_score
            overall_prof.proficiency_score = (band_score / 9.0) * 100
            overall_prof.sample_size += 1
            overall_prof.last_assessed_at = datetime.utcnow()
        else:
            # Create new
            overall_prof = SkillProficiency(
                id=uuid.uuid4(),
                user_id=user_id,
                skill_type="writing",
                sub_skill="overall",
                band_score_equivalent=band_score,
                proficiency_score=(band_score / 9.0) * 100,
                sample_size=1,
                last_assessed_at=datetime.utcnow()
            )
            db.add(overall_prof)

        # Update sub-skills
        for sub_skill, score in criteria_scores.items():
            if score:
                prof = db.query(SkillProficiency).filter(
                    SkillProficiency.user_id == user_id,
                    SkillProficiency.skill_type == "writing",
                    SkillProficiency.sub_skill == sub_skill
                ).first()

                if prof:
                    prof.band_score_equivalent = score
                    prof.proficiency_score = (score / 9.0) * 100
                    prof.sample_size += 1
                    prof.last_assessed_at = datetime.utcnow()
                else:
                    prof = SkillProficiency(
                        id=uuid.uuid4(),
                        user_id=user_id,
                        skill_type="writing",
                        sub_skill=sub_skill,
                        band_score_equivalent=score,
                        proficiency_score=(score / 9.0) * 100,
                        sample_size=1,
                        last_assessed_at=datetime.utcnow()
                    )
                    db.add(prof)

    async def _update_speaking_proficiency(
        self,
        db: Session,
        user_id: uuid.UUID,
        band_score: Optional[float],
        criteria_scores: Dict[str, Optional[float]]
    ):
        """Update user's speaking skill proficiency based on assessment"""
        if not band_score:
            return

        # Update overall speaking proficiency
        overall_prof = db.query(SkillProficiency).filter(
            SkillProficiency.user_id == user_id,
            SkillProficiency.skill_type == "speaking",
            SkillProficiency.sub_skill == "overall"
        ).first()

        if overall_prof:
            overall_prof.band_score_equivalent = band_score
            overall_prof.proficiency_score = (band_score / 9.0) * 100
            overall_prof.sample_size += 1
            overall_prof.last_assessed_at = datetime.utcnow()
        else:
            overall_prof = SkillProficiency(
                id=uuid.uuid4(),
                user_id=user_id,
                skill_type="speaking",
                sub_skill="overall",
                band_score_equivalent=band_score,
                proficiency_score=(band_score / 9.0) * 100,
                sample_size=1,
                last_assessed_at=datetime.utcnow()
            )
            db.add(overall_prof)

        # Update sub-skills
        for sub_skill, score in criteria_scores.items():
            if score:
                prof = db.query(SkillProficiency).filter(
                    SkillProficiency.user_id == user_id,
                    SkillProficiency.skill_type == "speaking",
                    SkillProficiency.sub_skill == sub_skill
                ).first()

                if prof:
                    prof.band_score_equivalent = score
                    prof.proficiency_score = (score / 9.0) * 100
                    prof.sample_size += 1
                    prof.last_assessed_at = datetime.utcnow()
                else:
                    prof = SkillProficiency(
                        id=uuid.uuid4(),
                        user_id=user_id,
                        skill_type="speaking",
                        sub_skill=sub_skill,
                        band_score_equivalent=score,
                        proficiency_score=(score / 9.0) * 100,
                        sample_size=1,
                        last_assessed_at=datetime.utcnow()
                    )
                    db.add(prof)

    def get_assessment_by_id(
        self,
        db: Session,
        assessment_id: uuid.UUID
    ) -> Optional[AIAssessment]:
        """Retrieve an assessment by ID"""
        return db.query(AIAssessment).filter(AIAssessment.id == assessment_id).first()

    def get_user_assessment_history(
        self,
        db: Session,
        user_id: uuid.UUID,
        skill_type: Optional[str] = None,
        limit: int = 20
    ) -> list[AIAssessment]:
        """Get user's assessment history"""
        query = db.query(AIAssessment).join(UserSubmission).filter(
            UserSubmission.user_id == user_id
        )

        if skill_type:
            query = query.filter(UserSubmission.skill_type == skill_type)

        return query.order_by(AIAssessment.created_at.desc()).limit(limit).all()


# Singleton instance
assessment_service = AssessmentService()
