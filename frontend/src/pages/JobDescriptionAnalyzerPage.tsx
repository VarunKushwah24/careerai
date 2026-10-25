import React, { useEffect, useState } from 'react';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Cpu,
  Layers,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { jobService } from '../services/jobService';
import { resumeService } from '../services/resumeService';
import { ResumeItem, CustomJDAnalysisResult } from '../types';
import { useToast } from '../context/ToastContext';

export const JobDescriptionAnalyzerPage: React.FC = () => {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [jobTitle, setJobTitle] = useState('Senior Python / AI Developer');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<CustomJDAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  useEffect(() => {
    const fetchUserResumes = async () => {
      try {
        const list = await resumeService.listResumes();
        setResumes(list);
        if (list.length > 0) setSelectedResumeId(list[0].id);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    fetchUserResumes();
  }, []);

  const sampleJD = `We are looking for an experienced Senior Software Engineer to build and deploy high-throughput microservices and machine learning recommendation systems. 
Key Requirements:
- 3+ years of experience with Python, FastAPI, and Docker containerization.
- Strong knowledge of PostgreSQL, Redis caching, and relational schema optimization.
- Experience with React, TypeScript, and modern responsive frontend architectures.
- Familiarity with CI/CD deployment pipelines, AWS cloud services, and Git workflows.
- Excellent communication, teamwork, and problem-solving abilities.`;

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId) {
      showToast('Please select an active resume first.', 'error');
      return;
    }
    if (!jobDescription.trim() || jobDescription.length < 50) {
      showToast('Please paste a comprehensive job description (at least 50 characters).', 'error');
      return;
    }

    setAnalyzing(true);
    try {
      const data = await jobService.analyzeCustomJD(selectedResumeId, jobDescription, jobTitle);
      setResult(data);
      showToast('Job description analyzed successfully!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Analysis failed.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 mb-2">
          <Cpu className="w-3.5 h-3.5" /> Live NLP Parser & Vector Match
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Job Description Analyzer
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Paste any external job description (from LinkedIn, Indeed, or career sites) to instantly simulate ATS parsing and match compatibility.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAnalyze} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Target Resume to Compare
            </label>
            <select
              value={selectedResumeId || ''}
              onChange={(e) => setSelectedResumeId(parseInt(e.target.value, 10))}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.filename} ({r.overall_score || 0} pts)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Job Title / Role
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Senior Machine Learning Engineer"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Job Description Text
            </label>
            <button
              type="button"
              onClick={() => setJobDescription(sampleJD)}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Paste Sample Python / AI JD
            </button>
          </div>
          <textarea
            rows={7}
            required
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the complete job description, requirements, and responsibilities here..."
            className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
          />
        </div>

        <button
          type="submit"
          disabled={analyzing}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Description...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Analyze Job Description
            </>
          )}
        </button>
      </form>

      {/* Analysis Output */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Result Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-white/20 text-blue-200">
                Match Analysis Result
              </span>
              <h3 className="text-2xl font-black mt-1">{jobTitle}</h3>
              <p className="text-xs text-blue-200 mt-0.5">
                Assessment: <span className="font-bold text-white">{result.experience_assessment}</span>
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-3xl font-black text-emerald-400">{result.skills_match_score}%</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Skills Match</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-blue-400">{result.text_similarity_score}%</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">TF-IDF Text Match</div>
              </div>
              <div className="text-right pl-4 border-l border-white/20">
                <div className="text-4xl font-black text-white">{result.match_percentage}%</div>
                <div className="text-[10px] text-blue-300 uppercase font-bold">Overall Compatibility</div>
              </div>
            </div>
          </div>

          {/* Skills Matched vs Missing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matching */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Matching Skills Extracted ({result.matching_skills.length})
                </h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.matching_skills.map((s, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-amber-600">
                <AlertCircle className="w-5 h-5" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Missing Skills Detected in Spec ({result.missing_skills.length})
                </h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.missing_skills.length > 0 ? (
                  result.missing_skills.map((s, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                    >
                      ⚠ {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">All extracted job skills matched!</span>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations Card */}
          {result.recommendations.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Targeted AI Recommendations for this Job Description
              </h4>
              <div className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs flex items-start gap-2.5">
                    <span className="font-bold text-blue-600 shrink-0">[{rec.category}]</span>
                    <span className="text-slate-700 dark:text-slate-300">{rec.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
