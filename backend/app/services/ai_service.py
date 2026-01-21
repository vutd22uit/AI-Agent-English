"""
AI Service for LLM Integration (OpenAI and Anthropic Claude)
"""
import json
import time
from typing import Dict, Any, Optional, List
from openai import OpenAI
from anthropic import Anthropic
import os

from app.core.config import settings
from app.prompts import IELTS_EXAMINER_SYSTEM_PROMPT


class AIService:
    """Service for interacting with AI models (OpenAI GPT and Anthropic Claude)"""

    def __init__(self):
        self.openai_client = None
        self.anthropic_client = None

        # Initialize OpenAI if API key is available
        if settings.OPENAI_API_KEY:
            self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)

        # Initialize Anthropic if API key is available
        if settings.ANTHROPIC_API_KEY:
            self.anthropic_client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    def _get_available_client(self) -> tuple[str, Any]:
        """Get the first available AI client"""
        if self.openai_client:
            return ("openai", self.openai_client)
        elif self.anthropic_client:
            return ("anthropic", self.anthropic_client)
        else:
            raise ValueError("No AI API keys configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY")

    async def generate_completion(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        response_format: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate completion using available AI model

        Args:
            prompt: User prompt
            system_prompt: System prompt (optional)
            model: Specific model to use (optional)
            temperature: Randomness (0-1)
            max_tokens: Max response tokens
            response_format: "json" for JSON response

        Returns:
            Dict with 'content', 'model_used', 'tokens_used', 'processing_time'
        """
        start_time = time.time()
        client_type, client = self._get_available_client()

        try:
            if client_type == "openai":
                result = await self._openai_completion(
                    client, prompt, system_prompt, model, temperature, max_tokens, response_format
                )
            else:  # anthropic
                result = await self._anthropic_completion(
                    client, prompt, system_prompt, model, temperature, max_tokens
                )

            processing_time = time.time() - start_time
            result["processing_time_seconds"] = round(processing_time, 2)

            return result

        except Exception as e:
            raise Exception(f"AI generation failed: {str(e)}")

    async def _openai_completion(
        self,
        client: OpenAI,
        prompt: str,
        system_prompt: Optional[str],
        model: Optional[str],
        temperature: float,
        max_tokens: int,
        response_format: Optional[str]
    ) -> Dict[str, Any]:
        """OpenAI-specific completion"""
        model = model or "gpt-4-turbo-preview"

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        kwargs = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        if response_format == "json":
            kwargs["response_format"] = {"type": "json_object"}

        response = client.chat.completions.create(**kwargs)

        return {
            "content": response.choices[0].message.content,
            "model_used": model,
            "tokens_used": response.usage.total_tokens,
            "provider": "openai"
        }

    async def _anthropic_completion(
        self,
        client: Anthropic,
        prompt: str,
        system_prompt: Optional[str],
        model: Optional[str],
        temperature: float,
        max_tokens: int
    ) -> Dict[str, Any]:
        """Anthropic Claude-specific completion"""
        model = model or "claude-3-opus-20240229"

        kwargs = {
            "model": model,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": [{"role": "user", "content": prompt}]
        }

        if system_prompt:
            kwargs["system"] = system_prompt

        response = client.messages.create(**kwargs)

        return {
            "content": response.content[0].text,
            "model_used": model,
            "tokens_used": response.usage.input_tokens + response.usage.output_tokens,
            "provider": "anthropic"
        }

    async def assess_writing(
        self,
        submission_text: str,
        task_type: str,
        prompt_text: str,
        cefr_level: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Assess IELTS Writing submission

        Args:
            submission_text: Student's essay
            task_type: "task1" or "task2"
            prompt_text: The writing prompt given to student
            cefr_level: Student's CEFR level (optional)

        Returns:
            Assessment with band scores and feedback
        """
        user_prompt = f"""Please assess this IELTS Writing {task_type.upper()} submission.

**Writing Prompt:**
{prompt_text}

**Student's Response:**
{submission_text}

**Word Count:** {len(submission_text.split())} words
"""

        if cefr_level:
            user_prompt += f"\n**Student's CEFR Level:** {cefr_level} (for context)"

        user_prompt += """

Please provide a comprehensive assessment following the IELTS criteria. Return your response in valid JSON format matching the structure specified in your system prompt."""

        result = await self.generate_completion(
            prompt=user_prompt,
            system_prompt=IELTS_EXAMINER_SYSTEM_PROMPT,
            temperature=0.3,  # Lower temperature for consistent grading
            max_tokens=3000,
            response_format="json"
        )

        try:
            assessment = json.loads(result["content"])
            assessment["ai_model"] = result["model_used"]
            assessment["processing_time_seconds"] = result["processing_time_seconds"]
            return assessment
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return {
                "overall_band_score": None,
                "error": "Failed to parse AI response",
                "raw_response": result["content"]
            }

    async def assess_speaking(
        self,
        transcription: str,
        prompt_text: str,
        part_number: int,
        cefr_level: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Assess IELTS Speaking submission (from transcription)

        Args:
            transcription: STT output of student's speech
            prompt_text: The speaking prompt
            part_number: IELTS Speaking part (1, 2, or 3)
            cefr_level: Student's CEFR level (optional)

        Returns:
            Assessment with band scores and feedback
        """
        user_prompt = f"""Please assess this IELTS Speaking Part {part_number} response.

**Speaking Prompt:**
{prompt_text}

**Student's Response (Transcribed):**
{transcription}
"""

        if cefr_level:
            user_prompt += f"\n**Student's CEFR Level:** {cefr_level} (for context)"

        user_prompt += """

Note: This is a transcription, so pronunciation cannot be fully assessed. Focus on fluency, lexical resource, and grammatical range. Provide a conservative pronunciation estimate based on the transcription quality.

Please provide a comprehensive assessment following the IELTS Speaking criteria. Return your response in valid JSON format."""

        result = await self.generate_completion(
            prompt=user_prompt,
            system_prompt=IELTS_EXAMINER_SYSTEM_PROMPT,
            temperature=0.3,
            max_tokens=3000,
            response_format="json"
        )

        try:
            assessment = json.loads(result["content"])
            assessment["ai_model"] = result["model_used"]
            assessment["processing_time_seconds"] = result["processing_time_seconds"]
            return assessment
        except json.JSONDecodeError:
            return {
                "overall_band_score": None,
                "error": "Failed to parse AI response",
                "raw_response": result["content"]
            }

    async def generate_content(
        self,
        generation_prompt: str,
        user_specifications: str,
        temperature: float = 0.8,
        max_tokens: int = 3000
    ) -> Dict[str, Any]:
        """
        Generate IELTS content (reading passages, listening scripts, etc.)

        Args:
            generation_prompt: System prompt for content generation
            user_specifications: User's requirements (topic, level, etc.)
            temperature: Higher for more creative content
            max_tokens: Max tokens for generation

        Returns:
            Generated content in JSON format
        """
        result = await self.generate_completion(
            prompt=user_specifications,
            system_prompt=generation_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            response_format="json"
        )

        try:
            content = json.loads(result["content"])
            content["generation_metadata"] = {
                "model_used": result["model_used"],
                "provider": result["provider"],
                "processing_time_seconds": result["processing_time_seconds"]
            }
            return content
        except json.JSONDecodeError:
            return {
                "error": "Failed to parse generated content",
                "raw_response": result["content"]
            }


# Singleton instance
ai_service = AIService()
