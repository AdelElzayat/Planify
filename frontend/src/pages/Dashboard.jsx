import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiUsers, FiClock, FiGitCommit, FiTrendingUp, FiCalendar, FiTarget, FiAward } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import StatCard from '../components/dashboard/StatCard';
import Avatar from '../components/common/Avatar';
import PageSkeleton from '../components/common/PageLoader';
import useTeamStore from '../stores/useTeamStore';
import useTaskStore from '../stores/useTaskStore';
import useAuthStore from '../stores/useAuthStore';

const COLORS = ['#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#64748b'];
const PIE_COLORS = ['#22c55e', '#2563eb', '#f59e0b', '#64748b'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function Dashboard() {
  const { team, fetchMyTeam } = useTeamStore();
  const { tasks, fetchTasks } = useTaskStore();
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const t = await fetchMyTeam();
    if (t) {
      await fetchTasks(t._id);
    }
    // Minimum delay so skeleton is always visible for a beat
    await new Promise(r => setTimeout(r, 400));
    setLoading(false);
  };

  const taskStats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    todo: tasks.filter((t) => t.status === 'todo').length,
  }), [tasks]);

  const completedPercentage = useMemo(() => 
    taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0,
  [taskStats.total, taskStats.completed]);

  const pieData = useMemo(() => [
    { name: 'Completed', value: taskStats.completed },
    { name: 'In Progress', value: taskStats.inProgress },
    { name: 'To Do', value: taskStats.todo },
    { name: 'Backlog', value: tasks.filter((t) => t.status === 'backlog').length },
  ].filter((d) => d.value > 0), [taskStats, tasks]);

  const completedTasks = useMemo(() => 
    tasks.filter(t => t.status === 'completed').length,
  [tasks]);

  const upcomingDeadlines = useMemo(() => 
    tasks
      .filter(t => t.dueDate && t.status !== 'completed')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5),
  [tasks]);

  if (loading) return <PageSkeleton type="default" />;

  if (!team) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-6 shadow-lg shadow-primary-500/20">
          <FiUsers className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-dark-900 dark:text-dark-100 mb-2">No Team Yet</h2>
        <p className="text-dark-500 dark:text-dark-400 mb-8 max-w-md">Create or join a team to see your project dashboard with stats, progress, and more.</p>
        <a href="/team" className="btn-primary btn-lg">
          <FiUsers className="w-4 h-4" /> Get Started
        </a>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">
            {team?.name} &mdash; {team?.phase?.charAt(0).toUpperCase() + team?.phase?.slice(1) || 'N/A'} phase
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {team?.members?.slice(0, 4).map((member, idx) => (
              <div key={member.user?._id} className="border-2 border-white dark:border-surface-dark rounded-full" title={member.user?.name}>
                <Avatar user={member.user} size="sm" />
              </div>
            ))}
            {(team?.members?.length || 0) > 4 && (
              <div className="w-8 h-8 rounded-full bg-dark-100 dark:bg-dark-800 flex items-center justify-center text-[11px] font-medium text-dark-500 border-2 border-white dark:border-surface-dark">
                +{team.members.length - 4}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FiTrendingUp}
          label="Team Progress"
          value={team?.progress || 0}
          subtitle="%"
          color="from-primary-500 to-accent-500"
        />
        <StatCard
          icon={FiCheckCircle}
          label="Completed Tasks"
          value={completedTasks}
          subtitle={`/ ${tasks.length}`}
          color="from-green-500 to-green-600"
          progress={completedPercentage}
        />
        <StatCard
          icon={FiUsers}
          label="Team Members"
          value={team?.members?.length || 0}
          subtitle={`/ 10`}
          color="from-blue-500 to-cyan-500"
          progress={Math.min(((team?.members?.length || 0) / 10) * 100, 100)}
        />
        <StatCard
          icon={FiAward}
          label="Project Phase"
          value={team?.phase?.charAt(0).toUpperCase() + team?.phase?.slice(1) || 'N/A'}
          color="from-amber-500 to-amber-600"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Distribution */}
        <motion.div variants={itemVariants} className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">
              <FiTarget className="w-4 h-4 text-primary-500" />
              Task Distribution
            </h3>
            <span className="text-xs text-dark-400">
              {taskStats.completed}/{taskStats.total} done
            </span>
          </div>

          <div className="h-64 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    animationBegin={200}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#1a1c26',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-dark-400">
                <FiTarget className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tasks yet</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }} />
                <span className="text-xs text-dark-600 dark:text-dark-400">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>

          {/* Overall progress ring */}
          <div className="mt-4 pt-4 border-t border-dark-100 dark:border-dark-800/60">
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-500 dark:text-dark-400">Overall completion</span>
              <span className="font-semibold text-dark-900 dark:text-dark-100">{completedPercentage}%</span>
            </div>
            <div className="mt-2 progress-bar">
              <motion.div
                className="progress-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${completedPercentage}%` }}
                transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div variants={itemVariants} className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">
              <FiCalendar className="w-4 h-4 text-primary-500" />
              Upcoming Deadlines
            </h3>
            <span className="text-xs text-dark-400">
              {upcomingDeadlines.length} pending
            </span>
          </div>

          <div className="space-y-2">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((task, idx) => {
                const isOverdue = new Date(task.dueDate) < new Date();
                return (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.2 }}
                    className="group flex items-center justify-between p-3 rounded-xl bg-dark-50 dark:bg-dark-800/30 hover:bg-dark-100 dark:hover:bg-dark-800/50 transition-colors duration-150"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        isOverdue ? 'bg-red-500' :
                        task.priority === 'urgent' ? 'bg-red-400' :
                        task.priority === 'high' ? 'bg-amber-400' :
                        'bg-blue-400'
                      }`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-dark-900 dark:text-dark-100 truncate">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <FiClock className="w-3 h-3 text-dark-400" />
                          <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-dark-400'}`}>
                            {new Date(task.dueDate).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric'
                            })}
                            {isOverdue ? ' (Overdue)' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={`badge flex-shrink-0 ${
                      task.priority === 'urgent' ? 'badge-danger' :
                      task.priority === 'high' ? 'badge-warning' :
                      task.priority === 'medium' ? 'badge-info' :
                      'badge-primary'
                    }`}>
                      {task.priority}
                    </span>
                  </motion.div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-dark-400">
                <FiCalendar className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs mt-1">No upcoming deadlines</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Team Members */}
      <motion.div variants={itemVariants} className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">
            <FiUsers className="w-4 h-4 text-primary-500" />
            Team Members
          </h3>
          <span className="text-xs text-dark-400">{team?.members?.length} members</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {team?.members?.map((member, idx) => (
            <motion.div
              key={member.user?._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.2 }}
              className="group flex items-center gap-3 p-3 rounded-xl bg-dark-50 dark:bg-dark-800/30 hover:bg-dark-100 dark:hover:bg-dark-800/50 transition-colors duration-150"
            >
              <div className="relative">
                <Avatar user={member.user} size="lg" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white dark:border-surface-dark" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dark-900 dark:text-dark-100 truncate">
                  {member.user?.name || 'Unknown'}
                </p>
                <p className="text-[11px] text-dark-500 capitalize truncate">{member.role}</p>
              </div>
              <span className={`badge flex-shrink-0 ${
                member.role === 'leader' ? 'badge-primary' : 'badge-info'
              }`}>
                {member.role}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}