import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  FileSearch,
  Sparkles,
  Target,
  Briefcase,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PieChart as PieIcon,
  Layers,
  Award,
  ChevronRight,
  Plus,
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/jobService';
import { DashboardStats } from '../types';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await jobService.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const hasResume = stats?.has_resume;
  const score = stats?.resume_score || 0;
  const atsScore = stats?.ats_score || 0;

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-600/15 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md inline-block mb-2">
            {hasResume ? 'Active Resume Analyzed' : 'Get Started with CareerAI'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Candidate'}!
          </h1>
          <p className="mt-1 text-sm text-blue-100 max-w-xl">
            {hasResume
              ? `Your latest resume scored ${score}/100. We discovered ${stats?.jobs_matched || 0} matching tech job opportunities based on your skills.`
              : 'Upload your resume to calculate your ATS score, discover missing skills, and match with verified job openings.'}
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm shadow-md transition-all hover:scale-105"
          >
            <UploadCloud className="w-4 h-4" />
            {hasResume ? 'Upload New Version' : 'Upload First Resume'}
          </Link>
        </div>
      </div>

      {/* Quick Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Resume Score */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Resume Score
            </p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {hasResume ? score : '--'}
              </span>
              <span className="text-xs text-slate-400 font-semibold">/ 100</span>
            </div>
            <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> ATS Compatibility: {hasResume ? `${atsScore}%` : '--'}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
            <Award className="w-7 h-7" />
          </div>
        </div>

        {/* Card 2: Jobs Matched */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Jobs Matched
            </p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {hasResume ? stats?.jobs_matched : '--'}
              </span>
              <span className="text-xs text-slate-400 font-semibold">roles ≥ 60%</span>
            </div>
            <Link
              to="/recommendations"
              className="text-[11px] font-medium text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1 hover:underline"
            >
              View recommendations <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
            <Briefcase className="w-7 h-7" />
          </div>
        </div>

        {/* Card 3: Skills Detected */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Skills Detected
            </p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {hasResume ? stats?.skills_count : '--'}
              </span>
              <span className="text-xs text-slate-400 font-semibold">taxonomies</span>
            </div>
            <Link
              to="/resume-analysis"
              className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1 hover:underline"
            >
              Explore skills breakdown <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
            <Layers className="w-7 h-7" />
          </div>
        </div>

        {/* Card 4: Missing Skills */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Missing Skills
            </p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-black text-amber-500">
                {hasResume ? stats?.missing_skills_count : '--'}
              </span>
              <span className="text-xs text-slate-400 font-semibold">target gaps</span>
            </div>
            <Link
              to="/skill-gap"
              className="text-[11px] font-medium text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1 hover:underline"
            >
              Bridge your gaps <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center font-bold text-lg">
            <Target className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score History Chart (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Resume Score History
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track score evolution across uploaded resume iterations
              </p>
            </div>
            {hasResume && (
              <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-lg">
                Best: {stats?.best_score}/100
              </span>
            )}
          </div>

          {stats?.score_history && stats.score_history.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.score_history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Bar dataKey="score" name="Overall Score" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="ats" name="ATS Compatibility" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-center">
              <BarChart3 className="w-10 h-10 mb-2 stroke-[1.5]" />
              <p className="text-sm font-medium">No score history available yet.</p>
              <p className="text-xs text-slate-400 mt-1">Upload your first resume to populate history.</p>
            </div>
          )}
        </div>

        {/* Skill Category Distribution Donut */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Skill Taxonomy Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Distribution across technical, soft & tools
          </p>

          {stats?.skill_distribution && stats.skill_distribution.some((d) => d.value > 0) ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.skill_distribution}
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {stats.skill_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold mt-2">
                {stats.skill_distribution.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="text-slate-600 dark:text-slate-400">
                      {entry.name}: {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center py-8">
              <PieIcon className="w-10 h-10 mb-2 stroke-[1.5]" />
              <p className="text-sm font-medium">No skills identified yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Recommended Jobs Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Top Recommended Jobs
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized matches ranked by multi-factor TF-IDF & skill overlap
            </p>
          </div>
          <Link
            to="/recommendations"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            View All ({stats?.jobs_matched || 0}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats?.top_recommended_jobs && stats.top_recommended_jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.top_recommended_jobs.map((job: any) => (
              <div
                key={job.id}
                className="p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 bg-slate-50/50 dark:bg-slate-800/30 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                      {job.title}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                      {job.match_percentage}%
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">
                    {job.company} • {job.location}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {job.matching_skills.slice(0, 3).map((s: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60"
                      >
                        ✓ {s}
                      </span>
                    ))}
                    {job.missing_skills.length > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                        +{job.missing_skills.length} missing
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">{job.job_type}</span>
                  <Link
                    to="/jobs"
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    View Job <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium">No job recommendations calculated yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              Upload your resume above to discover matching positions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
