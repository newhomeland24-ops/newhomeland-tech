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

/**
 * Injects high-fidelity video optimizations into Cloudinary video URLs.
 * Caps at 1080p, applies auto:best perceptual compression, auto codec, and fast-start streaming.
 */
export const getOptimizedVideoUrl = (url, options = {}) => {
  if (!url || typeof url !== 'string') return url || '';

  const { maxWidth = 1920, maxHeight = 1080, quality = 'auto:best' } = options;

  // Check if it is a Cloudinary video URL
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    // If it already contains video transformations, avoid duplicating
    if (url.includes('/q_auto') || url.includes('/vc_') || url.includes('/fl_fast_start')) {
      return url;
    }

    const transform = `c_limit,w_${maxWidth},h_${maxHeight},q_${quality},vc_auto,fl_fast_start`;
    return url.replace('/upload/', `/upload/${transform}/`);
  }

  return url;
};
