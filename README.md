# CareerAI — AI Resume Screening & Job Recommendation System

> **"Your Resume. Your Skills. Your Next Opportunity."**
> An Enterprise-grade, Full-Stack AI/ML SaaS Web Application for Resume Parsing, ATS Compliance Auditing, Skill-Gap Analysis, and Intelligent Job Matching.

---

## 🌟 Executive Summary

**CareerAI** is a complete, production-style web application designed to bridge the gap between job seekers and hiring algorithms. While developed as a capstone AI/ML engineering project, CareerAI is architected with the polish, security, scalability, and UI/UX rigor of modern commercial SaaS platforms like Resumake, Jobscan, and Eightfold AI.

### Key Capabilities:
- 📄 **Multi-Format & Image Resume Ingestion:** Supports `.pdf`, `.docx`, `.txt`, and **Scanned Images (`.png`, `.jpg`, `.jpeg`, `.webp`, `.bmp`, `.tiff`)** powered by an embedded deep-learning **AI OCR Engine** (`RapidOCR` + `pypdfium2`).
- 🧠 **NLP & Information Extraction:** Accurately extracts candidate identity, contact details, work history, education, certifications, and projects using specialized regex heuristics and NLP boundary detection.
- 🎯 **600+ Skill Taxonomy & Synonym Mapper:** Mines technical frameworks, cloud platforms, programming languages, databases, developer tools, and soft skills with automatic alias normalization (e.g., `k8s` → `Kubernetes`, `react.js` → `React`).
- 📊 **Multi-Factor ATS Compliance Scorer:** 0–100 rubric auditing formatting pitfalls, quantifiable impact metrics, contact completeness, and keyword density.
- ⚡ **Hybrid Job Recommendation Engine:** Dual-layer matching combining **TF-IDF + Cosine Vector Similarity** with **Weighted Skill Overlap Matrices**.
- 🗺️ **Skill-Gap Analyzer & Learning Roadmaps:** Evaluates target job descriptions to identify missing qualifications and generates a prioritized learning curriculum.
- 🔍 **Interactive Job Description (JD) Analyzer:** Paste any external job description to obtain instant match analytics and custom tailored resume improvement advice.
- ⚖️ **A/B Resume Version Comparison:** Compare two resumes side-by-side with visual diffs and score divergence analysis.
- 🎨 **Modern SaaS Design:** 16 responsive pages built with Tailwind CSS, Lucide icons, interactive Recharts, dark/light theme switching, and smooth transitions.

---


---


## 🔍 Deep Learning AI OCR Engine (Scanned & Image Resumes)

CareerAI includes an embedded, high-precision Optical Character Recognition (OCR) pipeline that solves the classic ATS issue with scanned resumes and image files:

- **100% Self-Contained ONNX Runtime:** Uses `rapidocr-onnxruntime` (PP-OCRv4) with neural network text detection and recognition. Requires **zero external system binaries** (no Tesseract installation required).
- **Direct Image Support:** Drag and drop or browse direct image resumes (`.png`, `.jpg`, `.jpeg`, `.webp`, `.bmp`, `.tiff`).
- **Scanned PDF Auto-Fallback:** When a PDF has fewer than 50 characters of digital text, `pypdfium2` automatically renders each page at 144 DPI (2.0x scale) into memory and runs neural OCR page-by-page.
- **Spatial Reconstruction:** Bounding boxes are sorted top-to-bottom and left-to-right to preserve document layout, enabling accurate entity extraction and 600+ skills tagging.

---

## 🌐 Real-Time Job API Architecture

CareerAI integrates live external web APIs to ingest and match real-time job openings alongside internal postings:

1. **Remotive API (`https://remotive.com/api/remote-jobs`)**:
   - Zero-key, public REST API providing live remote software, AI/ML, DevOps, and cloud engineering jobs.
   - Includes real employer application URLs, salary brackets, and structured tag metadata.

2. **Arbeitnow API (`https://www.arbeitnow.com/api/job-board-api`)**:
   - Real-time global and European tech positions.
   - Automatically sanitized from raw HTML into clean text.

3. **Optional JSearch Gateway (RapidAPI)**:
   - Aggregates live jobs directly from LinkedIn, Indeed, and Glassdoor when `RAPIDAPI_KEY` is present.

### Automatic AI Skill Tagging for Live Jobs
Whenever real-time jobs are synced from external web APIs, the description text passes through CareerAI's **600+ skills taxonomy engine**. It automatically extracts, deduplicates, and canonicalizes technical competencies (e.g., Python, React, Docker, AWS) so candidate resumes can immediately calculate match percentages and skill gaps.

## 🏛️ System Architecture

