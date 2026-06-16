import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiBook, FiCode, FiSave, FiCamera, FiEdit2, FiX, FiCheck, FiAward, FiCalendar } from 'react-icons/fi';
import useAuthStore from '../stores/useAuthStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function Profile() {
  const { user, updateProfile, loading } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    universityId: user?.universityId || '',
    department: user?.department || '',
    skills: user?.skills?.join(', ') || '',
  });

  const handleSave = async (e) => {
    e.preventDefault();
    await updateProfile({
      ...formData,
      skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
    });
    setEditing(false);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Profile Header */}
      <motion.div variants={itemVariants} className="card p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent" />
        <div className="relative">
          <div className="relative inline-block">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-400 via-primary-500 to-accent-500 flex items-center justify-center text-white text-4xl font-bold mx-auto shadow-xl shadow-primary-500/20 ring-4 ring-white dark:ring-surface-dark">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <button className="absolute bottom-1 right-1 p-2.5 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              <FiCamera className="w-3.5 h-3.5" />
            </button>
          </div>
          <h2 className="text-2xl font-bold text-dark-900 dark:text-dark-100 mt-4">{user?.name}</h2>
          <p className="text-dark-500 dark:text-dark-400">{user?.email}</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            {user?.isSupervisor && (
              <span className="badge badge-primary">Supervisor</span>
            )}
            {user?.teamRole && user?.teamRole !== 'none' && (
              <span className="badge badge-info capitalize">{user?.teamRole}</span>
            )}
            {user?.isSupervisor && <span className="badge badge-success">Verified</span>}
          </div>
        </div>
      </motion.div>

      {/* Profile Details */}
      <motion.div variants={itemVariants} className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="section-title">
            <FiUser className="w-4 h-4 text-primary-500" />
            Profile Details
          </h3>
          {!editing ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setEditing(true)}
              className="btn-ghost-primary btn-sm"
            >
              <FiEdit2 className="w-3.5 h-3.5" /> Edit Profile
            </motion.button>
          ) : (
            <button onClick={() => setEditing(false)} className="btn-ghost btn-sm">
              <FiX className="w-3.5 h-3.5" /> Cancel
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">University ID</label>
              <div className="relative">
                <FiBook className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input type="text" value={formData.universityId} onChange={(e) => setFormData({ ...formData, universityId: e.target.value })} className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Department</label>
              <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="select">
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Engineering">Engineering</option>
                <option value="Business">Business</option>
                <option value="Arts">Arts</option>
                <option value="Science">Science</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Skills (comma separated)</label>
              <div className="relative">
                <FiCode className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input type="text" value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} placeholder="React, Node.js, MongoDB" className="input pl-10" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Saving...
                  </span>
                ) : (
                  <><FiSave className="w-4 h-4" /> Save Changes</>
                )}
              </motion.button>
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            {[
              { icon: FiUser, label: 'Name', value: user?.name },
              { icon: FiMail, label: 'Email', value: user?.email },
              { icon: FiBook, label: 'University ID', value: user?.universityId || 'Not set' },
              { icon: FiCalendar, label: 'Department', value: user?.department || 'Not set' },
            ].map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-4 p-3.5 rounded-xl bg-dark-50 dark:bg-dark-800/30 border border-dark-100 dark:border-dark-800/60"
              >
                <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-primary-500" />
                </div>
                <div>
                  <p className="text-xs text-dark-500">{item.label}</p>
                  <p className="text-sm font-medium text-dark-900 dark:text-dark-100">{item.value}</p>
                </div>
              </motion.div>
            ))}

            {user?.skills?.length > 0 && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary-500/5 to-accent-500/5 border border-primary-200/30 dark:border-primary-800/30">
                <p className="text-xs text-dark-500 mb-3 flex items-center gap-2">
                  <FiAward className="w-3.5 h-3.5 text-primary-500" />
                  Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill) => (
                    <span key={skill} className="badge badge-primary">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}