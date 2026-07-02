import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiCheckCircle, FiClock, FiTrendingUp, FiBarChart2, FiFileText, FiAward, FiTarget, FiGitBranch, FiActivity, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import useAuthStore from '../stores/useAuthStore';
import api from '../services/api';

const COLORS = ['#2563eb', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444'];
const PIE_COLORS = ['#64748b', '#2563eb', '#f59e0b', '#f97316', '#22c55e'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function SupervisorDashboard() {
  const user = useAuthStore((s) => s.user);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamTasks, setTeamTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      loadTeamTasks(selectedTeam._id);
    }
  }, [selectedTeam]);

  const loadTeams = async () => {
    try {
      const { data } = await api.get('/teams');
      setTeams(data);
      if (data.length > 0) {
        setSelectedTeam(data[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load teams:', error);
      setLoading(false);
    }
  };

  const loadTeamTasks = async (teamId) => {
    try {
      const { data } = await api.get(`/tasks/${teamId}`);
      setTeamTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const taskDistribution = [
    { name: 'Backlog', value: teamTasks.filter((t) => t.status === 'backlog').length },
    { name: 'To Do', value: teamTasks.filter((t) => t.status === 'todo').length },
    { name: 'In Progress', value: teamTasks.filter((t) => t.status === 'in_progress').length },
    { name: 'Testing', value: teamTasks.filter((t) => t.status === 'testing').length },
    { name: 'Completed', value: teamTasks.filter((t) => t.status === 'completed').length },
  ];

  const completedTasks = teamTasks.filter((t) => t.status === 'completed').length;
  const totalTasks = teamTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (!user?.isSupervisor) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-6 shadow-lg shadow-primary-500/20">
          <FiBarChart2 className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-dark-900 dark:text-dark-100 mb-2">Supervisor Access Only</h2>
        <p className="text-dark-500 dark:text-dark-400">This dashboard is for supervisors only.</p>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="card p-6">
              <div className="skeleton w-10 h-10 rounded-xl mb-3" />
              <div className="skeleton w-16 h-6 mb-2" />
              <div className="skeleton w-24 h-3" />
            </div>
          ))}
        </div>
        <div className="card p-6">
          <div className="skeleton w-32 h-4 mb-4" />
          <div className="skeleton w-full h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Supervisor Dashboard</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">Monitor and manage your assigned teams</p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: FiUsers, label: 'Assigned Teams', value: teams.length, color: 'from-primary-500 to-accent-500', subtitle: 'teams' },
          { icon: FiAward, label: 'Total Students', value: teams.reduce((acc, t) => acc + (t.members?.length || 0), 0), color: 'from-emerald-500 to-green-600', subtitle: 'students' },
          { icon: FiActivity, label: 'Active Teams', value: teams.filter((t) => t.status === 'active').length, color: 'from-blue-500 to-cyan-500', subtitle: 'active' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            whileHover={{ y: -3 }}
            className="card p-5 relative overflow-hidden group"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
            <div className="relative z-10">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-dark-900 dark:text-dark-100">{stat.value}</h3>
              <p className="text-sm text-dark-500 dark:text-dark-400">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Team Details */}
      <motion.div variants={itemVariants} className="card p-6">
        <h3 className="section-title mb-4">
          <FiTarget className="w-4 h-4 text-primary-500" />
          Team Details
        </h3>
        
        {/* Team Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
          {teams.map((team) => (
            <motion.button
              key={team._id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTeam(team)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedTeam?._id === team._id
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20'
                  : 'bg-dark-50 dark:bg-dark-800/50 text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-700/50 border border-dark-100 dark:border-dark-800/60'
              }`}
            >
              {team.name}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selectedTeam && (
            <motion.div
              key={selectedTeam._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Team Info */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-dark-900 dark:text-dark-100">{selectedTeam.name}</h4>
                  <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">{selectedTeam.description}</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className={`badge ${selectedTeam.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                    {selectedTeam.status}
                  </span>
                  <span className="badge badge-primary">{selectedTeam.phase || 'Proposal'}</span>
                  <span className="badge badge-info">{selectedTeam.members?.length || 0} members</span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-dark-500 dark:text-dark-400">Progress</span>
                    <span className="font-semibold text-dark-900 dark:text-dark-100">{selectedTeam.progress || 0}%</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedTeam.progress || 0}%` }}
                      transition={{ duration: 1.5, delay: 0.2, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Members */}
                <div>
                  <h5 className="text-sm font-medium text-dark-700 dark:text-dark-300 mb-3 flex items-center gap-2">
                    <FiUsers className="w-4 h-4 text-primary-500" />
                    Team Members ({selectedTeam.members?.length || 0})
                  </h5>
                  <div className="space-y-2">
                    {selectedTeam.members?.map((member, idx) => (
                      <motion.div
                        key={member._id || member.user?._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-dark-50 dark:bg-dark-800/30"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                          {member.user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-dark-900 dark:text-dark-100 truncate">
                            {member.user?.name}
                          </p>
                        </div>
                        <span className="text-xs text-dark-400 capitalize px-2 py-0.5 rounded bg-dark-100 dark:bg-dark-800 font-medium">
                          {member.role}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Task Distribution Chart */}
              <div>
                <h5 className="text-sm font-medium text-dark-700 dark:text-dark-300 mb-4 flex items-center gap-2">
                  <FiBarChart2 className="w-4 h-4 text-primary-500" />
                  Task Distribution
                </h5>
                <div className="h-64 flex items-center justify-center">
                  {teamTasks.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={taskDistribution.filter((d) => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={100}
                          paddingAngle={4}
                          dataKey="value"
                          animationBegin={300}
                          animationDuration={1500}
                        >
                          {taskDistribution.map((entry, index) => (
                            <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
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
                      <FiBarChart2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No tasks yet</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {taskDistribution.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }} />
                      <span className="text-xs text-dark-500">{item.name}: <strong>{item.value}</strong></span>
                    </div>
                  ))}
                </div>
                {/* Completion rate */}
                {totalTasks > 0 && (
                  <div className="mt-4 pt-4 border-t border-dark-100 dark:border-dark-800/60">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-dark-500 dark:text-dark-400">Completion rate</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{completionRate}%</span>
                    </div>
                    <div className="mt-2 progress-bar">
                      <motion.div
                        className="progress-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${completionRate}%` }}
                        transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Teams Comparison */}
      <motion.div variants={itemVariants} className="card p-6">
        <h3 className="section-title mb-4">
          <FiGitBranch className="w-4 h-4 text-primary-500" />
          Teams Comparison
        </h3>
        <div className="h-72">
          {teams.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teams.map((t) => ({
                name: t.name?.length > 10 ? t.name.slice(0, 10) + '...' : t.name,
                Members: t.members?.length || 0,
                Progress: t.progress || 0,
              }))}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#636979' }}
                  axisLine={{ stroke: '#2a2d3a', strokeOpacity: 0.5 }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#636979' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1a1c26',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Bar 
                  dataKey="Members" 
                  fill="#2563eb" 
                  radius={[6, 6, 0, 0]} 
                  animationDuration={1500}
                />
                <Bar 
                  dataKey="Progress" 
                  fill="#06b6d4" 
                  radius={[6, 6, 0, 0]} 
                  animationDuration={1500}
                  animationBegin={300}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-dark-400">
              <FiBarChart2 className="w-8 h-8 mr-2 opacity-50" />
              <span className="text-sm">No teams to compare</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}