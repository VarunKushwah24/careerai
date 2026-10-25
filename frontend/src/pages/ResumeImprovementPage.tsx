import React, { useEffect, useState } from 'react';
import {
  Lightbulb,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileCheck,
  CheckSquare,
  Square,
} from 'lucide-react';
import { resumeService } from '../services/resumeService';
import { ResumeItem, ResumeAnalysis, SuggestionItem } from '../types';
import { useToast } from '../context/ToastContext';

export const ResumeImprovementPage: React.FC = () => {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const list = await resumeService.listResumes();
        setResumes(list);
        if (list.length > 0) {
          const rId = list[0].id;
          setSelectedResumeId(rId);
          loadAnalysis(rId);
        } else {
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
      }
    };
    fetchResumes();
  }, []);

  const loadAnalysis = async (id: number) => {
    setLoading(true);
    try {
      const data = await resumeService.getResumeAnalysis(id);
      setAnalysis(data);
    } catch (e) {
      showToast('Failed to load suggestions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeChange = (newId: number) => {
    setSelectedResumeId(newId);
    loadAnalysis(newId);
  };

  const toggleCheck = (key: string) => {
    setCompletedItems((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      if (updated[key]) {
        showToast('Item checked as completed!', 'success');
      }
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl w-1/3" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  const suggestions: SuggestionItem[] = analysis?.suggestions || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 mb-2">
            <Lightbulb className="w-3.5 h-3.5" /> Actionable Profile Coaching
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Resume Improvement Checklist
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Systematically resolve detected flaws to boost your ATS compatibility score and recruiter callback rate.
          </p>
        </div>

        {resumes.length > 1 && (
          <select
            value={selectedResumeId || ''}
            onChange={(e) => handleResumeChange(parseInt(e.target.value, 10))}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100"
          >
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.filename} ({r.overall_score || 0} pts)
              </option>
            ))}
          </select>
        )}
      </div>

      {suggestions.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Flawless Profile Structure!</h3>
          <p className="text-xs text-slate-500 mt-1">
            Your resume satisfies all primary ATS guidelines, contact verifications, and impact metrics.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((item, idx) => {
            const key = `sug_${idx}`;
            const isCompleted = !!completedItems[key];

            return (
              <div
                key={idx}
                className={`p-6 rounded-3xl border transition-all ${isCompleted ? "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <button
                      type="button"
                      onClick={() => toggleCheck(key)}
                      className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors shrink-0"
                    >
                      {isCompleted ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          {item.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${item.priority === "High" ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300" : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"}`}
                        >
                          {item.priority} Priority
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.problem}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                        💡 <span className="font-semibold text-slate-700 dark:text-slate-300">Solution:</span> {item.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
