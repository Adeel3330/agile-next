import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

/**
 * Upload file to Cloudinary
 * @param file - File buffer or base64 string
 * @param folder - Folder path in Cloudinary
 * @param resourceType - 'image' or 'video'
 * @returns Promise with upload result
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  folder: string = 'sliders',
  resourceType: 'image' | 'video' | 'auto' = 'auto'
): Promise<{ url: string; public_id: string; resource_type: string }> {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder,
      resource_type: resourceType === 'auto' ? undefined : resourceType,
    };

    if (Buffer.isBuffer(file)) {
      cloudinary.uploader
        .upload_stream(uploadOptions, (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          if (!result) {
            reject(new Error('Upload failed: No result'));
            return;
          }
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type,
          });
        })
        .end(file);
    } else {
      cloudinary.uploader.upload(file, uploadOptions, (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result) {
          reject(new Error('Upload failed: No result'));
          return;
        }
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
          resource_type: result.resource_type,
        });
      });
    }
  });
}

/**
 * Delete file from Cloudinary
 * @param publicId - Public ID of the file to delete
 * @param resourceType - 'image' or 'video'
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' = 'image'
): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}
