import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiCheck, FiCheckSquare, FiClock } from 'react-icons/fi';
import api from '../services/api';

const typeConfig = {
  task_assigned: { icon: '📋', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  task_updated: { icon: '✏️', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  new_commit: { icon: '💻', color: 'from-primary-500 to-primary-600', bg: 'bg-primary-50 dark:bg-primary-950/30' },
  team_invite: { icon: '👋', color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  supervisor_feedback: { icon: '💬', color: 'from-primary-500 to-accent-500', bg: 'bg-primary-50 dark:bg-primary-950/30' },
  deadline: { icon: '⏰', color: 'from-red-500 to-rose-500', bg: 'bg-red-50 dark:bg-red-950/30' },
  milestone: { icon: '🏆', color: 'from-yellow-500 to-amber-500', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
  message: { icon: '💬', color: 'from-cyan-500 to-teal-500', bg: 'bg-cyan-50 dark:bg-cyan-950/30' },
  member_joined: { icon: '👤', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  announcement: { icon: '📢', color: 'from-rose-500 to-pink-500', bg: 'bg-rose-50 dark:bg-rose-950/30' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      console.log('Notifications loaded:', data);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Notifications</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">Stay updated with your team's activity</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="btn-ghost-primary btn-sm"
            >
              <FiCheckSquare className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
          <div className="flex rounded-lg border border-dark-100 dark:border-dark-800/60 overflow-hidden">
            {['all', 'unread'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium transition-all ${
                  filter === f
                    ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400'
                    : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-300'
                }`}
              >
                {f === 'all' ? 'All' : `Unread (${unreadCount})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="card p-4">
                <div className="skeleton w-10 h-10 rounded-xl mb-3" />
                <div className="skeleton w-48 h-5 mb-2" />
                <div className="skeleton w-full h-3" />
              </div>
            ))}
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => {
            const config = typeConfig[notification.type] || { icon: '🔔', color: 'from-dark-400 to-dark-500', bg: 'bg-dark-50 dark:bg-dark-800/30' };
            return (
              <div
                key={notification._id}
                onClick={() => !notification.read && markAsRead(notification._id)}
                className={`group relative overflow-hidden card p-4 cursor-pointer transition-all ${
                  !notification.read
                    ? 'border-l-[3px] border-l-primary-500 bg-gradient-to-r from-primary-500/[0.02] to-transparent'
                    : 'opacity-70 hover:opacity-90'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center text-lg flex-shrink-0`}>
                    {config.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`text-sm font-medium ${!notification.read ? 'text-dark-900 dark:text-dark-100' : 'text-dark-600 dark:text-dark-300'}`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[11px] text-dark-400 flex items-center gap-1">
                          <FiClock className="w-3 h-3" />
                          {getTimeAgo(notification.createdAt)}
                        </span>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-primary-500" />
                        )}
                      </div>
                    </div>
                    <p className={`text-sm mt-0.5 ${!notification.read ? 'text-dark-600 dark:text-dark-300' : 'text-dark-400'}`}>
                      {notification.message}
                    </p>
                    {notification.team && (
                      <span className="badge badge-primary mt-2 text-[10px]">
                        {notification.team.name}
                      </span>
                    )}
                  </div>

                  {/* Mark as read button */}
                  {!notification.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification._id);
                      }}
                      className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/30 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                    >
                      <FiCheck className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-dark-400">
            <div className="w-20 h-20 rounded-2xl bg-dark-50 dark:bg-dark-800/30 flex items-center justify-center mb-4">
              <FiBell className="w-8 h-8" />
            </div>
            <p className="text-base font-medium text-dark-900 dark:text-dark-100">
              {filter === 'unread' ? 'No unread notifications' : 'All caught up!'}
            </p>
            <p className="text-sm mt-1">
              {filter === 'unread' ? "You've read everything" : 'No notifications yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}