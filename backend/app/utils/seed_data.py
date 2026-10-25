from sqlalchemy.orm import Session
from app.models.user import User
from app.models.job import Job
from app.utils.security import get_password_hash

DEMO_USERS = [
    {
        "email": "demo@example.com",
        "password": "Demo@123",
        "full_name": "Alex Johnson",
        "role": "user",
        "phone": "+1 (555) 234-5678",
        "location": "San Francisco, CA",
        "linkedin": "https://linkedin.com/in/alex-johnson-dev",
        "github": "https://github.com/alexjohnson",
        "portfolio": "https://alexjohnson.dev",
        "target_role": "Full Stack Developer",
    },
    {
        "email": "admin@example.com",
        "password": "Admin@123",
        "full_name": "Admin Supervisor",
        "role": "admin",
        "phone": "+1 (555) 987-6543",
        "location": "New York, NY",
        "linkedin": "https://linkedin.com/in/careerai-admin",
        "github": "https://github.com/careerai-admin",
        "portfolio": "https://careerai.platform",
        "target_role": "System Administrator",
    },
]

SEED_JOBS = [
    {
        "title": "Senior Machine Learning Engineer",
        "company": "NeuralScale AI",
        "location": "San Francisco, CA",
        "description": "We are seeking a Senior ML Engineer to architect and scale real-time recommendation and predictive inference pipelines. You will collaborate with data scientists to fine-tune transformer models, optimize feature stores, and deploy low-latency endpoints using FastAPI and PyTorch on AWS Kubernetes clusters.",
        "required_skills": ["python", "machine learning", "pytorch", "deep learning", "docker", "kubernetes", "aws", "sql"],
        "experience_required": 4,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Hybrid"
    },
    {
        "title": "Full Stack Software Engineer",
        "company": "Veloce Cloud",
        "location": "Austin, TX",
        "description": "Join our fast-growing SaaS platform building responsive web interfaces and resilient distributed microservices. You will develop modern React frontend components with Tailwind CSS and build scalable asynchronous backend services using FastAPI/Python and PostgreSQL.",
        "required_skills": ["python", "react", "typescript", "fastapi", "postgresql", "docker", "git", "rest api"],
        "experience_required": 3,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Remote"
    },
    {
        "title": "Frontend React Developer",
        "company": "PixelCraft Studio",
        "location": "New York, NY",
        "description": "Craft intuitive, lightning-fast UI experiences for enterprise analytics dashboards. Ideal candidates possess deep experience in React, TypeScript, state management, modern CSS frameworks (Tailwind/Sass), and data visualization libraries like Recharts.",
        "required_skills": ["react", "typescript", "javascript", "html5", "css3", "tailwind css", "git", "figma"],
        "experience_required": 2,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Remote"
    },
    {
        "title": "Backend Python Engineer",
        "company": "DataStream Solutions",
        "location": "Seattle, WA",
        "description": "Responsible for designing highly performant RESTful APIs, asynchronous message queues, and caching architectures. You will write clean Python code using FastAPI and SQLAlchemy, manage relational schemas in PostgreSQL, and integrate Redis cache layers.",
        "required_skills": ["python", "fastapi", "django", "postgresql", "redis", "docker", "ci/cd", "rest api"],
        "experience_required": 3,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Hybrid"
    },
    {
        "title": "Data Scientist - Generative AI",
        "company": "Cognitive Insights",
        "location": "Boston, MA",
        "description": "Lead the research and deployment of LLM-based intelligent automation agents. Work on prompt engineering, LangChain workflows, retrieval-augmented generation (RAG), vector embeddings, and statistical model evaluation.",
        "required_skills": ["python", "machine learning", "nlp", "llm", "generative ai", "langchain", "scikit-learn", "pandas"],
        "experience_required": 3,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Remote"
    },
    {
        "title": "DevOps & Cloud Engineer",
        "company": "Apex Infrastructure",
        "location": "Denver, CO",
        "description": "Own infrastructure-as-code and automated CI/CD release cycles across multi-cloud environments. We rely on Terraform, Kubernetes, Docker, Helm, and GitHub Actions to maintain 99.99% uptime for financial client workloads.",
        "required_skills": ["docker", "kubernetes", "aws", "terraform", "ci/cd", "linux", "jenkins", "bash"],
        "experience_required": 4,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Remote"
    },
    {
        "title": "Data Analyst",
        "company": "FinMetrix Global",
        "location": "Chicago, IL",
        "description": "Transform transactional and customer analytics data into actionable strategic insights. Create dynamic dashboards using Power BI and Tableau, execute complex SQL aggregations, and perform statistical modeling with Python and Pandas.",
        "required_skills": ["sql", "python", "pandas", "tableau", "power bi", "excel", "data analytics", "communication"],
        "experience_required": 2,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Hybrid"
    },
    {
        "title": "Cybersecurity Analyst",
        "company": "Sentinel Defense Corp",
        "location": "Washington, DC",
        "description": "Perform threat hunting, vulnerability scanning, security log analysis, and incident response. Must have solid knowledge of OWASP Top 10, penetration testing, network protocols, and enterprise SIEM tools.",
        "required_skills": ["cybersecurity", "penetration testing", "network security", "linux", "owasp", "python", "problem solving"],
        "experience_required": 3,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "On-site"
    },
    {
        "title": "Mobile App Developer (Android)",
        "company": "AppNova Labs",
        "location": "San Jose, CA",
        "description": "Design and engineer responsive mobile applications on Android using Kotlin and Jetpack Compose. You will optimize memory consumption, implement clean MVVM patterns, and integrate RESTful backend microservices.",
        "required_skills": ["kotlin", "java", "android", "mobile app development", "git", "rest api"],
        "experience_required": 2,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Remote"
    },
    {
        "title": "Senior Java Developer",
        "company": "OmniPay Systems",
        "location": "Charlotte, NC",
        "description": "Build mission-critical payment processing engines using Java 21, Spring Boot, and Kafka. Maintain high throughput, event-driven pipelines, secure transaction ledgers, and automated unit tests.",
        "required_skills": ["java", "spring boot", "microservices", "kafka", "postgresql", "docker", "git"],
        "experience_required": 5,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Hybrid"
    },
    {
        "title": "Junior Software Engineer",
        "company": "Horizon Tech Launch",
        "location": "Atlanta, GA",
        "description": "Great opportunity for early-career developers eager to grow their skills in modern software engineering. You will collaborate on web features, write unit tests, and resolve bugs across Python and JavaScript repositories.",
        "required_skills": ["python", "javascript", "sql", "git", "html5", "css3", "problem solving", "teamwork"],
        "experience_required": 1,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Hybrid"
    },
    {
        "title": "AI Research Specialist",
        "company": "Frontier Cognitive Labs",
        "location": "Palo Alto, CA",
        "description": "Research novel multi-modal architectures, transformer attention mechanisms, and model quantization techniques. Publish findings and implement scalable proof-of-concept prototypes in PyTorch and HuggingFace.",
        "required_skills": ["python", "pytorch", "deep learning", "nlp", "computer vision", "transformers", "scikit-learn"],
        "experience_required": 4,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Hybrid"
    },
    {
        "title": "Cloud Solutions Architect",
        "company": "Stratosphere Systems",
        "location": "Dallas, TX",
        "description": "Partner with enterprise clients to plan cloud migration, fault-tolerant architectures, and serverless backends on AWS and GCP. Requires strong communication and deep infrastructure automation expertise.",
        "required_skills": ["aws", "gcp", "docker", "kubernetes", "terraform", "ci/cd", "microservices", "leadership"],
        "experience_required": 6,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Remote"
    },
    {
        "title": "Natural Language Processing (NLP) Engineer",
        "company": "LinguaAI Technologies",
        "location": "Seattle, WA",
        "description": "Develop information extraction, semantic parsing, and intent classification pipelines for automated document intelligence and conversational systems.",
        "required_skills": ["python", "nlp", "scikit-learn", "tensorflow", "bert", "pandas", "git", "rest api"],
        "experience_required": 3,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Remote"
    },
    {
        "title": "Full Stack Web Developer (Node & React)",
        "company": "Beacon Interactive",
        "location": "Salt Lake City, UT",
        "description": "Build high-conversion customer portals and dynamic SPAs using TypeScript, Next.js, Node.js, Express, and MongoDB. Fast-paced collaborative team following Agile methodologies.",
        "required_skills": ["javascript", "typescript", "react", "next.js", "nodejs", "express", "mongodb", "git"],
        "experience_required": 2,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Remote"
    },
    {
        "title": "Computer Vision Engineer",
        "company": "Visionary Robotics",
        "location": "Pittsburgh, PA",
        "description": "Develop visual object detection, segmentation, and tracking algorithms for autonomous inspection drones using OpenCV, PyTorch, and CUDA acceleration.",
        "required_skills": ["python", "c++", "computer vision", "opencv", "pytorch", "deep learning", "linux"],
        "experience_required": 3,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "On-site"
    },
    {
        "title": "Data Platform Engineer",
        "company": "SnowPeak Analytics",
        "location": "Minneapolis, MN",
        "description": "Build robust ETL pipelines feeding Snowflake and BigQuery data lakes. Manage scheduled workflow orchestrations with Airflow and optimize large-scale SQL transformations.",
        "required_skills": ["python", "sql", "snowflake", "bigquery", "etl", "docker", "git", "data analytics"],
        "experience_required": 3,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Hybrid"
    },
    {
        "title": "Site Reliability Engineer (SRE)",
        "company": "CloudGuard Global",
        "location": "Portland, OR",
        "description": "Champion observability, automated alerting, and disaster recovery. Configure Prometheus, Grafana, and Kubernetes autoscaling to sustain heavy global web traffic.",
        "required_skills": ["linux", "kubernetes", "docker", "python", "bash", "aws", "ci/cd", "problem solving"],
        "experience_required": 4,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Remote"
    },
    {
        "title": "UI/UX Designer & Frontend Engineer",
        "company": "CreativePulse Media",
        "location": "Los Angeles, CA",
        "description": "Translate user research and high-fidelity Figma mockups into accessible, pixel-perfect React and Tailwind CSS components.",
        "required_skills": ["react", "javascript", "html5", "css3", "tailwind css", "figma", "creativity"],
        "experience_required": 2,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Hybrid"
    },
    {
        "title": "Database Administrator (PostgreSQL)",
        "company": "FinCore Tech",
        "location": "New York, NY",
        "description": "Manage mission-critical PostgreSQL enterprise clusters. Responsible for replication, high availability, backup integrity, query tuning, and index optimization.",
        "required_skills": ["postgresql", "sql", "linux", "bash", "python", "docker", "aws"],
        "experience_required": 5,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Hybrid"
    },
    {
        "title": "Python Developer - Automation & APIs",
        "company": "ProcessFlow Automation",
        "location": "Phoenix, AZ",
        "description": "Develop automation scripts and API integrations connecting third-party enterprise services with internal databases using Python, FastAPI, and Celery.",
        "required_skills": ["python", "fastapi", "rest api", "sql", "git", "docker", "postman"],
        "experience_required": 2,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Remote"
    },
    {
        "title": "iOS Application Engineer",
        "company": "SwiftMotion Apps",
        "location": "San Francisco, CA",
        "description": "Build intuitive native iOS applications in Swift and SwiftUI. Focus on smooth animations, offline persistence, and seamless backend API synchronization.",
        "required_skills": ["swift", "ios", "mobile app development", "git", "rest api", "figma"],
        "experience_required": 3,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Hybrid"
    },
    {
        "title": "Lead Software Architect",
        "company": "Vanguard Enterprise",
        "location": "Philadelphia, PA",
        "description": "Provide architectural leadership across multi-tier software projects. Guide microservice design, event streaming architectures, security best practices, and engineering standards.",
        "required_skills": ["python", "java", "microservices", "kubernetes", "aws", "leadership", "docker", "ci/cd"],
        "experience_required": 8,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Remote"
    },
    {
        "title": "QA Automation Engineer",
        "company": "QualiTech Global",
        "location": "Raleigh, NC",
        "description": "Build scalable automated end-to-end testing frameworks for web applications and REST APIs using Python, Selenium, Postman, and CI/CD pipelines.",
        "required_skills": ["python", "selenium", "postman", "git", "ci/cd", "sql", "jira"],
        "experience_required": 2,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Remote"
    },
    {
        "title": "Machine Learning Operations (MLOps) Engineer",
        "company": "ModelPipe Systems",
        "location": "San Diego, CA",
        "description": "Bridge the gap between data science experimentation and production deployments. Build CI/CD pipelines for ML models, drift detection, feature store monitoring, and containerized serving.",
        "required_skills": ["python", "machine learning", "docker", "kubernetes", "ci/cd", "aws", "git", "scikit-learn"],
        "experience_required": 3,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Remote"
    },
    {
        "title": "Blockchain & Smart Contract Developer",
        "company": "ChainSphere Labs",
        "location": "Miami, FL",
        "description": "Write and audit gas-optimized Ethereum smart contracts, decentralized applications (dApps), and web3 backend integrations using TypeScript and Python.",
        "required_skills": ["typescript", "python", "git", "rest api", "docker", "cryptography"],
        "experience_required": 3,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Remote"
    },
    {
        "title": "Business Intelligence (BI) Developer",
        "company": "MetricInsight Corp",
        "location": "Columbus, OH",
        "description": "Design data models and executive dashboards that drive key corporate KPIs. Collaborate with business leaders to understand reporting requirements and build Tableau reports.",
        "required_skills": ["sql", "tableau", "power bi", "excel", "data analytics", "communication"],
        "experience_required": 2,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Hybrid"
    },
    {
        "title": "Golang Backend Services Engineer",
        "company": "FastStream Networks",
        "location": "Austin, TX",
        "description": "Build ultra-low latency, concurrent distributed network gateways using Go (Golang), gRPC, and Redis. Handle millions of simultaneous socket connections.",
        "required_skills": ["go", "docker", "kubernetes", "redis", "linux", "git", "microservices"],
        "experience_required": 3,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Remote"
    },
    {
        "title": "Applied AI Engineer - Computer Vision & Edge",
        "company": "EdgeVision Automation",
        "location": "Detroit, MI",
        "description": "Deploy lightweight deep learning neural networks on embedded edge hardware for industrial anomaly detection and safety compliance.",
        "required_skills": ["python", "c++", "deep learning", "opencv", "pytorch", "linux", "docker"],
        "experience_required": 3,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Hybrid"
    },
    {
        "title": "Technical Product Manager - AI Products",
        "company": "NexusAI Solutions",
        "location": "San Francisco, CA",
        "description": "Lead the product vision and release roadmap for intelligent automated document intelligence products. Work closely with AI researchers, full-stack engineers, and customer stakeholders.",
        "required_skills": ["machine learning", "data analytics", "jira", "leadership", "communication", "agile", "strategic thinking"],
        "experience_required": 4,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Hybrid"
    },
    {
        "title": "Full Stack Engineer (Django & Vue)",
        "company": "Silverline Digital",
        "location": "Tampa, FL",
        "description": "Develop full-stack web applications using Django, Vue.js, and PostgreSQL. Implement secure authentication, payment gateway hooks, and clean REST endpoints.",
        "required_skills": ["python", "django", "vue", "javascript", "postgresql", "git", "html5", "css3"],
        "experience_required": 2,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Remote"
    },
    {
        "title": "Cloud Security Engineer",
        "company": "ShieldCloud Infosec",
        "location": "Reston, VA",
        "description": "Enforce principle of least privilege and zero-trust cloud network topologies on AWS. Automate compliance audits, guardrails, and vulnerability triage.",
        "required_skills": ["aws", "cybersecurity", "terraform", "python", "linux", "network security"],
        "experience_required": 4,
        "salary_range": ",000 - ,000",
        "job_type": "Full-time",
        "remote_status": "Hybrid"
    }
]

def seed_database(db: Session):
    # 1. Seed Demo Users if they don't exist
    for user_info in DEMO_USERS:
        existing_user = db.query(User).filter(User.email == user_info["email"]).first()
        if not existing_user:
            user = User(
                email=user_info["email"],
                hashed_password=get_password_hash(user_info["password"]),
                full_name=user_info["full_name"],
                role=user_info["role"],
                phone=user_info["phone"],
                location=user_info["location"],
                linkedin=user_info["linkedin"],
                github=user_info["github"],
                portfolio=user_info["portfolio"],
                target_role=user_info["target_role"],
            )
            db.add(user)
            db.commit()

    # 2. Seed Jobs if table is empty
    job_count = db.query(Job).count()
    if job_count < len(SEED_JOBS):
        for job_data in SEED_JOBS:
            existing = db.query(Job).filter(Job.title == job_data["title"], Job.company == job_data["company"]).first()
            if not existing:
                job = Job(**job_data)
                db.add(job)
        db.commit()
