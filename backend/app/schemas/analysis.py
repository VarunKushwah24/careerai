from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict

class ResumeAnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    resume_id: int
    overall_score: float
    ats_score: float
    score_breakdown: Dict[str, Any]
    extracted_info: Dict[str, Any]
    skills_detected: Dict[str, Any]
    ats_warnings: List[str]
    suggestions: List[Dict[str, Any]]
    created_at: datetime

class SkillGapRequest(BaseModel):
    resume_id: int
    job_id: int

class LearningItem(BaseModel):
    skill: str
    priority: str  # High | Medium | Low
    reason: str
    estimated_weeks: int

class SkillGapResponse(BaseModel):
    job_id: int
    job_title: str
    company: str
    skills_you_have: List[str]
    skills_you_need: List[str]
    match_percentage: float
    learning_path: List[LearningItem]

class JobDescriptionAnalyzeRequest(BaseModel):
    resume_id: int
    job_title: Optional[str] = "Target Job Role"
    job_description: str

class JobDescriptionAnalyzeResponse(BaseModel):
    match_percentage: float
    skills_match_score: float
    text_similarity_score: float
    matching_skills: List[str]
    missing_skills: List[str]
    important_keywords: List[str]
    experience_assessment: str
    recommendations: List[Dict[str, Any]]
