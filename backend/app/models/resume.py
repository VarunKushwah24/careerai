from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(20), nullable=False)
    file_size = Column(Integer, default=0)
    raw_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="resumes")
    analysis = relationship("ResumeAnalysis", back_populates="resume", uselist=False, cascade="all, delete-orphan")
    applications = relationship("JobApplication", back_populates="resume", cascade="all, delete-orphan")


class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    overall_score = Column(Float, default=0.0)
    ats_score = Column(Float, default=0.0)
    score_breakdown = Column(JSON, default=dict)
    extracted_info = Column(JSON, default=dict)
    skills_detected = Column(JSON, default=dict)
    ats_warnings = Column(JSON, default=list)
    suggestions = Column(JSON, default=list)
    created_at = Column(DateTime, default=utc_now)

    resume = relationship("Resume", back_populates="analysis")
