# VEDARC Internship Platform - Complete Deployment Guide

## 🚀 Overview

This guide provides step-by-step instructions for deploying the VEDARC Internship Platform to production. The project consists of:

- **Frontend**: React application (Vite)
- **Backend**: Flask API with MongoDB
- **API Service**: Centralized API communication layer

## 📁 Project Structure (Cleaned & Optimized)

```
VEDARC-Frontend-main/
├── src/                          # Frontend source code
│   ├── services/
│   │   └── apiService.js         # ✅ API service (correct location)
│   ├── components/
│   ├── pages/
│   └── assets/
├── backend/                      # Backend API
│   ├── app.py                   # ✅ Main Flask application
│   ├── requirements.txt         # Python dependencies
│   ├── env.example             # Environment template
│   ├── Procfile                # Heroku deployment
│   ├── runtime.txt             # Python runtime
│   ├── test_backend.py         # Test suite
│   └── README.md               # Backend documentation
├── public/                      # Static assets
├── package.json                 # Frontend dependencies
├── vite.config.js              # Vite configuration
└── README.md                   # Project documentation
```

## ✅ **API Service Location Confirmation**

**The API service is correctly located in `src/services/apiService.js`** - this is the proper location for a React application. It should NOT be moved to the backend.

### Why `src/services/` is correct:
1. **Frontend Responsibility**: API service handles frontend-to-backend communication
2. **React Convention**: Services belong in the frontend source code
3. **Build Process**: Gets bundled with the frontend application
4. **Environment Management**: Can be configured for different environments

## 🔧 Pre-Deployment Checklist

### ✅ Backend Verification
- [x] All 40+ API endpoints implemented
- [x] JWT authentication working
- [x] Database schema properly structured
- [x] Email functionality configured
- [x] No syntax or import errors
- [x] Test suite passes

### ✅ Frontend Verification
- [x] React application builds successfully
- [x] API service properly configured
- [x] All components working
- [x] No console errors

### ✅ Project Structure
- [x] Unnecessary files removed
- [x] Documentation organized
- [x] Clean project structure

## 🚀 Deployment Options

### Option 1: Heroku (Recommended)

#### Backend Deployment (Heroku)

1. **Create Heroku App**
```bash
cd backend
heroku create vedarc-backend-api
```

2. **Set Environment Variables**
```bash
heroku config:set MONGODB_URI="your-mongodb-atlas-uri"
heroku config:set JWT_SECRET_KEY="your-secret-key"
heroku config:set SMTP_USERNAME="your-email"
heroku config:set SMTP_PASSWORD="your-app-password"
heroku config:set ADMIN_USERNAME="admin@vedarc.co.in"
heroku config:set ADMIN_PASSWORD="vedarc_admin_2024"
heroku config:set HR_USERNAME="hr@vedarc.co.in"
heroku config:set HR_PASSWORD="vedarc_hr_2024"
heroku config:set MANAGER_USERNAME="manager@vedarc.co.in"
heroku config:set MANAGER_PASSWORD="vedarc_manager_2024"
```

3. **Deploy Backend**
```bash
git add .
git commit -m "Deploy backend"
git push heroku main
```

4. **Verify Backend**
```bash
heroku open
# Should show health check endpoint
```

#### Frontend Deployment (Vercel)

1. **Update API Base URL**
Edit `src/services/apiService.js`:
```javascript
const API_BASE_URL = 'https://your-backend-app.herokuapp.com/api'
```

2. **Deploy to Vercel**
```bash
npm run build
# Upload dist/ folder to Vercel
```

### Option 2: Vercel (Full Stack)

#### Backend Deployment (Vercel)

1. **Create `vercel.json` in backend folder**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "app.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app.py"
    }
  ]
}
```

2. **Deploy Backend**
```bash
cd backend
vercel --prod
```

#### Frontend Deployment (Vercel)

1. **Update API Base URL**
```javascript
const API_BASE_URL = 'https://your-backend.vercel.app/api'
```

2. **Deploy Frontend**
```bash
vercel --prod
```

### Option 3: Railway

#### Backend Deployment (Railway)

1. **Connect GitHub Repository**
2. **Set Environment Variables**
3. **Deploy Automatically**

#### Frontend Deployment (Railway)

1. **Update API Base URL**
2. **Deploy Frontend**

## 🔧 Environment Configuration

### Backend Environment Variables

Create `.env` file in backend directory:
```env
# Flask Configuration
FLASK_APP=app.py
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-change-this

# JWT Configuration
JWT_SECRET_KEY=vedarc-internship-secret-key-2024-change-this

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vedarc_internship

# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=tech@vedarc.co.in
SMTP_PASSWORD=your-app-specific-password

# Admin Credentials (CHANGE THESE!)
ADMIN_USERNAME=admin@vedarc.co.in
ADMIN_PASSWORD=vedarc_admin_2024
HR_USERNAME=hr@vedarc.co.in
HR_PASSWORD=vedarc_hr_2024
MANAGER_USERNAME=manager@vedarc.co.in
MANAGER_PASSWORD=vedarc_manager_2024
```

### Frontend Environment Variables

Create `.env` file in root directory:
```env
VITE_API_BASE_URL=https://your-backend-url.com/api
```

Update `src/services/apiService.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
```

## 🧪 Testing Deployment

### 1. Test Backend Health
```bash
curl https://your-backend-url.com/api/health
```

### 2. Test Frontend Build
```bash
npm run build
npm run preview
```

### 3. Test API Endpoints
```bash
cd backend
python test_backend.py
```

## 🔒 Security Checklist

### Backend Security
- [ ] Change default admin passwords
- [ ] Use strong JWT secret key
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets

### Frontend Security
- [ ] Use HTTPS in production
- [ ] Validate API responses
- [ ] Handle errors gracefully
- [ ] Secure token storage

## 📊 Database Setup

### MongoDB Atlas (Recommended)

1. **Create Cluster**
2. **Set Network Access** (0.0.0.0/0 for development)
3. **Create Database User**
4. **Get Connection String**
5. **Update Environment Variables**

### Local MongoDB (Development)

```bash
# Install MongoDB
# Start MongoDB service
# Create database
mongo
use vedarc_internship
```

## 🚨 Common Deployment Issues

### 1. CORS Errors
**Solution**: Update CORS configuration in backend
```python
CORS(app, origins=['https://your-frontend-domain.com'])
```

### 2. Environment Variables Not Set
**Solution**: Verify all environment variables are set in deployment platform

### 3. Database Connection Issues
**Solution**: Check MongoDB connection string and network access

### 4. Build Errors
**Solution**: Check Node.js version and dependencies

## 📈 Performance Optimization

### Backend
- Enable database indexing
- Use connection pooling
- Implement caching
- Monitor performance

### Frontend
- Optimize bundle size
- Enable compression
- Use CDN for assets
- Implement lazy loading

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: "your-backend-app"
          heroku_email: "your-email@example.com"

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📞 Support

For deployment issues:
1. Check the logs in your deployment platform
2. Verify environment variables
3. Test locally first
4. Check the backend test suite

## ✅ Final Verification

After deployment, verify:

1. **Backend Health**: `GET /api/health`
2. **Frontend Loads**: No console errors
3. **API Communication**: Login works
4. **Database Connection**: Data persists
5. **Email Functionality**: Test password reset

---

**🎉 Your VEDARC Internship Platform is now ready for production deployment!** 