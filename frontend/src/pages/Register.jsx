import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiBook } from 'react-icons/fi';
import useAuthStore from '../stores/useAuthStore';
import Logo from '../components/common/Logo';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    universityId: '',
    department: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return;
    }
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        universityId: formData.universityId,
        department: formData.department,
      });
      navigate('/dashboard');
    } catch {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-surface-dark overflow-hidden py-8">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 mesh-gradient dark:mesh-gradient-dark" />
        <motion.div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary-500/10 dark:bg-primary-500/5 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-accent-500/10 dark:bg-accent-500/5 blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-md relative z-10 px-4"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex justify-center mb-6">
            <Logo size="xl" animated />
          </div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-dark-100">Create your account</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-2">
            Join the graduation project platform
          </p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="card p-8 shadow-xl shadow-black/[0.03] dark:shadow-black/[0.1] border-dark-100 dark:border-dark-800/60"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/30 text-red-600 dark:text-red-400 text-sm flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Full Name</label>
                <div className="relative group">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 group-focus-within:text-primary-500 transition-colors" />
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className="input pl-10" required autoFocus />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">University ID</label>
                <div className="relative group">
                  <FiBook className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 group-focus-within:text-primary-500 transition-colors" />
                  <input type="text" name="universityId" value={formData.universityId} onChange={handleChange} placeholder="202012345" className="input pl-10" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Email Address</label>
              <div className="relative group">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 group-focus-within:text-primary-500 transition-colors" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@university.edu" className="input pl-10" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Department</label>
              <select name="department" value={formData.department} onChange={handleChange} className="select">
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Engineering">Engineering</option>
                <option value="Business">Business</option>
                <option value="Arts">Arts</option>
                <option value="Science">Science</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Password</label>
                <div className="relative group">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 group-focus-within:text-primary-500 transition-colors" />
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Min 6 characters" className="input pl-10" required minLength={6} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Confirm Password</label>
                <div className="relative group">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 group-focus-within:text-primary-500 transition-colors" />
                  <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat password" className="input pl-10" required />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showPass"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="rounded border-dark-300 text-primary-600 focus:ring-primary-500/30 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="showPass" className="text-sm text-dark-500 dark:text-dark-400 cursor-pointer select-none">
                Show passwords
              </label>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account <FiArrowRight className="w-4 h-4" />
                </span>
              )}
            </motion.button>
          </form>

          <div className="mt-6 pt-6 border-t border-dark-100 dark:border-dark-800/60 text-center">
            <p className="text-sm text-dark-500 dark:text-dark-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}