/**
 * Resolve avatar URL from stored path.
 * The avatar path is stored as /uploads/avatars/filename.jpg
 * The API URL is http://localhost:5000/api
 * So we need to resolve against the base server URL (without /api)
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

  // Resolve relative path against the server base URL (strip /api from API_URL)
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const baseUrl = apiUrl.replace(/\/api\/?$/, '');
  
  // Ensure the path starts correctly
  const cleanPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
  
  return `${baseUrl}${cleanPath}`;
}