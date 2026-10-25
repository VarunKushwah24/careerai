from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.resumes import router as resumes_router
from app.api.jobs import router as jobs_router
from app.api.analytics import router as analytics_router
from app.api.admin import router as admin_router

__all__ = ["auth_router", "users_router", "resumes_router", "jobs_router", "analytics_router", "admin_router"]
