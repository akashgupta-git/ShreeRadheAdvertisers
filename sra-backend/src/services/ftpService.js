const { uploadToFTP } = require('../config/ftp');

/**
 * Bridges files from the Render backend to Hostinger Storage via SFTP
 */
exports.uploadToHostinger = async (localPath, fileName) => {
  try {
    console.log('=== Hostinger Upload Bridge ===');
    console.log('Source file:', localPath);
    console.log('Target filename:', fileName);
    
    // Hostinger SFTP typically lands in user home, public_html is the web root
    // Try with relative path first (no leading slash)
    const remotePath = `public_html/uploads/media/${fileName}`;
    console.log('Full remote path:', remotePath);
    
    const fileUrl = await uploadToFTP(localPath, remotePath);
    console.log('Upload successful, URL:', fileUrl);
    
    return fileUrl;
  } catch (err) {
    console.error("=== SFTP Upload Failed ===");
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);
    throw new Error("Failed to transfer image to permanent storage.");
  }
};