import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Sun, Moon, UploadCloud, User as UserIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle Menu"
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            AI Career Suite
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
            Resume Parsing, ATS Evaluation & Neural Matching
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Upload CTA */}
        <Link
          to="/upload"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/80 border border-blue-200 dark:border-blue-800 transition-colors"
        >
          <UploadCloud className="w-3.5 h-3.5" /> Upload Resume
        </Link>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Profile Link */}
        <Link
          to="/profile"
          className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 transition-colors"
        >
          <span className="hidden md:inline text-xs font-semibold text-slate-700 dark:text-slate-200">
            {user?.full_name?.split(' ')[0] || 'Account'}
          </span>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
            {user?.full_name?.charAt(0) || <UserIcon className="w-3.5 h-3.5" />}
          </div>
        </Link>
      </div>
    </header>
  );
};
