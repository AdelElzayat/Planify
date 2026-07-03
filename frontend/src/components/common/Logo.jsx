import { motion } from 'framer-motion';
import planifySvg from '../../assets/logos/planify.svg';

export default function Logo({ size = 'md', showText = true, animated = false }) {
  const sizes = {
    sm: 'w-14 h-14',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  const LogoIcon = animated ? motion.img : 'img';

  return (
    <div className="flex items-center gap-0.8">
      <div className={`relative ${sizes[size]} flex-shrink-0`}>
        <LogoIcon
          {...(animated ? {
            whileHover: { scale: 1.05, rotate: -5 },
            transition: { type: 'spring', stiffness: 400, damping: 10 }
          } : {})}
          src={planifySvg}
          alt="Planify"
          className="w-full h-full"
        />

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