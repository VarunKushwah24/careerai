import React, { useEffect, useState } from 'react';
import {
  Target,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  ArrowRight,
  Briefcase,
  Layers,
} from 'lucide-react';
import { jobService } from '../services/jobService';
import { resumeService } from '../services/resumeService';
import { Job, ResumeItem, SkillGapData } from '../types';
import { useToast } from '../context/ToastContext';

export const SkillGapPage: React.FC = () => {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [gapData, setGapData] = useState<SkillGapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    const initData = async () => {
      try {
        const [rList, jData] = await Promise.all([
          resumeService.listResumes(),
          jobService.searchJobs({ limit: 50 }),
        ]);
        setResumes(rList);
        setJobs(jData.items);

        if (rList.length > 0 && jData.items.length > 0) {
          const rId = rList[0].id;
          const jId = jData.items[0].id;
          setSelectedResumeId(rId);
          setSelectedJobId(jId);
          fetchGap(rId, jId);
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

  const fetchGap = async (resumeId: number, jobId: number) => {
    setAnalyzing(true);
    try {
      const res = await jobService.getSkillGap(resumeId, jobId);
      setGapData(res);
    } catch (e) {
      showToast('Failed to calculate skill gap.', 'error');
    } finally {
      setAnalyzing(false);
      setLoading(false);
    }
  };

  const handleRunAnalysis = () => {
    if (selectedResumeId && selectedJobId) {
      fetchGap(selectedResumeId, selectedJobId);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl w-1/3" />
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 mb-2">
          <Target className="w-3.5 h-3.5" /> Competitive Skills Calibration
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Skill Gap Analysis & Roadmap
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Compare your extracted candidate profile against any target role to discover missing competencies and prioritized learning paths.
        </p>
      </div>

      {/* Target Selector Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Candidate Resume
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
              Target Job Specification
            </label>
            <select
              value={selectedJobId || ''}
              onChange={(e) => setSelectedJobId(parseInt(e.target.value, 10))}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} — {j.company} ({j.experience_required} Yrs)
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRunAnalysis}
          disabled={analyzing}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Target className="w-4 h-4" /> Evaluate Skill Gap
        </button>
      </div>

      {/* Gap Analysis Output */}
      {gapData && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-white/10 text-indigo-200">
                Target Alignment
              </span>
              <h3 className="text-xl font-bold mt-1">
                {gapData.job_title} @ {gapData.company}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                You meet {gapData.skills_you_have.length} of {gapData.skills_you_have.length + gapData.skills_you_need.length} verified requirements.
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-emerald-400">{gapData.match_percentage}%</div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase">Skills Overlap Match</div>
            </div>
          </div>

          {/* Side by side columns: You Have vs You Need */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills You Have */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <h4 className="text-sm font-bold uppercase tracking-wider">
                  Skills You Have ({gapData.skills_you_have.length})
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {gapData.skills_you_have.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Skills You Need */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-5 h-5" />
                <h4 className="text-sm font-bold uppercase tracking-wider">
                  Skills You Need ({gapData.skills_you_need.length})
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {gapData.skills_you_need.length > 0 ? (
                  gapData.skills_you_need.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                    >
                      ⚠ {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">
                    Zero missing skills! You possess 100% of required competencies.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Recommended Learning Path */}
          {gapData.learning_path.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Prioritized Learning Roadmap
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gapData.learning_path.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-bold text-sm text-slate-900 dark:text-white">{item.skill}</h5>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${item.priority === "High" ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300" : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"}`}
                        >
                          {item.priority} Priority
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                        {item.reason}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Est. {item.estimated_weeks} Weeks
                      </span>
                    </div>
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
