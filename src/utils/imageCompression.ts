/**
 * Image compression utility for property images
 * Compresses images while maintaining good quality
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
  maxSizeKB?: number;
}

export interface CompressionResult {
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

/**
 * Compress a single image file
 */
export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'jpeg',
    maxSizeKB = 500
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = Math.min(width, maxWidth);
            height = width / aspectRatio;
          } else {
            height = Math.min(height, maxHeight);
            width = height * aspectRatio;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx!.drawImage(img, 0, 0, width, height);

        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // Create compressed file
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, `.${format === 'jpeg' ? 'jpg' : format}`),
              {
                type: `image/${format}`,
                lastModified: Date.now()
              }
            );

            const originalSize = file.size;
            const compressedSize = compressedFile.size;
            const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

            resolve({
              compressedFile,
              originalSize,
              compressedSize,
              compressionRatio
            });
          },
          `image/${format}`,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load image
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Compress multiple images with progress tracking
 */
export const compressImages = async (
  files: File[],
  options: CompressionOptions = {},
  onProgress?: (progress: number, currentFile: string) => void
): Promise<CompressionResult[]> => {
  const results: CompressionResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Update progress
    if (onProgress) {
      onProgress((i / files.length) * 100, file.name);
    }
    
    try {
      const result = await compressImage(file, options);
      results.push(result);
    } catch (error) {
      console.error(`Failed to compress ${file.name}:`, error);
      // Return original file if compression fails
      results.push({
        compressedFile: file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 0
      });
    }
  }
  
  // Final progress update
  if (onProgress) {
    onProgress(100, 'Complete');
  }
  
  return results;
};

/**
 * Get optimal compression settings based on image size and type
 */
export const getOptimalCompressionSettings = (file: File): CompressionOptions => {
  const sizeInMB = file.size / (1024 * 1024);
  
  // Adjust settings based on file size
  if (sizeInMB > 5) {
    // Large files - aggressive compression
    return {
      maxWidth: 1600,
      maxHeight: 900,
      quality: 0.7,
      format: 'jpeg',
      maxSizeKB: 400
    };
  } else if (sizeInMB > 2) {
    // Medium files - moderate compression
    return {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.8,
      format: 'jpeg',
      maxSizeKB: 500
    };
  } else {
    // Small files - light compression
    return {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.85,
      format: 'jpeg',
      maxSizeKB: 600
    };
  }
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }
  
  // Check supported formats
  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!supportedFormats.includes(file.type)) {
    return { valid: false, error: 'Unsupported image format. Please use JPEG, PNG, or WebP' };
  }
  
  // Check file size (max 10MB before compression)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: 'Image file is too large. Maximum size is 10MB' };
  }
  
  return { valid: true };
};
