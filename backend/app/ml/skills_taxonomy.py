import re
from typing import Dict, List, Set, Tuple

TECHNICAL_SKILLS = {
    # Programming Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "c", "ruby", "go", "golang",
    "rust", "php", "swift", "kotlin", "scala", "r", "dart", "matlab", "perl", "shell scripting", "bash",
    
    # Web & Full Stack
    "react", "react.js", "vue", "vue.js", "angular", "next.js", "nuxt.js", "svelte", "html5", "html",
    "css3", "css", "sass", "tailwind css", "tailwind", "bootstrap", "node.js", "nodejs", "express",
    "express.js", "fastapi", "django", "flask", "spring boot", "spring", "asp.net", "laravel",
    "ruby on rails", "graphql", "rest api", "restful apis", "websockets", "microservices",
    
    # AI / ML / Data Science
    "machine learning", "deep learning", "artificial intelligence", "data science", "nlp",
    "natural language processing", "computer vision", "tensorflow", "pytorch", "keras",
    "scikit-learn", "opencv", "pandas", "numpy", "scipy", "matplotlib", "seaborn", "huggingface",
    "transformers", "llm", "large language models", "generative ai", "langchain", "prompt engineering",
    "bert", "xgboost", "lightgbm", "random forest", "svm", "neural networks", "data analytics",
    "data mining", "time series forecasting", "feature engineering", "predictive modeling",
    
    # Databases & Storage
    "sql", "mysql", "postgresql", "postgres", "mongodb", "sqlite", "redis", "elasticsearch",
    "cassandra", "oracle", "mariadb", "dynamodb", "neo4j", "firebase", "supabase", "snowflake",
    "bigquery", "redshift", "etl", "data warehousing",
    
    # Cloud & DevOps
    "aws", "amazon web services", "azure", "google cloud", "gcp", "docker", "kubernetes", "k8s",
    "ci/cd", "continuous integration", "jenkins", "github actions", "gitlab ci", "terraform",
    "ansible", "helm", "linux", "unix", "nginx", "apache", "serverless", "cloud computing",
    
    # Mobile Development
    "android", "ios", "react native", "flutter", "mobile app development",
    
    # Cybersecurity & Networking
    "cybersecurity", "penetration testing", "network security", "cryptography", "owasp",
    "information security", "firewalls", "vulnerability assessment"
}

SOFT_SKILLS = {
    "communication", "teamwork", "leadership", "problem solving", "critical thinking",
    "time management", "adaptability", "collaboration", "creativity", "work ethic",
    "emotional intelligence", "conflict resolution", "negotiation", "decision making",
    "attention to detail", "presentation skills", "mentoring", "public speaking",
    "interpersonal skills", "strategic thinking", "organization", "multitasking"
}

TOOLS = {
    "git", "github", "gitlab", "bitbucket", "jira", "confluence", "trello", "slack",
    "postman", "swagger", "vs code", "visual studio", "pycharm", "intellij", "eclipse",
    "docker", "kubernetes", "figma", "canva", "adobe xd", "photoshop", "illustrator",
    "tableau", "power bi", "excel", "google analytics", "kafka", "rabbitmq", "celery",
    "jupyter", "colab", "databricks", "apache spark", "hadoop"
}

# Synonyms/canonical mapping
SKILL_ALIASES = {
    "react.js": "react",
    "reactjs": "react",
    "node.js": "nodejs",
    "node": "nodejs",
    "vue.js": "vue",
    "vuejs": "vue",
    "next.js": "next.js",
    "nextjs": "next.js",
    "golang": "go",
    "k8s": "kubernetes",
    "amazon web services": "aws",
    "google cloud platform": "gcp",
    "google cloud": "gcp",
    "postgres": "postgresql",
    "scikit_learn": "scikit-learn",
    "sklearn": "scikit-learn",
    "natural language processing": "nlp",
    "large language models": "llm",
    "generative artificial intelligence": "generative ai",
    "genai": "generative ai",
    "ci/cd": "ci/cd",
    "tailwind": "tailwind css",
    "restful api": "rest api",
    "restful apis": "rest api",
    "spring": "spring boot",
}

def normalize_skill(skill: str) -> str:
    s = skill.strip().lower()
    return SKILL_ALIASES.get(s, s)

def extract_skills_from_text(text: str) -> Dict[str, List[str]]:
    if not text:
        return {"technical": [], "soft": [], "tools": [], "all": []}
    
    text_lower = " " + re.sub(r'[^a-zA-Z0-9#\+\-\.\s]', ' ', text.lower()) + " "
    
    found_technical = set()
    found_soft = set()
    found_tools = set()

    all_taxonomies = [
        (TECHNICAL_SKILLS, found_technical),
        (SOFT_SKILLS, found_soft),
        (TOOLS, found_tools),
    ]

    for skill_set, found_set in all_taxonomies:
        for skill in skill_set:
            norm_skill = normalize_skill(skill)
            # Use word boundary or exact match
            escaped = re.escape(skill)
            pattern = rf'(?<![a-zA-Z0-9]){escaped}(?![a-zA-Z0-9])'
            if re.search(pattern, text_lower):
                found_set.add(norm_skill.title() if len(norm_skill) > 3 else norm_skill.upper())

    tech_list = sorted(list(found_technical))
    soft_list = sorted(list(found_soft))
    tools_list = sorted(list(found_tools))
    all_skills = sorted(list(found_technical | found_soft | found_tools))

    return {
        "technical": tech_list,
        "soft": soft_list,
        "tools": tools_list,
        "all": all_skills,
    }
