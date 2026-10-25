import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Files,
  FileText,
  UploadCloud,
  Trash2,
  GitCompare,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  Award,
  Loader2,
} from 'lucide-react';
import { resumeService } from '../services/resumeService';
import { ResumeItem } from '../types';
import { useToast } from '../context/ToastContext';

export const MyResumesPage: React.FC = () => {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchResumes = async () => {
    try {
      const list = await resumeService.listResumes();
      setResumes(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this resume and its analysis?')) return;
    setDeletingId(id);
    try {
      await resumeService.deleteResume(id);
      showToast('Resume deleted successfully', 'success');
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      showToast('Failed to delete resume', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            My Uploaded Resumes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage stored resumes, review individual analysis scores, or launch comparison.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {resumes.length >= 2 && (
            <Link
              to="/compare"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
            >
              <GitCompare className="w-4 h-4 text-blue-600" /> Compare Resumes
            </Link>
          )}
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
          >
            <UploadCloud className="w-4 h-4" /> Upload New Resume
          </Link>
        </div>
      </div>

      {resumes.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Files className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No resumes uploaded yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Upload your first resume in PDF or DOCX format to receive an automated ATS report and job matches.
          </p>
          <Link
            to="/upload"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md"
          >
            Upload Resume
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {resume.overall_score || 0} / 100
                    </span>
                    <div className="text-[10px] font-semibold text-slate-400 mt-0.5">ATS: {resume.ats_score || 0}%</div>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {resume.filename}
                </h3>
                
                <div className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Uploaded {new Date(resume.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{resume.skills_count || 0} Skills Detected</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => handleDelete(resume.id)}
                  disabled={deletingId === resume.id}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  title="Delete Resume"
                >
                  {deletingId === resume.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>

                <Link
                  to={`/resume-analysis?id=${resume.id}`}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  View Report <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
