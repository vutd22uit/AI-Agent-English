# 🎓 Adaptive IELTS Learning Platform

An AI-powered adaptive learning platform for IELTS preparation, featuring personalized learning paths and intelligent assessment across all 4 skills: Listening, Reading, Writing, and Speaking.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Python FastAPI
- **Database**: PostgreSQL 16
- **AI/LLM**: OpenAI GPT-4 / Anthropic Claude
- **Containerization**: Docker & Docker Compose

### Project Structure
```
AI-Agent-English/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities (API client, etc.)
│   │   └── types/           # TypeScript types
│   ├── package.json
│   └── Dockerfile
│
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── api/             # API endpoints
│   │   │   └── endpoints/   # Route handlers
│   │   ├── core/            # Core config
│   │   ├── db/              # Database connection
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   └── main.py          # FastAPI app entry
│   ├── requirements.txt
│   └── Dockerfile
│
├── database/
│   ├── schema.sql           # Complete database schema
│   └── migrations/          # Alembic migrations
│
├── docker-compose.yml       # Multi-container setup
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- OpenAI API key (or Anthropic API key)

### Option 1: Using Docker Compose (Recommended)

1. **Clone the repository**
```bash
git clone <repository-url>
cd AI-Agent-English
```

2. **Set up environment variables**
```bash
# Copy example env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env and add your API keys
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
```

3. **Start all services**
```bash
docker-compose up -d
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Database: localhost:5432

5. **Stop all services**
```bash
docker-compose down
```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Run database migrations (after PostgreSQL is running)
# alembic upgrade head

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

#### Database Setup
```bash
# Start PostgreSQL (if not using Docker)
# Then run the schema:
psql -U postgres -d ielts_learning -f database/schema.sql
```

## 📊 Database Schema

The platform uses a comprehensive PostgreSQL schema with the following key tables:

### Core Tables
- **users** & **user_profiles**: User management and preferences
- **lessons**: Multi-skill lesson content (Reading, Listening, Writing, Speaking)
- **topics**: Subject matter categorization
- **questions**: Assessment questions linked to lessons

### Content Tables
- **reading_passages**: Reading comprehension content
- **listening_scripts**: Audio transcripts and metadata
- **writing_prompts**: Essay/report prompts
- **speaking_prompts**: Speaking task scenarios

### Adaptive Learning Tables
- **skill_proficiency**: Track user proficiency per skill/sub-skill
- **learning_roadmaps**: Personalized learning paths
- **recommended_lessons**: AI-generated lesson recommendations
- **learning_analytics**: Daily progress metrics

### Assessment Tables
- **user_submissions**: User writing/speaking submissions
- **ai_assessments**: AI-generated feedback with IELTS band scores
- **user_answers**: Question responses
- **user_lesson_progress**: Completion tracking

## 🤖 AI Features

### 1. AI Teacher/Examiner
- Acts as IELTS 9.0 examiner
- Provides detailed band scores for Writing and Speaking
- Evaluates based on official IELTS criteria:
  - Task Achievement
  - Coherence & Cohesion
  - Lexical Resource
  - Grammatical Range & Accuracy
  - Fluency & Pronunciation (Speaking)

### 2. Dynamic Content Generation
- Generates reading passages based on topic and CEFR level
- Creates listening scripts with appropriate vocabulary
- Produces writing prompts matching IELTS format
- Generates follow-up questions for speaking practice

### 3. Adaptive Learning Algorithm
- Analyzes user performance across skills
- Identifies skill gaps and weaknesses
- Recommends personalized lesson sequences
- Adjusts difficulty based on proficiency

## 📡 API Endpoints

### Users
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User authentication
- `GET /api/users/{user_id}` - Get user details
- `GET /api/users/{user_id}/profile` - Get user profile

### Lessons
- `GET /api/lessons` - List lessons (filterable by skill/level)
- `GET /api/lessons/{lesson_id}` - Get lesson details
- `POST /api/lessons/generate/reading` - Generate reading lesson
- `GET /api/lessons/recommended/{user_id}` - Get personalized recommendations

### Assessments
- `POST /api/assessments/submit/writing` - Submit writing for grading
- `POST /api/assessments/submit/speaking` - Submit speaking (audio)
- `GET /api/assessments/{assessment_id}` - Get assessment results
- `GET /api/assessments/user/{user_id}/history` - Get assessment history

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Database Migrations
```bash
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### Linting & Formatting
```bash
# Backend
black app/
flake8 app/

# Frontend
npm run lint
```

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ielts_learning
OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
SECRET_KEY=your_secret_key
DEBUG=true
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🎯 Next Steps

1. **Implement AI Prompts**: Create detailed system prompts for AI teacher
2. **Content Generation**: Build reading/listening generation service
3. **Assessment Engine**: Implement AI grading logic
4. **Adaptive Algorithm**: Develop recommendation engine
5. **STT Integration**: Add speech-to-text for speaking assessment
6. **Frontend UI**: Build complete user interface
7. **Authentication**: Implement JWT-based auth
8. **Testing**: Add comprehensive test coverage

## 📚 Resources

- [IELTS Band Descriptors](https://www.ielts.org/for-teachers/how-to-teach-ielts/assessment-and-marking)
- [CEFR Levels](https://www.coe.int/en/web/common-european-framework-reference-languages)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
