export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return 'https://via.placeholder.com/300?text=No+Image';
  
  // If it's an external URL, return it as is
  if (path.startsWith('http') || path.startsWith('https') || path.startsWith('data:')) {
    return path;
  }
  
  // Base API URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  // Get host (remove /api suffix)
  const host = API_URL.replace(/\/api$/, '');
  
  // Prepend host to local paths
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${host}${cleanPath}`;
};
