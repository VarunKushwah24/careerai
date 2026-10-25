import re
from typing import Dict, Any, List, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.config import SCORING_WEIGHTS
from app.ml.skills_taxonomy import normalize_skill

def compute_tfidf_similarity(resume_text: str, job_description: str) -> float:
    if not resume_text or not job_description:
        return 0.0
    try:
        vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words='english',
            max_features=5000
        )
        tfidf_matrix = vectorizer.fit_transform([resume_text, job_description])
        sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return float(np.clip(sim, 0.0, 1.0))
    except Exception:
        # Fallback word-set Jaccard if vocabulary too sparse
        r_words = set(re.findall(r'\w+', resume_text.lower()))
        j_words = set(re.findall(r'\w+', job_description.lower()))
        inter = len(r_words & j_words)
        union = len(r_words | j_words)
        return float(inter / union) if union > 0 else 0.0

def compute_skill_overlap(candidate_skills: List[str], required_job_skills: List[str]) -> Tuple[float, List[str], List[str]]:
    if not required_job_skills:
        return 1.0, candidate_skills, []
    
    cand_norm = {normalize_skill(s) for s in candidate_skills}
    matching = []
    missing = []
    
    for req in required_job_skills:
        req_norm = normalize_skill(req)
        if req_norm in cand_norm or any(req_norm in cs for cs in cand_norm):
            matching.append(req.title() if len(req) > 3 else req.upper())
        else:
            missing.append(req.title() if len(req) > 3 else req.upper())
            
    overlap_ratio = len(matching) / max(1, len(required_job_skills))
    return float(np.clip(overlap_ratio, 0.0, 1.0)), matching, missing

def compute_experience_match(candidate_years: float, required_years: int) -> float:
    if required_years <= 0:
        return 1.0
    ratio = candidate_years / float(required_years)
    return float(np.clip(ratio, 0.2, 1.0))

def compute_education_match(education_list: List[Dict[str, Any]], job_desc: str) -> float:
    degrees = [edu.get("degree", "").lower() for edu in education_list]
    has_bachelors = any("b" in d or "bachelor" in d for d in degrees)
    has_masters = any("m" in d or "master" in d for d in degrees)
    
    if "master" in job_desc.lower() or "phd" in job_desc.lower():
        return 1.0 if has_masters else 0.8
    elif has_bachelors or has_masters:
        return 1.0
    return 0.75

def generate_why_recommended(
    match_percentage: float,
    matching_skills: List[str],
    missing_skills: List[str],
    job_title: str
) -> str:
    top_matches = ", ".join(matching_skills[:3]) if matching_skills else "general profile competencies"
    if match_percentage >= 85:
        reason = f"Outstanding match! Your verified skills in {top_matches} strongly align with this {job_title} role."
    elif match_percentage >= 70:
        reason = f"Strong potential candidate. Solid foundation in {top_matches}. Addressing {len(missing_skills)} missing skills can boost your fit."
    else:
        reason = f"Good baseline compatibility. Your background in {top_matches} provides a bridge, but learning key tools like {', '.join(missing_skills[:2])} is advised."
    return reason

def calculate_job_match(
    resume_text: str,
    extracted_info: Dict[str, Any],
    skills_detected: Dict[str, Any],
    job: Any
) -> Dict[str, Any]:
    
    candidate_skills = skills_detected.get("all", [])
    cand_years = extracted_info.get("total_experience_years", 1.0)
    edu_records = extracted_info.get("education", [])
    
    # Required skills on the job
    required_skills = job.required_skills if isinstance(job.required_skills, list) else []
    
    # 1. Skill Match Score (0.0 to 1.0)
    s_skills, matching_skills, missing_skills = compute_skill_overlap(candidate_skills, required_skills)
    
    # 2. TF-IDF Text Similarity (0.0 to 1.0)
    s_tfidf = compute_tfidf_similarity(resume_text, f"{job.title} {job.description}")
    
    # 3. Experience Match Score (0.0 to 1.0)
    s_exp = compute_experience_match(cand_years, job.experience_required)
    
    # 4. Education Match Score (0.0 to 1.0)
    s_edu = compute_education_match(edu_records, job.description)
    
    # 5. Keyword Density Match (0.0 to 1.0)
    common_kw = len(matching_skills) / max(5, len(required_skills))
    s_kw = float(np.clip(common_kw, 0.0, 1.0))
    
    w = SCORING_WEIGHTS
    final_score = (
        (w["skills"] * s_skills) +
        (w["tfidf"] * s_tfidf) +
        (w["experience"] * s_exp) +
        (w["education"] * s_edu) +
        (w["keywords"] * s_kw)
    )
    
    match_percentage = round(float(final_score * 100), 1)
    # Ensure realistic range
    match_percentage = max(25.0, min(98.0, match_percentage))
    
    why_text = generate_why_recommended(match_percentage, matching_skills, missing_skills, job.title)
    
    return {
        "match_percentage": match_percentage,
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "score_breakdown": {
            "skills": round(s_skills * 100, 1),
            "tfidf": round(s_tfidf * 100, 1),
            "experience": round(s_exp * 100, 1),
            "education": round(s_edu * 100, 1),
            "keywords": round(s_kw * 100, 1),
        },
        "why_recommended": why_text
    }