```
                                  USER BROWSER
             ┌─────────────────────────────────────────────────────┐
             │         React 18 + TypeScript + Vite SPA             │
             │   Tailwind CSS  •  Lucide Icons  •  Recharts Charts  │
             └──────────────────────────┬──────────────────────────┘
                                        │ HTTP / JSON / Multipart
                                        ▼
                               FASTAPI GATEWAY (Port 8000)
             ┌─────────────────────────────────────────────────────┐
             │  CORS Middleware  •  JWT Bearer Auth  •  Pydantic v2 │
             │  Routes: /auth, /resumes, /jobs, /skills, /admin    │
             └──────────────────────────┬──────────────────────────┘
                                        │
                 ┌──────────────────────┼──────────────────────┐
                 ▼                      ▼                      ▼
         PARSING ENGINE           ML MATCHING CORE       PERSISTENCE LAYER
     ┌──────────────────────┐ ┌──────────────────────┐ ┌─────────────────────┐
     │ • PyPDF2 / pdfminer  │ │ • 600+ Skill Taxonomy│ │ • SQLAlchemy 2.0    │
     │ • python-docx        │ │ • TF-IDF Vectorizer  │ │ • SQLite (zero-cfg) │
     │ • Text Normalization │ │ • Cosine Similarity  │ │ • PostgreSQL ready  │
     │ • Regex Extractors   │ │ • ATS Rubric (0-100) │ │ • Seeded Data (32)  │
     └──────────────────────┘ └──────────────────────┘ └─────────────────────┘
```

---

## 📐 Mathematical Formulations & ML Core

### 1. Overall Resume Quality Score ($S_{\text{overall}}$)
The overall resume evaluation score is calculated using a multi-criteria weighted rubric ($0 \le S \le 100$):

$$S_{\text{overall}} = 0.35 \cdot S_{\text{skills}} + 0.25 \cdot S_{\text{experience}} + 0.15 \cdot S_{\text{education}} + 0.15 \cdot S_{\text{ats}} + 0.10 \cdot S_{\text{keywords}}$$

Where:
- $S_{\text{skills}}$: Depth, diversity, and balance across technical, tools, and soft skill categories.
- $S_{\text{experience}}$: Career duration, progression, action verb presence, and quantifiable achievements ($X\%$, $\$Y$).
- $S_{\text{education}}$: Degree level, institution detection, GPA mentions, and field relevance.
- $S_{\text{ats}}$: Section structure, parseability, standard headers, and contact information completeness.
- $S_{\text{keywords}}$: Industry vocabulary density, clarity, and readability.

---

### 2. Hybrid Job Match Score ($S_{\text{match}}$)
When matching a candidate against a job opening, CareerAI deploys a 5-pillar weighted hybrid recommender:

$$S_{\text{match}} = 0.40 \cdot S_{\text{skill\_overlap}} + 0.25 \cdot S_{\text{tfidf}} + 0.15 \cdot S_{\text{exp\_fit}} + 0.10 \cdot S_{\text{edu\_fit}} + 0.10 \cdot S_{\text{keyword\_overlap}}$$

#### A. Skill Overlap ($S_{\text{skill\_overlap}}$)
Calculated via normalized set intersection against job requirements:

$$S_{\text{skill\_overlap}} = \frac{|S_{\text{resume}} \cap S_{\text{job}}|}{|S_{\text{job}}|} \times 100$$

#### B. TF-IDF & Cosine Similarity ($S_{\text{tfidf}}$)
The resume text $\vec{u}$ and job description $\vec{v}$ are vectorized in a shared $N$-gram term space using Term Frequency-Inverse Document Frequency (TF-IDF):

$$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \ln\left(\frac{1 + |D|}{1 + |\{d \in D : t \in d\}|}\right) + 1$$

The vector similarity is then computed using the cosine angle between normalized vectors:

$$\cos(\theta) = \frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\|_2 \|\vec{v}\|_2} = \frac{\sum_{i=1}^{n} u_i v_i}{\sqrt{\sum_{i=1}^{n} u_i^2} \sqrt{\sum_{i=1}^{n} v_i^2}}$$

$$S_{\text{tfidf}} = \min\left(100, \cos(\theta) \times 100 \times 1.3\right)$$

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+** (Tested on Python 3.10, 3.11, 3.12, 3.14)
- **Node.js 18+** and **npm**

---

### 1. Clone & Setup Backend

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start backend server (auto-creates database and seeds 32 jobs)
python run.py
```
> The backend server will start at `http://localhost:8000`.  
> Interactive OpenAPI documentation is accessible at `http://localhost:8000/docs`.

---

### 2. Setup Frontend

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install Node packages
npm install

# Start Vite development server
npm run dev
```
> The frontend will launch at `http://localhost:5173`.

---

### 3. Single-Command Launch (Root Helper)

You can also run both servers concurrently using the provided launcher:

```bash
python run_project.py
```

---

## 🔑 Pre-Configured Demo Accounts

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Demo Candidate** | `demo@example.com` | `Demo@123` | Upload resumes, analyze ATS scores, match jobs, skill gaps |
| **Administrator** | `admin@example.com` | `Admin@123` | Access Admin Console, manage platform jobs, view user metrics |

