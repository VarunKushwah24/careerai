from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True, nullable=False)
    company = Column(String(255), index=True, nullable=False)
    location = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    required_skills = Column(JSON, default=list)
    experience_required = Column(Integer, default=0)
    salary_range = Column(String(100), nullable=True)
    job_type = Column(String(50), default="Full-time")
    remote_status = Column(String(50), default="On-site")
    source = Column(String(100), default="CareerAI Platform")
    external_url = Column(Text, nullable=True)
    is_realtime = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    saved_by_users = relationship("SavedJob", back_populates="job", cascade="all, delete-orphan")
    applications = relationship("JobApplication", back_populates="job", cascade="all, delete-orphan")
