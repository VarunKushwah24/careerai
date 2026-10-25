from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.job import Job
from app.models.resume import Resume, ResumeAnalysis
from app.schemas.job import JobCreate, JobUpdate, JobResponse
from app.schemas.user import UserResponse
from app.api.deps import get_current_admin_user

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

@router.get("/stats", response_model=Dict[str, Any])
def get_admin_stats(
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_resumes = db.query(Resume).count()
    total_analyses = db.query(ResumeAnalysis).count()
    total_jobs = db.query(Job).count()
    
    avg_score_res = db.query(func.avg(ResumeAnalysis.overall_score)).scalar()
    avg_score = round(float(avg_score_res), 1) if avg_score_res is not None else 0.0
    
    avg_ats_res = db.query(func.avg(ResumeAnalysis.ats_score)).scalar()
    avg_ats = round(float(avg_ats_res), 1) if avg_ats_res is not None else 0.0

    return {
        "total_users": total_users,
        "total_resumes": total_resumes,
        "total_analyses": total_analyses,
        "total_jobs": total_jobs,
        "average_resume_score": avg_score,
        "average_ats_score": avg_ats,
    }

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.id.desc()).all()
    return users

@router.post("/jobs", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job_in: JobCreate,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    # Normalize skill names to lowercase
    norm_skills = [s.strip().lower() for s in job_in.required_skills if s.strip()]
    job = Job(
        title=job_in.title,
        company=job_in.company,
        location=job_in.location,
        description=job_in.description,
        required_skills=norm_skills,
        experience_required=job_in.experience_required,
        salary_range=job_in.salary_range,
        job_type=job_in.job_type,
        remote_status=job_in.remote_status
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.put("/jobs/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    job_in: JobUpdate,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
        
    update_data = job_in.model_dump(exclude_unset=True)
    if "required_skills" in update_data and update_data["required_skills"]:
        update_data["required_skills"] = [s.strip().lower() for s in update_data["required_skills"] if s.strip()]
        
    for k, v in update_data.items():
        setattr(job, k, v)
        
    db.commit()
    db.refresh(job)
    return job

@router.delete("/jobs/{job_id}")
def delete_job(
    job_id: int,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    db.delete(job)
    db.commit()
    return {"message": "Job listing successfully deleted."}
