import re
from typing import Dict, Any, List, Tuple

def calculate_resume_scores(
    raw_text: str,
    extracted_info: Dict[str, Any],
    skills_detected: Dict[str, Any]
) -> Tuple[float, float, Dict[str, float], List[str], List[Dict[str, Any]]]:
    
    text_len = len(raw_text.split())
    skills_count = len(skills_detected.get("all", []))
    tech_count = len(skills_detected.get("technical", []))
    tools_count = len(skills_detected.get("tools", []))
    soft_count = len(skills_detected.get("soft", []))
    
    warnings = []
    suggestions = []
    
    # 1. Section & Contact Completeness (Max 20 points)
    contact_score = 0
    if extracted_info.get("email") and "@" in extracted_info["email"]:
        contact_score += 5
    else:
        warnings.append("No verified email address detected.")
        suggestions.append({
            "category": "Contact Information",
            "problem": "Missing professional email address.",
            "recommendation": "Add a prominent, professional email in the top header.",
            "priority": "High"
        })
        
    if extracted_info.get("phone"):
        contact_score += 5
    else:
        warnings.append("No phone number found.")
        suggestions.append({
            "category": "Contact Information",
            "problem": "Missing contact phone number.",
            "recommendation": "Include your primary phone number with country code.",
            "priority": "Medium"
        })
        
    if extracted_info.get("linkedin"):
        contact_score += 5
    else:
        warnings.append("Missing LinkedIn profile hyperlink.")
        suggestions.append({
            "category": "Online Presence",
            "problem": "No LinkedIn URL detected.",
            "recommendation": "Add a link to your updated LinkedIn profile to build recruiter trust.",
            "priority": "High"
        })
        
    if extracted_info.get("github") or extracted_info.get("portfolio"):
        contact_score += 5
    else:
        warnings.append("Consider adding GitHub or Portfolio URL.")
        suggestions.append({
            "category": "Online Presence",
            "problem": "No code repository or portfolio link.",
            "recommendation": "Showcase your real-world code by linking your GitHub or personal portfolio.",
            "priority": "Medium"
        })
    contact_pts = contact_score  # 0 - 20
    
    # 2. Skill Richness (Max 25 points)
    if tech_count >= 10:
        skill_pts = 25
    elif tech_count >= 6:
        skill_pts = 20
    elif tech_count >= 3:
        skill_pts = 15
    else:
        skill_pts = 8
        warnings.append("Technical skill count is low; modern ATS filters require dense keyword coverage.")
        suggestions.append({
            "category": "Skills",
            "problem": "Sparse technical skill coverage.",
            "recommendation": "Explicitly list relevant languages, frameworks, and databases in a dedicated Skills section.",
            "priority": "High"
        })
        
    if tools_count < 2:
        suggestions.append({
            "category": "Tools",
            "problem": "Few development tools or DevOps utilities mentioned.",
            "recommendation": "Include common tools such as Git, Docker, Postman, or Jira to showcase workflow readiness.",
            "priority": "Medium"
        })
        
    # 3. Experience & Quantifiable Impact (Max 25 points)
    exp_years = extracted_info.get("total_experience_years", 1.0)
    exp_roles = extracted_info.get("experience", [])
    
    exp_pts = min(25, int(exp_years * 5) + (5 if len(exp_roles) > 1 else 3))
    
    # Check for quantifiable metrics: percentages, numbers, dollars, improvements
    metric_matches = re.findall(r'\b(?:\d+%(?:\s+increase|\s+reduction|\s+growth)?|\$\d+[kKmM]?|\b\d{2,}\b)', raw_text)
    if len(metric_matches) < 2:
        warnings.append("Your resume has limited measurable achievements (percentages, numbers, ROI).")
        suggestions.append({
            "category": "Experience",
            "problem": "Lack of measurable impact in work experience bullet points.",
            "recommendation": "Quantify outcomes: e.g., 'Reduced query latency by 35%' or 'Processed 50,000+ daily requests'.",
            "priority": "High"
        })
        exp_pts = max(5, exp_pts - 4)
    else:
        exp_pts = min(25, exp_pts + 3)
        
    # 4. Education & Projects (Max 15 points)
    edu_records = extracted_info.get("education", [])
    proj_records = extracted_info.get("projects", [])
    edu_pts = 8 if len(edu_records) > 0 else 3
    proj_pts = 7 if len(proj_records) > 0 else 2
    edu_proj_pts = edu_pts + proj_pts
    
    if len(proj_records) == 0:
        suggestions.append({
            "category": "Projects",
            "problem": "No distinguished projects identified.",
            "recommendation": "Include 2-3 significant projects with tech stacks and live URLs or GitHub links.",
            "priority": "High"
        })
        
    # 5. Formatting, Length & Keyword Density (Max 15 points)
    fmt_pts = 15
    if text_len < 200:
        fmt_pts -= 8
        warnings.append("Resume length is very brief (under 200 words).")
        suggestions.append({
            "category": "Formatting",
            "problem": "Resume content is too brief.",
            "recommendation": "Expand upon your technical contributions, architecture decisions, and academic coursework.",
            "priority": "High"
        })
    elif text_len > 1200:
        fmt_pts -= 3
        warnings.append("Resume exceeds standard 2-page concise length.")
        suggestions.append({
            "category": "Formatting",
            "problem": "Resume exceeds recommended length.",
            "recommendation": "Condense older bullet points and keep modern relevant achievements front and center.",
            "priority": "Low"
        })
        
    # Check action verbs
    action_verbs = re.findall(r'(?i)\b(?:developed|engineered|implemented|architected|designed|led|built|optimized|deployed|scaled|automated)\b', raw_text)
    if len(action_verbs) < 4:
        fmt_pts -= 3
        suggestions.append({
            "category": "Action Verbs",
            "problem": "Passive language detected in descriptions.",
            "recommendation": "Begin experience bullet points with strong action verbs like 'Architected', 'Engineered', 'Optimized'.",
            "priority": "Medium"
        })

    fmt_pts = max(4, min(15, fmt_pts))
    
    # Calculate Overall Score (Sum of points: 20 + 25 + 25 + 15 + 15 = 100)
    overall_score = round(float(contact_pts + skill_pts + exp_pts + edu_proj_pts + fmt_pts), 1)
    overall_score = max(20.0, min(98.0, overall_score))
    
    # ATS Compatibility Score: weighted heavily towards standard section structure and parseability
    ats_score = round(float((contact_pts / 20.0 * 25) + (skill_pts / 25.0 * 35) + (fmt_pts / 15.0 * 25) + (edu_proj_pts / 15.0 * 15)), 1)
    ats_score = max(25.0, min(97.0, ats_score))
    
    breakdown = {
        "ats_compatibility": ats_score,
        "skills": round((skill_pts / 25.0) * 100, 1),
        "experience": round((exp_pts / 25.0) * 100, 1),
        "education": round((edu_pts / 8.0) * 100, 1),
        "projects": round((proj_pts / 7.0) * 100, 1),
        "formatting": round((fmt_pts / 15.0) * 100, 1),
        "keywords": min(100.0, round((skills_count / 15.0) * 100, 1)),
    }
    
    return overall_score, ats_score, breakdown, warnings, suggestions
