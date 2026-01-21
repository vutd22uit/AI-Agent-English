CREATE TYPE cefr_level AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    target_band DECIMAL(2,1),
    current_cefr cefr_level DEFAULT 'B1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'reading', 'listening', 'writing', 'speaking'
    topic TEXT NOT NULL,
    content JSONB NOT NULL, -- Passage, questions, answer key
    difficulty_level cefr_level NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    lesson_id UUID REFERENCES lessons(id),
    score DECIMAL(3,1),
    band_score DECIMAL(2,1),
    feedback TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE roadmap (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    current_step INTEGER DEFAULT 0,
    steps JSONB NOT NULL, -- Array of planned lessons/objectives
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
