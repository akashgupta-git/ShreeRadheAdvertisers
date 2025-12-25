# SRA Backend

Node.js/Express backend for Shree Radhe Advertisers outdoor advertising management system.

## Features

- MongoDB Atlas integration for data persistence
- FTP upload to Hostinger 100GB SSD storage
- RESTful API for media, customers, bookings, and payments
- Analytics endpoints for dashboard metrics

## Deployment

### Option 1: Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables from `.env.example`

### Option 2: Railway

1. Create a new project on [Railway](https://railway.app)
2. Deploy from GitHub
3. Add environment variables

### Option 3: Heroku

```bash
heroku create sra-backend
heroku config:set MONGODB_URI=your-mongodb-uri
git push heroku main
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

- `MONGODB_URI` - Your MongoDB Atlas connection string
- `FTP_HOST`, `FTP_USER`, `FTP_PASSWORD` - Hostinger FTP credentials
- `FRONTEND_URL` - Your frontend domain for CORS

## API Endpoints

### Analytics
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/city-loss` - Revenue loss by city
- `GET /api/analytics/vacant-sites/:city` - Vacant sites for a city
- `GET /api/analytics/revenue-trend` - Monthly revenue trend
- `GET /api/analytics/state-revenue` - Revenue by state

### Media
- `GET /api/media` - List all media
- `GET /api/media/:id` - Get single media
- `POST /api/media` - Create media
- `PUT /api/media/:id` - Update media
- `DELETE /api/media/:id` - Soft delete media

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer

### Bookings
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking

### Upload
- `POST /api/upload` - Upload file to FTP storage

## Local Development

```bash
npm install
npm run dev
```

Server runs on `http://localhost:5000`
