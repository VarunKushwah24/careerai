import React, { useEffect, useState } from 'react';
import {
  Search,
  Briefcase,
  MapPin,
  Bookmark,
  BookmarkCheck,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Globe,
  Radio,
  Building2,
  TrendingUp,
} from 'lucide-react';
import { jobService } from '../services/jobService';
import { resumeService } from '../services/resumeService';
import { Job, ResumeItem } from '../types';
import { useToast } from '../context/ToastContext';

export const JobSearchPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [syncingIndia, setSyncingIndia] = useState(false);
  const [syncingGlobal, setSyncingGlobal] = useState(false);

  // Filters
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [remoteStatus, setRemoteStatus] = useState('All');
  const [jobType, setJobType] = useState('All');
  const [minExp, setMinExp] = useState<number | undefined>(undefined);
  const [savedOnly, setSavedOnly] = useState(false);
  const [realtimeOnly, setRealtimeOnly] = useState(false);
  const [indiaOnly, setIndiaOnly] = useState(false);

  // Resumes for applying
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);

  // Modal
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const [applyingJobId, setApplyingJobId] = useState<number | null>(null);

  const { showToast } = useToast();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      if (savedOnly) {
        const savedList = await jobService.getSavedJobs();
        setJobs(savedList);
        setTotal(savedList.length);
        setPages(1);
      } else {
        const data = await jobService.searchJobs({
          q: query || undefined,
          location: location || undefined,
          remote_status: remoteStatus !== 'All' ? remoteStatus : undefined,
          job_type: jobType !== 'All' ? jobType : undefined,
          min_exp: minExp,
          is_realtime: realtimeOnly ? true : undefined,
          india_only: indiaOnly ? true : undefined,
          page,
          limit: 9,
        });
        setJobs(data.items);
        setTotal(data.total);
        setPages(data.pages);
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to fetch jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, savedOnly, realtimeOnly, indiaOnly]);

  useEffect(() => {
    const fetchUserResumes = async () => {
      try {
        const list = await resumeService.listResumes();
        setResumes(list);
        if (list.length > 0) setSelectedResumeId(list[0].id);
      } catch (e) {}
    };
    fetchUserResumes();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleSyncIndiaJobs = async () => {
    setSyncingIndia(true);
    try {
      const res = await jobService.syncIndiaJobs(25);
      showToast(res.message || 'Synced live jobs from the Indian Job Market!', 'success');
      setIndiaOnly(true);
      setRealtimeOnly(false);
      setSavedOnly(false);
      setPage(1);
      fetchJobs();
    } catch (e) {
      showToast('Failed to sync Indian jobs from APIs.', 'error');
    } finally {
      setSyncingIndia(false);
    }
  };

  const handleSyncGlobalJobs = async () => {
    setSyncingGlobal(true);
    try {
      const res = await jobService.syncLiveJobs(20);
      showToast(res.message || 'Successfully fetched live global jobs!', 'success');
      setRealtimeOnly(true);
      setIndiaOnly(false);
      setSavedOnly(false);
      setPage(1);
      fetchJobs();
    } catch (e) {
      showToast('Failed to fetch global jobs from APIs.', 'error');
    } finally {
      setSyncingGlobal(false);
    }
  };

  const handleToggleSave = async (job: Job) => {
    try {
      if (job.is_saved) {
        await jobService.unsaveJob(job.id);
        showToast('Removed from saved jobs', 'info');
      } else {
        await jobService.saveJob(job.id);
        showToast('Saved to your favorites!', 'success');
      }
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, is_saved: !j.is_saved } : j))
      );
    } catch (e) {
      showToast('Failed to update bookmark', 'error');
    }
  };

  const handleApply = async (jobId: number) => {
    setApplyingJobId(jobId);
    try {
      await jobService.applyJob(jobId, selectedResumeId || undefined);
      showToast('Application successfully sent!', 'success');
      setDetailJob(null);
    } catch (e) {
      showToast('Failed to apply.', 'error');
    } finally {
      setApplyingJobId(null);
    }
  };

  const isIndiaJob = (job: Job) => {
    const loc = (job.location || '').toLowerCase();
    const src = (job.source || '').toLowerCase();
    const sal = (job.salary_range || '');
    return (
      loc.includes('india') ||
      loc.includes('bengaluru') ||
      loc.includes('bangalore') ||
      loc.includes('hyderabad') ||
      loc.includes('pune') ||
      loc.includes('mumbai') ||
      loc.includes('gurgaon') ||
      loc.includes('gurugram') ||
      loc.includes('noida') ||
      loc.includes('delhi') ||
      loc.includes('chennai') ||
      src.includes('india') ||
      sal.includes('₹') ||
      sal.includes('lpa')
    );
  };

  return (
    <div className="space-y-8">
      {/* Header with Live Sync Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold">
              🇮🇳 Indian Market API (Adzuna India • Pan-India Hub)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse" /> Live Real-Time Feed (Remotive • Arbeitnow)
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Explore Job Openings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Search verified tech openings, sync live Indian corporate & startup jobs, or explore global remote roles.
          </p>
        </div>

        {/* Sync Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSyncIndiaJobs}
            disabled={syncingIndia}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-800 text-white font-bold text-xs shadow-md shadow-amber-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingIndia ? 'animate-spin' : ''}`} />
            {syncingIndia ? 'Syncing India Jobs...' : 'Sync India Jobs 🇮🇳'}
          </button>

          <button
            type="button"
            onClick={handleSyncGlobalJobs}
            disabled={syncingGlobal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingGlobal ? 'animate-spin' : ''}`} />
            {syncingGlobal ? 'Syncing Global...' : 'Sync Global Web 🌐'}
          </button>
        </div>
      </div>

      {/* Search & Filter Form */}
      <form onSubmit={handleSearchSubmit} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Query */}
          <div className="sm:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Title, skills, company (Python, React, Flipkart, Swiggy, TCS)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Location */}
          <div className="sm:col-span-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or Region (Bengaluru, Pune, Hyderabad, Remote)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Search Button */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
            >
              Search Jobs
            </button>
          </div>
        </div>

        {/* Filter Badges & Dropdowns */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Workplace */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500">Workplace:</span>
              <select
                value={remoteStatus}
                onChange={(e) => setRemoteStatus(e.target.value)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300"
              >
                <option value="All">All</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            {/* Job Type */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500">Type:</span>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300"
              >
                <option value="All">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          {/* Toggles: India Market, Global Real-time & Saved */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIndiaOnly(!indiaOnly);
                if (realtimeOnly) setRealtimeOnly(false);
                if (savedOnly) setSavedOnly(false);
                setPage(1);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                indiaOnly
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
              }`}
            >
              <span>🇮🇳</span>
              {indiaOnly ? 'Showing India Market (All Types)' : 'Filter Indian Jobs 🇮🇳'}
            </button>

            <button
              type="button"
              onClick={() => {
                setRealtimeOnly(!realtimeOnly);
                if (indiaOnly) setIndiaOnly(false);
                if (savedOnly) setSavedOnly(false);
                setPage(1);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                realtimeOnly
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              {realtimeOnly ? 'Showing Live Web' : 'Filter Live Web'}
            </button>

            <button
              type="button"
              onClick={() => {
                setSavedOnly(!savedOnly);
                if (realtimeOnly) setRealtimeOnly(false);
                if (indiaOnly) setIndiaOnly(false);
                setPage(1);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                savedOnly
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              {savedOnly ? 'Showing Saved' : 'Saved'}
            </button>
          </div>
        </div>
      </form>

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-60 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No matching openings found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Try adjusting your search criteria, or click below to pull fresh real-time openings directly from the web or Indian job market.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleSyncIndiaJobs}
              disabled={syncingIndia}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-md hover:bg-amber-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingIndia ? 'animate-spin' : ''}`} />
              Sync India Job Market 🇮🇳
            </button>
            <button
              type="button"
              onClick={handleSyncGlobalJobs}
              disabled={syncingGlobal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingGlobal ? 'animate-spin' : ''}`} />
              Sync Global Openings 🌐
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => {
            const indian = isIndiaJob(job);
            return (
              <div
                key={job.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-500/50 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Source & Status Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {indian ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80">
                        <span>🇮🇳</span> India • {job.source?.split('(')[0] || 'Market'}
                      </span>
                    ) : job.is_realtime ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live • {job.source?.split('(')[0] || 'Web'}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500">
                        Curated
                      </span>
                    )}

                    <div className="flex items-center gap-1">
                      {job.external_url && (
                        <a
                          href={job.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                          title="Open original job posting"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleToggleSave(job)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          job.is_saved
                            ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 text-blue-600'
                            : 'border-slate-200 dark:border-slate-700 text-slate-400'
                        }`}
                        title={job.is_saved ? 'Unsave' : 'Save'}
                      >
                        {job.is_saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5 mb-2 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{job.company}</span>
                    <span>•</span>
                    <span className="truncate">{job.location}</span>
                  </p>

                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-3">
                    <span>{job.job_type}</span>
                    <span>•</span>
                    <span>{job.remote_status}</span>
                    <span>•</span>
                    <span>{job.experience_required} Yrs Req</span>
                  </div>

                  {job.salary_range && (
                    <p className={`text-xs font-black mb-3 ${indian ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>
                      {job.salary_range}
                    </p>
                  )}

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {job.required_skills.slice(0, 4).map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {s}
                      </span>
                    ))}
                    {job.required_skills.length > 4 && (
                      <span className="text-[10px] text-slate-400 self-center font-medium">
                        +{job.required_skills.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs gap-2">
                  <button
                    type="button"
                    onClick={() => setDetailJob(job)}
                    className="font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    View Details
                  </button>

                  <div className="flex items-center gap-2">
                    {job.external_url ? (
                      <a
                        href={job.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-3 py-1.5 rounded-xl text-white font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                          indian
                            ? 'bg-amber-600 hover:bg-amber-700'
                            : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                      >
                        Apply on Site <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApply(job.id)}
                        disabled={applyingJobId === job.id}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" /> Apply
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!savedOnly && pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
            Page {page} of {pages} ({total} Total Openings)
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Job Details Modal */}
      {detailJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                {isIndiaJob(detailJob) ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 mb-2">
                    <span>🇮🇳</span> Indian Job Hub • {detailJob.source || 'Pan-India'}
                  </span>
                ) : detailJob.is_realtime ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Web Opening • {detailJob.source || 'Remotive'}
                  </span>
                ) : null}
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {detailJob.title}
                </h3>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                  {detailJob.company} • {detailJob.location}
                </p>
              </div>
              <button
                onClick={() => setDetailJob(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {detailJob.job_type}
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {detailJob.remote_status}
              </span>
              <span className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold">
                {detailJob.salary_range || 'Competitive'}
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {detailJob.experience_required} Yrs Experience
              </span>
            </div>

            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                Required Technical & Soft Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {detailJob.required_skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                Role Description & Responsibilities
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                {detailJob.description}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              {detailJob.external_url ? (
                <a
                  href={detailJob.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                >
                  Apply on Employer Portal <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => handleApply(detailJob.id)}
                  disabled={applyingJobId === detailJob.id}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" /> Quick Apply with Active Resume
                </button>
              )}

              <button
                type="button"
                onClick={() => setDetailJob(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
