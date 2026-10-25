from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict

class ResumeInfoUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None

class ResumeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    filename: str
    file_type: str
    file_size: int
    created_at: datetime
    overall_score: Optional[float] = None
    ats_score: Optional[float] = None
    skills_count: Optional[int] = 0

class ResumeCompareRequest(BaseModel):
    resume_a_id: int
    resume_b_id: int
