import { motion } from 'framer-motion';

const loadingVariants = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const barVariants = {
  initial: { scaleX: 0, opacity: 0 },
  animate: {
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const pulseVariants = {
  initial: { opacity: 0.3, scale: 0.95 },
  animate: {
    opacity: [0.3, 1, 0.3],
    scale: [0.95, 1, 0.95],
    transition: {
      duration: 1.8,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ── Generic page skeleton (cards, lists, etc.) ──
export function PageSkeleton({ type = 'default' }) {
  if (type === 'kanban') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton h-6 w-40 rounded" />
            <div className="skeleton h-3 w-56 rounded" />
          </div>
          <div className="skeleton h-10 w-28 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-5 w-8 rounded-lg" />
              </div>
              <div className="space-y-3">
                {[...Array(2 + Math.floor(Math.random() * 2))].map((_, j) => (
                  <div key={j} className="skeleton h-28 rounded-2xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'chat') {
    return (
      <div className="space-y-4 p-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-3 px-4" style={{ flexDirection: i % 3 === 0 ? 'row-reverse' : 'row' }}>
            <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="skeleton h-3 w-32 rounded" />
              <div className={`skeleton h-4 rounded ${i % 2 === 0 ? 'w-3/4' : 'w-1/2'}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'calendar') {
    return (
      <div className="space-y-6">
        <div className="skeleton h-6 w-32 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="skeleton h-6 w-40 rounded" />
              <div className="flex gap-2">
                <div className="skeleton h-8 w-8 rounded-lg" />
                <div className="skeleton h-8 w-8 rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {[...Array(35)].map((_, i) => (
                <div key={i} className="skeleton h-20 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="card p-6">
            <div className="skeleton h-6 w-24 rounded mb-4" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-14 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'profile') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="card p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="skeleton w-24 h-24 rounded-full mb-4" />
            <div className="skeleton h-6 w-40 rounded mb-2" />
            <div className="skeleton h-4 w-56 rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="skeleton h-3 w-20 rounded" />
                <div className="skeleton h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'team') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton h-6 w-40 rounded" />
            <div className="skeleton h-3 w-56 rounded" />
          </div>
          <div className="skeleton h-10 w-32 rounded-xl" />
        </div>
        <div className="card p-6">
          <div className="skeleton h-6 w-32 rounded mb-6" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="skeleton h-4 w-32 rounded" />
                  <div className="skeleton h-3 w-20 rounded" />
                </div>
                <div className="skeleton h-6 w-16 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'supervisor') {
    return (
      <div className="space-y-6">
        <div className="skeleton h-6 w-48 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5">
              <div className="skeleton w-10 h-10 rounded-xl mb-3" />
              <div className="skeleton w-20 h-3 mb-2" />
              <div className="skeleton w-12 h-6" />
            </div>
          ))}
        </div>
        <div className="card p-6">
          <div className="skeleton h-6 w-40 rounded mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default: generic page skeleton
  return (
    <motion.div
      variants={loadingVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={barVariants} className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-7 w-48 rounded" />
          <div className="skeleton h-3 w-64 rounded" />
        </div>
        <div className="skeleton h-10 w-28 rounded-xl" />
      </motion.div>

      {/* Content cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            variants={barVariants}
            className="card p-5 space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="skeleton w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-3 w-16 rounded" />
              </div>
            </div>
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-3/4 rounded" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Full-page centered spinner ──
export function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <motion.div
        variants={pulseVariants}
        initial="initial"
        animate="animate"
        className="flex flex-col items-center gap-4"
      >
        <div className="relative w-12 h-12">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary-500/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-1 rounded-full border-2 border-transparent border-t-primary-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        <p className="text-sm text-dark-400">Loading...</p>
      </motion.div>
    </div>
  );
}

// ── Inline spinner (for buttons, small areas) ──
export function InlineSpinner({ size = 'sm' }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  return (
    <motion.div
      className={`${sizeClass} rounded-full border-2 border-dark-300 border-t-primary-500`}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    />
  );
}

export default PageSkeleton;