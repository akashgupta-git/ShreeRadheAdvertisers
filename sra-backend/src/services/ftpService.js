const { uploadToFTP } = require('../config/ftp');

/**
 * Bridges files from the Render backend to Hostinger Storage via Standard FTP
 */
exports.uploadToHostinger = async (localPath, fileName) => {
  try {
    console.log('=== Hostinger Upload Bridge (FTP Mode) ===');
    console.log('Source file:', localPath);
    console.log('Target filename:', fileName);
    
    // Remote path remains the same as your folder structure hasn't changed
    const remotePath = `public_html/uploads/media/${fileName}`;
    console.log('Full remote path:', remotePath);
    
    const fileUrl = await uploadToFTP(localPath, remotePath);
    console.log('Upload successful, URL:', fileUrl);
    
    return fileUrl;
  } catch (err) {
    console.error("=== FTP Upload Failed ===");
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);
    throw new Error("Failed to transfer image to permanent storage.");
  }
};