import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiSearch, FiCommand } from 'react-icons/fi';
import useAuthStore from '../../stores/useAuthStore';

const pageTitles = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Project overview and statistics' },
  '/team': { title: 'Team', subtitle: 'Manage your team members' },
  '/chat': { title: 'Chat', subtitle: 'Team communication' },
  '/tasks': { title: 'Tasks', subtitle: 'Kanban task board' },
  '/repository': { title: 'Repository', subtitle: 'Project files and documentation' },
  '/calendar': { title: 'Calendar', subtitle: 'Schedule and deadlines' },
  '/notifications': { title: 'Notifications', subtitle: 'Activity and updates' },
  '/profile': { title: 'Profile', subtitle: 'Your account settings' },
  '/supervisor': { title: 'Supervisor', subtitle: 'Supervisor dashboard' },
};

export default function TopBar({ onMenuClick }) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);

  const currentPage = pageTitles[location.pathname] || { title: 'Planify', subtitle: 'Graduation Projects' };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 px-4 md:px-6 py-3 bg-white/70 dark:bg-surface-dark/70 backdrop-blur-xl border-b border-dark-100 dark:border-dark-800/60">
      <button
        onClick={onMenuClick}
        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl text-dark-500 hover:bg-dark-100 dark:hover:bg-dark-800/50 hover:text-dark-700 dark:hover:text-dark-200 transition-all"
      >
        <FiMenu className="w-[18px] h-[18px]" />
      </button>

      <div className="flex-1 min-w-0">
        <motion.h2
          key={location.pathname}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-semibold text-dark-900 dark:text-dark-100 truncate"
        >
          {currentPage.title}
        </motion.h2>
        <p className="text-sm text-dark-500 dark:text-dark-400 truncate">
          {user?.isSupervisor ? 'Supervisor Dashboard' : currentPage.subtitle}
        </p>
      </div>

      <div className="relative hidden md:block">
        <button
          onClick={() => {
            setSearchOpen(true);
            setTimeout(() => searchRef.current?.focus(), 100);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-50 dark:bg-dark-800/50 border border-dark-100 dark:border-dark-700/50 text-sm text-dark-400 hover:text-dark-600 dark:hover:text-dark-300 hover:border-dark-200 dark:hover:border-dark-600 transition-all w-64"
        >
          <FiSearch className="w-4 h-4" />
          <span>Search anything...</span>
          <div className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded bg-dark-100 dark:bg-dark-700 text-[10px] font-medium text-dark-500 dark:text-dark-400">
            <FiCommand className="w-3 h-3" />K
          </div>
        </button>

        <AnimatePresence>
          {searchOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg"
              >
                <div className="card p-2 shadow-2xl shadow-black/10 dark:shadow-black/30 border-dark-200 dark:border-dark-700">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <FiSearch className="w-5 h-5 text-dark-400" />
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search pages, tasks, files..."
                      className="flex-1 bg-transparent border-0 outline-none text-sm text-dark-900 dark:text-dark-100 placeholder-dark-400"
                    />
                    <button
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="px-2 py-1 rounded text-[11px] font-medium bg-dark-100 dark:bg-dark-700 text-dark-500 dark:text-dark-400"
                    >
                      ESC
                    </button>
                  </div>
                  <div className="border-t border-dark-100 dark:border-dark-700/50 mt-1 pt-1 px-1">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-dark-400">
                      <FiSearch className="w-4 h-4" />
                      <span>Search across the workspace...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}