*(You can also use the one-click "Fill Demo Candidate" or "Fill Demo Admin" buttons on the `/login` page).*

---

## 📂 Pre-Loaded Sample Resumes

Pre-constructed resumes are included in `backend/sample_resumes/` for immediate testing:
- `Software_Engineer_Resume.txt` / `.docx`: Senior Full-Stack Engineer (Python, React, AWS, Docker).
- `Data_Scientist_Resume.txt` / `.docx`: ML & Data Scientist (PyTorch, scikit-learn, SQL, NLP).

---

## 🧪 Running Automated Tests

Run backend unit and integration tests using `pytest`:

```bash
cd backend
pytest tests/ -v
```

All 12 unit tests validate:
1. `test_skills_taxonomy`: Taxonomy retrieval, synonym normalization, categorization.
2. `test_nlp_parser_and_extractor`: Text extraction, email/phone parsing, section splitting.
3. `test_ats_scorer`: Score consistency, warning generation, rubric bounds.
4. `test_job_matcher_tfidf`: TF-IDF cosine matrix, match ranking, breakdown sanity.
5. `test_gap_analyzer`: Missing skill detection, learning path prioritization.
6. `test_auth_endpoints`: Registration, JWT issuance, password verification.
7. `test_jobs_endpoints`: Search filters, recommendation retrieval, saving jobs.
8. `test_resume_upload_and_analysis`: End-to-end multipart resume upload and analysis.

---

## 📡 API Endpoint Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new candidate or recruiter | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT bearer token | No |
| `GET` | `/api/users/me` | Fetch authenticated user profile | Yes |
| `POST` | `/api/resumes/upload` | Upload & parse PDF/DOCX/TXT resume | Yes |
| `GET` | `/api/resumes` | List user's uploaded resumes | Yes |
| `GET` | `/api/resumes/{id}` | Get detailed ATS report & extracted entities | Yes |
| `POST` | `/api/resumes/{id}/analyze` | Trigger re-analysis of resume | Yes |
| `POST` | `/api/resumes/compare` | Compare Resume A vs Resume B | Yes |
| `GET` | `/api/jobs` | Search & filter jobs (title, location, type) | No |
| `GET` | `/api/jobs/recommendations/{resume_id}` | Get ranked AI job recommendations | Yes |
| `POST` | `/api/jobs/{id}/save` | Save job to favorites | Yes |
| `POST` | `/api/jobs/{id}/apply` | Quick-apply to job | Yes |
| `POST` | `/api/jobs/analyze-jd` | Custom job description analyzer | Yes |
| `POST` | `/api/skills/gap-analysis` | Skill-gap analysis & learning roadmap | Yes |
| `GET` | `/api/dashboard/stats` | Dashboard telemetry & score history | Yes |
| `GET` | `/api/admin/stats` | System-wide administrator metrics | Admin |
| `POST` | `/api/admin/jobs` | Post new job opening | Admin |

---

## 🎨 UI Pages & User Flow

1. **Landing Page (`/`)**: Hero section, live stats, feature showcase, interactive ATS formula explainer, and testimonial highlights.
2. **Authentication (`/login`, `/register`, `/forgot-password`)**: Quick login with pre-loaded demo buttons.
3. **Candidate Dashboard (`/dashboard`)**: Score summary, score history charts, skill category distribution, quick actions, and recent matches.
4. **Resume Upload (`/upload`)**: Drag-and-drop dropzone, sample resume loader, and animated 6-step AI processing checklist.
5. **Resume Analysis (`/resume-analysis`)**: Interactive score gauge, extracted entity verification, skill badges, ATS warnings, and bullet improvements.
6. **My Resumes (`/my-resumes`)**: Version management, date tracking, re-analysis, and quick deletion.
7. **Resume Compare (`/compare`)**: Side-by-side differential analysis of two resumes.
8. **Job Recommendations (`/recommendations`)**: AI-sorted match cards with percentage score, matching vs missing skills, and "Why Recommended" insights.
9. **Job Search & Filter (`/jobs`)**: Keyword search, remote status, location, and minimum experience filters.
10. **Skill-Gap Analyzer (`/skill-gap`)**: Missing skill diagnostics with structured learning milestones.
11. **Job Description Analyzer (`/jd-analyzer`)**: Freeform job description tester.
12. **Actionable Suggestions (`/suggestions`)**: Interactive checklist to enhance resume quality.
13. **Profile Settings (`/profile`)**: Manage target roles and account details.
14. **Admin Console (`/admin`)**: User directory, platform metrics, and job posting management.

---

## 📄 License & Academic Attribution
Developed for college academic evaluation and viva voce demonstration. Built with standard open-source technologies (FastAPI, React, Scikit-learn, Tailwind CSS).
