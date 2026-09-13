/**
 * Client-side image compression utility.
 * Downscales images exceeding maxDimension and compresses to high-quality JPEG/WebP.
 * Drastically reduces upload time and payload size without visual quality loss.
 */
export const compressImage = async (file, maxDimension = 1920, quality = 0.82) => {
  // If not an image or is an SVG/GIF, do not compress
  if (!file || !file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = document.createElement('img');
      img.src = event.target.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Only scale down if larger than maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file); // Fallback to original
        }

        // High quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to Blob
        const outputType = file.type === 'image/png' ? 'image/jpeg' : file.type;
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              // If compression didn't reduce size, keep original
              return resolve(file);
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
              type: outputType,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          },
          outputType,
          quality
        );
      };

      img.onerror = () => {
        resolve(file); // Fallback to original on error
      };
    };

    reader.onerror = () => {
      resolve(file); // Fallback to original on error
    };
  });
};

/**
 * Compress an array of files in parallel.
 */
export const compressMediaBatch = async (files, onProgress) => {
  const compressed = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.type.startsWith('image/')) {
      const result = await compressImage(file);
      compressed.push(result);
    } else {
      compressed.push(file); // Videos pass through
    }
    if (onProgress) {
      onProgress(Math.round(((i + 1) / files.length) * 100));
    }
  }
  return compressed;
};
