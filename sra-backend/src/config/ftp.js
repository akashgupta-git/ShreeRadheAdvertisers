const Client = require('ssh2-sftp-client');
const path = require('path');

const sftpConfig = {
    host: process.env.FTP_HOST, 
    // Hostinger typically uses 65002 for SFTP/SSH access
    port: parseInt(process.env.SFTP_PORT || '65002'), 
    username: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    retries: 3,
    retryDelay: 2000,
    readyTimeout: 20000 
};

/**
 * Uploads a file using SFTP (Secure Shell File Transfer Protocol)
 * Resolves production 'Timeout (control socket)' errors by using a single secure channel.
 */
const uploadToFTP = async (localPath, remotePath) => {
    const sftp = new Client();
    
    try {
        console.log('=== SFTP Secure Upload Initiation ===');
        console.log('Local source:', localPath);
        console.log('Remote destination:', remotePath);

        await sftp.connect(sftpConfig);
        console.log('SFTP connection established successfully');

        // Ensure the remote directory exists recursively
        const remoteDir = path.dirname(remotePath);
        console.log('Ensuring directory exists:', remoteDir);
        await sftp.mkdir(remoteDir, true); 

        // Upload the file directly to the remote path
        await sftp.put(localPath, remotePath);
        console.log(`File securely transferred to: ${remotePath}`);

        // Construct public URL logic
        const baseUrl = process.env.CDN_BASE_URL || 'https://shreeradheadvertisers.com';
        
        // Isolate the web-accessible path after 'public_html/'
        const webPathParts = remotePath.split('public_html/');
        const webPath = webPathParts.length > 1 ? webPathParts[1] : remotePath;
        
        const finalUrl = `${baseUrl.replace(/\/$/, '')}/${webPath.replace(/^\//, '')}`;
        console.log('Generated Public URL:', finalUrl);

        return finalUrl;
    } catch (error) {
        console.error('SFTP Operation Error:', error.message);
        throw error;
    } finally {
        // Disconnect after each operation
        await sftp.end();
    }
};

/**
 * Deletes a file via SFTP
 */
const deleteFromFTP = async (remotePath) => {
    const sftp = new Client();
    try {
        await sftp.connect(sftpConfig);
        await sftp.delete(remotePath);
        console.log(`File deleted via SFTP: ${remotePath}`);
    } catch (error) {
        console.error('SFTP Deletion Error:', error.message);
        throw error;
    } finally {
        await sftp.end();
    }
};

module.exports = { uploadToFTP, deleteFromFTP };