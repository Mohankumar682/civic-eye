# CivicEye AI+ - Setup & Deployment Guide

Complete guide for setting up and deploying CivicEye locally and to production.

## Table of Contents
1. [Local Development](#local-development)
2. [MongoDB Setup](#mongodb-setup)
3. [Environment Configuration](#environment-configuration)
4. [Running the Application](#running-the-application)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Local Development

### Prerequisites
- Node.js 16+ (LTS recommended)
- npm or yarn
- MongoDB 4.4+ (local or Atlas)
- Git

### Installation Steps

#### 1. Clone Repository
```bash
git clone <repository-url>
cd civic-eye
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
touch .env

# Edit .env with your configuration (see Environment Configuration)
```

#### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env if needed (frontend uses localhost:5000 by default)
```

---

## MongoDB Setup

### Option 1: Local MongoDB

#### Windows
```powershell
# Download MongoDB Community Edition from mongodb.com
# Or use Chocolatey
choco install mongodb-community

# Start MongoDB service
net start MongoDB

# Verify connection
mongo
```

#### macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify
mongosh
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb

# Start service
sudo systemctl start mongodb

# Verify
mongosh
```

### Option 2: MongoDB Atlas (Cloud)

1. **Create Account**
   - Visit https://www.mongodb.com/cloud/atlas
   - Sign up for free tier account

2. **Create Cluster**
   - Click "Create" → Choose Free Tier (M0)
   - Select region closest to you
   - Create cluster (takes ~5 minutes)

3. **Security Setup**
   - Go to Security → Database Access
   - Add Database User:
     - Username: `civic_eye_user`
     - Password: Generate strong password
   - Go to Network Access → Add IP Address
     - Add `0.0.0.0/0` for development (restrict in production)

4. **Get Connection String**
   - Click "Connect" on cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password

5. **Update .env**
   ```
   MONGO_URI=mongodb+srv://civic_eye_user:<password>@cluster0.xxxxx.mongodb.net/civic_eye?retryWrites=true&w=majority
   ```

---

## Environment Configuration

### Backend .env

Create `backend/.env`:

```env
# Database
MONGO_URI=mongodb://127.0.0.1:27017/civic_eye
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/civic_eye

# JWT
JWT_SECRET=your_very_secure_random_secret_key_minimum_32_characters

# Server
PORT=5000
NODE_ENV=development
```

**Generating Secure JWT_SECRET:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

### Frontend Configuration

Frontend automatically connects to `http://localhost:5000`

If deploying backend elsewhere, update API URL in components or create `.env.local`:

```env
VITE_API_URL=https://your-api-domain.com
```

Then update components:
```javascript
const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';
```

---

## Running the Application

### Development Mode

#### Terminal 1: Backend

```bash
cd backend

# Run with auto-reload
npm run dev

# Output should show:
# Server running on port 5000
# MongoDB Connected to mongodb://127.0.0.1:27017/civic_eye
```

#### Terminal 2: Frontend

```bash
cd frontend

# Start Vite dev server
npm run dev

# Output should show:
# VITE v5.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5173/
```

Visit `http://localhost:5173` in your browser.

### Testing the Application

1. **Register Account**
   - Go to /register
   - Create user account
   - Can select "City Official (Admin)" role for testing dashboard

2. **Report Issue**
   - Navigate to /submit
   - Fill in issue details
   - Click on map to set location
   - Upload optional image
   - Submit

3. **View Home**
   - Go to /
   - See map with reported issues
   - Try filtering and sorting

4. **Admin Dashboard** (if registered as admin)
   - Navigate to /dashboard
   - View analytics
   - Update issue statuses

---

## Production Deployment

### Frontend Deployment (Vercel)

#### 1. Build
```bash
cd frontend
npm run build
# Creates dist/ folder
```

#### 2. Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel
```

**Option B: Drag & Drop**
- Go to vercel.com
- Log in with GitHub
- Import repository
- Click Deploy

#### 3. Environment Variables
In Vercel dashboard:
- Go to Settings → Environment Variables
- Add `VITE_API_URL=https://your-api-domain.com`

### Backend Deployment (Railway/Heroku)

#### Option 1: Railway (Recommended)

1. **Connect Repository**
   - Go to railway.app
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Select your repository

2. **Configure**
   - Railway auto-detects Node.js
   - Go to Variables tab
   - Add environment variables:
     ```
     MONGO_URI=mongodb+srv://...
     JWT_SECRET=your_secret
     NODE_ENV=production
     ```

3. **Database**
   - Click "Add Service"
   - Select "MongoDB"
   - Railway creates and connects automatically

4. **Deploy**
   - Railway auto-deploys on push to main

#### Option 2: Heroku

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create your-app-name

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Update Frontend API URL

After deploying backend:

1. Get backend URL (e.g., `https://your-api.railway.app`)
2. Update frontend environment variables:
   - Vercel: Settings → Environment Variables → Add `VITE_API_URL`
3. Update deployed components if needed to use new API URL
4. Redeploy frontend

---

## Database Backup & Restore

### MongoDB Atlas

**Manual Backup:**
- Atlas handles automatic daily backups
- Restore: Atlas → Deployment → Snapshots → Restore

**Export Data:**
```bash
# Export to JSON
mongoexport --uri "mongodb://..." --collection issues --out issues.json

# Import from JSON
mongoimport --uri "mongodb://..." --collection issues --file issues.json
```

### Local MongoDB

**Backup:**
```bash
mongodump --db civic_eye --out ./backup
```

**Restore:**
```bash
mongorestore --db civic_eye ./backup/civic_eye
```

---

## Performance Optimization

### Backend

1. **Add Indexes** (in MongoDB):
```javascript
// In Issue model
IssueSchema.index({ status: 1 });
IssueSchema.index({ category: 1 });
IssueSchema.index({ createdAt: -1 });
```

2. **Enable Compression**:
```javascript
const compression = require('compression');
app.use(compression());
```

3. **Add Caching**:
```bash
npm install redis
# Update analytics endpoints with Redis caching
```

### Frontend

1. **Code Splitting**:
```javascript
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

2. **Image Optimization**:
- Convert images to WebP
- Serve different sizes for mobile/desktop

3. **Bundle Analysis**:
```bash
npm run build -- --analyze
```

---

## Security Checklist

### Backend
- [ ] Set strong JWT_SECRET
- [ ] Use HTTPS in production
- [ ] Add rate limiting
- [ ] Validate all inputs
- [ ] Use environment variables for secrets
- [ ] Enable CORS for specific domains only:
  ```javascript
  app.use(cors({
    origin: 'https://your-domain.com'
  }));
  ```

### Database
- [ ] Restrict MongoDB network access
- [ ] Use strong database credentials
- [ ] Enable MongoDB authentication
- [ ] Regular backups

### Frontend
- [ ] Remove console.log() calls
- [ ] Use Content Security Policy headers
- [ ] Enable HTTPS
- [ ] Validate user input client-side

---

## Monitoring & Logging

### Backend Logging

```javascript
// Winston logger example
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});
```

### Error Tracking

```bash
npm install sentry/node
```

---

## Troubleshooting

### Backend Won't Start

**Problem**: Port 5000 already in use
```bash
# Find process using port
lsof -i :5000
# Kill process
kill -9 <PID>
```

**Problem**: MongoDB connection failed
```bash
# Check MongoDB is running
mongosh

# Verify connection string in .env
# Test connection:
node -e "require('mongoose').connect('mongodb://127.0.0.1:27017/civic_eye')"
```

### Frontend API Errors

**CORS Errors**:
- Ensure backend is running
- Check CORS headers in server.js
- Verify API URL in frontend

**Environmental Variables**:
```bash
# Check if .env is loaded in Vite
console.log(import.meta.env.VITE_API_URL)
```

### Image Upload Not Working

**Problem**: Uploads directory doesn't exist
```bash
# Create from backend directory
mkdir uploads
```

**Problem**: File too large
- Increase multer size limit
- Compress before upload

### Map Not Loading

**Problem**: Leaflet CSS not imported
```javascript
// Make sure in main.jsx:
import 'leaflet/dist/leaflet.css';
```

**Problem**: API Key issues (if using different map provider)
- Verify Leaflet API key if using Mapbox
- OpenStreetMap doesn't require API key

---

## Useful Commands

```bash
# Backend
npm run dev           # Start development
npm start            # Production server
npm run lint         # Run linter

# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Database
mongosh              # Connect to MongoDB
db.issues.find()     # Query issues
db.issues.count()    # Count issues
```

---

## Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
- [Express Documentation](https://expressjs.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs/)

---

## Getting Help

1. Check logs: `npm run dev` output
2. Check browser console (F12)
3. Check MongoDB connection
4. Review API endpoints in API_DOCUMENTATION.md
5. Create GitHub issue

---

Last Updated: April 2024
