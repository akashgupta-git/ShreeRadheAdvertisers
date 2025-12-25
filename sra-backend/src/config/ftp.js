/**
 * FTP Configuration for Hostinger 100GB SSD Storage
 */

const ftp = require('basic-ftp');
const path = require('path');

const ftpConfig = {
  host: process.env.FTP_HOST,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  secure: process.env.FTP_SECURE === 'true',
  port: parseInt(process.env.FTP_PORT) || 21
};

/**
 * Upload a file to Hostinger FTP storage
 * @param {string} localPath - Local file path
 * @param {string} remotePath - Remote path on FTP server
 * @returns {Promise<string>} - Public URL of uploaded file
 */
const uploadToFTP = async (localPath, remotePath) => {
  const client = new ftp.Client();
  client.ftp.verbose = process.env.NODE_ENV === 'development';

  try {
    await client.access(ftpConfig);
    const remoteDir = path.dirname(remotePath);
    await client.ensureDir(remoteDir);
    await client.uploadFrom(localPath, remotePath);
    console.log(`File uploaded to FTP: ${remotePath}`);
    return `${process.env.CDN_BASE_URL || 'https://yourdomain.com'}${remotePath}`;
  } catch (error) {
    console.error('FTP upload error:', error);
    throw error;
  } finally {
    client.close();
  }
};

/**
 * Delete a file from Hostinger FTP storage
 * @param {string} remotePath - Remote path on FTP server
 */
const deleteFromFTP = async (remotePath) => {
  const client = new ftp.Client();
  client.ftp.verbose = process.env.NODE_ENV === 'development';

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
