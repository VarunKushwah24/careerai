from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import CORS_ORIGINS, UPLOAD_DIR
from app.database import engine, SessionLocal, Base
from app.api import (
    auth_router,
    users_router,
    resumes_router,
    jobs_router,
    analytics_router,
    admin_router
)
from app.utils.seed_data import seed_database

def ensure_schema_migrations():
    from sqlalchemy import inspect, text
    try:
        with engine.connect() as conn:
            inspector = inspect(engine)
            if "jobs" in inspector.get_table_names():
                cols = [c["name"] for c in inspector.get_columns("jobs")]
                if "source" not in cols:
                    conn.execute(text("ALTER TABLE jobs ADD COLUMN source VARCHAR(100) DEFAULT 'CareerAI Platform'"))
                if "external_url" not in cols:
                    conn.execute(text("ALTER TABLE jobs ADD COLUMN external_url TEXT"))
                if "is_realtime" not in cols:
                    conn.execute(text("ALTER TABLE jobs ADD COLUMN is_realtime BOOLEAN DEFAULT 0"))
                conn.commit()
    except Exception as e:
        print(f"Schema migration note: {e}")

# Ensure database tables and initial seeds exist immediately
Base.metadata.create_all(bind=engine)
ensure_schema_migrations()
_init_db = SessionLocal()
try:
    seed_database(_init_db)
finally:
    _init_db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist and seed demo data on app start
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="CareerAI - AI Resume Screening & Job Recommendation Platform",
    description="Production-grade AIML platform for intelligent resume text parsing, entity extraction, ATS rubric evaluation, and multi-factor job recommendation matching.",
    version="2.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Include Routers - mount both with /api prefix and root for maximum client compatibility
routers = [auth_router, users_router, resumes_router, jobs_router, analytics_router, admin_router]
for router in routers:
    app.include_router(router, prefix="/api")
    app.include_router(router)

@app.get("/")
@app.get("/api")
def root():
    return {
        "service": "CareerAI API",
        "status": "online",
        "docs": "/docs",
        "version": "2.0.0"
    }

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
