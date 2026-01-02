const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads media to Cloudinary with folder organization by District
 */
exports.uploadToCloudinary = async (localPath, customId, district = 'General', type = 'media') => {
  try {
    // Organizes files: ShreeRadhe/Districts/DistrictName/Images/SRA_ID
    const folderPath = `ShreeRadhe/Districts/${district.trim()}/${type === 'media' ? 'Images' : 'Documents'}`;
    
    const result = await cloudinary.uploader.upload(localPath, {
      public_id: customId, // Sets filename as your SRA ID
      folder: folderPath,
      resource_type: 'auto',
      quality: "auto", // Perceptual compression
      fetch_format: "auto" // Auto-converts to WebP/AVIF
    });

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary Error:', error);
    throw new Error(`Cloudinary transfer failed: ${error.message}`);
  }
};