/**
 * Injects automatic format, quality, and width optimizations into Cloudinary image URLs.
 * Cuts data transfer by 80-95% and significantly speeds up rendering.
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || typeof url !== 'string') return url || '';

  const { width = 800, quality = 'auto' } = options;

  // Check if it is a Cloudinary URL
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    // If it already has transformations, avoid duplicating
    if (url.includes('/f_auto') || url.includes('/q_auto')) {
      return url;
    }

    const transform = `f_auto,q_${quality},w_${width},c_limit`;
    return url.replace('/upload/', `/upload/${transform}/`);
  }

  return url;
};
