import os
import shutil
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.config import UPLOAD_DIR, ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES
from app.database import get_db
from app.models.user import User
from app.models.resume import Resume, ResumeAnalysis
from app.schemas.resume import ResumeResponse, ResumeInfoUpdate, ResumeCompareRequest
from app.schemas.analysis import ResumeAnalysisResponse
from app.api.deps import get_current_user
from app.ml.parser import parse_resume_file
from app.ml.extractor import extract_all_resume_info
from app.ml.skills_taxonomy import extract_skills_from_text
from app.ml.scorer import calculate_resume_scores

router = APIRouter(prefix="/resumes", tags=["Resumes"])

@router.post("/upload", response_model=ResumeAnalysisResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Please upload a PDF, DOCX, or Image file (PNG, JPG, WEBP)."
        )

    # Save file to disk
    user_upload_dir = UPLOAD_DIR / str(current_user.id)
    user_upload_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = user_upload_dir / f"{int(os.times().elapsed * 1000)}_{file.filename}"
    file_size = 0
    with open(file_path, "wb") as buffer:
        content = await file.read()
        file_size = len(content)
        if file_size > MAX_FILE_SIZE_BYTES:
            buffer.close()
            if file_path.exists():
                file_path.unlink()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File exceeds maximum allowed size of 10 MB."
            )
        buffer.write(content)

    # Parse and extract
    try:
        raw_text = parse_resume_file(str(file_path))
    except Exception as e:
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=400, detail=str(e))

    # Run ML and NLP Pipeline
    extracted_info = extract_all_resume_info(raw_text)
    skills_detected = extract_skills_from_text(raw_text)
    overall_score, ats_score, breakdown, warnings, suggestions = calculate_resume_scores(
        raw_text, extracted_info, skills_detected
    )

    # Save Resume record
    resume = Resume(
        user_id=current_user.id,
        filename=file.filename,
        file_path=str(file_path),
        file_type=ext,
        file_size=file_size,
        raw_text=raw_text,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    # Save Analysis record
    analysis = ResumeAnalysis(
        resume_id=resume.id,
        overall_score=overall_score,
        ats_score=ats_score,
        score_breakdown=breakdown,
        extracted_info=extracted_info,
        skills_detected=skills_detected,
        ats_warnings=warnings,
        suggestions=suggestions
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return analysis

@router.get("", response_model=List[ResumeResponse])
def list_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).all()
    results = []
    for r in resumes:
        overall = r.analysis.overall_score if r.analysis else None
        ats = r.analysis.ats_score if r.analysis else None
        skills_ct = len(r.analysis.skills_detected.get("all", [])) if r.analysis and r.analysis.skills_detected else 0
        results.append({
            "id": r.id,
            "user_id": r.user_id,
            "filename": r.filename,
            "file_type": r.file_type,
            "file_size": r.file_size,
            "created_at": r.created_at,
            "overall_score": overall,
            "ats_score": ats,
            "skills_count": skills_ct,
        })
    return results

@router.get("/{resume_id}", response_model=ResumeAnalysisResponse)
def get_resume_analysis(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    if not resume.analysis:
        raise HTTPException(status_code=404, detail="Analysis for this resume is not yet available.")
    return resume.analysis

@router.delete("/{resume_id}")
def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    
    # Remove file on disk if present
    if os.path.exists(resume.file_path):
        try:
            os.remove(resume.file_path)
        except OSError:
            pass
            
    db.delete(resume)
    db.commit()
    return {"message": "Resume and associated analyses successfully deleted."}

@router.put("/{resume_id}/info", response_model=ResumeAnalysisResponse)
def update_extracted_info(
    resume_id: int,
    info_in: ResumeInfoUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume or not resume.analysis:
        raise HTTPException(status_code=404, detail="Resume or analysis not found.")
    
    info = dict(resume.analysis.extracted_info or {})
    update_data = info_in.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        if v is not None:
            info[k] = v
            
    resume.analysis.extracted_info = info
    
    # Recalculate score with updated contact fields
    overall_score, ats_score, breakdown, warnings, suggestions = calculate_resume_scores(
        resume.raw_text, info, resume.analysis.skills_detected
    )
    resume.analysis.overall_score = overall_score
    resume.analysis.ats_score = ats_score
    resume.analysis.score_breakdown = breakdown
    resume.analysis.ats_warnings = warnings
    resume.analysis.suggestions = suggestions

    db.commit()
    db.refresh(resume.analysis)
    return resume.analysis

@router.post("/{resume_id}/analyze", response_model=ResumeAnalysisResponse)
def reanalyze_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    
    extracted_info = extract_all_resume_info(resume.raw_text)
    skills_detected = extract_skills_from_text(resume.raw_text)
    overall_score, ats_score, breakdown, warnings, suggestions = calculate_resume_scores(
        resume.raw_text, extracted_info, skills_detected
    )
    
    if not resume.analysis:
        resume.analysis = ResumeAnalysis(resume_id=resume.id)
        
    resume.analysis.overall_score = overall_score
    resume.analysis.ats_score = ats_score
    resume.analysis.score_breakdown = breakdown
    resume.analysis.extracted_info = extracted_info
    resume.analysis.skills_detected = skills_detected
    resume.analysis.ats_warnings = warnings
    resume.analysis.suggestions = suggestions
    
    db.commit()
    db.refresh(resume.analysis)
    return resume.analysis

@router.post("/compare")
def compare_resumes(
    req: ResumeCompareRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    r_a = db.query(Resume).filter(Resume.id == req.resume_a_id, Resume.user_id == current_user.id).first()
    r_b = db.query(Resume).filter(Resume.id == req.resume_b_id, Resume.user_id == current_user.id).first()
    if not r_a or not r_b or not r_a.analysis or not r_b.analysis:
        raise HTTPException(status_code=400, detail="Both resumes must exist and have completed analyses.")
        
    skills_a = set(r_a.analysis.skills_detected.get("all", []))
    skills_b = set(r_b.analysis.skills_detected.get("all", []))
    
    score_diff = round(r_b.analysis.overall_score - r_a.analysis.overall_score, 1)
    ats_diff = round(r_b.analysis.ats_score - r_a.analysis.ats_score, 1)
    
    return {
        "resume_a": {
            "id": r_a.id,
            "filename": r_a.filename,
            "overall_score": r_a.analysis.overall_score,
            "ats_score": r_a.analysis.ats_score,
            "skills_count": len(skills_a),
            "score_breakdown": r_a.analysis.score_breakdown,
            "skills": sorted(list(skills_a)),
            "experience_years": r_a.analysis.extracted_info.get("total_experience_years", 1.0)
        },
        "resume_b": {
            "id": r_b.id,
            "filename": r_b.filename,
            "overall_score": r_b.analysis.overall_score,
            "ats_score": r_b.analysis.ats_score,
            "skills_count": len(skills_b),
            "score_breakdown": r_b.analysis.score_breakdown,
            "skills": sorted(list(skills_b)),
            "experience_years": r_b.analysis.extracted_info.get("total_experience_years", 1.0)
        },
        "comparison": {
            "score_diff": score_diff,
            "ats_diff": ats_diff,
            "common_skills": sorted(list(skills_a & skills_b)),
            "unique_to_a": sorted(list(skills_a - skills_b)),
            "unique_to_b": sorted(list(skills_b - skills_a)),
            "verdict": f"Resume {'B' if score_diff > 0 else 'A'} is stronger by {abs(score_diff)} points with enhanced keyword coverage." if score_diff != 0 else "Both resumes have identical overall ratings."
        }
    }
