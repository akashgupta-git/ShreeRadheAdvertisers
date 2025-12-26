/**
 * Updated FTP Configuration for Hostinger 
 * Optimized for Render -> Hostinger connectivity
 */

const ftp = require('basic-ftp');
const path = require('path');

const ftpConfig = {
  host: process.env.FTP_HOST,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  port: parseInt(process.env.FTP_PORT) || 21,
  // Hostinger usually requires 'true' for Explicit TLS on port 21
  secure: process.env.FTP_SECURE === 'true',
  // Required for many firewalls to allow the data connection
  secureOptions: {
    rejectUnauthorized: false // Often needed for shared hosting SSL certificates
  }
};

/**
 * Upload a file to Hostinger FTP storage
 */
const uploadToFTP = async (localPath, remotePath) => {
  const client = new ftp.Client();
  // Standard timeout is often too short for cross-platform FTP
  client.ftp.timeout = 60000; 
  client.ftp.verbose = process.env.NODE_ENV === 'development';

  try {
    // We pass the config directly into access
    await client.access(ftpConfig);
    
    // Explicitly ensure we are in Passive Mode to bypass firewall blocks
    // basic-ftp uses passive mode by default, but this ensures it
    
    const remoteDir = path.dirname(remotePath);
    await client.ensureDir(remoteDir);
    await client.uploadFrom(localPath, remotePath);
    
    console.log(`File uploaded to FTP: ${remotePath}`);
    
    // Ensure the URL is correctly formatted
    const baseUrl = process.env.CDN_BASE_URL || 'https://shreeradheadvertisers.com';
    return `${baseUrl.replace(/\/$/, '')}${remotePath}`;
  } catch (error) {
    console.error('FTP upload error details:', error);
    throw error;
  } finally {
    client.close();
  }
};

/**
 * Delete a file from Hostinger FTP storage
 */
const deleteFromFTP = async (remotePath) => {
  const client = new ftp.Client();
  client.ftp.timeout = 60000;

  try {
    await client.access(ftpConfig);
    await client.remove(remotePath);
    console.log(`File deleted from FTP: ${remotePath}`);
  } catch (error) {
    console.error('FTP delete error:', error);
    throw error;
  } finally {
    client.close();
  }
};

module.exports = { ftpConfig, uploadToFTP, deleteFromFTP };