# Project Structure

Complete directory structure and file organization for the IELTS Learning Platform.

```
AI-Agent-English/
│
├── 📁 frontend/                      # Next.js Frontend Application
│   ├── 📁 src/
│   │   ├── 📁 app/                   # Next.js App Router
│   │   │   ├── layout.tsx           # Root layout
│   │   │   ├── page.tsx             # Home page
│   │   │   ├── globals.css          # Global styles
│   │   │   ├── 📁 lessons/          # Lessons pages
│   │   │   ├── 📁 practice/         # Practice pages
│   │   │   ├── 📁 profile/          # User profile
│   │   │   └── 📁 dashboard/        # User dashboard
│   │   │
│   │   ├── 📁 components/           # Reusable React components
│   │   │   ├── 📁 ui/               # UI components (buttons, cards, etc.)
│   │   │   ├── 📁 lessons/          # Lesson-related components
│   │   │   ├── 📁 assessment/       # Assessment components
│   │   │   └── 📁 layout/           # Layout components
│   │   │
│   │   ├── 📁 lib/                  # Utilities and libraries
│   │   │   ├── api.ts               # API client (axios)
│   │   │   ├── utils.ts             # Helper functions
│   │   │   └── constants.ts         # Constants
│   │   │
│   │   ├── 📁 types/                # TypeScript type definitions
│   │   │   └── index.ts             # Shared types
│   │   │
│   │   └── 📁 hooks/                # Custom React hooks
│   │       ├── useAuth.ts           # Authentication hook
│   │       ├── useLessons.ts        # Lessons data hook
│   │       └── useAssessment.ts     # Assessment hook
│   │
│   ├── 📁 public/                   # Static assets
│   │   ├── images/
│   │   └── audio/
│   │
│   ├── package.json                 # Node dependencies
│   ├── tsconfig.json                # TypeScript config
│   ├── next.config.js               # Next.js config
│   ├── tailwind.config.js           # TailwindCSS config
│   ├── .env.example                 # Environment variables example
│   ├── .eslintrc.json               # ESLint config
│   └── Dockerfile                   # Docker image definition
│
├── 📁 backend/                       # FastAPI Backend Application
│   ├── 📁 app/
│   │   ├── main.py                  # FastAPI application entry point
│   │   │
│   │   ├── 📁 api/                  # API layer
│   │   │   └── 📁 endpoints/        # API route handlers
│   │   │       ├── users.py         # User endpoints
│   │   │       ├── lessons.py       # Lesson endpoints
│   │   │       ├── assessments.py   # Assessment endpoints
│   │   │       ├── progress.py      # Progress tracking
│   │   │       └── analytics.py     # Analytics endpoints
│   │   │
│   │   ├── 📁 core/                 # Core configuration
│   │   │   ├── config.py            # Settings and config
│   │   │   ├── security.py          # Security utilities (JWT, hashing)
│   │   │   └── dependencies.py      # FastAPI dependencies
│   │   │
│   │   ├── 📁 db/                   # Database layer
│   │   │   ├── base.py              # SQLAlchemy base setup
│   │   │   └── session.py           # Database session management
│   │   │
│   │   ├── 📁 models/               # SQLAlchemy ORM models
│   │   │   ├── __init__.py          # Export all models
│   │   │   ├── user.py              # User & UserProfile models
│   │   │   ├── lesson.py            # Lesson-related models
│   │   │   ├── progress.py          # Progress tracking models
│   │   │   ├── adaptive.py          # Adaptive learning models
│   │   │   └── system.py            # System config models
│   │   │
│   │   ├── 📁 schemas/              # Pydantic schemas (request/response)
│   │   │   ├── user.py              # User schemas
│   │   │   ├── lesson.py            # Lesson schemas
│   │   │   ├── assessment.py        # Assessment schemas
│   │   │   └── common.py            # Common/shared schemas
│   │   │
│   │   ├── 📁 services/             # Business logic layer
│   │   │   ├── ai_service.py        # LLM integration (OpenAI/Claude)
│   │   │   ├── content_generator.py # Content generation
│   │   │   ├── assessment_service.py # Assessment & grading
│   │   │   ├── adaptive_engine.py   # Adaptive learning algorithm
│   │   │   ├── user_service.py      # User operations
│   │   │   └── analytics_service.py # Analytics calculations
│   │   │
│   │   └── 📁 prompts/              # AI prompt templates
│   │       ├── examiner_prompt.py   # IELTS examiner system prompt
│   │       ├── content_prompts.py   # Content generation prompts
│   │       └── feedback_prompts.py  # Feedback generation prompts
│   │
│   ├── 📁 tests/                    # Backend tests
│   │   ├── test_api/
│   │   ├── test_services/
│   │   └── test_models/
│   │
│   ├── requirements.txt             # Python dependencies
│   ├── .env.example                 # Environment variables example
│   ├── Dockerfile                   # Docker image definition
│   └── alembic.ini                  # Database migration config
│
├── 📁 database/                      # Database files
│   ├── schema.sql                   # Complete PostgreSQL schema
│   └── 📁 migrations/               # Alembic migration files
│       └── versions/
│
├── 📁 docs/                          # Documentation
│   ├── ARCHITECTURE.md              # System architecture
│   ├── PROJECT_STRUCTURE.md         # This file
│   ├── API.md                       # API documentation
│   └── DATABASE.md                  # Database schema details
│
├── docker-compose.yml               # Multi-container orchestration
├── .dockerignore                    # Docker ignore patterns
├── .gitignore                       # Git ignore patterns
├── .env.example                     # Root environment variables
├── Makefile                         # Build automation commands
├── README.md                        # Main documentation
├── QUICKSTART.md                    # Quick start guide
└── LICENSE                          # License file

```

