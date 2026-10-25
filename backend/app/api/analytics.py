from collections import Counter
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.job import Job
from app.models.resume import Resume
from app.schemas.analysis import SkillGapRequest, SkillGapResponse
from app.api.deps import get_current_user
from app.ml.gap_analyzer import analyze_skill_gap
from app.ml.matcher import calculate_job_match

router = APIRouter(prefix="", tags=["Analytics & Dashboard"])

@router.post("/skills/gap-analysis", response_model=SkillGapResponse)
def get_skill_gap_analysis(
    req: SkillGapRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == req.resume_id, Resume.user_id == current_user.id).first()
    if not resume or not resume.analysis:
        raise HTTPException(status_code=404, detail="Resume with completed analysis not found.")
        
    job = db.query(Job).filter(Job.id == req.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Target job not found.")
        
    cand_skills = resume.analysis.skills_detected.get("all", []) if resume.analysis.skills_detected else []
    target_skills = job.required_skills or []
    
    gap_data = analyze_skill_gap(cand_skills, target_skills)
    
    return {
        "job_id": job.id,
        "job_title": job.title,
        "company": job.company,
        "skills_you_have": gap_data["skills_you_have"],
        "skills_you_need": gap_data["skills_you_need"],
        "match_percentage": gap_data["match_percentage"],
        "learning_path": gap_data["learning_path"]
    }

@router.get("/dashboard/stats", response_model=Dict[str, Any])
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.asc()).all()
    all_jobs = db.query(Job).all()
    
    if not resumes:
        return {
            "has_resume": False,
            "resume_score": 0,
            "ats_score": 0,
            "jobs_matched": 0,
            "skills_count": 0,
            "missing_skills_count": 0,
            "score_history": [],
            "skill_distribution": [
                {"name": "Technical", "value": 0},
                {"name": "Soft Skills", "value": 0},
                {"name": "Tools", "value": 0},
            ],
            "top_recommended_jobs": [],
            "top_missing_skills": []
        }
        
    latest_resume = resumes[-1]
    analysis = latest_resume.analysis
    
    best_score = max([r.analysis.overall_score for r in resumes if r.analysis] or [0])
    latest_score = analysis.overall_score if analysis else 0
    ats_score = analysis.ats_score if analysis else 0
    
    skills_detected = analysis.skills_detected if analysis else {}
    tech_skills = skills_detected.get("technical", [])
    soft_skills = skills_detected.get("soft", [])
    tools = skills_detected.get("tools", [])
    all_cand_skills = skills_detected.get("all", [])
    
    # Calculate matches for top jobs
    job_matches = []
    missing_counter = Counter()
    
    for job in all_jobs:
        match_info = calculate_job_match(
            latest_resume.raw_text,
            analysis.extracted_info if analysis else {},
            skills_detected,
            job
        )
        if match_info["match_percentage"] >= 60:
            job_matches.append({
                "id": job.id,
                "title": job.title,
                "company": job.company,
                "location": job.location,
                "match_percentage": match_info["match_percentage"],
                "matching_skills": match_info["matching_skills"],
                "missing_skills": match_info["missing_skills"],
                "salary_range": job.salary_range,
                "job_type": job.job_type,
                "remote_status": job.remote_status,
                "experience_required": job.experience_required
            })
        for m in match_info["missing_skills"]:
            missing_counter[m] += 1
            
    job_matches.sort(key=lambda x: x["match_percentage"], reverse=True)
    
    # Score History
    score_history = []
    for idx, r in enumerate(resumes):
        if r.analysis:
            score_history.append({
                "name": f"V{idx+1}: {r.filename[:14]}",
                "score": r.analysis.overall_score,
                "ats": r.analysis.ats_score,
                "date": r.created_at.strftime("%b %d")
            })
            
    top_missing = [skill for skill, count in missing_counter.most_common(5)]
    
    return {
        "has_resume": True,
        "latest_resume_id": latest_resume.id,
        "latest_resume_filename": latest_resume.filename,
        "resume_score": latest_score,
        "ats_score": ats_score,
        "best_score": best_score,
        "jobs_matched": len(job_matches),
        "skills_count": len(all_cand_skills),
        "missing_skills_count": len(top_missing),
        "score_breakdown": analysis.score_breakdown if analysis else {},
        "score_history": score_history,
        "skill_distribution": [
            {"name": "Technical", "value": len(tech_skills)},
            {"name": "Soft Skills", "value": len(soft_skills)},
            {"name": "Tools", "value": len(tools)},
        ],
        "top_recommended_jobs": job_matches[:5],
        "top_missing_skills": top_missing,
        "suggestions_count": len(analysis.suggestions) if analysis else 0
    }

@router.get("/analytics/in-demand-skills", response_model=List[Dict[str, Any]])
def get_in_demand_skills(db: Session = Depends(get_db)):
    jobs = db.query(Job).all()
    counter = Counter()
    for job in jobs:
        for s in (job.required_skills or []):
            counter[s.title() if len(s) > 3 else s.upper()] += 1
            
    top_skills = [{"skill": k, "count": v} for k, v in counter.most_common(12)]
    return top_skills
