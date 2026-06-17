import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiBook, FiCode, FiSave, FiCamera, FiEdit2, FiX, FiCheck, FiAward, FiCalendar, FiGithub, FiLinkedin, FiGlobe, FiMapPin, FiClock, FiShield, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import useAuthStore from '../stores/useAuthStore';
import getAvatarUrl from '../utils/getAvatarUrl';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function Profile() {
  const { user, initialized, loadUser, updateProfile, uploadAvatar, removeAvatar, loading } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    universityId: user?.universityId || '',
    department: user?.department || '',
    skills: user?.skills?.join(', ') || '',
    bio: user?.bio || '',
    github: user?.github || '',
    linkedin: user?.linkedin || '',
    website: user?.website || '',
    location: user?.location || '',
  });

  // Fetch fresh user data on mount
  useEffect(() => {
    loadUser();
  }, []);

  // Sync formData when user data comes in (after loadUser completes)
  useEffect(() => {
    setFormData({
      name: user?.name || '',
      universityId: user?.universityId || '',
      department: user?.department || '',
      skills: user?.skills?.join(', ') || '',
      bio: user?.bio || '',
      github: user?.github || '',
      linkedin: user?.linkedin || '',
      website: user?.website || '',
      location: user?.location || '',
    });
  }, [user?._id]);

  const handleSave = async (e) => {
    e.preventDefault();
    await updateProfile({
      ...formData,
      skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
    });
    setEditing(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview locally
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    try {
      await uploadAvatar(file);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    }
    setUploading(false);
  };

  const avatarSrc = avatarPreview || getAvatarUrl(user?.avatar);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Profile Header / Avatar Card */}
      <motion.div variants={itemVariants} className="card p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 via-primary-500/[0.02] to-transparent" />
        <div className="relative">
          {/* Avatar */}
          <div className="relative inline-block group">
            <div className={`
              w-32 h-32 rounded-full flex items-center justify-center mx-auto
              shadow-xl shadow-primary-500/20 ring-4 ring-white dark:ring-surface-dark
              overflow-hidden transition-transform duration-200 group-hover:scale-[1.02]
              ${avatarSrc ? '' : 'bg-gradient-to-br from-primary-400 via-primary-500 to-accent-500'}
            `}>
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-5xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>

            {/* Upload overlay */}
            <button
              onClick={handleAvatarClick}
              disabled={uploading}
              className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer"
            >
              {uploading ? (
                <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <FiCamera className="w-6 h-6 text-white" />
                  <span className="text-white text-xs font-medium">Change Photo</span>
                </div>
              )}
            </button>

            {/* Remove photo button - only show when avatar exists */}
            {avatarSrc && !uploading && (
              <button
                onClick={async () => {
                  await removeAvatar();
                  setAvatarPreview(null);
                }}
                className="absolute -bottom-1 -right-1 p-2 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title="Remove photo"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* User info */}
          <h2 className="text-2xl font-bold text-dark-900 dark:text-dark-100 mt-4">{user?.name}</h2>
          <p className="text-dark-500 dark:text-dark-400">{user?.email}</p>

          {/* Badges */}
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            {user?.isSupervisor && (
              <span className="badge badge-primary">
                <FiShield className="w-3 h-3 mr-1" /> Supervisor
              </span>
            )}
            {user?.teamRole && user?.teamRole !== 'none' && (
              <span className="badge badge-info capitalize">
                <FiUser className="w-3 h-3 mr-1" /> {user?.teamRole}
              </span>
            )}
            <span className="badge badge-success">
              <FiCheck className="w-3 h-3 mr-1" /> Active
            </span>
          </div>

          {/* Bio */}
          {user?.bio && !editing && (
            <p className="text-sm text-dark-500 dark:text-dark-400 mt-4 max-w-md mx-auto">
              {user.bio}
            </p>
          )}

          {/* Meta info */}
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-dark-400">
            {user?.department && (
              <span className="flex items-center gap-1">
                <FiBook className="w-3 h-3" /> {user.department}
              </span>
            )}
            {user?.createdAt && (
              <span className="flex items-center gap-1">
                <FiCalendar className="w-3 h-3" /> Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            )}
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
            <button
              onClick={() => setEditing(true)}
              className="btn-ghost-primary btn-sm"
            >
              <FiEdit2 className="w-3.5 h-3.5" /> Edit Profile
            </button>
          ) : (
            <button onClick={() => setEditing(false)} className="btn-ghost btn-sm">
              <FiX className="w-3.5 h-3.5" /> Cancel
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                className="textarea"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Location</label>
                <div className="relative">
                  <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                  <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="City, Country" className="input pl-10" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Skills (comma separated)</label>
              <div className="relative">
                <FiCode className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input type="text" value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} placeholder="React, Node.js, MongoDB" className="input pl-10" />
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-2 border-t border-dark-100 dark:border-dark-800/60">
              <p className="text-xs font-medium text-dark-500 dark:text-dark-400 mb-3 uppercase tracking-wider">Social Links</p>
              <div className="space-y-3">
                <div className="relative">
                  <FiGithub className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                  <input type="url" value={formData.github} onChange={(e) => setFormData({ ...formData, github: e.target.value })} placeholder="https://github.com/username" className="input pl-10" />
                </div>
                <div className="relative">
                  <FiLinkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                  <input type="url" value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} placeholder="https://linkedin.com/in/username" className="input pl-10" />
                </div>
                <div className="relative">
                  <FiGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                  <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://yourwebsite.com" className="input pl-10" />
                </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: FiUser, label: 'Name', value: user?.name },
                { icon: FiMail, label: 'Email', value: user?.email },
                { icon: FiBook, label: 'University ID', value: user?.universityId || 'Not set' },
                { icon: FiMapPin, label: 'Location', value: user?.location || 'Not set' },
                { icon: FiCalendar, label: 'Department', value: user?.department || 'Not set' },
              ].map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.2 }}
                  className="flex items-center gap-4 p-3.5 rounded-xl bg-dark-50 dark:bg-dark-800/30 border border-dark-100 dark:border-dark-800/60"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-primary-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-dark-500">{item.label}</p>
                    <p className="text-sm font-medium text-dark-900 dark:text-dark-100 truncate">{item.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bio display */}
            {user?.bio && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary-500/[0.03] to-accent-500/[0.03] border border-primary-200/20 dark:border-primary-800/20">
                <p className="text-xs text-dark-500 mb-2 flex items-center gap-2">
                  <FiUser className="w-3.5 h-3.5 text-primary-500" />
                  Bio
                </p>
                <p className="text-sm text-dark-700 dark:text-dark-300 leading-relaxed">{user.bio}</p>
              </div>
            )}

            {/* Skills */}
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

            {/* Social Links */}
            {(user?.github || user?.linkedin || user?.website) && (
              <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800/30 border border-dark-100 dark:border-dark-800/60">
                <p className="text-xs text-dark-500 mb-3 flex items-center gap-2">
                  <FiGlobe className="w-3.5 h-3.5 text-primary-500" />
                  Links
                </p>
                <div className="flex flex-wrap gap-2">
                  {user?.github && (
                    <a
                      href={user.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-100 dark:bg-dark-800 text-dark-700 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-primary-950/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-150"
                    >
                      <FiGithub className="w-3.5 h-3.5" /> GitHub
                    </a>
                  )}
                  {user?.linkedin && (
                    <a
                      href={user.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-100 dark:bg-dark-800 text-dark-700 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-primary-950/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-150"
                    >
                      <FiLinkedin className="w-3.5 h-3.5" /> LinkedIn
                    </a>
                  )}
                  {user?.website && (
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-100 dark:bg-dark-800 text-dark-700 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-primary-950/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-150"
                    >
                      <FiGlobe className="w-3.5 h-3.5" /> Website
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}