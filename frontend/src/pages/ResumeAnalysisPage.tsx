import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Edit3,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Layers,
  X,
  Loader2,
} from 'lucide-react';
import { resumeService } from '../services/resumeService';
import { ResumeAnalysis, ResumeItem } from '../types';
import { useToast } from '../context/ToastContext';

export const ResumeAnalysisPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const resumeIdParam = searchParams.get('id');

  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(
    resumeIdParam ? parseInt(resumeIdParam, 10) : null
  );
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});

  const { showToast } = useToast();

  useEffect(() => {
    const fetchResumesAndAnalysis = async () => {
      try {
        const list = await resumeService.listResumes();
        setResumes(list);

        let targetId = selectedResumeId;
        if (!targetId && list.length > 0) {
          targetId = list[0].id;
          setSelectedResumeId(targetId);
        }

        if (targetId) {
          const report = await resumeService.getResumeAnalysis(targetId);
          setAnalysis(report);
          setEditFormData(report.extracted_info || {});
        }
      } catch (err) {
        console.error('Failed to load analysis', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResumesAndAnalysis();
  }, [selectedResumeId]);

  const handleResumeChange = async (id: number) => {
    setSelectedResumeId(id);
    setLoading(true);
    try {
      const report = await resumeService.getResumeAnalysis(id);
      setAnalysis(report);
      setEditFormData(report.extracted_info || {});
    } catch (err) {
      showToast('Failed to switch resume.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEditedInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId) return;
    try {
      const updated = await resumeService.updateExtractedInfo(selectedResumeId, editFormData);
      setAnalysis(updated);
      setEditModalOpen(false);
      showToast('Contact and personal information updated!', 'success');
    } catch (err) {
      showToast('Failed to update details.', 'error');
    }
  };

  const handleReanalyze = async () => {
    if (!selectedResumeId) return;
    setReanalyzing(true);
    try {
      const updated = await resumeService.reanalyzeResume(selectedResumeId);
      setAnalysis(updated);
      showToast('Analysis re-evaluated successfully!', 'success');
    } catch (err) {
      showToast('Failed to re-analyze resume.', 'error');
    } finally {
      setReanalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="lg:col-span-2 h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Resume Analysis Found</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Upload your resume to generate a complete ATS report and neural match breakdown.
        </p>
        <Link
          to="/upload"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md"
        >
          Upload Resume
        </Link>
      </div>
    );
  }

  const { overall_score, ats_score, score_breakdown, extracted_info, skills_detected, ats_warnings, suggestions } = analysis;

  return (
    <div className="space-y-8">
      {/* Top Header & Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Verified ATS Evaluation
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Resume Analysis Report
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Detailed breakdown of parsed entities, ATS compliance, skill breadth, and job readiness.
          </p>
        </div>

        {/* Action buttons & selector */}
        <div className="flex items-center gap-2">
          {resumes.length > 1 && (
            <select
              value={selectedResumeId || ''}
              onChange={(e) => handleResumeChange(parseInt(e.target.value, 10))}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.filename} ({r.overall_score || 0} pts)
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleReanalyze}
            disabled={reanalyzing}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Re-run analysis"
          >
            <RefreshCw className={`w-4 h-4 ${reanalyzing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Re-analyze</span>
          </button>

          <Link
            to="/recommendations"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all"
          >
            <span>View Matching Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Score Badges & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

          <div>
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase bg-white/10 text-blue-200 backdrop-blur-md">
              Comprehensive Score
            </span>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-6xl font-black text-white">{overall_score}</span>
              <span className="text-lg font-semibold text-slate-400">/ 100</span>
            </div>
            <p className="text-xs text-slate-300 mt-2">
              {overall_score >= 80
                ? 'Excellent resume rating! Highly competitive for top-tier tech roles.'
                : overall_score >= 65
                ? 'Solid profile foundation. Refine missing keywords and metrics to unlock senior tiers.'
                : 'Significant optimization required. Address formatting and section keywords.'}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-emerald-400">{ats_score}%</div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase">ATS Compatibility</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{extracted_info?.total_experience_years || 1.0} Yrs</div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase">Experience Duration</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-400">{skills_detected?.all?.length || 0}</div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase">Total Skills</div>
            </div>
          </div>
        </div>

        {/* Breakdown Progress Bars (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              ATS & Quality Metric Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-5">
              Quantified evaluation across key recruiter screening rubrics
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {[
                { label: 'ATS Compatibility', val: score_breakdown?.ats_compatibility || 85, color: 'bg-emerald-500' },
                { label: 'Technical & Domain Skills', val: score_breakdown?.skills || 80, color: 'bg-blue-500' },
                { label: 'Experience Depth & Impact', val: score_breakdown?.experience || 75, color: 'bg-indigo-500' },
                { label: 'Education & Accreditation', val: score_breakdown?.education || 90, color: 'bg-purple-500' },
                { label: 'Projects & Architecture', val: score_breakdown?.projects || 80, color: 'bg-cyan-500' },
                { label: 'Formatting & Parseability', val: score_breakdown?.formatting || 90, color: 'bg-teal-500' },
                { label: 'Keyword Density & Match', val: score_breakdown?.keywords || 70, color: 'bg-amber-500' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>{item.label}</span>
                    <span>{item.val}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-700`}
                      style={{ width: `${item.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Rubric calibrated against enterprise ATS standards</span>
            <Link to="/suggestions" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              View detailed improvements →
            </Link>
          </div>
        </div>
      </div>

      {/* Extracted Personal Info Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Extracted Personal Information</h3>
          </div>
          <button
            onClick={() => {
              setEditFormData(extracted_info || {});
              setEditModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Details
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="text-slate-400 flex items-center gap-1.5 mb-1">
              <User className="w-3.5 h-3.5" /> Candidate Name
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
              {extracted_info?.name || 'Not detected'}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="text-slate-400 flex items-center gap-1.5 mb-1">
              <Mail className="w-3.5 h-3.5" /> Email
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
              {extracted_info?.email || 'Not detected'}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="text-slate-400 flex items-center gap-1.5 mb-1">
              <Phone className="w-3.5 h-3.5" /> Phone
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
              {extracted_info?.phone || 'Not detected'}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="text-slate-400 flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5" /> Location
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
              {extracted_info?.location || 'Not detected'}
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="mt-4 flex flex-wrap gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          {extracted_info?.linkedin && (
            <a
              href={extracted_info.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold hover:underline"
            >
              <Linkedin className="w-3.5 h-3.5" /> LinkedIn
            </a>
          )}
          {extracted_info?.github && (
            <a
              href={extracted_info.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold hover:underline"
            >
              <Github className="w-3.5 h-3.5" /> GitHub
            </a>
          )}
          {extracted_info?.portfolio && (
            <a
              href={extracted_info.portfolio}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold hover:underline"
            >
              <Globe className="w-3.5 h-3.5" /> Portfolio Link
            </a>
          )}
        </div>
      </div>

      {/* Skills Analysis */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Verified Skills ({skills_detected?.all?.length || 0})
            </h3>
          </div>
          <Link to="/skill-gap" className="text-xs font-bold text-blue-600 hover:underline">
            Compare Against Job Specs →
          </Link>
        </div>

        {/* Technical */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
            Technical Skills ({skills_detected?.technical?.length || 0})
          </h4>
          <div className="flex flex-wrap gap-2">
            {skills_detected?.technical?.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
            Tools & Platforms ({skills_detected?.tools?.length || 0})
          </h4>
          <div className="flex flex-wrap gap-2">
            {skills_detected?.tools?.map((tool, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* Soft Skills */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
            Soft & Leadership Skills ({skills_detected?.soft?.length || 0})
          </h4>
          <div className="flex flex-wrap gap-2">
            {skills_detected?.soft?.map((s, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-900"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Experience, Education & Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Experience Timeline */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Experience Timeline</h3>
          </div>
          <div className="space-y-4">
            {extracted_info?.experience?.map((exp: any, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{exp.title}</h4>
                  <span className="text-[11px] font-semibold text-slate-500 bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 shrink-0">
                    {exp.duration}
                  </span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">{exp.company}</p>
                {exp.responsibilities && (
                  <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                    {exp.responsibilities.map((r: string, rIdx: number) => (
                      <li key={rIdx}>{r}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Education & Certifications */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Education & Credentials</h3>
          </div>
          <div className="space-y-4">
            {extracted_info?.education?.map((edu: any, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{edu.degree}</h4>
                  <span className="text-[11px] font-semibold text-slate-500 bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 shrink-0">
                    {edu.year}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{edu.institution}</p>
                {edu.score && <p className="text-xs text-emerald-600 font-semibold mt-1">Grade/CGPA: {edu.score}</p>}
              </div>
            ))}

            {extracted_info?.certifications && extracted_info.certifications.length > 0 && (
              <div className="pt-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Certifications</h4>
                <div className="flex flex-wrap gap-2">
                  {extracted_info.certifications.map((c: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Projects Section */}
      {extracted_info?.projects && extracted_info.projects.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <FolderGit2 className="w-5 h-5 text-cyan-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Key Identified Projects</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {extracted_info.projects.map((proj: any, idx: number) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{proj.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{proj.description}</p>
                {proj.technologies && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {proj.technologies.map((t: string, tIdx: number) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ATS Warnings & Action Items */}
      {ats_warnings && ats_warnings.length > 0 && (
        <div className="p-6 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 className="text-base font-bold">ATS Warnings & Filter Flags</h3>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Applicant Tracking Systems frequently reject resumes that trigger these parsing warnings:
          </p>
          <ul className="space-y-1.5 pt-1">
            {ats_warnings.map((warn, i) => (
              <li key={i} className="text-xs font-semibold text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <span className="text-amber-600">•</span>
                <span>{warn}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Edit Extracted Info Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Extracted Information</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedInfo} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Location</label>
                <input
                  type="text"
                  value={editFormData.location || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={editFormData.linkedin || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">GitHub URL</label>
                <input
                  type="text"
                  value={editFormData.github || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, github: e.target.value })}
                  placeholder="https://github.com/username"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md"
                >
                  Save & Recalculate Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
