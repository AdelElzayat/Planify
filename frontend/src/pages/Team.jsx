import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiCopy, FiUserPlus, FiUserMinus, FiShield, FiMail, FiUsers, FiLink, FiCheck, FiX, FiLogIn, FiLogOut, FiTrash2, FiCode, FiShare2 } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import useTeamStore from '../stores/useTeamStore';
import useAuthStore from '../stores/useAuthStore';
import api from '../services/api';
import Avatar from '../components/common/Avatar';
import PageSkeleton from '../components/common/PageLoader';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function Team() {
  const { team, fetchMyTeam, createTeam, joinTeam, updateTeam, removeMember, leaveTeam, deleteTeam, loading } = useTeamStore();
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Handle invite link from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const inviteFromUrl = params.get('invite');
    if (inviteFromUrl && !team) {
      setInviteCode(inviteFromUrl);
      setShowJoin(true);
      // Clean up URL
      navigate('/team', { replace: true });
    }
  }, [location, navigate, team]);

  useEffect(() => {
    fetchMyTeam().finally(() => setPageLoading(false));
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

  const handleDelete = async () => {
    if (window.confirm('Are you absolutely sure you want to delete this team? This will permanently remove the team and its repository. All members will be removed from the team.')) {
      setDeleting(true);
      try {
        await deleteTeam(team._id);
      } catch (err) {
        alert(err || 'Failed to delete team');
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleLeave = async () => {
    if (window.confirm('Are you sure you want to leave this team? You can join another team afterwards.')) {
      setLeaving(true);
      try {
        await leaveTeam(team._id);
      } catch (err) {
        alert(err || 'Failed to leave team');
      } finally {
        setLeaving(false);
      }
    }
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

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/team?invite=${team?.inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const getInviteLink = () => {
    return `${window.location.origin}/team?invite=${team?.inviteCode}`;
  };

  if (pageLoading) return <PageSkeleton type="team" />;

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
              <button
                onClick={() => setShowCreate(true)}
                className="btn-primary btn-lg"
              >
                <FiPlus className="w-4 h-4" /> Create Team
              </button>
              <button
                onClick={() => setShowJoin(true)}
                className="btn-secondary btn-lg"
              >
                <FiLogIn className="w-4 h-4" /> Join Team
              </button>
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
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
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
                  <button
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
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Members */}
          <motion.div variants={itemVariants} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">
                <FiUsers className="w-4 h-4 text-primary-500" />
                Team Members ({team?.members?.length}/10)
              </h3>
              {user?.teamRole === 'leader' && (team?.members?.length < 10) && (
                <button 
                  onClick={() => setShowInviteModal(true)}
                  className="btn-secondary btn-sm"
                >
                  <FiUserPlus className="w-4 h-4" /> Invite
                </button>
              )}
            </div>

            <div className="space-y-2">
              {team?.members?.map((member, idx) => (
                <motion.div
                  key={member.user?._id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.2 }}
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-dark-50 dark:hover:bg-dark-800/30 transition-colors duration-150"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar user={member.user} size="lg" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-surface-dark" />
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
                      <button
                        onClick={() => handleRemoveMember(member.user?._id)}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 transition-colors duration-150 opacity-0 group-hover:opacity-100"
                      >
                        <FiUserMinus className="w-4 h-4" />
                      </button>
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
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-green-500/5 to-green-500/5 border border-green-200/30 dark:border-green-800/30">
                <Avatar user={team.supervisor} size="xl" className="shadow-lg shadow-green-500/20" />
                <div>
                  <p className="text-base font-medium text-dark-900 dark:text-dark-100">{team.supervisor?.name}</p>
                  <p className="text-sm text-dark-500">{team.supervisor?.email}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Danger Zone - Delete Team for leader (with members), Leave Team for leader (alone) or members */}
          {user?.teamRole === 'leader' && team?.members?.length > 1 ? (
            <motion.div variants={itemVariants} className="card p-6 border-2 border-red-200 dark:border-red-900/50">
              <h3 className="section-title mb-4 text-red-600 dark:text-red-400">
                <FiTrash2 className="w-4 h-4" />
                Danger Zone
              </h3>
              <p className="text-sm text-dark-500 dark:text-dark-400 mb-4">
                Deleting the team will permanently remove the team, its repository, and remove all members. This action cannot be undone.
              </p>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn-danger btn-lg w-full sm:w-auto"
              >
                {deleting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Deleting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FiTrash2 className="w-4 h-4" /> Delete Team
                  </span>
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants} className="flex justify-center pt-4">
              <button
                onClick={handleLeave}
                disabled={leaving}
                className="btn-danger btn-lg px-8"
              >
                {leaving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Leaving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FiLogOut className="w-4 h-4" /> Leave Team
                  </span>
                )}
              </button>
            </motion.div>
          )}
        </>
      )}

      {/* Invite Link Modal */}
      <AnimatePresence>
        {showInviteModal && team && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 12 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="card p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Invite Members</h3>
                <button onClick={() => setShowInviteModal(false)} className="p-1.5 rounded-lg text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors duration-150">
                  <FiX className="w-4 h-4" />
                </button>
              </div>
              
              <div className="mb-4 p-3 rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-200/30 dark:border-primary-800/30">
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  Share this invite link with your teammates to join your team
                </p>
              </div>

              <div className="space-y-4">
                {/* Invite Link */}
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Invite Link</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={getInviteLink()} 
                      readOnly 
                      className="input text-sm" 
                      onClick={(e) => e.target.select()}
                    />
                    <button
                      onClick={copyInviteLink}
                      className={`btn-sm ${linkCopied ? 'btn-soft' : 'btn-secondary'}`}
                    >
                      {linkCopied ? (
                        <span className="flex items-center gap-1">
                          <FiCheck className="w-3.5 h-3.5" /> Copied!
                        </span>
                      ) : (
                        <FiCopy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Invite Code */}
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Or Invite Code</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-4 py-2.5 rounded-lg bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-700 text-lg font-mono text-center tracking-widest text-primary-600 dark:text-primary-400">
                      {team?.inviteCode}
                    </code>
                    <button
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
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button type="button" onClick={() => setShowInviteModal(false)} className="btn-secondary">Close</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Team Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 12 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="card p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Create New Team</h3>
                <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors duration-150">
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
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowJoin(false)}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 12 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="card p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Join Team</h3>
                <button onClick={() => setShowJoin(false)} className="p-1.5 rounded-lg text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors duration-150">
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