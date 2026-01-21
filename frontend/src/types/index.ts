// User types
export interface User {
  id: string
  email: string
  full_name: string
  created_at: string
  is_active: boolean
}

export interface UserProfile {
  id: string
  user_id: string
  current_cefr_level: string
  target_band_score: number
  target_exam_date?: string
  native_language?: string
  study_hours_per_week?: number
}

// Lesson types
export interface Lesson {
  id: string
  skill_type: 'listening' | 'reading' | 'writing' | 'speaking'
  title: string
  cefr_level: string
  estimated_duration_minutes: number
  difficulty_score: number
}

// Assessment types
export interface Assessment {
  id: string
  submission_id: string
  overall_band_score: number
  task_achievement_score?: number
  coherence_cohesion_score?: number
  lexical_resource_score?: number
  grammatical_range_score?: number
  detailed_feedback: any
  strengths: string[]
  weaknesses: string[]
  improvement_suggestions: string[]
}
