import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

function AnimatedCounter({ value, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const numericValue = parseInt(value) || 0;

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 800;
    const steps = 30;
    const increment = numericValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, numericValue]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
}

export default function StatCard({ icon: Icon, label, value, color, subtitle, trend }) {
  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className="group relative card p-5 overflow-hidden cursor-default"
    >
      {/* Background gradient on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

      {/* Mesh pattern overlay */}
      <div className="absolute inset-0 bg-mesh-pattern opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-200`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {trend && (
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              trend > 0 ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
            }`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>

        <p className="text-sm text-dark-500 dark:text-dark-400 mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-2xl font-bold text-dark-900 dark:text-dark-100">
            <AnimatedCounter value={value} />
          </h3>
          {subtitle && (
            <span className="text-xs text-dark-400">{subtitle}</span>
          )}
        </div>

        {/* Progress bar indicator */}
        <div className="mt-3 h-1 rounded-full bg-dark-100 dark:bg-dark-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(parseInt(value) || 0, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className={`h-full rounded-full bg-gradient-to-r ${color}`}
          />
        </div>
      </div>
    </motion.div>
  );
}