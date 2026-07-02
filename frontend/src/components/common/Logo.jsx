import { motion } from 'framer-motion';

export default function Logo({ size = 'md', showText = true, animated = false }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  const LogoIcon = animated ? motion.div : 'div';

  return (
    <div className="flex items-center gap-3">
      <div className={`relative ${sizes[size]} flex-shrink-0`}>
        <LogoIcon
          {...(animated ? {
            whileHover: { scale: 1.05, rotate: -5 },
            transition: { type: 'spring', stiffness: 400, damping: 10 }
          } : {})}
          className="w-full h-full"
        >
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Background gradient */}
            <defs>
              <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="50%" stopColor="#1d4ed8" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="logo-gradient-light" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="50%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
              <filter id="glow-logo">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background circle */}
            <circle
              cx="20"
              cy="20"
              r="19"
              className="fill-primary-600 dark:fill-primary-700"
            />

            {/* Graduation cap top */}
            <path
              d="M20 8L8 15L20 22L32 15L20 8Z"
              className="fill-white"
              opacity="0.95"
            />

            {/* Cap tassel */}
            <path
              d="M20 22V28"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.8"
            />
            <circle
              cx="20"
              cy="29"
              r="2"
              className="fill-accent-400"
            />

            {/* Connected nodes - collaboration */}
            <circle cx="13" cy="18" r="3" fill="white" opacity="0.3" />
            <circle cx="27" cy="18" r="3" fill="white" opacity="0.3" />
            <circle cx="20" cy="14" r="2.5" fill="white" opacity="0.4" />

            {/* Connecting lines */}
            <line x1="15.5" y1="16" x2="18" y2="14" stroke="white" strokeWidth="1.5" opacity="0.5" />
            <line x1="24.5" y1="16" x2="22" y2="14" stroke="white" strokeWidth="1.5" opacity="0.5" />
            <line x1="13" y1="21" x2="13" y2="18" stroke="white" strokeWidth="1.5" opacity="0.4" />
            <line x1="27" y1="21" x2="27" y2="18" stroke="white" strokeWidth="1.5" opacity="0.4" />

            {/* Accent dot */}
            <circle cx="32" cy="10" r="1.5" className="fill-accent-400" />
          </svg>
        </LogoIcon>

        {/* Glow effect */}
        {animated && (
          <motion.div
            className="absolute inset-0 rounded-full bg-primary-500/20 blur-xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>

      {showText && (
        <div>
          <h1 className={`${textSizes[size]} font-bold`}>
            <span className="gradient-text">Plan</span>
            <span className="text-dark-900 dark:text-dark-100">ify</span>
          </h1>
          <p className="text-[10px] text-dark-500 dark:text-dark-400 font-medium tracking-wide uppercase">
            Graduation Projects
          </p>
        </div>
      )}
    </div>
  );
}