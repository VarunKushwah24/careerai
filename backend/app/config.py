import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "careerai-super-secret-jwt-key-aiml-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Database: SQLite fallback by default, or PostgreSQL if configured
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'careerai.db'}")

# Upload storage
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

# CORS
CORS_ORIGINS_RAW = os.getenv("CORS_ORIGINS", "")
EXTRA_ORIGINS = [o.strip() for o in CORS_ORIGINS_RAW.split(",") if o.strip()]

CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "*"
] + EXTRA_ORIGINS

# Scoring Weights (Configurable)
SCORING_WEIGHTS = {
    "skills": 0.40,
    "tfidf": 0.25,
    "experience": 0.15,
    "education": 0.10,
    "keywords": 0.10,
}
