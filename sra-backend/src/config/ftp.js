/**
 * SFTP Configuration for Hostinger (Port 22)
 * This is more reliable for Render connections.
 */
const Client = require('ssh2-sftp-client');
const path = require('path');

const sftpConfig = {
  host: process.env.FTP_HOST,
  port: 22, // SFTP always uses port 22, not FTPS port 65002
  username: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  readyTimeout: 30000, // 30 seconds for slower connections
  retries: 2,
  retry_factor: 2,
  retry_minTimeout: 40000,
  debug: console.log,
  algorithms: {
    serverHostKey: ['ssh-rsa', 'ssh-dss', 'ecdsa-sha2-nistp256'] // Explicitly allow common keys
  }
};

const uploadToFTP = async (localPath, remotePath) => {
  const sftp = new Client();
  try {
    console.log('=== SFTP Upload Debug ===');
    console.log('Local file:', localPath);
    console.log('Remote path requested:', remotePath);
    
    await sftp.connect(sftpConfig);
    console.log('SFTP connected successfully');
    
    // List root directory to understand structure
    try {
      const rootList = await sftp.list('/');
      console.log('Root directory contents:', rootList.map(f => f.name));
    } catch (listErr) {
      console.log('Could not list root:', listErr.message);
    }
    
    // Ensure the remote directory exists
    const remoteDir = path.dirname(remotePath);
    console.log('Creating directory:', remoteDir);
    await sftp.mkdir(remoteDir, true);
    
    // Upload the file
    await sftp.put(localPath, remotePath);
    console.log(`File uploaded successfully to: ${remotePath}`);
    
    // Verify file exists
    try {
      const exists = await sftp.exists(remotePath);
      console.log('File verification:', exists ? 'EXISTS' : 'NOT FOUND');
    } catch (verifyErr) {
      console.log('Could not verify:', verifyErr.message);
    }
    
    // Build public URL - remove 'public_html/' prefix for web access
    const baseUrl = process.env.CDN_BASE_URL || 'https://shreeradheadvertisers.com';
    const webPath = remotePath.replace('public_html/', '/');
    const finalUrl = `${baseUrl.replace(/\/$/, '')}${webPath}`;
    console.log('Generated URL:', finalUrl);
    
    return finalUrl;
  } catch (error) {
    console.error('SFTP upload error:', error.message);
    console.error('Full error:', error);
    throw error;
  } finally {
    await sftp.end();
  }
};

const deleteFromFTP = async (remotePath) => {
  const sftp = new Client();
  try {
    await sftp.connect(sftpConfig);
    await sftp.delete(remotePath);
    console.log(`File deleted via SFTP: ${remotePath}`);
  } catch (error) {
    console.error('SFTP delete error:', error);
    throw error;
  } finally {
    await sftp.end();
  }
};

module.exports = { uploadToFTP, deleteFromFTP };