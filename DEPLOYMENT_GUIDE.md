# Shree Radhe Advertisers - Deployment Guide

## System Overview

SRA OAM (Outdoor Advertising Management) is a full-stack application with:
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **File Storage**: Hostinger FTP (100GB)

---

## Prerequisites

### Required Accounts & Services
1. **MongoDB Atlas** - Free tier available at [mongodb.com](https://www.mongodb.com/atlas)
2. **Hostinger** - For web hosting and FTP storage
3. **Node.js** - v18+ recommended
4. **npm or bun** - Package manager

---

## Backend Deployment (sra-backend)

### Step 1: Set Up MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user with read/write permissions
3. Whitelist your server IP (or use 0.0.0.0/0 for all IPs)
4. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<database>?retryWrites=true&w=majority
   ```

### Step 2: Configure Environment Variables

Create `/sra-backend/.env` file:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/sra_database?retryWrites=true&w=majority

# JWT Secret (Generate a secure random string)
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters

# Server Configuration
PORT=5000
NODE_ENV=production

# FTP Configuration (Hostinger)
FTP_HOST=ftp.yourdomain.com
FTP_USER=your-ftp-username
FTP_PASSWORD=your-ftp-password
FTP_SECURE=true

# CORS Origin (Your frontend URL)
CORS_ORIGIN=https://yourdomain.com
```

### Step 3: Install Dependencies

```bash
cd sra-backend
npm install
```

### Step 4: Create Initial Admin User

Before first deployment, create an admin user in MongoDB:

```javascript
// Run in MongoDB Atlas or mongosh
db.adminusers.insertOne({
  username: "admin",
  password: "$2b$10$...", // bcrypt hashed password
  email: "admin@sra.com",
  role: "superadmin",
  name: "System Admin",
  createdAt: new Date()
})
```

Or use the registration endpoint (if enabled) to create the first user.

### Step 5: Deploy Backend

#### Option A: Deploy on Hostinger VPS

1. Upload `sra-backend` folder to your VPS
2. Install Node.js and npm
3. Install PM2 for process management:
   ```bash
   npm install -g pm2
   ```
4. Start the server:
   ```bash
   cd sra-backend
   pm2 start server.js --name "sra-api"
   pm2 save
   pm2 startup
   ```

#### Option B: Deploy on Render/Railway

1. Connect your GitHub repository
2. Set build command: `npm install`
3. Set start command: `node server.js`
4. Add environment variables from `.env`

#### Option C: Deploy on DigitalOcean App Platform

1. Create new app from GitHub
2. Configure as Node.js service
3. Add environment variables
4. Deploy

---

## Frontend Deployment

### Step 1: Configure API URL

Update `/src/lib/api/config.ts`:

```typescript
export const API_BASE_URL = 'https://api.yourdomain.com'; // Your backend URL
```

Or use environment variable:
```env
VITE_API_URL=https://api.yourdomain.com
```

### Step 2: Build for Production

```bash
# Install dependencies
npm install

# Build production bundle
npm run build
```

This creates a `dist` folder with optimized static files.

### Step 3: Deploy Frontend

#### Option A: Deploy on Lovable (Recommended)

1. Click "Publish" in Lovable editor
2. Your app is live at `yourproject.lovable.app`
3. Optionally connect custom domain in settings

#### Option B: Deploy on Hostinger

1. Build the project locally
2. Upload contents of `dist` folder to `public_html`
3. Configure `.htaccess` for SPA routing:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### Option C: Deploy on Vercel/Netlify

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables
5. Deploy

---

## Database Collections

The system uses these MongoDB collections:

| Collection | Description |
|------------|-------------|
| `adminusers` | Admin user accounts |
| `medias` | Media/hoarding locations |
| `bookings` | Customer bookings |
| `customers` | Client companies |
| `payments` | Payment records |
| `contacts` | Contact form submissions |
| `maintenances` | Maintenance records |
| `tenders` | Tender agreements |
| `taxrecords` | Tax payment records |

---

## File Storage (Hostinger FTP)

### FTP Structure
```
/public_html/
  /uploads/
    /media/           # Media images
    /documents/       # PDF documents
    /receipts/        # Payment receipts
```

### FTP Configuration
- Host: Usually `ftp.yourdomain.com` or server IP
- Port: 21 (FTP) or 22 (SFTP)
- Protocol: Use FTPS (FTP over SSL) for security

---

## Security Checklist

### Before Going Live

- [ ] Change default admin password
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS on both frontend and backend
- [ ] Configure CORS to only allow your domain
- [ ] Set up MongoDB Atlas IP whitelist
- [ ] Enable FTP over SSL (FTPS)
- [ ] Review RLS policies if using Supabase

### Environment Variables Security

- Never commit `.env` files to Git
- Use platform-specific secret management
- Rotate JWT secret periodically
- Use different secrets for development/production

---

## Monitoring & Maintenance

### Backend Logs (PM2)
```bash
# View logs
pm2 logs sra-api

# Monitor CPU/Memory
pm2 monit

# Restart if needed
pm2 restart sra-api
```

### MongoDB Backup
1. Enable automated backups in MongoDB Atlas
2. Or use mongodump for manual backups:
```bash
mongodump --uri="your-connection-string" --out=backup-$(date +%Y%m%d)
```

### Health Check Endpoint
Access `GET /api/health` to verify backend is running.

---

## Troubleshooting

### Common Issues

**1. CORS Errors**
- Ensure `CORS_ORIGIN` in backend matches frontend URL exactly
- Check for trailing slashes

**2. MongoDB Connection Failed**
- Verify connection string
- Check IP whitelist in Atlas
- Ensure user has correct permissions

**3. FTP Upload Failed**
- Verify FTP credentials
- Check if FTP_SECURE should be true/false
- Ensure upload directory exists and is writable

**4. JWT Token Expired**
- Tokens expire after the time set in JWT_EXPIRES_IN
- Default is 7 days
- User must re-login after expiry

**5. Images Not Loading**
- Check FTP upload path
- Verify public URL format
- Ensure proper permissions on uploaded files

---

## Support

For technical support:
- Email: tech@shreeradheadvertisers.com
- Developer: [Your Contact Info]

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-XX | Initial release |

---

## Quick Reference

### API Endpoints Base
```
Production: https://api.yourdomain.com/api
Development: http://localhost:5000/api
```

### Default Ports
- Frontend Dev: 5173 (Vite)
- Backend: 5000

### Key URLs
- Admin Panel: `/admin`
- Login: `/admin/login`
- API Health: `/api/health`
