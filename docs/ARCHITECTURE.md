# System Architecture

## Overview
The Adaptive IELTS Learning Platform is built on a modern microservices architecture with clear separation between frontend, backend, and database layers.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│                    Next.js 14 (App Router)                  │
│                  TypeScript + TailwindCSS                   │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API
                         │ (HTTP/JSON)
┌────────────────────────▼────────────────────────────────────┐
│                         Backend                             │
│                     FastAPI (Python)                        │
│  ┌─────────────┬──────────────┬──────────────────────────┐ │
│  │  API Layer  │   Services   │      AI Integration      │ │
│  │  Endpoints  │   Business   │   OpenAI / Claude API    │ │
│  │             │     Logic    │                          │ │
│  └─────────────┴──────────────┴──────────────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │ SQLAlchemy ORM
                         │
┌────────────────────────▼────────────────────────────────────┐
│                       Database                              │
│                    PostgreSQL 16                            │
│   Users | Lessons | Progress | Analytics | Assessments     │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend (Next.js)
**Responsibilities:**
- User interface rendering
- Client-side routing
- Form handling and validation
- API communication
- State management
- Audio recording (for speaking)

**Key Technologies:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS
- Axios (API client)

### Backend (FastAPI)
**Responsibilities:**
- RESTful API endpoints
- Business logic
- Authentication & authorization
- Database operations
- AI/LLM integration
- Content generation
- Assessment grading

**Key Technologies:**
- FastAPI
- SQLAlchemy (ORM)
- Pydantic (validation)
- Python 3.11+
- JWT authentication

### Database (PostgreSQL)
**Responsibilities:**
- Data persistence
- User management
- Content storage
- Progress tracking
- Analytics storage

**Key Features:**
- JSONB for flexible data
- Full-text search
- UUID primary keys
- Triggers for auto-updates
- Indexes for performance

## Data Flow

### 1. User Registration & Onboarding
```
User -> Frontend -> POST /api/users/register -> Backend
     <- Success   <-                          <- Create user in DB
                                              <- Create initial profile
                                              <- Generate learning roadmap
```

### 2. Adaptive Lesson Recommendation
```
User -> Frontend -> GET /api/lessons/recommended/{user_id} -> Backend
                                                             -> Fetch user proficiency
                                                             -> Analyze skill gaps
                                                             -> Run recommendation algorithm
                                                             -> Return ranked lessons
     <- Lesson List <-
```

### 3. AI Content Generation
```
User -> Frontend -> POST /api/lessons/generate/reading -> Backend
                    (topic, level)                      -> Load prompt template
                                                        -> Call OpenAI/Claude API
                                                        -> Parse generated content
                                                        -> Save to database
                                                        -> Return lesson
     <- New Lesson <-
```

### 4. Writing Assessment
```
User -> Frontend -> POST /api/assessments/submit/writing -> Backend
                    (essay text)                          -> Save submission
                                                          -> Load AI examiner prompt
                                                          -> Call LLM for grading
                                                          -> Parse band scores
                                                          -> Extract feedback
                                                          -> Save assessment
                                                          -> Update proficiency
     <- Assessment <-
```

## Security Architecture

### Authentication Flow
```
1. User enters credentials
2. Backend validates against database
3. Backend generates JWT token
4. Token returned to frontend
5. Token stored in localStorage
6. Token sent in Authorization header for protected routes
7. Backend validates token on each request
```

### Security Measures
- Password hashing (bcrypt)
- JWT token expiration
- HTTPS in production
- CORS configuration
- SQL injection prevention (ORM)
- Input validation (Pydantic)
- API rate limiting

## Scalability Considerations

### Horizontal Scaling
- Frontend: Static site deployment (Vercel, Netlify)
- Backend: Multiple FastAPI instances behind load balancer
- Database: PostgreSQL read replicas

### Caching Strategy
- API responses cached at CDN
- Database query caching
- LLM response caching (for common requests)

### Performance Optimization
- Database indexes on frequently queried columns
- Lazy loading for large datasets
- Pagination for list endpoints
- Connection pooling
- Async operations where applicable

## Deployment Architecture

### Development
```
Docker Compose
├── postgres:5432
├── backend:8000
└── frontend:3000
```

### Production (Recommended)
```
Cloud Provider (AWS/GCP/Azure)
├── Frontend: Vercel / Netlify (CDN)
├── Backend: ECS / Cloud Run / App Service
├── Database: RDS / Cloud SQL / Managed PostgreSQL
└── AI Services: OpenAI API / Anthropic API
```

## Future Enhancements
1. **Microservices**: Split backend into separate services (Auth, Content, Assessment)
2. **Message Queue**: Add RabbitMQ/Redis for async tasks
3. **CDN**: Serve static assets from CDN
4. **Monitoring**: Add Prometheus + Grafana
5. **Logging**: Centralized logging (ELK stack)
6. **CI/CD**: Automated testing and deployment
