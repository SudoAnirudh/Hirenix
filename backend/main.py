from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import auth, resume, github, job_match, interview, analytics, payments

app = FastAPI(
    title="Hirenix API",
    description="Full-stack SaaS career analytics platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(resume.router, prefix="/resume", tags=["Resume"])
app.include_router(github.router, prefix="/github", tags=["GitHub"])
app.include_router(job_match.router, prefix="/jobs", tags=["Job Matching"])
app.include_router(interview.router, prefix="/interview", tags=["Mock Interview"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(payments.router, prefix="/payments", tags=["Payments"])


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
