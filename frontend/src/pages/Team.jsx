import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiCopy, FiUserPlus, FiUserMinus, FiShield, FiMail, FiUsers, FiLink, FiCheck, FiX, FiLogIn, FiCode } from 'react-icons/fi';
import useTeamStore from '../stores/useTeamStore';
import useAuthStore from '../stores/useAuthStore';
import api from '../services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function Team() {
  const { team, fetchMyTeam, createTeam, joinTeam, updateTeam, removeMember, loading } = useTeamStore();
  const user = useAuthStore((s) => s.user);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchMyTeam();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createTeam({ name: teamName, description: teamDesc });
      setShowCreate(false);
      setTeamName('');
      setTeamDesc('');
    } catch {}
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      await joinTeam(inviteCode);
      setShowJoin(false);
      setInviteCode('');
    } catch {}
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      await removeMember(team._id, memberId);
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(team?.inviteCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Empty State - No Team */}
      {!team && !showCreate && !showJoin && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center min-h-[60vh] text-center"
        >
          <motion.div variants={itemVariants}>
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/20">
              <FiUsers className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-dark-900 dark:text-dark-100 mb-2">Join or Create a Team</h2>
            <p className="text-dark-500 dark:text-dark-400 mb-8 max-w-md text-lg">
              Collaborate with your classmates on your graduation project
            </p>
            <div className="flex gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreate(true)}
                className="btn-primary btn-lg"
              >
                <FiPlus className="w-4 h-4" /> Create Team
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowJoin(true)}
                className="btn-secondary btn-lg"
              >
                <FiLogIn className="w-4 h-4" /> Join Team
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Team Details - Only show when team exists */}
      {team && (
        <>
          {/* Team Header */}
          <motion.div variants={itemVariants} className="card p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary-500/20">
                {team?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-dark-900 dark:text-dark-100">{team?.name}</h2>
                    <p className="text-dark-500 dark:text-dark-400 mt-1">{team?.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className={`badge ${team?.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                        {team?.status}
                      </span>
                      <span className="badge badge-primary">{team?.phase}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Invite Code */}
            {user?.teamRole === 'leader' && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-primary-500/5 to-accent-500/5 border border-primary-200/30 dark:border-primary-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <FiLink className="w-4 h-4 text-primary-500" />
                  <label className="text-sm font-medium text-dark-700 dark:text-dark-300">Invite Code</label>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-4 py-2.5 rounded-lg bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-700 text-lg font-mono text-center tracking-widest text-primary-600 dark:text-primary-400">
                    {team?.inviteCode}
                  </code>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={copyInviteCode}
                    className={`btn-sm ${copied ? 'btn-soft' : 'btn-secondary'}`}
                  >
                    {copied ? (
                      <span className="flex items-center gap-1">
                        <FiCheck className="w-3.5 h-3.5" /> Copied!
                      </span>
                    ) : (
                      <FiCopy className="w-3.5 h-3.5" />
                    )}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Members */}
          <motion.div variants={itemVariants} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">
                <FiUsers className="w-4 h-4 text-primary-500" />
                Team Members ({team?.members?.length})
              </h3>
              {user?.teamRole === 'leader' && (
                <button className="btn-secondary btn-sm">
                  <FiUserPlus className="w-4 h-4" /> Invite
                </button>
              )}
            </div>

            <div className="space-y-2">
              {team?.members?.map((member, idx) => (
                <motion.div
                  key={member.user?._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-dark-50 dark:hover:bg-dark-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                        {member.user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-surface-dark" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-dark-900 dark:text-dark-100">
                        {member.user?.name}
                        {member.user?._id === team?.leader?._id && (
                          <span className="ml-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 text-[10px] font-medium">
                            <FiShield className="w-2.5 h-2.5" /> Leader
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-dark-500">{member.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${member.role === 'leader' ? 'badge-primary' : 'badge-info'}`}>
                      {member.role}
                    </span>
                    {user?.teamRole === 'leader' && member.role !== 'leader' && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemoveMember(member.user?._id)}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <FiUserMinus className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Supervisor */}
          {team?.supervisor && (
            <motion.div variants={itemVariants} className="card p-6">
              <h3 className="section-title mb-4">
                <FiShield className="w-4 h-4 text-primary-500" />
                Supervisor
              </h3>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/5 to-green-500/5 border border-emerald-200/30 dark:border-emerald-800/30">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-emerald-500/20">
                  {team.supervisor?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="text-base font-medium text-dark-900 dark:text-dark-100">{team.supervisor?.name}</p>
                  <p className="text-sm text-dark-500">{team.supervisor?.email}</p>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Modals - Always rendered */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="card p-6 w-full max-w-md mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Create New Team</h3>
                <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors">
                  <FiX className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Team Name</label>
                  <input type="text" placeholder="Enter team name" value={teamName} onChange={(e) => setTeamName(e.target.value)} className="input" required autoFocus />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Description</label>
                  <textarea placeholder="Describe your project (optional)" value={teamDesc} onChange={(e) => setTeamDesc(e.target.value)} className="textarea" rows={3} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Creating...
                      </span>
                    ) : 'Create Team'}
                  </button>
                  <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showJoin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowJoin(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="card p-6 w-full max-w-md mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Join Team</h3>
                <button onClick={() => setShowJoin(false)} className="p-1.5 rounded-lg text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors">
                  <FiX className="w-4 h-4" />
                </button>
              </div>
              <div className="mb-4 p-3 rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-200/30 dark:border-primary-800/30">
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  Enter the invite code provided by your team leader
                </p>
              </div>
              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Invite Code</label>
                  <input type="text" placeholder="Enter invite code" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} className="input text-center text-lg font-mono uppercase tracking-widest" required maxLength={6} autoFocus />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Joining...
                      </span>
                    ) : 'Join Team'}
                  </button>
                  <button type="button" onClick={() => setShowJoin(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}