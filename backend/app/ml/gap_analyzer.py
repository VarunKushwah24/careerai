from typing import Dict, Any, List
from app.ml.skills_taxonomy import extract_skills_from_text, normalize_skill
from app.ml.matcher import compute_skill_overlap, compute_tfidf_similarity

SKILL_LEARNING_ESTIMATES = {
    # Core Languages & Heavy Tech: 4-8 weeks
    "python": (6, "Foundational scripting, OOP, and data structures"),
    "java": (8, "JVM architecture, concurrency, and Spring Boot framework"),
    "c++": (8, "Memory management, pointers, and STL algorithms"),
    "rust": (8, "Borrow checker, safety patterns, and async programming"),
    "machine learning": (8, "Supervised/unsupervised algorithms, scikit-learn, evaluation metrics"),
    "deep learning": (10, "Neural network backpropagation, PyTorch/TensorFlow architectures"),
    "kubernetes": (6, "Pod orchestration, service meshes, Helm deployments"),
    
    # Frameworks & Platforms: 3-5 weeks
    "react": (4, "Hooks, virtual DOM, component lifecycles, and state stores"),
    "fastapi": (3, "Async endpoints, Pydantic schemas, dependency injection"),
    "docker": (3, "Containerization, multi-stage builds, and docker-compose"),
    "aws": (6, "IAM, S3, EC2, Lambda, and cloud architecture patterns"),
    "sql": (3, "Complex joins, indexing, query optimization, and window functions"),
    "postgresql": (3, "ACID compliance, JSONB queries, and connection pools"),
    
    # Tools & Practices: 1-2 weeks
    "git": (2, "Branching strategies, interactive rebasing, merge conflict resolution"),
    "ci/cd": (2, "Automated build pipelines and GitHub Actions workflows"),
    "postman": (1, "API contract testing and automated test collections"),
    "jira": (1, "Agile sprint tracking and workflow management"),
}

def analyze_skill_gap(candidate_skills: List[str], target_job_skills: List[str]) -> Dict[str, Any]:
    overlap_ratio, matching, missing = compute_skill_overlap(candidate_skills, target_job_skills)
    match_percentage = round(overlap_ratio * 100, 1)
    
    learning_path = []
    for idx, skill in enumerate(missing):
        norm = normalize_skill(skill)
        weeks, reason = SKILL_LEARNING_ESTIMATES.get(
            norm, 
            (3, f"Master core syntax, hands-on integration, and industry best practices for {skill}")
        )
        # Priority: First 3 missing are High priority, next are Medium/Low
        if idx < 3:
            priority = "High"
        elif idx < 6:
            priority = "Medium"
        else:
            priority = "Low"
            
        learning_path.append({
            "skill": skill,
            "priority": priority,
            "reason": reason,
            "estimated_weeks": weeks
        })
        
    return {
        "skills_you_have": matching,
        "skills_you_need": missing,
        "match_percentage": match_percentage,
        "learning_path": learning_path
    }

def analyze_custom_job_description(
    resume_text: str,
    candidate_skills: List[str],
    job_description: str
) -> Dict[str, Any]:
    # Extract skills directly from pasted job description
    extracted_from_jd = extract_skills_from_text(job_description)
    target_skills = extracted_from_jd.get("all", [])
    
    overlap_ratio, matching, missing = compute_skill_overlap(candidate_skills, target_skills)
    tfidf_score = compute_tfidf_similarity(resume_text, job_description)
    
    # Combined score: 60% skills overlap + 40% TF-IDF similarity
    match_score = round(((overlap_ratio * 0.60) + (tfidf_score * 0.40)) * 100, 1)
    match_score = max(20.0, min(98.0, match_score))
    
    recommendations = []
    if missing:
        recommendations.append({
            "category": "Skills Gap",
            "text": f"Add hands-on project experience with missing target skills: {', '.join(missing[:4])}."
        })
    if tfidf_score < 0.35:
        recommendations.append({
            "category": "Keyword Optimization",
            "text": "Incorporate domain-specific phrases and industry terminology from the job description into your experience bullets."
        })
    recommendations.append({
        "category": "Impact Metrics",
        "text": "Ensure your resume clearly quantifies impact in areas relevant to the employer's stated responsibilities."
    })
    
    return {
        "match_percentage": match_score,
        "skills_match_score": round(overlap_ratio * 100, 1),
        "text_similarity_score": round(tfidf_score * 100, 1),
        "matching_skills": matching,
        "missing_skills": missing,
        "important_keywords": target_skills[:12],
        "experience_assessment": "Moderate Alignment" if match_score >= 60 else "Requires Skill Bridging",
        "recommendations": recommendations
    }
