const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload video to Cloudinary
 */
exports.uploadVideo = async (filePath, fileName) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      folder: 'lms/videos',
      public_id: fileName,
      quality: 'auto',
      eager: [
        {
          width: 300,
          height: 300,
          crop: 'pad',
          audio_codec: 'none',
        },
      ],
      eager_async: true,
    });

    return result;
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
};

/**
 * Upload image to Cloudinary
 */
exports.uploadImage = async (filePath, fileName) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'image',
      folder: 'lms/images',
      public_id: fileName,
      transformation: [
        {
          width: 400,
          height: 300,
          crop: 'fill',
        },
      ],
    });

    return result;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Delete file from Cloudinary
 */
exports.deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Get video thumbnail
 */
exports.getVideoThumbnail = (videoUrl) => {
  try {
    const publicId = videoUrl.split('/').pop().split('.')[0];
    return cloudinary.url(publicId, {
      resource_type: 'video',
      format: 'jpg',
      crop: 'fill',
      width: 400,
      height: 300,
    });
  } catch (error) {
    console.error('Error getting thumbnail:', error);
    throw error;
  }
};

/**
 * Get optimized video URL
 */
exports.getOptimizedVideoUrl = (videoUrl, quality = 'auto', maxWidth = 1280) => {
  try {
    const publicId = videoUrl.split('/').pop().split('.')[0];
    return cloudinary.url(publicId, {
      resource_type: 'video',
      quality: quality,
      crop: 'scale',
      width: maxWidth,
      fetch_format: 'auto',
    });
  } catch (error) {
    console.error('Error getting optimized URL:', error);
    throw error;
  }
};
