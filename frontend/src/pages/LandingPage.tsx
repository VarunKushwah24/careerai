import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileSearch,
  Target,
  BarChart3,
  ShieldCheck,
  Zap,
  TrendingUp,
  Cpu,
  Upload,
  Layers,
  Award,
  ChevronRight,
  Briefcase,
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { jobService } from '../services/jobService';

export const LandingPage: React.FC = () => {
  const [stats, setStats] = useState({
    jobsCount: 32,
    skillsIdentified: 640,
    avgScore: 84.5,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const jobsData = await jobService.searchJobs({ limit: 1 });
        if (jobsData?.total) {
          setStats((prev) => ({ ...prev, jobsCount: jobsData.total }));
        }
      } catch (e) {
        // Fallback default stats
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 mb-8 animate-fade-in shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Next-Generation AI Resume Screening & Recommendation System</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.12]">
            Turn Your Resume Into Your{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent">
              Career Advantage
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Harness modern Natural Language Processing and TF-IDF vector matching to uncover hidden ATS flaws, analyze your skill gaps, and match with the top roles in tech.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/upload"
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              Analyze My Resume <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              Sign In to Account
            </Link>
            <Link
              to="/jobs"
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              Explore 30+ Jobs <Briefcase className="w-4 h-4" />
            </Link>
          </div>

          {/* Live Product Preview Interactive Card */}
          <div className="mt-16 max-w-5xl mx-auto p-3 sm:p-4 rounded-3xl bg-gradient-to-b from-slate-200/60 to-slate-100/30 dark:from-slate-800/60 dark:to-slate-900/30 border border-slate-200/80 dark:border-slate-800 shadow-2xl backdrop-blur-xl">
            <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 sm:p-8 border border-slate-200 dark:border-slate-800 text-left">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Live Analysis Demonstration
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    Alex Johnson — Senior Full Stack & ML Engineer
                  </h3>
                  <p className="text-xs text-slate-500">Analyzed via CareerAI NLP Engine v2.0 • 4.2 Yrs Experience</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-black text-blue-600 dark:text-blue-400">91 / 100</div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase">ATS Compatibility</div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    94%
                  </div>
                </div>
              </div>

              {/* Sample Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Skills Detected</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">24 Verified</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Python, React, Docker +21</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Matching Tech Roles</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">18 Openings</div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Top: ML Engineer (94%)</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Skill Gap Priority</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">2 Recommended</div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Kubernetes, Kafka</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Quantified Impact</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">Strong (6 metrics)</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Latencies, throughput</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Statistics Section */}
      <section id="stats" className="py-14 bg-slate-50/70 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400">
                {stats.jobsCount}+
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-400">
                Curated Tech Jobs Seeded
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {stats.skillsIdentified}+
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-400">
                Skills in NLP Taxonomy
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {stats.avgScore}%
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-400">
                Average Resume ATS Match
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-500">
                0.2s
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-400">
                Real-Time Inference Speed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-full">
            Powerful Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-4">
            Engineered Like an Enterprise Talent Engine
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-base sm:text-lg">
            We replaced simplistic keyword lookups with multi-gram entity extraction, TF-IDF cosine similarity, and structured ATS rubric scoring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: FileSearch,
              title: 'AI Resume Analysis',
              desc: 'Parses PDF & DOCX text, normalizes character encoding, and accurately segments education, experience, and projects.',
              color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/60',
            },
            {
              icon: Target,
              title: 'Smart Job Matching',
              desc: 'Vectorizes resumes and job descriptions using TF-IDF and computes high-dimensional Cosine Similarity plus skill overlap.',
              color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60',
            },
            {
              icon: Layers,
              title: 'Skill Gap Detection',
              desc: 'Pinpoints critical missing skills for your dream roles and generates prioritized study timelines with realistic effort weeks.',
              color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60',
            },
            {
              icon: Award,
              title: 'Objective ATS Score (0-100)',
              desc: 'Evaluates your resume against 7 distinct metrics: Formatting, Contact Info, Keywords, Impact Verbs, and Experience Depth.',
              color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60',
            },
            {
              icon: Zap,
              title: 'Actionable Suggestions',
              desc: 'Provides structured recommendations categorized by Summary, Experience, Skills, and Projects with clear Priority levels.',
              color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/60',
            },
            {
              icon: TrendingUp,
              title: 'Resume Version Compare',
              desc: 'Upload multiple resume iterations and view side-by-side score diffs and keyword expansions to measure improvement.',
              color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/60',
            },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-xl transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.color} mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-2.5 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-full">
              5-Step Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-4">
              How CareerAI Transforms Your Search
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { step: '01', title: 'Upload Resume', desc: 'Drag-and-drop your PDF or DOCX file with instant validation.' },
              { step: '02', title: 'NLP Extraction', desc: 'Entities, skills, contact links, and experience are extracted.' },
              { step: '03', title: 'ATS Scoring', desc: 'Get your 100-point rating, keyword assessment, and warnings.' },
              { step: '04', title: 'Neural Matching', desc: 'Matches with 30+ jobs with detailed matching & missing skills.' },
              { step: '05', title: 'Bridge Skill Gap', desc: 'Follow personalized study paths and apply with confidence.' },
            ].map((item, index) => (
              <div
                key={index}
                className="relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <span className="text-3xl font-black text-blue-600/30 dark:text-blue-400/30 block mb-2">
                    {item.step}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Matching Algorithm Formula Section */}
      <section id="matching-engine" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-4">
              <Cpu className="w-3.5 h-3.5" /> Transparent Multi-Factor AI Rubric
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              How the Recommendation Formula Calculates Job Fit
            </h2>
            <p className="mt-3 text-slate-300 text-sm sm:text-base">
              Unlike black-box systems, CareerAI combines vector embeddings, lexical TF-IDF, and candidate qualification rules:
            </p>

            <div className="mt-8 p-4 rounded-xl bg-slate-800/80 border border-slate-700 font-mono text-xs sm:text-sm text-blue-300 leading-relaxed overflow-x-auto">
              Final Score = (0.40 × Skills Overlap) + (0.25 × TF-IDF Cosine Similarity) + (0.15 × Experience Ratio) + (0.10 × Education Match) + (0.10 × Domain Keywords)
            </div>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-xl font-extrabold text-blue-400">40%</div>
                <div className="text-[11px] text-slate-300 mt-0.5">Skills Jaccard</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-xl font-extrabold text-indigo-400">25%</div>
                <div className="text-[11px] text-slate-300 mt-0.5">TF-IDF Similarity</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-xl font-extrabold text-emerald-400">15%</div>
                <div className="text-[11px] text-slate-300 mt-0.5">Years of Exp</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-xl font-extrabold text-amber-400">10%</div>
                <div className="text-[11px] text-slate-300 mt-0.5">Education Match</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-xl font-extrabold text-purple-400">10%</div>
                <div className="text-[11px] text-slate-300 mt-0.5">Keyword Density</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center max-w-4xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Ready to find your best career opportunities?
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
          Upload your resume now to receive an instant ATS score, explore matching job openings, and bridge your skill gaps.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/upload"
            className="px-8 py-4 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-xl shadow-blue-600/25 transition-all flex items-center gap-2"
          >
            Upload Resume Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-10 bg-slate-50 dark:bg-slate-950 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-700 dark:text-slate-300">CareerAI Platform</span>
            <span>• Full-Stack AIML College Project</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Python 3.14 • FastAPI • Scikit-learn • React • Tailwind</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