## Key Directories Explained

### `/frontend/src/app`
Next.js App Router pages. Each folder represents a route in the application.

### `/frontend/src/components`
Reusable React components organized by feature or type.

### `/backend/app/api/endpoints`
FastAPI route handlers. Each file contains related endpoints.

### `/backend/app/models`
SQLAlchemy ORM models that map to database tables.

### `/backend/app/schemas`
Pydantic models for request validation and response serialization.

### `/backend/app/services`
Business logic layer. Contains core algorithms and integrations.

### `/database`
Database schema and migration files.

### `/docs`
Project documentation and guides.

## File Naming Conventions

### Backend (Python)
- Files: `snake_case.py`
- Classes: `PascalCase`
- Functions: `snake_case()`
- Constants: `UPPER_SNAKE_CASE`

### Frontend (TypeScript/React)
- Files: `camelCase.tsx` or `PascalCase.tsx` (for components)
- Components: `PascalCase`
- Functions: `camelCase()`
- Hooks: `useHookName()`

## Import Order

### Backend
```python
# Standard library
import os
from typing import List

# Third-party
from fastapi import APIRouter
from sqlalchemy import Column

# Local
from app.models import User
from app.schemas import UserCreate
```

### Frontend
```typescript
// React/Next
import React from 'react'
import { useRouter } from 'next/navigation'

// Third-party
import axios from 'axios'

// Local
import { apiClient } from '@/lib/api'
import { User } from '@/types'
```

## Environment Files

### Development
- `.env` - Local environment variables (gitignored)
- `.env.example` - Template for environment variables (committed)

### Production
- Environment variables set in hosting platform
- Never commit `.env` files

## Configuration Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Multi-container setup |
| `next.config.js` | Next.js configuration |
| `tsconfig.json` | TypeScript configuration |
| `tailwind.config.js` | TailwindCSS configuration |
| `requirements.txt` | Python dependencies |
| `package.json` | Node.js dependencies |
| `alembic.ini` | Database migration configuration |

## Adding New Features

### Backend Endpoint
1. Create route in `/backend/app/api/endpoints/`
2. Add Pydantic schemas in `/backend/app/schemas/`
3. Implement business logic in `/backend/app/services/`
4. Add tests in `/backend/tests/`

### Frontend Page
1. Create page in `/frontend/src/app/`
2. Add components in `/frontend/src/components/`
3. Define types in `/frontend/src/types/`
4. Create hooks if needed in `/frontend/src/hooks/`

### Database Change
1. Modify schema in `/database/schema.sql`
2. Update SQLAlchemy models in `/backend/app/models/`
3. Create Alembic migration
4. Update Pydantic schemas

## Best Practices

1. **Separation of Concerns**: Keep API, business logic, and data layers separate
2. **Type Safety**: Use TypeScript in frontend, Pydantic in backend
3. **Environment Variables**: Never hardcode secrets
4. **Documentation**: Update docs when adding features
5. **Testing**: Write tests for critical functionality
6. **Git**: Use meaningful commit messages and branch names
