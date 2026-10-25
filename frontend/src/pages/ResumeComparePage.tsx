import React, { useEffect, useState } from 'react';
import { GitCompare, Sparkles, ArrowRight, CheckCircle2, TrendingUp, TrendingDown, Layers, Award } from 'lucide-react';
import { resumeService } from '../services/resumeService';
import { ResumeItem } from '../types';
import { useToast } from '../context/ToastContext';

export const ResumeComparePage: React.FC = () => {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [resumeAId, setResumeAId] = useState<number | null>(null);
  const [resumeBId, setResumeBId] = useState<number | null>(null);
  const [comparison, setComparison] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    const fetchList = async () => {
      try {
        const list = await resumeService.listResumes();
        setResumes(list);
        if (list.length >= 2) {
          setResumeAId(list[0].id);
          setResumeBId(list[1].id);
        } else if (list.length === 1) {
          setResumeAId(list[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchList();
  }, []);

  const handleCompare = async () => {
    if (!resumeAId || !resumeBId) {
      showToast('Please select two resumes to compare.', 'error');
      return;
    }
    if (resumeAId === resumeBId) {
      showToast('Please select two distinct resumes.', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await resumeService.compareResumes(resumeAId, resumeBId);
      setComparison(data);
      showToast('Comparison generated successfully!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to compare resumes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Resume Version Comparison
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Compare two versions of your resume side-by-side to track ATS improvements, skill expansions, and quality score gains.
        </p>
      </div>

      {resumes.length < 2 ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <GitCompare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">At least 2 resumes required</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Upload another version of your resume to compare keyword coverage, ATS metrics, and scoring differences.
          </p>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Resume A (Baseline)
              </label>
              <select
                value={resumeAId || ''}
                onChange={(e) => setResumeAId(parseInt(e.target.value, 10))}
                className="w-full p-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
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
                Resume B (Updated Version)
              </label>
              <select
                value={resumeBId || ''}
                onChange={(e) => setResumeBId(parseInt(e.target.value, 10))}
                className="w-full p-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.filename} ({r.overall_score || 0} pts)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleCompare}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            <GitCompare className="w-4 h-4" /> Run Comparison
          </button>
        </div>
      )}

      {/* Comparison Results Card */}
      {comparison && (
        <div className="space-y-6 animate-fade-in">
          {/* Verdict Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl flex items-center justify-between">
            <div>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-white/20 text-blue-200">
                AI Evaluation Verdict
              </span>
              <h3 className="text-xl font-bold mt-2">{comparison.comparison.verdict}</h3>
              <p className="text-xs text-blue-200 mt-1">
                Score Difference: {comparison.comparison.score_diff > 0 ? `+${comparison.comparison.score_diff}` : comparison.comparison.score_diff} pts • ATS Diff: {comparison.comparison.ats_diff > 0 ? `+${comparison.comparison.ats_diff}` : comparison.comparison.ats_diff}%
              </p>
            </div>
          </div>

          {/* Side by side columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resume A Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Resume A</span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {comparison.resume_a.filename}
                  </h4>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {comparison.resume_a.overall_score}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold">ATS: {comparison.resume_a.ats_score}%</div>
                </div>
              </div>

              <div className="text-xs space-y-2">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Experience:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{comparison.resume_a.experience_years} Yrs</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Skills Count:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{comparison.resume_a.skills_count}</span>
                </div>
              </div>

              <div className="pt-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Unique Skills in A</h5>
                <div className="flex flex-wrap gap-1.5">
                  {comparison.comparison.unique_to_a.length > 0 ? (
                    comparison.comparison.unique_to_a.map((s: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">None</span>
                  )}
                </div>
              </div>
            </div>

            {/* Resume B Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Resume B</span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {comparison.resume_b.filename}
                  </h4>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {comparison.resume_b.overall_score}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold">ATS: {comparison.resume_b.ats_score}%</div>
                </div>
              </div>

              <div className="text-xs space-y-2">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Experience:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{comparison.resume_b.experience_years} Yrs</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Skills Count:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{comparison.resume_b.skills_count}</span>
                </div>
              </div>

              <div className="pt-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Unique Skills in B</h5>
                <div className="flex flex-wrap gap-1.5">
                  {comparison.comparison.unique_to_b.length > 0 ? (
                    comparison.comparison.unique_to_b.map((s: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        +{s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">None</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Common Overlap Skills */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Shared Verified Skills Across Both Iterations ({comparison.comparison.common_skills.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {comparison.comparison.common_skills.map((s: string, idx: number) => (
                <span key={idx} className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
