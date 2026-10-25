# CareerAI — Comprehensive College Viva & Technical Defense Guide

> **Project Title:** CareerAI — AI Resume Screening & Job Recommendation System  
> **Domain:** Artificial Intelligence, Natural Language Processing (NLP), Information Retrieval, Full-Stack Web Engineering  
> **Target Audience:** College Viva Examiners, Technical Evaluators, Project Defense Committees  

---

## 📑 Table of Contents
1. [Core Project Overview & Objectives](#1-core-project-overview--objectives)
2. [Natural Language Processing (NLP) & Parsing Architecture](#2-natural-language-processing-nlp--parsing-architecture)
3. [Machine Learning Algorithms & Mathematical Foundations](#3-machine-learning-algorithms--mathematical-foundations)
4. [ATS Scoring System & Heuristics Rubric](#4-ats-scoring-system--heuristics-rubric)
5. [Backend Architecture, Database & Security](#5-backend-architecture-database--security)
6. [Frontend Architecture & User Experience](#6-frontend-architecture--user-experience)
7. [35+ Comprehensive Viva Voce Questions & Answers](#7-35-comprehensive-viva-voce-questions--answers)
8. [Future Enhancements & Scalability Roadmap](#8-future-enhancements--scalability-roadmap)

---

## 1. Core Project Overview & Objectives

### What problem does CareerAI solve?
Traditional recruitment workflows face two symmetrical problems:
1. **Recruiters** receive hundreds of resumes per job opening and rely on opaque, rigid Applicant Tracking Systems (ATS) that reject qualified candidates due to minor keyword mismatches or formatting issues.
2. **Candidates** submit resumes blindly into "black holes" without knowing how well their skills match job requirements, what critical skills they are missing, or why their resumes fail automated screenings.

**CareerAI** solves this by providing:
- Transparent, multi-factor ATS compliance evaluation.
- Accurate information extraction across heterogeneous resume formats (PDF, DOCX, TXT).
- 600+ skills taxonomy extraction with synonym normalization.
- Intelligent, content-based job recommendation using TF-IDF vectorization and cosine similarity.
- Gap analysis providing actionable, prioritized learning roadmaps.

---

## 2. Natural Language Processing (NLP) & Parsing Architecture

### Text Extraction Pipeline
```
[User Document: .pdf / .docx / .txt]
                │
                ▼
      [Document Normalizer]
      • pypdf / pdfminer for PDF streams
      • python-docx for OOXML documents
      • UTF-8 text sanitization & whitespace cleaning
                │
                ▼
      [Section Segmentation Engine]
      • Regex pattern boundary detection:
        - Work Experience, Employment History, Career
        - Education, Academic Background
        - Skills, Technical Competencies
        - Projects, Open Source Work
        - Certifications, Accreditations
                │
                ▼
      [Entity & Contact Extractor]
      • Email: RFC 5322 compliant regex
      • Phone: E.164 & international standard format regex
      • Links: LinkedIn, GitHub, Portfolio URL detection
      • Name: Header heuristic + capitalization & positional parsing
```

### Skills Taxonomy Extraction (600+ Entities)
Traditional keyword search fails when a candidate writes `k8s` and the job description specifies `Kubernetes`, or `Postgres` vs `PostgreSQL`.  
CareerAI maintains a comprehensive, domain-segmented dictionary across:
- **Technical Skills:** Python, Java, TypeScript, Go, C++, Rust, React, FastAPI, Django, GraphQL, Docker, Kubernetes, etc.
- **Tools & Platforms:** Git, GitHub Actions, AWS, Azure, GCP, Jenkins, Terraform, Jira, Datadog.
- **Soft Skills:** Leadership, Agile/Scrum, Communication, Problem Solving, Team Collaboration.

**Synonym Aliasing Engine:**
Each canonical skill entry contains an array of aliases. Input text is tokenized into unigrams, bigrams, and trigrams. Matching terms are normalized to their canonical form.

---

## 3. Machine Learning Algorithms & Mathematical Foundations

### Why TF-IDF with Cosine Similarity?
CareerAI utilizes **Content-Based Filtering** with **TF-IDF (Term Frequency-Inverse Document Frequency)** and **Cosine Similarity**:
1. **Interpretability:** Explainable matching scores that can be audited by candidates and recruiters.
2. **Zero Cold Start for Jobs:** Does not require historical user click or application data (unlike collaborative filtering).
3. **Low Latency:** High-speed vector projection without GPU dependencies.

### Mathematical Formulas

#### 1. Term Frequency ($TF$):
Measures the frequency of term $t$ within document $d$:

$$TF(t, d) = \frac{f_{t, d}}{\sum_{t' \in d} f_{t', d}}$$

#### 2. Inverse Document Frequency ($IDF$):
Penalizes common words appearing across all documents:

$$IDF(t, D) = \ln\left(\frac{1 + |D|}{1 + |\{d \in D : t \in d\}|}\right) + 1$$

#### 3. TF-IDF Score:
$$TF\text{-}IDF(t, d, D) = TF(t, d) \times IDF(t, D)$$

#### 4. Cosine Similarity:
Evaluates the geometric angle between the resume vector $\vec{u}$ and the job vector $\vec{v}$, independent of document length:

$$\cos(\theta) = \frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\|_2 \|\vec{v}\|_2} = \frac{\sum_{i=1}^n u_i v_i}{\sqrt{\sum_{i=1}^n u_i^2} \cdot \sqrt{\sum_{i=1}^n v_i^2}}$$

#### 5. Hybrid Composite Matching Function:
CareerAI balances pure vector semantic overlap with explicit qualification requirements:

$$Score_{\text{match}} = 0.40 \cdot S_{\text{skills}} + 0.25 \cdot S_{\text{tfidf}} + 0.15 \cdot S_{\text{exp}} + 0.10 \cdot S_{\text{edu}} + 0.10 \cdot S_{\text{keywords}}$$

Where $S_{\text{skills}}$ is the normalized Jaccard-like intersection:

$$S_{\text{skills}} = \frac{|Skills_{\text{resume}} \cap Skills_{\text{job}}|}{|Skills_{\text{job}}|} \times 100$$

---

## 4. ATS Scoring System & Heuristics Rubric

The overall resume score ($0–100$) audits candidates across 5 industry-standard criteria:

| Dimension | Weight | Evaluation Criteria |
| :--- | :---: | :--- |
| **Skills & Competencies** | **35%** | Total skill count ($10+$ skills), balance across technical, tools, and soft categories. |
| **Work Experience** | **25%** | Chronological duration, action verbs (Architected, Built, Optimized), quantified results ($X\%$, $\$Y$). |
| **Education & Credentials** | **15%** | Recognized degree level (B.S., M.S., Ph.D.), university detection, GPA presence. |
| **ATS Compliance & Format** | **15%** | Standard section headers, contact info completeness (email, phone, LinkedIn/GitHub), proper length. |
| **Keyword Relevance** | **10%** | Industry vocabulary density, absence of filler/buzzwords, clear formatting. |

---

## 5. Backend Architecture, Database & Security

### Tech Stack
- **Framework:** FastAPI (Python 3.10+) with asynchronous ASGI request handling.
- **ORM:** SQLAlchemy 2.0 with type annotations and relationship cascades.
- **Database:** SQLite (default zero-configuration file DB) / PostgreSQL (production connection string switchable via `.env`).
- **Validation:** Pydantic v2 schemas with `ConfigDict(from_attributes=True)`.
- **Security:**
  - Password hashing using `bcrypt` (12 salt rounds).
  - Stateless authentication via JSON Web Tokens (JWT) using `HS256` signature algorithm.
  - Role-Based Access Control (RBAC): `user` vs `admin`.

### Database Schema Relational Graph
- `users`: `id`, `email`, `hashed_password`, `full_name`, `role`, `target_role`, `created_at`
- `resumes`: `id`, `user_id`, `filename`, `file_type`, `file_size`, `raw_text`, `created_at`
- `resume_analyses`: `id`, `resume_id`, `overall_score`, `ats_score`, `score_breakdown`, `extracted_info`, `skills_detected`, `ats_warnings`, `suggestions`
- `jobs`: `id`, `title`, `company`, `location`, `description`, `required_skills`, `experience_required`, `salary_range`, `job_type`, `remote_status`
- `saved_jobs`: `id`, `user_id`, `job_id`, `created_at`
- `job_applications`: `id`, `user_id`, `job_id`, `resume_id`, `status`, `applied_at`

---

## 6. Frontend Architecture & User Experience

### Tech Stack
- **Library:** React 18 with TypeScript.
- **Build Tool:** Vite 5 for fast Hot Module Replacement (HMR) and optimized Rollup bundling.
- **Styling:** Tailwind CSS with dark and light theme switching.
- **Icons:** Lucide React icons.
- **Data Visualization:** Recharts for interactive bar charts, radar/pie distribution charts, and timeline score tracking.
- **State Management:** React Context API (`AuthContext`, `ThemeContext`, `ToastContext`).

---

## 7. 35+ Comprehensive Viva Voce Questions & Answers

### Category 1: Project Architecture & High-Level Design

#### Q1: Can you give an executive 60-second summary of CareerAI?
**Answer:** CareerAI is an AI-powered resume screening and job recommendation system. It extracts structured information from candidate resumes (PDF, DOCX, TXT), evaluates ATS compliance using a 0–100 weighted rubric, extracts skills against a 600+ taxonomy with synonym mapping, and matches resumes to job openings using a hybrid scoring algorithm combining TF-IDF vector cosine similarity and weighted skill overlap. It also provides gap analysis with personalized learning roadmaps.

#### Q2: What is the high-level architecture of your project?
**Answer:** It follows a decoupled client-server architecture:
- A modern React + TypeScript single-page application (SPA) styled with Tailwind CSS on the frontend.
- A RESTful FastAPI backend implementing JWT authentication, Pydantic data validation, and SQLAlchemy ORM.
- An NLP and Machine Learning module in Python utilizing scikit-learn, pypdf, and python-docx.
- SQLite/PostgreSQL relational storage for persistence.

#### Q3: Why did you choose FastAPI over Flask or Django?
**Answer:**
1. **Speed & Asynchronous Performance:** FastAPI is built on Starlette and Pydantic, providing high throughput for I/O-bound operations.
2. **Automatic Data Validation:** Pydantic models automatically validate incoming request bodies and query parameters.
3. **Automated OpenAPI Documentation:** Native Swagger UI (`/docs`) and ReDoc (`/redoc`) without extra setup.
4. **Modern Python Support:** Built-in typing and async/await syntax.

#### Q4: Why did you choose React + Vite instead of Next.js or Vanilla JS?
**Answer:** React offers modular component architecture and a rich ecosystem (Recharts, Lucide). Vite provides fast development builds and bundle optimization via Rollup. Because CareerAI is an authenticated dashboard SaaS application rather than an SEO-dependent e-commerce catalog, a Single Page Application (SPA) with client-side routing (`react-router-dom`) is the ideal architecture.

---

### Category 2: NLP & Information Extraction

#### Q5: How does your system parse text from PDF and DOCX files?
**Answer:**
- For **PDFs**: We use `pypdf` to extract text streams across all pages while handling standard encoding schemes.
- For **DOCX**: We use `python-docx` to iterate through paragraphs and table cell contents.
- For **Plain Text**: Standard UTF-8 decoding.
The extracted text then goes through a cleaning pipeline that normalizes whitespace, strips non-printable control characters, and standardizes punctuation.

#### Q6: How do you identify sections like Experience, Education, and Skills?
**Answer:** We implement header boundary segmentation using regular expressions matching common section titles (e.g., `EXPERIENCE`, `WORK HISTORY`, `EMPLOYMENT`, `EDUCATION`, `SKILLS & TECHNOLOGIES`). When a recognized header is encountered at the start of a line or surrounded by clean spacing, the parser segments the preceding text and labels the subsequent block until the next header is detected.

#### Q7: How are applicant contact details (Email, Phone, Links) extracted?
**Answer:**
- **Email:** Standard RFC-compliant regex `[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+`.
- **Phone:** Regular expressions matching standard phone formats: `(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}`.
- **Links:** Targeted regular expressions detecting GitHub (`github.com/username`), LinkedIn (`linkedin.com/in/username`), and HTTP/HTTPS portfolio domains.

#### Q8: How does the 600+ skills taxonomy and synonym mapping work?
**Answer:** We maintain a categorized dictionary of canonical skills (Technical, Tools, Soft). Each canonical skill has aliases (e.g., canonical `Kubernetes` has aliases `['k8s', 'kube', 'kubernetes engine']`). The parser performs case-insensitive boundary search on both canonical names and aliases. When an alias is found, it maps directly to the canonical skill, preventing duplicate or inconsistent tags.

---

### Category 3: Machine Learning & Recommendation Systems

#### Q9: What is the machine learning model used for job recommendation?
**Answer:** We use an Information Retrieval (IR) content-based recommendation approach combining **TF-IDF Vectorization** and **Cosine Similarity** from `scikit-learn`, layered with a **Multi-Factor Weighted Overlap Algorithm**.

#### Q10: What is TF-IDF and why is it suitable here?
**Answer:** TF-IDF stands for Term Frequency-Inverse Document Frequency:
- **TF (Term Frequency)** counts how often a term appears in a resume or job description.
- **IDF (Inverse Document Frequency)** reduces the weight of terms that appear ubiquitously across all documents (like "experience", "work", "responsible"), while magnifying domain-specific terms (like "PyTorch", "Kubernetes", "PostgreSQL").
It transforms unstructured text into numerical feature vectors that preserve lexical significance.

#### Q11: What is Cosine Similarity and how does it compute match?
**Answer:** Cosine similarity measures the cosine of the angle between two multi-dimensional vectors in term space:

$$\cos(	heta) = rac{ec{u} \cdot ec{v}}{\|ec{u}\| \|ec{v}\|}$$

It outputs a value between 0 (orthogonal, completely dissimilar) and 1 (identical orientation). It is ideal for resume matching because it evaluates topical similarity independent of document length (a 1-page resume and a 3-page job description can have high cosine similarity if they share proportional term distributions).

#### Q12: Why didn't you use pure Jaccard similarity instead of TF-IDF?
**Answer:** Jaccard similarity ($|A \cap B| / |A \cup B|$) treats all terms equally. A shared word like "project" would carry the same weight as a critical differentiator like "TensorFlow". TF-IDF accounts for term importance and frequency, making it substantially more accurate for text matching. However, we do use a normalized set intersection specifically for explicit skill requirements.

#### Q13: What are the weights in your composite match score?
**Answer:**
1. **40% Explicit Skill Overlap:** Direct match of mandatory job skills.
2. **25% TF-IDF Cosine Similarity:** Semantic context and domain terminology overlap.
3. **15% Experience Fit:** Comparison of candidate years of experience against job requirements.
4. **10% Education Fit:** Degree level alignment (e.g., Bachelor's vs Master's).
5. **10% Keyword Density:** General industry terminology alignment.

#### Q14: How does the Skill-Gap Analyzer work?
**Answer:** It compares the set of canonical skills extracted from the resume against the target job's required skills:
- **Matching Skills** = $S_{	ext{resume}} \cap S_{	ext{job}}$
- **Missing Skills** = $S_{	ext{job}} \setminus S_{	ext{resume}}$
Each missing skill is passed to a heuristic prioritizer that assigns it a priority level (High/Medium/Low) based on frequency in industry postings, and generates estimated study weeks and actionable learning roadmap recommendations.

---

### Category 4: ATS Scoring & Rules Engine

#### Q15: What is an ATS and why do resumes get rejected by it?
**Answer:** An ATS (Applicant Tracking System) is software used by employers to collect, sort, and rank candidate applications. Resumes get rejected because of:
1. Complex formatting (tables, multi-column layouts, graphics) that parser engines cannot linearize.
2. Missing standard section titles.
3. Lack of relevant keywords matching the job description.
4. Missing basic contact information.
5. Lack of quantifiable accomplishments (e.g., listing duties rather than results).

#### Q16: How does CareerAI calculate the ATS Score?
**Answer:** The ATS compliance score uses a 100-point rubric evaluating:
1. **Section Headers:** Presence of standard headings (Experience, Education, Skills, Projects).
2. **Quantifiable Metrics:** Detection of metrics, percentages, numbers, and currency values in bullet points.
3. **Action Verbs:** Detection of strong action verbs (Developed, Implemented, Led, Designed).
4. **Contact Details:** Verification of email, valid phone number, and professional portfolio/LinkedIn.
5. **Length & Density:** Optimal word count bounds ($300–1200$ words).

#### Q17: What actionable suggestions does CareerAI produce?
**Answer:** When an audit condition fails, the system generates prioritized suggestions:
- Missing quantifiable metrics → "Include measurable impact (e.g., 'reduced latency by 30%')."
- Missing LinkedIn/GitHub → "Add your LinkedIn or GitHub profile link to header."
- Thin skill section → "Expand technical stack to at least 8–10 verified industry skills."
- Length alerts → "Document is under 300 words or over 1,500 words."

---

### Category 5: Backend & Database Engineering

#### Q18: How is authentication handled securely?
**Answer:**
1. **Password Security:** Passwords are never stored in plain text. They are hashed using `bcrypt` with unique salts before being persisted.
2. **JWT Bearer Authentication:** Upon login, the backend issues an industry-standard JSON Web Token containing user ID, role, and an expiration timestamp signed with a secret key (`HS256`).
3. **Stateless Verification:** The client sends this token in the `Authorization: Bearer <token>` header for protected endpoints. The server decodes and validates the signature without needing session DB lookups.

#### Q19: What is Role-Based Access Control (RBAC) in your application?
**Answer:** We define user roles (`user` and `admin`). Endpoints are secured using FastAPI dependency injection (`get_current_user` and `require_admin`). If a regular user attempts to access `/api/admin/stats` or create jobs via `/api/admin/jobs`, the dependency immediately raises an HTTP 403 Forbidden exception.

#### Q20: How does the system handle database migrations and scalability?
**Answer:** We use SQLAlchemy ORM with declarative mapping. In development, SQLite provides an embedded zero-configuration database stored in a local `.db` file. For production, the database URL can be swapped to PostgreSQL in `app/config.py` without rewriting any business logic or SQL queries.

#### Q21: What happens if an uploaded file is corrupted or malicious?
**Answer:**
1. File size is validated (max 10MB).
2. MIME types and file extensions are validated (`.pdf`, `.docx`, `.txt`).
3. File parsing is wrapped in try-catch blocks with granular exception handling that returns HTTP 400 Bad Request with a clear explanation instead of crashing the server.
4. Uploaded files are saved with sanitized, unique timestamps and IDs to prevent path traversal attacks.

---

### Category 6: Frontend & UI/UX Design

#### Q22: How is the state managed across the React application?
**Answer:** We use modular React Context providers:
- `AuthContext`: Manages logged-in user state, JWT persistence in `localStorage`, and login/logout lifecycles.
- `ThemeContext`: Toggles dark/light mode and synchronizes with HTML class attributes.
- `ToastContext`: Provides non-blocking notifications across all pages.
Component-level state is managed with React hooks (`useState`, `useEffect`, `useMemo`, `useCallback`).

#### Q23: How are charts rendered dynamically?
**Answer:** We use **Recharts**, a composable charting library built on React components and SVG. It renders responsive Bar Charts for score history and Pie/Donut charts for skill category distribution with hover tooltips and animations.

#### Q24: How does dark mode work in your app?
**Answer:** Tailwind CSS is configured with `darkMode: 'class'`. When the user toggles the theme in `ThemeContext`, the `dark` class is dynamically added or removed from the root `document.documentElement` element, and the preference is saved in `localStorage`.

---

### Category 7: Evaluation, Comparison & Viva Curveballs

#### Q25: How does the Resume Comparison (A/B) feature work?
**Answer:** The user selects two previously uploaded resumes. The backend fetches both parsed analyses, compares their overall scores, ATS compliance, skill overlaps, and section breakdowns, and computes score differences ($\Delta S$). It determines a verdict (e.g., "Resume A is better suited for Backend Roles with +15% ATS compliance") and renders a side-by-side visual diff.

#### Q26: What are the limitations of your current approach?
**Answer:**
1. **Semantic Nuance Beyond TF-IDF:** While TF-IDF is fast and explainable, it cannot detect semantic equivalence for complex phrases that share no common root words without taxonomy aliases.
2. **OCR for Scanned Resumes:** It parses digital text streams in PDFs, but if a user uploads an image-only scanned PDF, an OCR engine like Tesseract would be required.
3. **Cold Start for Candidate Experience:** Candidate work history duration relies on standard date formats.

#### Q27: How would you scale CareerAI to handle 100,000 resumes concurrently?
**Answer:**
1. **Asynchronous Task Queues:** Decouple resume upload from analysis using Celery or Redis Queue (RQ). The upload endpoint immediately returns a task ID, and background workers process NLP parsing.
2. **Vector Database:** Index pre-computed job embeddings in a dedicated vector database (like Milvus, Qdrant, or pgvector) for approximate nearest neighbor ($k$-NN) retrieval in sub-millisecond time.
3. **Caching Layer:** Cache job postings and in-demand skills in Redis.
4. **Containerization & Autoscaling:** Package the FastAPI backend in Docker containers managed by Kubernetes or AWS ECS with Horizontal Pod Autoscaling.

#### Q28: How could you integrate Large Language Models (LLMs) into CareerAI?
**Answer:**
1. **Sentence Transformers / BERT Embeddings:** Replace or augment TF-IDF vectors with `all-MiniLM-L6-v2` dense embeddings for deep semantic matching.
2. **Generative Resume Rewriting:** Use OpenAI GPT-4o or Google Gemini API to automatically rewrite weak bullet points into high-impact, quantified achievement statements based on specific job descriptions.
3. **Automated Cover Letter Generation:** Generate personalized cover letters using the resume extracted entities and job description requirements.

#### Q29: What are your key database indexes?
**Answer:**
- `users(email)`: Unique index for $O(1)$ login lookups.
- `resumes(user_id)`: Index for fast candidate resume history retrieval.
- `resume_analyses(resume_id)`: Foreign key index for instant report fetches.
- `jobs(title, location)`: Multi-column indexes for search query filtering.
- `saved_jobs(user_id, job_id)`: Unique compound constraint preventing duplicate saves.

#### Q30: Why is Cosine Similarity preferred over Euclidean Distance for text?
**Answer:** Euclidean distance is sensitive to document length: two documents discussing the exact same topic with the exact same word proportions will have a large Euclidean distance if one is 200 words and the other is 2,000 words. Cosine similarity normalizes for magnitude and measures the angle, making it completely invariant to document length.

#### Q31: How did you prevent overfitting in your scoring weights?
**Answer:** The weights ($0.40, 0.25, 0.15, 0.10, 0.10$) were calibrated based on empirical recruitment studies regarding what hiring managers and corporate recruiters prioritize: technical qualification alignment is primary, followed by general domain experience and communication clarity.

#### Q32: What is the time complexity of the job matching algorithm?
**Answer:**
- Vocabulary construction and TF-IDF transformation of $M$ jobs with $V$ unique vocabulary tokens takes $O(M 	imes L)$ where $L$ is the average document length.
- Transforming a single query resume of length $K$ takes $O(K)$.
- Cosine similarity between the resume vector and $M$ job vectors takes $O(M 	imes N_{	ext{nonzero}})$, which executes in milliseconds for hundreds of jobs using sparse matrix multiplication in `scikit-learn`.

#### Q33: How does your application prevent SQL Injection and XSS attacks?
**Answer:**
- **SQL Injection:** We use SQLAlchemy ORM with parameterized queries. Raw string interpolation is never used in database statements.
- **XSS (Cross-Site Scripting):** React escapes all string variables by default before rendering them into the Virtual DOM, preventing script injection.
- **CSRF:** The application uses stateless JWT bearer tokens stored in memory/client storage rather than vulnerable ambient session cookies.

#### Q34: What is the difference between Hard Skills and Soft Skills in your taxonomy?
**Answer:**
- **Hard / Technical Skills:** Teachable, measurable abilities related to specific tools, languages, and technologies (e.g., Python, Docker, React, PostgreSQL).
- **Soft Skills:** Interpersonal traits, communication methodologies, and work styles (e.g., Leadership, Agile, Critical Thinking, Time Management).
Our system separates these into distinct badges and applies different weights in the scoring rubric.

#### Q35: What would you say is the single most unique feature of CareerAI?
**Answer:** The **Dual-Perspective Transparency**: while most ATS systems are black boxes that simply rank or reject candidates silently, CareerAI exposes the complete mathematical score breakdown, highlights exact missing skills, and generates an actionable learning roadmap showing candidates *precisely* how to become the top candidate for their target role.

---


#### Q36: How does CareerAI integrate real-time job openings from external APIs?
**Answer:** CareerAI incorporates a multi-provider Real-Time Job Ingestion engine (`RealTimeJobService`). It connects directly to live web APIs including **Remotive API** and **Arbeitnow API** (with optional support for **JSearch / RapidAPI** for LinkedIn and Indeed). The system fetches live openings, cleans raw HTML markup into structured plain text, deduplicates against existing records by company and title, and tags the job with direct employer application links.

#### Q37: How are required skills determined for live external jobs without manual human tagging?
**Answer:** When external jobs are ingested from live web feeds, they pass through CareerAI's **NLP 600+ Skills Taxonomy Engine**. The pipeline tokenizes the job title and description, runs regex boundary matching across technical, soft, and tool taxonomies, normalizes aliases (e.g., `k8s` -> `Kubernetes`), and merges any platform tags. This produces a verified array of required skills automatically, allowing the TF-IDF and Cosine Recommendation engine to calculate match scores against candidate resumes in real time.

---


#### Q38: How does CareerAI handle image-based scanned resumes or documents where no digital text stream exists?
**Answer:** CareerAI integrates a native, deep learning **AI OCR (Optical Character Recognition) Engine** built on `rapidocr-onnxruntime` (PP-OCRv4 / ONNX Runtime) and `pypdfium2`:
1. **Direct Image Ingestion:** Accepts direct image formats (`.png`, `.jpg`, `.jpeg`, `.webp`, `.bmp`, `.tiff`).
2. **Scanned PDF Fallback:** When a PDF is uploaded, the parser first checks if digital text exists. If fewer than 50 characters of digital text are found (indicating a scanned or rasterized document), `pypdfium2` automatically renders each page at 144 DPI (2.0x scale) into memory.
3. **Deep Learning Text Detection & Recognition:** RapidOCR detects text bounding boxes and transcribes characters with deep learning convolutional and recurrent neural networks.
4. **Spatial Layout Reconstruction:** Bounding boxes are sorted top-to-bottom and left-to-right to preserve document structure and section hierarchy before feeding the text into the 600+ skills extractor, ATS scoring rubric, and TF-IDF recommender.
5. **Zero External Binaries:** The entire engine runs in-process via ONNX runtime without requiring external C++ dependencies (like standard Tesseract installations).

---

## 8. Summary Checklist for Viva Presentation

- [x] Backend running on `http://localhost:8000` (docs at `/docs`)
- [x] Frontend running on `http://localhost:5173`
- [x] Demo Candidate credentials ready: `demo@example.com` / `Demo@123`
- [x] Demo Admin credentials ready: `admin@example.com` / `Admin@123`
- [x] Sample resumes ready in `backend/sample_resumes/`
- [x] 20 unit tests passing (`pytest tests/ -v`)
- [x] Mathematical formulas prepared on whiteboard/slides ($S_{	ext{overall}}$, $S_{	ext{match}}$, Cosine Similarity, TF-IDF)
