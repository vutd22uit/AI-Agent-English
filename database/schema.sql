-- =====================================================
-- ADAPTIVE IELTS LEARNING PLATFORM - DATABASE SCHEMA
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- =====================================================
-- 1. USER MANAGEMENT
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_cefr_level VARCHAR(2) CHECK (current_cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    target_band_score DECIMAL(2,1) CHECK (target_band_score BETWEEN 4.0 AND 9.0),
    target_exam_date DATE,
    native_language VARCHAR(50),
    study_hours_per_week INTEGER,
    preferred_study_time VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. CONTENT MANAGEMENT
-- =====================================================

CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- e.g., "Technology", "Environment", "Education"
    difficulty_level VARCHAR(2) CHECK (difficulty_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    keywords TEXT[], -- Array of related keywords
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_type VARCHAR(20) NOT NULL CHECK (skill_type IN ('listening', 'reading', 'writing', 'speaking')),
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    cefr_level VARCHAR(2) CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    estimated_duration_minutes INTEGER,
    difficulty_score DECIMAL(3,2), -- 0.00 to 10.00
    content JSONB, -- Flexible storage for different content types
    metadata JSONB, -- Additional lesson metadata
    is_generated BOOLEAN DEFAULT FALSE, -- Whether AI-generated
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reading specific content
CREATE TABLE reading_passages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID UNIQUE NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    passage_text TEXT NOT NULL,
    word_count INTEGER,
    reading_time_minutes INTEGER,
    passage_type VARCHAR(50), -- e.g., "academic", "general", "descriptive"
    vocabulary_complexity DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Listening specific content
CREATE TABLE listening_scripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID UNIQUE NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    script_text TEXT NOT NULL,
    audio_url VARCHAR(500),
    duration_seconds INTEGER,
    speaker_count INTEGER,
    accent VARCHAR(50), -- e.g., "British", "American", "Australian"
    speech_rate VARCHAR(20), -- e.g., "slow", "normal", "fast"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Writing prompts
CREATE TABLE writing_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID UNIQUE NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    prompt_text TEXT NOT NULL,
    task_type VARCHAR(20) CHECK (task_type IN ('task1', 'task2')),
    word_count_requirement INTEGER,
    time_limit_minutes INTEGER,
    sample_answer TEXT, -- Optional model answer
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Speaking prompts
CREATE TABLE speaking_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID UNIQUE NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    part_number INTEGER CHECK (part_number IN (1, 2, 3)),
    prompt_text TEXT NOT NULL,
    follow_up_questions TEXT[],
    time_limit_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Questions for reading/listening
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    question_type VARCHAR(50), -- e.g., "multiple_choice", "true_false_not_given", "matching"
    question_text TEXT NOT NULL,
    options JSONB, -- For multiple choice questions
    correct_answer TEXT,
    explanation TEXT,
    points INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_lesson ON questions(lesson_id);

-- =====================================================
-- 3. USER PROGRESS & ADAPTIVE LEARNING
-- =====================================================

CREATE TABLE user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent_minutes INTEGER DEFAULT 0,
    score DECIMAL(5,2), -- Percentage or band score
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_user_lesson_progress_user ON user_lesson_progress(user_id);
CREATE INDEX idx_user_lesson_progress_lesson ON user_lesson_progress(lesson_id);

-- User answers for tracking
CREATE TABLE user_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    user_answer TEXT,
    is_correct BOOLEAN,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_answers_user ON user_answers(user_id);

-- User submissions for writing/speaking
CREATE TABLE user_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    skill_type VARCHAR(20) NOT NULL CHECK (skill_type IN ('writing', 'speaking')),
    submission_text TEXT,
    audio_url VARCHAR(500), -- For speaking submissions
    transcription TEXT, -- STT output for speaking
    word_count INTEGER,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_submissions_user ON user_submissions(user_id);

-- AI-generated feedback and grading
CREATE TABLE ai_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID UNIQUE NOT NULL REFERENCES user_submissions(id) ON DELETE CASCADE,
    overall_band_score DECIMAL(2,1) CHECK (overall_band_score BETWEEN 0.0 AND 9.0),

    -- IELTS Speaking/Writing criteria
    task_achievement_score DECIMAL(2,1),
    coherence_cohesion_score DECIMAL(2,1),
    lexical_resource_score DECIMAL(2,1),
    grammatical_range_score DECIMAL(2,1),

    -- Speaking specific (if applicable)
    fluency_score DECIMAL(2,1),
    pronunciation_score DECIMAL(2,1),

    detailed_feedback JSONB, -- Structured feedback
    strengths TEXT[],
    weaknesses TEXT[],
    improvement_suggestions TEXT[],

    ai_model VARCHAR(50), -- e.g., "gpt-4", "claude-3"
    processing_time_seconds DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_assessments_submission ON ai_assessments(submission_id);

-- =====================================================
-- 4. ADAPTIVE LEARNING SYSTEM
-- =====================================================

-- Skill proficiency tracking
CREATE TABLE skill_proficiency (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_type VARCHAR(20) NOT NULL CHECK (skill_type IN ('listening', 'reading', 'writing', 'speaking')),

    -- Skill sub-components
    sub_skill VARCHAR(100), -- e.g., "vocabulary", "grammar", "pronunciation"
    proficiency_level VARCHAR(2) CHECK (proficiency_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    proficiency_score DECIMAL(5,2), -- 0-100 scale
    band_score_equivalent DECIMAL(2,1),

    confidence_level DECIMAL(3,2), -- 0.00 to 1.00
    sample_size INTEGER DEFAULT 0, -- Number of assessments used

    last_assessed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, skill_type, sub_skill)
);

CREATE INDEX idx_skill_proficiency_user ON skill_proficiency(user_id);

-- Learning path / roadmap
CREATE TABLE learning_roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_phase VARCHAR(50), -- e.g., "foundation", "intermediate", "advanced", "exam_prep"
    recommended_cefr_level VARCHAR(2),
    weekly_goal_lessons INTEGER,
    total_lessons_completed INTEGER DEFAULT 0,
    estimated_completion_date DATE,
    last_recalculated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recommended next lessons (adaptive algorithm output)
CREATE TABLE recommended_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    recommendation_rank INTEGER, -- 1 = highest priority
    reason TEXT, -- Why this lesson is recommended
    predicted_difficulty DECIMAL(3,2),
    estimated_benefit_score DECIMAL(5,2), -- Expected learning gain
    skill_gaps_addressed TEXT[],
    expires_at TIMESTAMP WITH TIME ZONE, -- Recommendations expire
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id, created_at)
);

