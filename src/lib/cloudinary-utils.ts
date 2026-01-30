/**
 * Cloudinary Utility Functions
 * Helper functions for working with Cloudinary URLs and file management
 */

/**
 * Check if a URL is a valid Cloudinary URL
 * @param url - URL to check
 * @returns boolean
 */
export function isCloudinaryUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return false;
  }
  
  // Reject static file paths
  if (url.includes('placeholder.jpg') || 
      url.includes('/assets/images/') || 
      url.startsWith('/assets/') || 
      url.startsWith('assets/')) {
    return false;
  }
  
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
}

/**
 * Extract public_id from Cloudinary URL
 * @param url - Cloudinary URL
 * @returns public_id or null
 */
export function extractCloudinaryPublicId(url: string): string | null {
  if (!isCloudinaryUrl(url)) {
    return null;
  }
  
  try {
    // Cloudinary URLs format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{transformations}/{public_id}.{format}
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) {
      return null;
    }
    
    // Get everything after 'upload' and before the file extension
    const afterUpload = urlParts.slice(uploadIndex + 1);
    const lastPart = afterUpload[afterUpload.length - 1];
    const publicIdWithExt = afterUpload.join('/');
    
    // Remove file extension
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
    
    return publicId || null;
  } catch (error) {
    console.error('Error extracting Cloudinary public_id:', error);
    return null;
  }
}

/**
 * Get Cloudinary transformation URL for optimized images
 * @param url - Original Cloudinary URL
 * @param width - Desired width
 * @param height - Desired height (optional)
 * @param quality - Image quality (optional, default: auto)
 * @returns Transformed URL
 */
export function getCloudinaryImageUrl(
  url: string,
  width?: number,
  height?: number,
  quality: string | number = 'auto'
): string {
  if (!isCloudinaryUrl(url)) {
    return url;
  }
  
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const uploadIndex = pathParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) {
      return url;
    }
    
    // Build transformation string
    const transformations: string[] = [];
    
    if (width) {
      transformations.push(`w_${width}`);
    }
    
    if (height) {
      transformations.push(`h_${height}`);
    }
    
    if (quality) {
      transformations.push(`q_${quality}`);
    }
    
    // Add crop mode if both width and height are specified
    if (width && height) {
      transformations.push('c_fill');
    }
    
    const transformString = transformations.length > 0 ? transformations.join(',') + '/' : '';
    
    // Insert transformation after 'upload'
    pathParts.splice(uploadIndex + 1, 0, transformString);
    
    urlObj.pathname = pathParts.join('/');
    return urlObj.toString();
  } catch (error) {
    console.error('Error generating Cloudinary transformation URL:', error);
    return url;
  }
}
