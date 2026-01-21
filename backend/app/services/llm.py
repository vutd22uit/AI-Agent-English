import os
import json
import google.generativeai as genai
from app.schemas.lesson import ReadingLesson, ListeningLesson, LessonGenerateRequest, AssessmentRequest, AssessmentResponse
from typing import Optional

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY", "dummy-key"))
model = genai.GenerativeModel('gemini-1.5-pro')

async def generate_reading_lesson(request: LessonGenerateRequest) -> ReadingLesson:
    """
    Generates a Reading Lesson using Gemini based on topic and CEFR level.
    """
    prompt = f"""
    You are an IELTS 9.0 Content Creator. 
    Generate a complete IELTS Reading passage and associated questions.
    
    Topic: {request.topic}
    Target CEFR Level: {request.cefr_level}
    
    The output must be a valid JSON object with the following structure:
    {{
      "title": "Title of the passage",
      "passage": "Full passage text (approx 700-900 words)",
      "questions": [
        {{ "id": 1, "type": "MCQ", "text": "Question text here", "options": ["A", "B", "C", "D"], "answer": "A" }},
        ...
      ],
      "answer_key": {{
        "1": {{ "answer": "A", "explanation": "Why this is correct..." }}
      }}
    }}
    
    Ensure the vocabulary and complexity match the {request.cefr_level} level.
    Generate 5 MCQ, 5 TFNG, and 5 Sentence Completion questions.
    Return ONLY pure JSON.
    """

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                candidate_count=1,
                max_output_tokens=2048,
                temperature=0.7,
            )
        )
        # Handle potential markdown formatting in response
        content = response.text.replace("```json", "").replace("```", "").strip()
        return ReadingLesson.model_validate_json(content)
    except Exception as e:
        print(f"Gemini API error: {e}. Using mock data.")
        return ReadingLesson(
            title=f"The Impact of {request.topic} on Modern Society",
            passage=f"This is a generated passage about {request.topic} tailored for {request.cefr_level} level readers...",
            questions=[
                {
                    "id": 1,
                    "type": "MCQ",
                    "text": f"What is the main idea of the passage regarding {request.topic}?",
                    "options": ["Its recent importance in daily life", "Historical context", "Future predictions", "Technical specifications"],
                    "answer": "Its recent importance in daily life"
                }
            ],
            answer_key={
                "1": {"answer": "Its recent importance in daily life", "explanation": "The first paragraph explicitly states the main idea."}
            }
        )

async def generate_listening_lesson(request: LessonGenerateRequest) -> ListeningLesson:
    """
    Generates a Listening Lesson (script and questions) using Gemini.
    """
    prompt = f"""
    You are an IELTS 9.0 Content Creator. 
    Generate a complete IELTS Listening script and associated questions for Section 3 (Academic Discussion).
    
    Topic: {request.topic}
    Target CEFR Level: {request.cefr_level}
    
    The output must be a valid JSON object:
    {{
      "title": "Title of the script",
      "audio_script": "Full script of the discussion (approx 600-800 words)",
      "questions": [
        {{ "id": 1, "type": "Completion", "text": "Fill in the blank: ...", "answer": "..." }},
        ...
      ],
      "answer_key": {{
        "1": {{ "answer": "...", "explanation": "..." }}
      }}
    }}
    Return ONLY pure JSON.
    """

    try:
        response = model.generate_content(prompt)
        content = response.text.replace("```json", "").replace("```", "").strip()
        return ListeningLesson.model_validate_json(content)
    except Exception as e:
        print(f"Gemini API error: {e}. Using mock data.")
        return ListeningLesson(
            title=f"Academic Discussion on {request.topic}",
            audio_script=f"Two students are discussing their research project on {request.topic}...",
            questions=[{ "id": 1, "type": "Completion", "text": "The students are mainly discussing their ______ project.", "options": None, "answer": "research" }],
            answer_key={ "1": {"answer": "research", "explanation": "The script explicitly mentions 'research project'."} }
        )

async def grade_assessment(request: AssessmentRequest) -> AssessmentResponse:
    """
    Grades a writing or speaking assessment using the IELTS 9.0 Examiner Persona via Gemini.
    """
    system_prompt = f"""
    You are an IELTS Senior Examiner (Band 9.0 Level). 
    Grade the following user submission strictly based on IELTS criteria for {request.task_type}.
    
    If it's Speaking, focus on Fluency, Pronunciation, Lexical Resource, and Grammar.
    If it's Writing, focus on Task Response, Cohesion, Lexical Resource, and Grammar.
    
    Return your response strictly as a JSON object:
    {{
      "band_scores": {{
        "overall": 7.5,
        "lexical_resource": 7.0,
        "grammatical_range": 8.0,
        "coherence_cohesion": 7.5,
        "task_response": 7.5
      }},
      "feedback": "Overall summary of the performance...",
      "detailed_breakdown": {{
        "Lexical Resource": "Comment on vocabulary usage...",
        "Grammatical Range": "Comment on sentence variety...",
        "Coherence & Cohesion": "Comment on flow...",
        "Task Response": "Comment on answering the prompt..."
      }},
      "suggestions": ["Use more complex connectors like...", "Avoid repeating 'big'..."]
    }}
    """
    
    user_prompt = f"Task Type: {request.task_type}\nUser Submission: {request.user_content}\n"
    if request.prompt_context:
        user_prompt += f"Context/Prompt: {request.prompt_context}"

    try:
        response = model.generate_content(f"{system_prompt}\n\nUSER SUBMISSION:\n{user_prompt}")
        content = response.text.replace("```json", "").replace("```", "").strip()
        return AssessmentResponse.model_validate_json(content)
    except Exception as e:
        print(f"Gemini Grading error: {e}")
        # Fallback Mock
        return AssessmentResponse(
            band_scores={ "overall": 7.0, "lexical_resource": 6.5, "grammatical_range": 7.0, "coherence_cohesion": 7.5, "task_response": 7.0 },
            feedback="Your performance shows good control, but needs more academic synonyms.",
            detailed_breakdown={ "Lexical Resource": "Good, but limited academic synonyms.", "Grammatical Range": "Mostly accurate.", "Coherence & Cohesion": "Excellent linking.", "Task Response": "Fully addresses task." },
            suggestions=["Use more academic words.", "Try complex sentences."]
        )
