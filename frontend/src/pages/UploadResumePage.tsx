import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  FileCheck,
  ShieldCheck,
  Zap,
  ScanText,
} from 'lucide-react';
import { resumeService } from '../services/resumeService';
import { useToast } from '../context/ToastContext';

export const UploadResumePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const processingSteps = [
    'Uploading document or image to secure AI sandbox...',
    'Running Deep Learning AI OCR & extracting text streams...',
    'Mining 600+ skills across technical, tools, and soft domains...',
    'Analyzing work experience duration, roles, and quantified achievements...',
    'Executing ATS compliance rubric (0–100 scale)...',
    'Calculating TF-IDF vector similarity and matching top jobs...',
  ];

  const isImageFile = (f: File | null) => {
    if (!f) return false;
    const name = f.name.toLowerCase();
    return (
      f.type.startsWith('image/') ||
      name.endsWith('.png') ||
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg') ||
      name.endsWith('.webp') ||
      name.endsWith('.bmp') ||
      name.endsWith('.tiff')
    );
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile: File) => {
    setError(null);
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
    ];
    const name = selectedFile.name.toLowerCase();
    const isDocx = name.endsWith('.docx') || name.endsWith('.doc');
    const isPdf = name.endsWith('.pdf');
    const isTxt = name.endsWith('.txt');
    const isImg =
      selectedFile.type.startsWith('image/') ||
      name.endsWith('.png') ||
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg') ||
      name.endsWith('.webp') ||
      name.endsWith('.bmp') ||
      name.endsWith('.tiff');

    if (!validTypes.includes(selectedFile.type) && !isDocx && !isPdf && !isTxt && !isImg) {
      setError('Please upload a valid PDF, DOCX, TXT, or Scanned Image (PNG, JPG, WEBP).');
      showToast('Invalid format. Supported: PDF, DOCX, TXT, PNG, JPG, WEBP.', 'error');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      showToast('File too large (max 10MB).', 'error');
      return;
    }

    setFile(selectedFile);
    showToast(`Selected ${isImg ? 'scanned image' : 'resume'}: ${selectedFile.name}`, 'info');
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const loadSampleResume = () => {
    const sampleText = `ALEXANDER WRIGHT
Email: alex.wright@example.com | Phone: (555) 342-8901 | Location: San Francisco, CA
LinkedIn: linkedin.com/in/alexwright-dev | GitHub: github.com/alexwright

PROFESSIONAL SUMMARY
Results-oriented Senior Full-Stack Engineer with 5+ years of experience designing and scaling distributed web applications and cloud architectures. Proven track record in optimizing backend throughput, microservices orchestration, and modern React SPAs.

SKILLS
- Programming: Python, TypeScript, JavaScript, Go, SQL, HTML5, CSS3
- Frameworks & Libraries: FastAPI, React, Node.js, Express, Django, Tailwind CSS, Next.js, Redux
- Cloud & DevOps: AWS (ECS, S3, RDS, Lambda), Docker, Kubernetes, CI/CD GitHub Actions, Terraform
- Databases: PostgreSQL, Redis, MongoDB, MySQL
- Methodologies: Agile/Scrum, Test-Driven Development (TDD), System Design, RESTful APIs, GraphQL

WORK EXPERIENCE
Senior Full-Stack Engineer | CloudScale Technologies (2021 - Present)
- Architected and delivered high-throughput microservices using FastAPI and PostgreSQL, serving 2.5M daily active requests with 99.98% uptime.
- Reduced API response latency by 42% through strategic Redis caching layers and asynchronous database connection pooling.
- Led front-end engineering for enterprise analytics dashboard using React 18, TypeScript, and Tailwind CSS, increasing user engagement by 35%.
- Mentored 6 junior/mid-level engineers on microservice patterns, clean architecture, and automated test coverage (exceeding 90%).

Software Engineer | Apex Systems Inc. (2019 - 2021)
- Built scalable RESTful services using Python, Django, and PostgreSQL handling enterprise customer transactions.
- Automated deployment pipelines with Docker and GitHub Actions, slashing release deployment cycles from 2 hours to 12 minutes.
- Implemented real-time telemetry and error tracking with Prometheus and Grafana.

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley (2015 - 2019) | GPA: 3.85 / 4.0

PROJECTS
- Distributed Job Queue Engine: High-performance task scheduler built with Go, Redis streams, and Docker.
- AI Search & Recommendation Assistant: Full-stack semantic document search with Python, scikit-learn, and React.

CERTIFICATIONS
- AWS Certified Solutions Architect - Associate
- Certified Kubernetes Administrator (CKA)`;

    const sampleBlob = new Blob([sampleText], { type: 'text/plain' });
    const sampleFile = new File([sampleBlob], 'Alexander_Wright_FullStack_Resume.txt', {
      type: 'text/plain',
    });
    setFile(sampleFile);
    setError(null);
    showToast('Loaded sample senior full-stack resume.', 'info');
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) {
      setError('Please choose a resume file to upload.');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setCurrentStep(0);

    // Multi-step animated progress simulation
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < processingSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 900);

    try {
      const response = await resumeService.uploadResume(file);
      clearInterval(interval);
      setCurrentStep(processingSteps.length - 1);

      showToast('Resume analyzed successfully!', 'success');
      setTimeout(() => {
        navigate(`/analysis/${response.id}`);
      }, 750);
    } catch (err: any) {
      clearInterval(interval);
      setAnalyzing(false);
      const msg = err?.response?.data?.detail || 'Failed to analyze resume. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isImg = isImageFile(file);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" /> AI Document Parser & ATS Evaluator with Deep OCR
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Upload & Screen Resume
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Our NLP parsing and AI OCR pipeline extracts text from PDF, DOCX, TXT, and scanned image resumes, extracts 600+ skills, computes ATS compliance, and matches you against live job openings.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Error: </span>
            {error}
          </div>
        </div>
      )}

      {/* Main Upload or Processing Card */}
      {!analyzing ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          {/* Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 sm:p-14 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
              dragActive
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 scale-[1.01]'
                : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 bg-slate-50/50 dark:bg-slate-900/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="w-20 h-20 rounded-3xl bg-blue-600/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Drag & Drop your resume or scan here
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md">
              Supports <span className="font-semibold text-slate-700 dark:text-slate-300">PDF, DOCX, TXT</span> and <span className="font-semibold text-blue-600 dark:text-blue-400">Scanned Images (PNG, JPG, WEBP)</span> with AI OCR.
            </p>

            <button
              type="button"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" /> Browse Computer
            </button>
          </div>

          {/* Selected File Card */}
          {file && (
            <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
                  {isImg ? <ImageIcon className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                </div>
                <div className="overflow-hidden text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-sm">
                      {file.name}
                    </p>
                    {isImg && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        AI OCR Scan
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatFileSize(file.size)} • {isImg ? 'Image scan ready for neural OCR extraction' : 'Document ready for NLP analysis'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Remove file"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleUploadAndAnalyze}
                  className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> {isImg ? 'Scan & Analyze Resume' : 'Analyze Resume'}
                </button>
              </div>
            </div>
          )}

          {/* Sample quick button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">Don't have a resume handy?</span>
            <button
              type="button"
              onClick={loadSampleResume}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <FileCheck className="w-3.5 h-3.5" /> Use Pre-loaded Software Engineer Sample
            </button>
          </div>
        </div>
      ) : (
        /* Animated Multi-Step Processing Stage */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-8 animate-fade-in">
          <div className="relative w-20 h-20 mx-auto">
            <div className="w-20 h-20 rounded-full border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 animate-spin flex items-center justify-center" />
            <Sparkles className="w-8 h-8 text-blue-600 absolute inset-0 m-auto animate-pulse" />
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              AI Processing & Neural OCR Evaluation
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Please wait while our deep learning OCR pipeline extracts text from your document or scan, validates ATS compliance, and matches job competencies.
            </p>
          </div>

          {/* Step checklist */}
          <div className="max-w-md mx-auto space-y-3 text-left">
            {processingSteps.map((stepDesc, idx) => {
              const isDone = idx < currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold transition-all ${
                    isDone
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                      : isCurrent
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 shadow-sm'
                      : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                  )}
                  <span>{stepDesc}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Feature Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <ScanText className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-base">Deep AI OCR Engine</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Neural text recognition parses scanned PDFs and image files (PNG, JPG, WEBP) even when no digital text stream exists.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-base">Multi-Factor ATS Rubric</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Evaluates format compliance, section headers, quantifiable bullet points, contact info completeness, and length ratios.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-base">600+ Skill Taxonomy</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Accurately classifies technical frameworks, developer tools, soft skills, and detects synonyms & aliases automatically.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-base">TF-IDF Matching</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Scikit-learn cosine similarity calculation delivers weighted percentage compatibility scores across real-time jobs.
          </p>
        </div>
      </div>
    </div>
  );
};
