"""
Content Generator Service for IELTS lessons
Generates Reading passages, Listening scripts, Writing prompts, Speaking prompts, and Questions
"""
from typing import Dict, Any, List, Optional
import json

from app.services.ai_service import ai_service
from app.prompts import (
    READING_GENERATION_PROMPT,
    LISTENING_GENERATION_PROMPT,
    WRITING_PROMPT_GENERATION,
    SPEAKING_PROMPT_GENERATION,
    QUESTION_GENERATION_PROMPT,
)


class ContentGeneratorService:
    """Service for generating IELTS lesson content using AI"""

    async def generate_reading_passage(
        self,
        topic: str,
        cefr_level: str,
        passage_type: str = "expository",
        word_count_target: int = 800
    ) -> Dict[str, Any]:
        """
        Generate an IELTS Reading passage

        Args:
            topic: Subject matter (e.g., "Climate Change", "Technology in Education")
            cefr_level: CEFR level (A1, A2, B1, B2, C1, C2)
            passage_type: Type of passage (descriptive, argumentative, narrative, expository)
            word_count_target: Target word count

        Returns:
            Dict with passage_text, title, word_count, etc.
        """
        user_spec = f"""Generate an IELTS Academic Reading passage with the following specifications:

**Topic:** {topic}
**CEFR Level:** {cefr_level}
**Passage Type:** {passage_type}
**Target Word Count:** {word_count_target} words

Please create an engaging, informative passage suitable for IELTS preparation. Ensure the vocabulary and sentence complexity match the specified CEFR level.

Return the result in the JSON format specified in your system prompt."""

        result = await ai_service.generate_content(
            generation_prompt=READING_GENERATION_PROMPT,
            user_specifications=user_spec,
            temperature=0.8,
            max_tokens=3000
        )

        return result

    async def generate_listening_script(
        self,
        topic: str,
        cefr_level: str,
        section_type: str = "social_daily",
        speaker_count: int = 2,
        accent: str = "British",
        duration_minutes: int = 5
    ) -> Dict[str, Any]:
        """
        Generate an IELTS Listening script

        Args:
            topic: Conversation topic
            cefr_level: CEFR level
            section_type: IELTS section type (social_daily, social_educational, academic_training, academic_lecture)
            speaker_count: Number of speakers (1-4)
            accent: Accent type (British, American, Australian)
            duration_minutes: Target duration in minutes

        Returns:
            Dict with script_text, speakers, duration, etc.
        """
        user_spec = f"""Generate an IELTS Listening script with the following specifications:

**Topic:** {topic}
**CEFR Level:** {cefr_level}
**Section Type:** {section_type}
**Number of Speakers:** {speaker_count}
**Accent:** {accent}
**Target Duration:** {duration_minutes} minutes (~{duration_minutes * 150} words)

Create a natural, realistic conversation or monologue suitable for IELTS Listening practice.

Return the result in the JSON format specified in your system prompt."""

        result = await ai_service.generate_content(
            generation_prompt=LISTENING_GENERATION_PROMPT,
            user_specifications=user_spec,
            temperature=0.9,  # Higher for more natural dialogue
            max_tokens=2500
        )

        return result

    async def generate_writing_prompt(
        self,
        task_type: str,
        topic: str,
        cefr_level: str,
        prompt_format: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate an IELTS Writing prompt

        Args:
            task_type: "task1" or "task2"
            topic: General topic area
            cefr_level: CEFR level
            prompt_format: For Task 2 (opinion, discussion, problem_solution, two_part)

        Returns:
            Dict with prompt_text, requirements, sample_plan
        """
        if task_type == "task1":
            format_hint = "graph, chart, table, diagram, or process"
        else:
            format_hint = prompt_format or "opinion, discussion, problem-solution, or two-part question"

        user_spec = f"""Generate an IELTS Writing {task_type.upper()} prompt with the following specifications:

**Topic Area:** {topic}
**CEFR Level:** {cefr_level}
**Format Type:** {format_hint}

Create an authentic IELTS-style writing task that is clear, appropriate for the level, and follows official IELTS format.

Return the result in the JSON format specified in your system prompt."""

        result = await ai_service.generate_content(
            generation_prompt=WRITING_PROMPT_GENERATION,
            user_specifications=user_spec,
            temperature=0.7,
            max_tokens=1500
        )

        return result

    async def generate_speaking_prompt(
        self,
        part_number: int,
        topic: str,
        cefr_level: str
    ) -> Dict[str, Any]:
        """
        Generate an IELTS Speaking prompt

        Args:
            part_number: IELTS Speaking part (1, 2, or 3)
            topic: Topic for the prompt
            cefr_level: CEFR level

        Returns:
            Dict with prompt_text, follow_up_questions, time_limits
        """
        part_descriptions = {
            1: "Part 1: Introduction and familiar topics (4-5 minutes)",
            2: "Part 2: Individual long turn with cue card (3-4 minutes)",
            3: "Part 3: Two-way discussion on abstract topics (4-5 minutes)"
        }

        user_spec = f"""Generate an IELTS Speaking prompt for {part_descriptions[part_number]}

**Topic:** {topic}
**CEFR Level:** {cefr_level}
**Part Number:** {part_number}

Create an appropriate prompt following official IELTS Speaking test format.

Return the result in the JSON format specified in your system prompt."""

        result = await ai_service.generate_content(
            generation_prompt=SPEAKING_PROMPT_GENERATION,
            user_specifications=user_spec,
            temperature=0.7,
            max_tokens=1200
        )

        return result

    async def generate_questions(
        self,
        content_text: str,
        skill_type: str,
        cefr_level: str,
        question_count: int = 10,
        question_types: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Generate comprehension questions for a passage or script

        Args:
            content_text: The reading passage or listening script
            skill_type: "reading" or "listening"
            cefr_level: CEFR level
            question_count: Number of questions to generate
            question_types: List of question types to include (optional)

        Returns:
            List of question dicts
        """
        if not question_types:
            if skill_type == "reading":
                question_types = ["multiple_choice", "true_false_not_given", "sentence_completion"]
            else:  # listening
                question_types = ["multiple_choice", "form_completion", "short_answer"]

        user_spec = f"""Generate {question_count} IELTS {skill_type.capitalize()} comprehension questions for the following content:

**Content:**
{content_text[:2000]}...  # Truncate if too long

**CEFR Level:** {cefr_level}
**Question Types:** {', '.join(question_types)}
**Number of Questions:** {question_count}

Create questions that test comprehension, following official IELTS question formats.

Return the result in the JSON format specified in your system prompt (array of question objects)."""

        result = await ai_service.generate_content(
            generation_prompt=QUESTION_GENERATION_PROMPT,
            user_specifications=user_spec,
            temperature=0.6,
            max_tokens=2500
        )

        # Extract questions array
        if isinstance(result, dict) and "questions" in result:
            return result["questions"]
        return []

    async def generate_complete_reading_lesson(
        self,
        topic: str,
        cefr_level: str,
        passage_type: str = "expository"
    ) -> Dict[str, Any]:
        """
        Generate a complete reading lesson with passage and questions

        Args:
            topic: Subject matter
            cefr_level: CEFR level
            passage_type: Type of passage

        Returns:
            Complete lesson dict with passage and questions
        """
        # Generate passage
        passage_data = await self.generate_reading_passage(
            topic=topic,
            cefr_level=cefr_level,
            passage_type=passage_type
        )

        if "error" in passage_data:
            return passage_data

        # Generate questions for the passage
        questions = await self.generate_questions(
            content_text=passage_data.get("passage_text", ""),
            skill_type="reading",
            cefr_level=cefr_level,
            question_count=10
        )

        # Combine into complete lesson
        complete_lesson = {
            "lesson_type": "reading",
            "topic": topic,
            "cefr_level": cefr_level,
            "passage": passage_data,
            "questions": questions,
            "metadata": {
                "generated_at": passage_data.get("generation_metadata", {}),
                "total_questions": len(questions)
            }
        }

        return complete_lesson

    async def generate_complete_listening_lesson(
        self,
        topic: str,
        cefr_level: str,
        section_type: str = "social_daily"
    ) -> Dict[str, Any]:
        """
        Generate a complete listening lesson with script and questions

        Args:
            topic: Conversation topic
            cefr_level: CEFR level
            section_type: IELTS section type

        Returns:
            Complete lesson dict with script and questions
        """
        # Generate script
        script_data = await self.generate_listening_script(
            topic=topic,
            cefr_level=cefr_level,
            section_type=section_type
        )

        if "error" in script_data:
            return script_data

        # Generate questions
        questions = await self.generate_questions(
            content_text=script_data.get("script_text", ""),
            skill_type="listening",
            cefr_level=cefr_level,
            question_count=10
        )

        # Combine into complete lesson
        complete_lesson = {
            "lesson_type": "listening",
            "topic": topic,
            "cefr_level": cefr_level,
            "script": script_data,
            "questions": questions,
            "metadata": {
                "generated_at": script_data.get("generation_metadata", {}),
                "total_questions": len(questions)
            }
        }

        return complete_lesson


# Singleton instance
content_generator = ContentGeneratorService()
