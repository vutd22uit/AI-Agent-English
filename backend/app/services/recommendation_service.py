"""
Adaptive Recommendation Service

Implements intelligent lesson recommendations based on:
- User skill proficiency gaps
- Learning history and patterns
- Optimal difficulty progression
- Balanced skill development
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from decimal import Decimal
import uuid

from app.models.user import User, UserProfile
from app.models.lesson import Lesson
from app.models.adaptive import SkillProficiency, LearningRoadmap, RecommendedLesson
from app.models.progress import UserLessonProgress, AIAssessment, UserSubmission


# CEFR level progression
CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"]
CEFR_BAND_MAP = {
    "A1": 2.5, "A2": 3.5, "B1": 4.5, "B2": 5.5, "C1": 7.0, "C2": 8.5
}

# Skill types
SKILL_TYPES = ["listening", "reading", "writing", "speaking"]


class RecommendationService:
    """Service for generating adaptive lesson recommendations"""

    def __init__(self, db: Session):
        self.db = db

    def get_recommendations(
        self,
        user_id: uuid.UUID,
        limit: int = 10
    ) -> List[Dict]:
        """
        Generate personalized lesson recommendations for a user

        Algorithm:
        1. Analyze user's skill proficiency across all skills
        2. Identify weakest skills and skill gaps
        3. Get completed lessons to avoid repetition
        4. Score available lessons based on:
           - Skill gap relevance
           - Difficulty match
           - Recency (newer content preferred)
           - Skill balance
        5. Return top recommendations with reasons
        """
        # Get user profile and proficiencies
        profile = self.db.query(UserProfile).filter(
            UserProfile.user_id == user_id
        ).first()

        proficiencies = self.db.query(SkillProficiency).filter(
            SkillProficiency.user_id == user_id
        ).all()

        # Get completed lesson IDs
        completed_lessons = self.db.query(UserLessonProgress.lesson_id).filter(
            UserLessonProgress.user_id == user_id,
            UserLessonProgress.status == "completed"
        ).all()
        completed_ids = {l[0] for l in completed_lessons}

        # Analyze skill gaps
        skill_analysis = self._analyze_skill_gaps(proficiencies, profile)

        # Get user's optimal CEFR level
        target_level = self._determine_target_level(profile, skill_analysis)

        # Get candidate lessons
        candidate_lessons = self._get_candidate_lessons(
            target_level=target_level,
            completed_ids=completed_ids,
            limit=limit * 3  # Get more candidates for scoring
        )

        # Score and rank lessons
        scored_lessons = []
        for lesson in candidate_lessons:
            score, reason = self._score_lesson(
                lesson=lesson,
                skill_analysis=skill_analysis,
                target_level=target_level,
                profile=profile
            )
            scored_lessons.append({
                "lesson": lesson,
                "score": score,
                "reason": reason,
                "skill_gaps_addressed": self._get_addressed_gaps(lesson, skill_analysis)
            })

        # Sort by score and return top recommendations
        scored_lessons.sort(key=lambda x: x["score"], reverse=True)
        top_recommendations = scored_lessons[:limit]

        # Save recommendations to database
        self._save_recommendations(user_id, top_recommendations)

        return [
            {
                "id": str(r["lesson"].id),
                "title": r["lesson"].title,
                "skill_type": r["lesson"].skill_type,
                "cefr_level": r["lesson"].cefr_level,
                "estimated_duration_minutes": r["lesson"].estimated_duration_minutes,
                "reason": r["reason"],
                "benefit_score": float(r["score"]),
                "skill_gaps_addressed": r["skill_gaps_addressed"]
            }
            for r in top_recommendations
        ]

    def _analyze_skill_gaps(
        self,
        proficiencies: List[SkillProficiency],
        profile: Optional[UserProfile]
    ) -> Dict:
        """Analyze user's skill gaps and weaknesses"""
        target_band = profile.target_band_score if profile else 6.5

        skill_scores = {}
        for skill in SKILL_TYPES:
            prof = next((p for p in proficiencies if p.skill_type == skill), None)
            if prof:
                current_score = float(prof.band_score_equivalent or 5.0)
            else:
                current_score = 5.0  # Default score for new users

            gap = target_band - current_score
            skill_scores[skill] = {
                "current": current_score,
                "target": target_band,
                "gap": max(0, gap),
                "priority": 1.0 + (gap * 0.5) if gap > 0 else 0.5  # Higher priority for larger gaps
            }

        # Identify weakest skill
        weakest_skill = min(skill_scores.items(), key=lambda x: x[1]["current"])
        skill_scores["weakest"] = weakest_skill[0]

        # Calculate overall proficiency
        avg_score = sum(s["current"] for s in skill_scores.values() if isinstance(s, dict)) / 4
        skill_scores["average"] = avg_score

        return skill_scores

    def _determine_target_level(
        self,
        profile: Optional[UserProfile],
        skill_analysis: Dict
    ) -> str:
        """Determine the optimal CEFR level for recommendations"""
        if profile and profile.current_cefr_level:
            base_level = profile.current_cefr_level
        else:
            # Estimate from average score
            avg_score = skill_analysis.get("average", 5.0)
            base_level = self._band_to_cefr(avg_score)

        # Allow content slightly above current level for growth
        current_idx = CEFR_LEVELS.index(base_level) if base_level in CEFR_LEVELS else 2
        return CEFR_LEVELS[min(current_idx + 1, len(CEFR_LEVELS) - 1)]

    def _band_to_cefr(self, band_score: float) -> str:
        """Convert IELTS band score to CEFR level"""
        if band_score < 3.0:
            return "A1"
        elif band_score < 4.0:
            return "A2"
        elif band_score < 5.0:
            return "B1"
        elif band_score < 6.5:
            return "B2"
        elif band_score < 8.0:
            return "C1"
        else:
            return "C2"

    def _get_candidate_lessons(
        self,
        target_level: str,
        completed_ids: set,
        limit: int
    ) -> List[Lesson]:
        """Get candidate lessons for recommendation"""
        target_idx = CEFR_LEVELS.index(target_level) if target_level in CEFR_LEVELS else 2

        # Get adjacent levels
        adjacent_levels = []
        if target_idx > 0:
            adjacent_levels.append(CEFR_LEVELS[target_idx - 1])
        adjacent_levels.append(target_level)
        if target_idx < len(CEFR_LEVELS) - 1:
            adjacent_levels.append(CEFR_LEVELS[target_idx + 1])

        # Query lessons
        query = self.db.query(Lesson).filter(
            Lesson.cefr_level.in_(adjacent_levels)
        )

        # Exclude completed lessons
        if completed_ids:
            query = query.filter(~Lesson.id.in_(completed_ids))

        # Order by creation date (newer first) and get candidates
        lessons = query.order_by(desc(Lesson.created_at)).limit(limit).all()

        return lessons

    def _score_lesson(
        self,
        lesson: Lesson,
        skill_analysis: Dict,
        target_level: str,
        profile: Optional[UserProfile]
    ) -> tuple:
        """Score a lesson based on multiple factors"""
        score = 0.0
        reasons = []

        # 1. Skill gap relevance (40% weight)
        skill_data = skill_analysis.get(lesson.skill_type, {})
        skill_priority = skill_data.get("priority", 1.0) if isinstance(skill_data, dict) else 1.0
        skill_score = skill_priority * 40
        score += skill_score

        if lesson.skill_type == skill_analysis.get("weakest"):
            score += 15  # Bonus for weakest skill
            reasons.append(f"Targets your weakest skill: {lesson.skill_type}")
        elif isinstance(skill_data, dict) and skill_data.get("gap", 0) > 0.5:
            reasons.append(f"Helps close skill gap in {lesson.skill_type}")

        # 2. Difficulty match (30% weight)
        lesson_level_idx = CEFR_LEVELS.index(lesson.cefr_level) if lesson.cefr_level in CEFR_LEVELS else 2
        target_level_idx = CEFR_LEVELS.index(target_level) if target_level in CEFR_LEVELS else 2
        level_diff = abs(lesson_level_idx - target_level_idx)

        if level_diff == 0:
            difficulty_score = 30
            reasons.append("Perfect difficulty match")
        elif level_diff == 1:
            difficulty_score = 20
            if lesson_level_idx > target_level_idx:
                reasons.append("Slightly challenging - promotes growth")
            else:
                reasons.append("Reinforces fundamentals")
        else:
            difficulty_score = 10

        score += difficulty_score

        # 3. Recency bonus (10% weight)
        if lesson.created_at:
            days_old = (datetime.utcnow() - lesson.created_at).days
            recency_score = max(0, 10 - (days_old / 30))  # Decay over time
            score += recency_score
        else:
            score += 5

        # 4. Skill balance (20% weight)
        # Bonus for less practiced skills
        skill_current = skill_data.get("current", 5.0) if isinstance(skill_data, dict) else 5.0
        balance_score = 20 * (1 - (skill_current / 9))  # Lower current score = higher bonus
        score += balance_score

        if not reasons:
            reasons.append(f"Recommended for {lesson.skill_type} practice")

        return score, "; ".join(reasons)

    def _get_addressed_gaps(self, lesson: Lesson, skill_analysis: Dict) -> List[str]:
        """Get list of skill gaps addressed by this lesson"""
        gaps = []
        skill_data = skill_analysis.get(lesson.skill_type, {})

        if isinstance(skill_data, dict) and skill_data.get("gap", 0) > 0:
            gaps.append(lesson.skill_type)

        # Add sub-skill analysis if available
        if lesson.skill_type == "writing":
            gaps.extend(["task_achievement", "coherence", "vocabulary", "grammar"])
        elif lesson.skill_type == "speaking":
            gaps.extend(["fluency", "vocabulary", "grammar", "pronunciation"])

        return gaps

    def _save_recommendations(
        self,
        user_id: uuid.UUID,
        recommendations: List[Dict]
    ):
        """Save recommendations to database for tracking"""
        # Clear old recommendations
        self.db.query(RecommendedLesson).filter(
            RecommendedLesson.user_id == user_id
        ).delete()

        # Save new recommendations
        for rank, rec in enumerate(recommendations, 1):
            lesson = rec["lesson"]
            recommended = RecommendedLesson(
                id=uuid.uuid4(),
                user_id=user_id,
                lesson_id=lesson.id,
                recommendation_rank=rank,
                reason=rec["reason"],
                predicted_difficulty=Decimal(str(lesson.difficulty_score or 5.0)),
                estimated_benefit_score=Decimal(str(rec["score"])),
                skill_gaps_addressed=rec["skill_gaps_addressed"],
                expires_at=datetime.utcnow() + timedelta(days=1),
                created_at=datetime.utcnow()
            )
            self.db.add(recommended)

        self.db.commit()


def get_user_recommendations(
    db: Session,
    user_id: uuid.UUID,
    limit: int = 10
) -> List[Dict]:
    """Helper function to get recommendations"""
    service = RecommendationService(db)
    return service.get_recommendations(user_id, limit)
