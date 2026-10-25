from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict

class JobCreate(BaseModel):
    title: str
    company: str
    location: str
    description: str
    required_skills: List[str]
    experience_required: int = 0
    salary_range: Optional[str] = None
    job_type: str = "Full-time"
    remote_status: str = "On-site"
    source: Optional[str] = "CareerAI Platform"
    external_url: Optional[str] = None
    is_realtime: bool = False

class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    experience_required: Optional[int] = None
    salary_range: Optional[str] = None
    job_type: Optional[str] = None
    remote_status: Optional[str] = None
    source: Optional[str] = None
    external_url: Optional[str] = None
    is_realtime: Optional[bool] = None

class JobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    company: str
    location: str
    description: str
    required_skills: List[str]
    experience_required: int
    salary_range: Optional[str] = None
    job_type: str
    remote_status: str
    source: Optional[str] = "CareerAI Platform"
    external_url: Optional[str] = None
    is_realtime: bool = False
    created_at: datetime
    is_saved: Optional[bool] = False

class JobMatchCard(BaseModel):
    id: int
    title: str
    company: str
    location: str
    salary_range: Optional[str] = None
    job_type: str
    remote_status: str
    experience_required: int
    required_skills: List[str]
    source: Optional[str] = "CareerAI Platform"
    external_url: Optional[str] = None
    is_realtime: bool = False
    match_percentage: float
    matching_skills: List[str]
    missing_skills: List[str]
    score_breakdown: Dict[str, float]
    why_recommended: str
    is_saved: bool = False

class JobApplyRequest(BaseModel):
    resume_id: Optional[int] = None

class JobApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    job_id: int
    resume_id: Optional[int] = None
    status: str
    applied_at: datetime
    job_title: Optional[str] = None
    company: Optional[str] = None
