from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import lessons

app = FastAPI(title="Adaptive IELTS Learning Platform API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(lessons.router, prefix="/api/v1/lessons", tags=["Lessons"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Adaptive IELTS Learning Platform API"}
