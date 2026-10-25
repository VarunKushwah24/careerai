import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Users,
  Files,
  FileSearch,
  Briefcase,
  Award,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { jobService } from '../services/jobService';
import { Job, User } from '../types';
import { useToast } from '../context/ToastContext';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Job Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    location: 'Remote',
    description: '',
    required_skills: 'python, react, docker',
    experience_required: 3,
    salary_range: '\,000 - \,000',
    job_type: 'Full-time',
    remote_status: 'Remote',
  });
  const [savingJob, setSavingJob] = useState(false);

  const { showToast } = useToast();

  const loadAdminData = async () => {
    try {
      const [adminStats, jobsData, usersList] = await Promise.all([
        jobService.getAdminStats(),
        jobService.searchJobs({ limit: 50 }),
        jobService.getAllUsers(),
      ]);
      setStats(adminStats);
      setJobs(jobsData.items);
      setUsers(usersList);
    } catch (err) {
      console.error(err);
      showToast('Failed to load admin console data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const openCreateModal = () => {
    setEditingJobId(null);
    setJobForm({
      title: '',
      company: '',
      location: 'Remote',
      description: '',
      required_skills: 'python, fastapi, docker',
      experience_required: 2,
      salary_range: '\,000 - \,000',
      job_type: 'Full-time',
      remote_status: 'Remote',
    });
    setModalOpen(true);
  };

  const openEditModal = (job: Job) => {
    setEditingJobId(job.id);
    setJobForm({
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      required_skills: job.required_skills.join(', '),
      experience_required: job.experience_required,
      salary_range: job.salary_range || '',
      job_type: job.job_type,
      remote_status: job.remote_status,
    });
    setModalOpen(true);
  };

  const handleDeleteJob = async (id: number) => {
    if (!window.confirm('Delete this job posting permanently?')) return;
    try {
      await jobService.deleteJob(id);
      showToast('Job listing removed successfully.', 'success');
      setJobs((prev) => prev.filter((j) => j.id !== id));
      if (stats) setStats({ ...stats, total_jobs: stats.total_jobs - 1 });
    } catch (e) {
      showToast('Failed to delete job.', 'error');
    }
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingJob(true);
    const skillsArray = jobForm.required_skills.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

    const payload = {
      ...jobForm,
      required_skills: skillsArray,
      experience_required: Number(jobForm.experience_required),
    };

    try {
      if (editingJobId) {
        const updated = await jobService.updateJob(editingJobId, payload);
        setJobs((prev) => prev.map((j) => (j.id === editingJobId ? updated : j)));
        showToast('Job updated successfully!', 'success');
      } else {
        const created = await jobService.createJob(payload);
        setJobs((prev) => [created, ...prev]);
        if (stats) setStats({ ...stats, total_jobs: stats.total_jobs + 1 });
        showToast('New job successfully posted!', 'success');
      }
      setModalOpen(false);
    } catch (e) {
      showToast('Failed to save job.', 'error');
    } finally {
      setSavingJob(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Root Admin Console
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Platform Operations & Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Overview of total user accounts, uploaded resumes, ATS scores, and active job postings.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Post New Job
        </button>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Users</p>
          <div className="text-2xl font-black text-blue-600 mt-1">{stats?.total_users || 0}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Resumes</p>
          <div className="text-2xl font-black text-indigo-600 mt-1">{stats?.total_resumes || 0}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Analyses</p>
          <div className="text-2xl font-black text-purple-600 mt-1">{stats?.total_analyses || 0}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Jobs</p>
          <div className="text-2xl font-black text-emerald-600 mt-1">{stats?.total_jobs || 0}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Score</p>
          <div className="text-2xl font-black text-amber-500 mt-1">{stats?.average_resume_score || 0}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg ATS</p>
          <div className="text-2xl font-black text-teal-500 mt-1">{stats?.average_ats_score || 0}%</div>
        </div>
      </div>

      {/* Jobs CRUD Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Job Postings Management ({jobs.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-bold text-[10px] text-slate-400">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Company</th>
                <th className="p-3">Location</th>
                <th className="p-3">Experience</th>
                <th className="p-3">Salary</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {jobs.map((j) => (
                <tr key={j.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{j.title}</td>
                  <td className="p-3 font-semibold text-slate-600 dark:text-slate-300">{j.company}</td>
                  <td className="p-3">{j.location} ({j.remote_status})</td>
                  <td className="p-3">{j.experience_required} Yrs</td>
                  <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">{j.salary_range || 'N/A'}</td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(j)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteJob(j.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Overview Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Platform Registered Users ({users.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-bold text-[10px] text-slate-400">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Target Goal</th>
                <th className="p-3">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{u.full_name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">{u.target_role || 'Not specified'}</td>
                  <td className="p-3 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Job Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingJobId ? 'Edit Job Opening' : 'Post New Tech Role'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    placeholder="Senior ML Engineer"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Company</label>
                  <input
                    type="text"
                    required
                    value={jobForm.company}
                    onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                    placeholder="Nexus Technologies"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Workplace</label>
                  <select
                    value={jobForm.remote_status}
                    onChange={(e) => setJobForm({ ...jobForm, remote_status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Exp Req (Yrs)</label>
                  <input
                    type="number"
                    min="0"
                    value={jobForm.experience_required}
                    onChange={(e) => setJobForm({ ...jobForm, experience_required: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Salary Range</label>
                <input
                  type="text"
                  value={jobForm.salary_range}
                  onChange={(e) => setJobForm({ ...jobForm, salary_range: e.target.value })}
                  placeholder="\,000 - \,000"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Required Skills (Comma separated)
                </label>
                <input
                  type="text"
                  required
                  value={jobForm.required_skills}
                  onChange={(e) => setJobForm({ ...jobForm, required_skills: e.target.value })}
                  placeholder="python, pytorch, docker, aws, sql"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Job Description</label>
                <textarea
                  rows={4}
                  required
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  placeholder="Describe the core responsibilities, team culture, and technical deliverables..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingJob}
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md disabled:opacity-50"
                >
                  {savingJob ? 'Saving...' : 'Save Job Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
