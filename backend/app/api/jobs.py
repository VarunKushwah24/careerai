from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from app.database import get_db
from app.models.user import User
from app.models.job import Job
from app.models.resume import Resume
from app.models.application import SavedJob, JobApplication
from app.schemas.job import (
    JobResponse, JobMatchCard, JobApplyRequest, JobApplicationResponse
)
from app.schemas.analysis import JobDescriptionAnalyzeRequest, JobDescriptionAnalyzeResponse
from app.api.deps import get_current_user
from app.ml.matcher import calculate_job_match
from app.ml.gap_analyzer import analyze_custom_job_description

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("", response_model=dict)
def search_jobs(
    q: Optional[str] = Query(None, description="Search term for title, company or description"),
    location: Optional[str] = Query(None),
    remote_status: Optional[str] = Query(None),
    job_type: Optional[str] = Query(None),
    min_exp: Optional[int] = Query(None),
    source: Optional[str] = Query(None),
    is_realtime: Optional[bool] = Query(None),
    india_only: Optional[bool] = Query(None, description="Filter specifically for Indian job market openings"),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Job)
    
    if q:
        search_fmt = f"%{q}%"
        query = query.filter(
            or_(
                Job.title.ilike(search_fmt),
                Job.company.ilike(search_fmt),
                Job.description.ilike(search_fmt)
            )
        )
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if remote_status and remote_status != "All":
        query = query.filter(Job.remote_status == remote_status)
    if job_type and job_type != "All":
        query = query.filter(Job.job_type == job_type)
    if min_exp is not None:
        query = query.filter(Job.experience_required <= min_exp)
    if source and source != "All":
        query = query.filter(Job.source.ilike(f"%{source}%"))
    if is_realtime is not None:
        query = query.filter(Job.is_realtime == is_realtime)
    if india_only:
        query = query.filter(
            or_(
                Job.location.ilike("%India%"),
                Job.location.ilike("%Bengaluru%"),
                Job.location.ilike("%Bangalore%"),
                Job.location.ilike("%Hyderabad%"),
                Job.location.ilike("%Pune%"),
                Job.location.ilike("%Mumbai%"),
                Job.location.ilike("%Gurugram%"),
                Job.location.ilike("%Gurgaon%"),
                Job.location.ilike("%Noida%"),
                Job.location.ilike("%Delhi%"),
                Job.location.ilike("%Chennai%"),
                Job.source.ilike("%India%"),
            )
        )
        
    total = query.count()
    jobs = query.order_by(Job.id.desc()).offset((page - 1) * limit).limit(limit).all()
    
    # Check saved jobs for current user
    saved_job_ids = {
        sj.job_id for sj in db.query(SavedJob.job_id).filter(SavedJob.user_id == current_user.id).all()
    }
    
    items = []
    for j in jobs:
        items.append({
            "id": j.id,
            "title": j.title,
            "company": j.company,
            "location": j.location,
            "description": j.description,
            "required_skills": j.required_skills or [],
            "experience_required": j.experience_required,
            "salary_range": j.salary_range,
            "job_type": j.job_type,
            "remote_status": j.remote_status,
            "source": j.source or "CareerAI Platform",
            "external_url": j.external_url,
            "is_realtime": bool(j.is_realtime),
            "created_at": j.created_at,
            "is_saved": j.id in saved_job_ids
        })
        
    return {
        "items": items,
        "total": total,
        "page": page,
        "pages": max(1, (total + limit - 1) // limit)
    }

@router.get("/recommendations/{resume_id}", response_model=List[JobMatchCard])
def get_recommendations_for_resume(
    resume_id: int,
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume or not resume.analysis:
        raise HTTPException(status_code=404, detail="Resume with completed analysis not found.")
        
    all_jobs = db.query(Job).all()
    saved_ids = {
        sj.job_id for sj in db.query(SavedJob.job_id).filter(SavedJob.user_id == current_user.id).all()
    }
    
    match_cards = []
    for job in all_jobs:
        match_data = calculate_job_match(
            resume.raw_text,
            resume.analysis.extracted_info or {},
            resume.analysis.skills_detected or {},
            job
        )
        match_cards.append({
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "salary_range": job.salary_range,
            "job_type": job.job_type,
            "remote_status": job.remote_status,
            "experience_required": job.experience_required,
            "required_skills": job.required_skills or [],
            "match_percentage": match_data["match_percentage"],
            "matching_skills": match_data["matching_skills"],
            "missing_skills": match_data["missing_skills"],
            "score_breakdown": match_data["score_breakdown"],
            "source": job.source or "CareerAI Platform",
            "external_url": job.external_url,
            "is_realtime": bool(job.is_realtime),
            "why_recommended": match_data["why_recommended"],
            "is_saved": job.id in saved_ids
        })
        
    # Sort descending by match percentage
    match_cards.sort(key=lambda x: x["match_percentage"], reverse=True)
    return match_cards[:limit]

@router.get("/saved/all", response_model=List[JobResponse])
def get_all_saved_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved = db.query(SavedJob).filter(SavedJob.user_id == current_user.id).order_by(SavedJob.created_at.desc()).all()
    res = []
    for s in saved:
        if s.job:
            res.append({
                "id": s.job.id,
                "title": s.job.title,
                "company": s.job.company,
                "location": s.job.location,
                "description": s.job.description,
                "required_skills": s.job.required_skills or [],
                "experience_required": s.job.experience_required,
                "salary_range": s.job.salary_range,
                "job_type": s.job_type if hasattr(s, "job_type") else s.job.job_type,
                "remote_status": s.job.remote_status,
                "source": s.job.source or "CareerAI Platform",
                "external_url": s.job.external_url,
                "is_realtime": bool(s.job.is_realtime),
                "created_at": s.job.created_at,
                "is_saved": True
            })
    return res

@router.post("/{job_id}/save")
def save_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job opening not found.")
        
    existing = db.query(SavedJob).filter(SavedJob.user_id == current_user.id, SavedJob.job_id == job_id).first()
    if existing:
        return {"message": "Job is already saved in your favorites."}
        
    saved = SavedJob(user_id=current_user.id, job_id=job_id)
    db.add(saved)
    db.commit()
    return {"message": "Job successfully saved to your list."}

@router.delete("/{job_id}/save")
def unsave_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved = db.query(SavedJob).filter(SavedJob.user_id == current_user.id, SavedJob.job_id == job_id).first()
    if saved:
        db.delete(saved)
        db.commit()
    return {"message": "Job removed from saved list."}

@router.post("/{job_id}/apply", response_model=JobApplicationResponse)
def apply_to_job(
    job_id: int,
    req: JobApplyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job opening not found.")
        
    # Check if already applied
    existing = db.query(JobApplication).filter(JobApplication.user_id == current_user.id, JobApplication.job_id == job_id).first()
    if existing:
        return {
            "id": existing.id,
            "user_id": existing.user_id,
            "job_id": existing.job_id,
            "resume_id": existing.resume_id,
            "status": existing.status,
            "applied_at": existing.applied_at,
            "job_title": job.title,
            "company": job.company
        }
        
    resume_id = req.resume_id
    if not resume_id:
        latest_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()
        resume_id = latest_resume.id if latest_resume else None
        
    app_record = JobApplication(
        user_id=current_user.id,
        job_id=job_id,
        resume_id=resume_id,
        status="Applied"
    )
    db.add(app_record)
    db.commit()
    db.refresh(app_record)
    
    return {
        "id": app_record.id,
        "user_id": app_record.user_id,
        "job_id": app_record.job_id,
        "resume_id": app_record.resume_id,
        "status": app_record.status,
        "applied_at": app_record.applied_at,
        "job_title": job.title,
        "company": job.company
    }

@router.get("/applications/all", response_model=List[JobApplicationResponse])
def get_user_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    apps = db.query(JobApplication).filter(JobApplication.user_id == current_user.id).order_by(JobApplication.applied_at.desc()).all()
    results = []
    for a in apps:
        results.append({
            "id": a.id,
            "user_id": a.user_id,
            "job_id": a.job_id,
            "resume_id": a.resume_id,
            "status": a.status,
            "applied_at": a.applied_at,
            "job_title": a.job.title if a.job else "Unknown Role",
            "company": a.job.company if a.job else "Unknown Co"
        })
    return results

@router.post("/analyze-jd", response_model=JobDescriptionAnalyzeResponse)
def analyze_custom_jd(
    req: JobDescriptionAnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == req.resume_id, Resume.user_id == current_user.id).first()
    if not resume or not resume.analysis:
        raise HTTPException(status_code=404, detail="Resume with completed analysis not found.")
        
    candidate_skills = resume.analysis.skills_detected.get("all", []) if resume.analysis.skills_detected else []
    result = analyze_custom_job_description(resume.raw_text, candidate_skills, req.job_description)
    return result


@router.post("/sync-live", response_model=dict)
def sync_live_jobs(
    limit_per_source: int = Query(15, ge=5, le=50),
    region: str = Query("all", description="'all', 'india', or 'global'"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Ingest and refresh real-time job openings from live web APIs (Adzuna India, Remotive, Arbeitnow, JSearch).
    Automatically normalizes job descriptions and maps skills to CareerAI's 600+ taxonomy.
    """
    from app.services.job_api_service import RealTimeJobService
    result = RealTimeJobService.sync_jobs_to_db(db, limit_per_source=limit_per_source, region=region)
    return result

@router.post("/sync-india", response_model=dict)
def sync_india_jobs(
    limit: int = Query(25, ge=5, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Dedicated endpoint to sync real-time jobs specifically from the Indian Job Market
    spanning all sectors: Software Engineering, Data Science, Product, DevOps, QA, Sales, and Internships.
    """
    from app.services.job_api_service import RealTimeJobService
    result = RealTimeJobService.sync_jobs_to_db(db, limit_per_source=limit, region="india")
    return result

@router.get("/live-providers", response_model=List[dict])
def get_live_job_providers(
    current_user: User = Depends(get_current_user)
):
    """Return status and metadata of active real-time job API integrations."""
    from app.services.job_api_service import RealTimeJobService
    return RealTimeJobService.get_providers_status()

@router.get("/{job_id}", response_model=JobResponse)
def get_job_detail(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    is_saved = db.query(SavedJob).filter(SavedJob.user_id == current_user.id, SavedJob.job_id == job_id).first() is not None
    return {
        "id": job.id,
        "title": job.title,
        "company": job.company,
        "location": job.location,
        "description": job.description,
        "required_skills": job.required_skills or [],
        "experience_required": job.experience_required,
        "salary_range": job.salary_range,
        "job_type": job.job_type,
        "remote_status": job.remote_status,
        "source": job.source or "CareerAI Platform",
        "external_url": job.external_url,
        "is_realtime": bool(job.is_realtime),
        "created_at": job.created_at,
        "is_saved": is_saved
    }
