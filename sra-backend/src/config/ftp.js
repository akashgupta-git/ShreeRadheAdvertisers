const ftp = require("basic-ftp");
const path = require("path");

const ftpConfig = {
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    port: 21, // Standard FTP port
    secure: false,
    timeout: 60000, 
    settings: {
        retries: 2,
        retryDelay: 5000
    }
};

/**
 * Uploads a file using standard FTP
 */
const uploadToFTP = async (localPath, remotePath) => {
    const client = new ftp.Client();
    client.ftp.verbose = true; // Equivalent to your previous debug: console.log
    
    try {
        console.log('=== FTP Upload Debug ===');
        console.log('Local file:', localPath);
        console.log('Remote path requested:', remotePath);

        await client.access(ftpConfig);
        console.log('FTP connected successfully');

        // Ensure the remote directory exists
        const remoteDir = path.dirname(remotePath);
        console.log('Ensuring directory exists:', remoteDir);
        await client.ensureDir(remoteDir);

        // Upload the file
        await client.uploadFrom(localPath, path.basename(remotePath));
        console.log(`File uploaded successfully to: ${remotePath}`);

        // Build public URL - remove 'public_html/' for web access
        const baseUrl = process.env.CDN_BASE_URL || 'https://shreeradheadvertisers.com';
        const webPath = remotePath.replace('public_html/', '/');
        const finalUrl = `${baseUrl.replace(/\/$/, '')}${webPath}`;
        console.log('Generated URL:', finalUrl);

        return finalUrl;
    } catch (error) {
        console.error('FTP upload error:', error.message);
        throw error;
    } finally {
        client.close();
    }
};

/**
 * Deletes a file using standard FTP
 */
const deleteFromFTP = async (remotePath) => {
    const client = new ftp.Client();
    try {
        await client.access(ftpConfig);
        await client.remove(remotePath);
        console.log(`File deleted via FTP: ${remotePath}`);
    } catch (error) {
        console.error('FTP delete error:', error.message);
        throw error;
    } finally {
        client.close();
    }
};

module.exports = { uploadToFTP, deleteFromFTP };