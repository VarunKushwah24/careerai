from app.ml.skills_taxonomy import extract_skills_from_text
from app.ml.scorer import calculate_resume_scores
from app.ml.matcher import compute_tfidf_similarity, compute_skill_overlap
from app.ml.gap_analyzer import analyze_skill_gap

def test_extract_skills():
    sample_text = (
        'Experienced with Python, FastAPI, React, Docker, and PostgreSQL. '
        'Strong problem solving, teamwork, and communication. '
        'Familiar with Git, Jira, and VS Code.'
    )
    skills = extract_skills_from_text(sample_text)
    tech = [s.lower() for s in skills["technical"]]
    assert "python" in tech
    assert "fastapi" in tech
    assert "react" in tech
    assert "docker" in tech
    assert len(skills["soft"]) >= 2
    assert len(skills["tools"]) >= 2

def test_tfidf_similarity():
    doc_a = "Senior Software Engineer specializing in Python, FastAPI, and Docker deployments."
    doc_b = "Looking for a Python Developer with Docker and cloud API development skills."
    doc_c = "Experienced Pastry Chef creating French cakes and artisan bakery items."
    
    sim_ab = compute_tfidf_similarity(doc_a, doc_b)
    sim_ac = compute_tfidf_similarity(doc_a, doc_c)
    assert sim_ab > sim_ac
    assert sim_ab > 0.05

def test_skill_overlap():
    candidate = ["Python", "FastAPI", "Docker", "SQL", "Git"]
    job_skills = ["python", "docker", "kubernetes", "aws"]
    ratio, matching, missing = compute_skill_overlap(candidate, job_skills)
    assert ratio == 0.5  # 2 of 4 (python, docker)
    assert "Python" in matching or "PYTHON" in matching
    assert len(missing) == 2

def test_skill_gap():
    cand = ["Python", "SQL"]
    req = ["python", "docker", "kubernetes"]
    gap = analyze_skill_gap(cand, req)
    assert len(gap["skills_you_have"]) == 1
    assert len(gap["skills_you_need"]) == 2
    assert len(gap["learning_path"]) == 2