CREATE INDEX idx_recommended_lessons_user ON recommended_lessons(user_id);
CREATE INDEX idx_recommended_lessons_rank ON recommended_lessons(recommendation_rank);

-- Learning analytics / metrics
CREATE TABLE learning_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,

    -- Daily metrics
    lessons_completed INTEGER DEFAULT 0,
    time_studied_minutes INTEGER DEFAULT 0,
    questions_answered INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    accuracy_rate DECIMAL(5,2),

    -- Skill-specific practice time
    listening_minutes INTEGER DEFAULT 0,
    reading_minutes INTEGER DEFAULT 0,
    writing_minutes INTEGER DEFAULT 0,
    speaking_minutes INTEGER DEFAULT 0,

    -- Engagement metrics
    streak_days INTEGER DEFAULT 0,
    avg_session_duration_minutes DECIMAL(5,2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

CREATE INDEX idx_learning_analytics_user_date ON learning_analytics(user_id, date DESC);

-- =====================================================
-- 5. SYSTEM TABLES
-- =====================================================

-- AI prompt templates
CREATE TABLE ai_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_name VARCHAR(100) UNIQUE NOT NULL,
    prompt_type VARCHAR(50), -- e.g., "system", "assessment", "generation"
    skill_type VARCHAR(20),
    prompt_template TEXT NOT NULL,
    version VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System configuration
CREATE TABLE system_config (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. TRIGGERS & FUNCTIONS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_lesson_progress_updated_at BEFORE UPDATE ON user_lesson_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skill_proficiency_updated_at BEFORE UPDATE ON skill_proficiency
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_roadmaps_updated_at BEFORE UPDATE ON learning_roadmaps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_lessons_skill_cefr ON lessons(skill_type, cefr_level);
CREATE INDEX idx_lessons_topic ON lessons(topic_id);
CREATE INDEX idx_topics_difficulty ON topics(difficulty_level);
CREATE INDEX idx_user_submissions_skill ON user_submissions(skill_type);
CREATE INDEX idx_skill_proficiency_skill ON skill_proficiency(skill_type);

-- Full-text search on passages
CREATE INDEX idx_reading_passages_text ON reading_passages USING gin(to_tsvector('english', passage_text));

-- =====================================================
-- 8. SAMPLE DATA
-- =====================================================

-- Insert AI prompt template
INSERT INTO ai_prompts (prompt_name, prompt_type, skill_type, prompt_template, version, is_active)
VALUES
('ielts_examiner_system', 'system', NULL, 'See separate prompt file', '1.0', TRUE),
('reading_generation', 'generation', 'reading', 'See separate prompt file', '1.0', TRUE);

-- Insert system config
INSERT INTO system_config (key, value, description) VALUES
('openai_model', 'gpt-4-turbo-preview', 'Default OpenAI model for content generation'),
('claude_model', 'claude-3-opus-20240229', 'Default Claude model for assessments'),
('max_daily_lessons', '10', 'Maximum lessons a user can complete per day'),
('min_words_writing_task1', '150', 'Minimum words for Writing Task 1'),
('min_words_writing_task2', '250', 'Minimum words for Writing Task 2');

-- =====================================================
-- END OF SCHEMA
-- =====================================================
