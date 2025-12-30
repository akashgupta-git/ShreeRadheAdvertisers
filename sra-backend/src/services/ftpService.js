const { uploadToFTP } = require('../config/ftp');

/**
 * Bridges files from the Render backend to Hostinger Storage via Standard FTP
 * @param {string} localPath - The temporary path on the Render server
 * @param {string} fileName - The generated unique filename
 * @param {string} folder - The target sub-folder (e.g., 'media', 'documents')
 */
exports.uploadToHostinger = async (localPath, fileName, folder = 'documents') => {
  try {
    console.log('=== Hostinger Upload Bridge (Standard FTP Mode) ===');
    console.log('Source file:', localPath);
    console.log('Target folder:', folder);
    
    // UPDATED: Dynamically construct the path based on the folder parameter
    // This allows the bridge to support both images and general documents
    const remotePath = `public_html/uploads/${folder}/${fileName}`;
    console.log('Full remote path:', remotePath);
    
    const fileUrl = await uploadToFTP(localPath, remotePath);
    console.log('Upload successful, URL:', fileUrl);
    
    return fileUrl;
  } catch (err) {
    console.error("=== FTP Upload Failed ===");
    console.error("Error:", err.message);
    // Explicitly throw the actual error message to help with frontend debugging
    throw new Error(`Failed to transfer to permanent storage: ${err.message}`);
  }
};