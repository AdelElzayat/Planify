import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import useAuthStore from '../../stores/useAuthStore';
import getAvatarUrl from '../../utils/getAvatarUrl';
import Logo from './Logo';
import {
  FiGrid, FiMessageSquare, FiCheckSquare, FiFolder,
  FiCalendar, FiUsers, FiBarChart2, FiBell, FiLogOut,
  FiChevronLeft, FiChevronRight, FiMoon, FiSun, FiUser,
  FiLayout, FiMenu
} from 'react-icons/fi';

const navItems = [
  { to: '/dashboard', icon: FiGrid, label: 'Dashboard' },
  { to: '/team', icon: FiUsers, label: 'Team' },
  { to: '/chat', icon: FiMessageSquare, label: 'Chat' },
  { to: '/tasks', icon: FiCheckSquare, label: 'Tasks' },
  { to: '/repository', icon: FiFolder, label: 'Repository' },
  { to: '/calendar', icon: FiCalendar, label: 'Calendar' },
  { to: '/notifications', icon: FiBell, label: 'Notifications' },
];

const bottomItems = [
  { to: '/profile', icon: FiUser, label: 'Profile' },
  { to: '/supervisor', icon: FiBarChart2, label: 'Supervisor' },
];

export default function Sidebar({ open, onClose }) {
  const { isDark, toggleTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const sidebarWidth = collapsed ? 'w-20' : 'w-64';

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          ${sidebarWidth}
          bg-surface dark:bg-surface-dark
          border-r border-dark-100 dark:border-dark-800/60
          flex flex-col
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform duration-200 ease-out
        `}
      >
        {/* Logo Section */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-4 h-16 border-b border-dark-100 dark:border-dark-800/60`}>
          {collapsed ? (
            <Logo size="sm" showText={false} animated />
          ) : (
            <Logo size="sm" animated />
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800/50 hover:text-dark-600 dark:hover:text-dark-200 transition-colors duration-150"
          >
            {collapsed ? <FiChevronRight className="w-4 h-4" /> : <FiChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`
                  group relative flex items-center ${collapsed ? 'justify-center' : 'gap-3'}
                  ${collapsed ? 'w-12 h-12' : 'px-4 py-2.5'}
                  rounded-xl text-sm font-medium
                  transition-colors duration-150
                  ${active
                   ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 shadow-sm shadow-primary-500/5'
                    : 'text-dark-600 dark:text-dark-400 hover:bg-dark-50 dark:hover:bg-dark-800/30 hover:text-dark-900 dark:hover:text-dark-100'
                  }
                `}
              >
                  {active && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl bg-primary-500/10 dark:bg-primary-500/10"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                <div className="relative z-10 flex items-center gap-3">
                  <div className={`
                    flex items-center justify-center w-5 h-5
                    ${active ? 'text-primary-600 dark:text-primary-400' : 'text-dark-400 group-hover:text-dark-600 dark:group-hover:text-dark-300'}
                    transition-colors duration-150
                  `}>
                    <item.icon className="w-[18px] h-[18px]" />
                  </div>
                  {!collapsed && (
                    <span className="relative z-10">{item.label}</span>
                  )}
                  {active && !collapsed && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute -left-4 w-1 h-5 rounded-full bg-primary-500"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </div>
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg bg-dark-900 dark:bg-dark-700 text-white text-xs whitespace-nowrap shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 pointer-events-none z-50">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-dark-100 dark:border-dark-800/60 p-3 space-y-1">
          {/* Profile */}
          <NavLink
            to="/profile"
            onClick={onClose}
            className={`
              group relative flex items-center ${collapsed ? 'justify-center' : 'gap-3'}
              ${collapsed ? 'w-12 h-12 mx-auto' : 'px-4 py-2.5'}
              rounded-xl text-sm font-medium
              transition-colors duration-150
              ${isActive('/profile')
                ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300'
                : 'text-dark-600 dark:text-dark-400 hover:bg-dark-50 dark:hover:bg-dark-800/30 hover:text-dark-900 dark:hover:text-dark-100'
              }
            `}
          >
            <div className="relative z-10 flex items-center gap-3">
              {collapsed ? (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
                  {user?.avatar ? (
                    <img src={getAvatarUrl(user.avatar)} alt={user?.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
                    {user?.avatar ? (
                      <img src={getAvatarUrl(user.avatar)} alt={user?.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-900 dark:text-dark-100 truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-[11px] text-dark-500 truncate">{user?.email}</p>
                  </div>
                </>
              )}
            </div>
            {collapsed && (
              <div className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg bg-dark-900 dark:bg-dark-700 text-white text-xs whitespace-nowrap shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 pointer-events-none z-50">
                {user?.name || 'User'}
              </div>
            )}
          </NavLink>

          {/* Actions */}
          <div className={`flex ${collapsed ? 'flex-col items-center' : 'items-center'} gap-1 pt-1`}>
            <button
              onClick={toggleTheme}
              className={`
                flex items-center justify-center
                ${collapsed ? 'w-12 h-12' : 'flex-1 px-3 py-2'}
                rounded-xl text-sm
                text-dark-500 dark:text-dark-400
                hover:bg-dark-50 dark:hover:bg-dark-800/30 hover:text-dark-700 dark:hover:text-dark-200
                transition-colors duration-150
              `}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
              {!collapsed && <span className="ml-2">{isDark ? 'Light' : 'Dark'}</span>}
            </button>
            <button
              onClick={logout}
              className={`
                flex items-center justify-center
                ${collapsed ? 'w-12 h-12' : 'flex-1 px-3 py-2'}
                rounded-xl text-sm
                text-red-500 dark:text-red-400
                hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-300
                transition-colors duration-150
              `}
              title="Logout"
            >
              <FiLogOut className="w-4 h-4" />
              {!collapsed && <span className="ml-2">Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}