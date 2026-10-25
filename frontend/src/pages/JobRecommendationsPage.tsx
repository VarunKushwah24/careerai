import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Briefcase,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  Send,
  HelpCircle,
  X,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { resumeService } from '../services/resumeService';
import { jobService } from '../services/jobService';
import { ResumeItem, JobMatchCard } from '../types';
import { useToast } from '../context/ToastContext';

export const JobRecommendationsPage: React.FC = () => {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<JobMatchCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobForModal, setSelectedJobForModal] = useState<JobMatchCard | null>(null);
  const [applyingJobId, setApplyingJobId] = useState<number | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    const initData = async () => {
      try {
        const list = await resumeService.listResumes();
        setResumes(list);
        if (list.length > 0) {
          const activeId = list[0].id;
          setSelectedResumeId(activeId);
          fetchMatches(activeId);
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    };
    initData();
  }, []);

  const fetchMatches = async (resumeId: number) => {
    setLoading(true);
    try {
      const cards = await jobService.getRecommendations(resumeId, 30);
      setRecommendations(cards);
    } catch (err) {
      showToast('Failed to calculate job recommendations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSwitch = (newId: number) => {
    setSelectedResumeId(newId);
    fetchMatches(newId);
  };

  const handleToggleSave = async (job: JobMatchCard) => {
    try {
      if (job.is_saved) {
        await jobService.unsaveJob(job.id);
        showToast('Job removed from saved list.', 'info');
      } else {
        await jobService.saveJob(job.id);
        showToast('Job saved to your favorites!', 'success');
      }
      setRecommendations((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, is_saved: !j.is_saved } : j))
      );
    } catch (e) {
      showToast('Action failed.', 'error');
    }
  };

  const handleApply = async (jobId: number) => {
    if (!selectedResumeId) return;
    setApplyingJobId(jobId);
    try {
      await jobService.applyJob(jobId, selectedResumeId);
      showToast('Application successfully submitted with your active resume!', 'success');
    } catch (err: any) {
      showToast('Failed to submit application.', 'error');
    } finally {
      setApplyingJobId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Neural Job Recommendation
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Recommended Tech Roles
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Ranked by multi-factor TF-IDF cosine similarity, skills overlap, and experience calibration.
          </p>
        </div>

        {/* Resume Selector */}
        {resumes.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Matching Resume:</span>
            <select
              value={selectedResumeId || ''}
              onChange={(e) => handleResumeSwitch(parseInt(e.target.value, 10))}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.filename} ({r.overall_score || 0} pts)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No matches found yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Upload your resume or ensure it contains key development skills to trigger the recommendation algorithm.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((job) => (
            <div
              key={job.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                {job.is_realtime && (
                  <div className="mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Web Opening • {job.source || 'Remotive'}
                    </span>
                  </div>
                )}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                      {job.company} • {job.location}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {job.match_percentage}% Match
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">
                  <span>{job.job_type}</span>
                  <span>•</span>
                  <span>{job.remote_status}</span>
                  <span>•</span>
                  <span>{job.experience_required} Yrs Req</span>
                </div>

                {job.salary_range && (
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-4">
                    {job.salary_range}
                  </div>
                )}

                {/* Matching Skills */}
                <div className="space-y-2 mb-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Matching Skills ({job.matching_skills.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {job.matching_skills.slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                    {job.matching_skills.length > 4 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{job.matching_skills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                {job.missing_skills.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Missing Skills ({job.missing_skills.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {job.missing_skills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                        >
                          ⚠ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggleSave(job)}
                    className={`p-2 rounded-xl border transition-colors ${job.is_saved ? "bg-blue-50 dark:bg-blue-950/50 border-blue-200 text-blue-600" : "border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600"}`}
                    title={job.is_saved ? 'Unsave Job' : 'Save Job'}
                  >
                    {job.is_saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedJobForModal(job)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                    title="Why recommended breakdown"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {job.external_url ? (
                    <a
                      href={job.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-sm flex items-center gap-1.5"
                    >
                      Apply on Site <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleApply(job.id)}
                      disabled={applyingJobId === job.id}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" /> Apply
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Why Recommended Modal */}
      {selectedJobForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  Recommendation Explanation
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {selectedJobForModal.title}
                </h3>
                <p className="text-xs text-slate-500">{selectedJobForModal.company}</p>
              </div>
              <button
                onClick={() => setSelectedJobForModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
              {selectedJobForModal.why_recommended}
            </div>

            {/* Score Breakdown Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Formula Score Breakdown (100% Scale)
              </h4>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Skills Overlap Match (40% weight):</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedJobForModal.score_breakdown.skills}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">TF-IDF Cosine Similarity (25% weight):</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedJobForModal.score_breakdown.tfidf}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Experience Alignment (15% weight):</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedJobForModal.score_breakdown.experience}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Education Degree Match (10% weight):</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedJobForModal.score_breakdown.education}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Domain Keywords Match (10% weight):</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedJobForModal.score_breakdown.keywords}%
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedJobForModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
