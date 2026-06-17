import { useState } from 'react';
import getAvatarUrl from '../../utils/getAvatarUrl';

export default function Avatar({ user, size = 'md', className = '' }) {
  const [imgError, setImgError] = useState(false);
  const sizeClasses = {
    xs: 'w-5 h-5 text-[8px]',
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-12 h-12 text-base',
    '2xl': 'w-16 h-16 text-xl',
  };

  const avatarUrl = getAvatarUrl(user?.avatar);
  const showImage = avatarUrl && !imgError;

  if (showImage) {
    return (
      <div className={`${sizeClasses[size]} rounded-full flex-shrink-0 overflow-hidden ${className}`}>
        <img
          src={avatarUrl}
          alt={user?.name || 'User'}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Fallback: gradient initials
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}>
      {user?.name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
}
