# Quick Start Guide

Get the IELTS Learning Platform running in 5 minutes!

## Prerequisites
- Docker & Docker Compose
- OpenAI or Anthropic API key

## Steps

### 1. Clone & Setup
```bash
git clone <repository-url>
cd AI-Agent-English
```

### 2. Configure Environment
```bash
# Copy environment file
cp .env.example .env

# Edit .env and add your API key
nano .env  # or use your preferred editor
```

Add your API keys:
```env
OPENAI_API_KEY=sk-your-key-here
# or
ANTHROPIC_API_KEY=your-key-here
```

### 3. Start Services
```bash
# Build and start all containers
docker-compose up -d

# Or using make
make up
```

Wait 30 seconds for all services to initialize.

### 4. Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application |
| **Backend API** | http://localhost:8000 | API server |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |
| **Database** | localhost:5432 | PostgreSQL (postgres/postgres) |

### 5. Test the API

Open http://localhost:8000/docs and try:
- GET `/health` - Check backend health
- GET `/api/lessons` - List lessons
- POST `/api/users/register` - Create a user

## Common Commands

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Clean everything (including database)
docker-compose down -v
```

## Using Make Commands

```bash
make help              # Show all commands
make up                # Start services
make down              # Stop services
make logs              # View logs
make restart           # Restart all
make clean             # Remove everything
```

## Manual Setup (Without Docker)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your values
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Database
```bash
# Install PostgreSQL
# Create database
psql -U postgres -c "CREATE DATABASE ielts_learning;"
# Run schema
psql -U postgres -d ielts_learning -f database/schema.sql
```

## Troubleshooting

### Port Already in Use
If ports 3000, 8000, or 5432 are in use:
```bash
# Check what's using the port
lsof -i :3000
lsof -i :8000
lsof -i :5432

# Stop the process or change ports in docker-compose.yml
```

### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart database
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Backend Not Starting
```bash
# Check backend logs
docker-compose logs backend

# Common issues:
# - Missing API keys in .env
# - Database not ready (wait 30s and retry)
```

## Next Steps

1. **Read the Documentation**: Check `/docs` folder
2. **Explore the API**: Visit http://localhost:8000/docs
3. **Test the Frontend**: Visit http://localhost:3000
4. **Create a User**: Use the registration endpoint
5. **Generate Content**: Try the lesson generation API

## Need Help?

- Check the full README.md
- Review docs/ARCHITECTURE.md
- Open an issue on GitHub

Happy Learning! 🎓
