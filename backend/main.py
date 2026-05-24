from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import sys

from config import settings
from routers import auth, resume, github, linkedin, job_match, interview, analytics, payments, roadmap, cover_letter, applications, jobs_board

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("hirenix")
logger.info("Starting Hirenix API...")

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
app.include_router(linkedin.router, prefix="/linkedin", tags=["LinkedIn"])
app.include_router(job_match.router, prefix="/jobs", tags=["Job Matching"])
app.include_router(interview.router, prefix="/interview", tags=["Mock Interview"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(payments.router, prefix="/payments", tags=["Payments"])
app.include_router(roadmap.router, prefix="/roadmap", tags=["Roadmap"])
app.include_router(cover_letter.router, prefix="/cover-letter", tags=["Cover Letter"])
app.include_router(applications.router, prefix="/applications", tags=["Job Applications"])
app.include_router(jobs_board.router, prefix="/jobs-board", tags=["Jobs Board"])


@app.get("/", tags=["Health"])
async def root():
    return {"message": "Hirenix API is running", "status": "healthy"}


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}


@app.on_event("startup")
async def start_scheduler():
    import asyncio
    from services.twitter_job_aggregator import sync_twitter_jobs

    async def periodic_job_scraper():
        logger.info("Starting periodic job scraper background task (2-hour interval)...")
        # Run shortly after startup so we don't delay initial server readiness
        await asyncio.sleep(10)
        while True:
            try:
                logger.info("Executing periodic job scraping...")
                new_jobs = await sync_twitter_jobs()
                logger.info(f"Periodic job scraping complete. Added {new_jobs} new jobs.")
            except Exception as e:
                logger.error(f"Error during periodic job scraping: {e}")
            # Wait for 2 hours (7200 seconds)
            await asyncio.sleep(7200)

    asyncio.create_task(periodic_job_scraper())


# End of main.py
