const ftp = require("basic-ftp");
const path = require("path");

const uploadToFTP = async (localPath, remotePath) => {
    // 1. Pass a 0 timeout to disable control socket timeouts during transfer
    const client = new ftp.Client(0); 
    client.ftp.verbose = true;
    
    try {
        // 2. Disable NAT traversal issues common on Render
        client.ftp.allowSeparateTransferHost = false; 

        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            port: 21,
            secure: false, // TLS handshakes often cause timeouts in cloud envs
            timeout: 90000 // 90 second global timeout
        });

        client.ftp.pasv = true;

        const remoteDir = path.dirname(remotePath);
        await client.ensureDir(remoteDir);

        // 3. Fast upload directly from stream
        await client.uploadFrom(localPath, path.basename(remotePath));

        const baseUrl = process.env.CDN_BASE_URL || 'https://shreeradheadvertisers.com';
        const webPath = remotePath.replace('public_html/', '');
        return `${baseUrl.replace(/\/$/, '')}/${webPath.replace(/^\//, '')}`;
    } catch (error) {
        console.error('FTP Error:', error.message);
        throw error;
    } finally {
        client.close();
    }
};