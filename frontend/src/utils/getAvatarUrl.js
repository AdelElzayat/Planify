/**
 * Resolve avatar URL from stored path.
 * The avatar path may be a full URL (e.g. https://.../uploads/avatars/filename.jpg)
 * or a relative path (/uploads/avatars/filename.jpg).
 */
export default function getAvatarUrl(avatarPath) {
  if (!avatarPath) return null;

  // If it's already a full URL, return as-is
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }

  // If it's a data URL (local preview), return as-is
  if (avatarPath.startsWith('data:')) {
    return avatarPath;
  }

  // Resolve relative path against VITE_UPLOADS_URL (server base URL)
  const uploadsBase = import.meta.env.VITE_UPLOADS_URL || '';
  const cleanPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;

  if (uploadsBase) {
    return `${uploadsBase}${cleanPath}`;
  }

  // Fallback: just return the path (may work in dev via Vite proxy)
  return cleanPath;
}
