# 🚀 VEDARC Internship Platform - Vercel + Render Deployment Guide

## 📋 **Deployment Architecture**
- **Frontend:** Vercel (vedarc.co.in)
- **Backend:** Render (api.vedarc.co.in)
- **Database:** MongoDB Atlas
- **Domain:** vedarc.co.in

---

## 🔧 **Step 1: MongoDB Atlas Setup**

### 1.1 Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Set up database access (username/password)
4. Set up network access (0.0.0.0/0 for development)
5. Get your connection string

### 1.2 Connection String Format
```
mongodb+srv://username:password@cluster.mongodb.net/vedarc_internship?retryWrites=true&w=majority
```

---

## 🎯 **Step 2: Backend Deployment on Render**

### 2.1 Create Render Account
1. Go to [Render](https://render.com)
2. Sign up with GitHub
3. Connect your repository

### 2.2 Deploy Backend Service
1. **Click "New +" → "Web Service"**
2. **Connect Repository:** Select your VEDARC repository
3. **Configure Service:**
   - **Name:** `vedarc-backend-api`
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`

### 2.3 Set Environment Variables
Add these environment variables in Render dashboard:

```env
FLASK_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vedarc_internship?retryWrites=true&w=majority
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=tech@vedarc.co.in
SMTP_PASSWORD=your-app-specific-password
ADMIN_USERNAME=admin@vedarc.co.in
ADMIN_PASSWORD=your-secure-admin-password
HR_USERNAME=hr@vedarc.co.in
HR_PASSWORD=your-secure-hr-password
MANAGER_USERNAME=manager@vedarc.co.in
MANAGER_PASSWORD=your-secure-manager-password
FRONTEND_ORIGIN=https://vedarc.co.in
```

### 2.4 Get Backend URL
After deployment, you'll get a URL like:
`https://vedarc-backend-api.onrender.com`

---

## 🎨 **Step 3: Frontend Deployment on Vercel**

### 3.1 Create Vercel Account
1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Import your repository

### 3.2 Deploy Frontend
1. **Import Project:** Select your VEDARC repository
2. **Configure Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 3.3 Set Environment Variables
Add this environment variable in Vercel:

```env
VITE_API_BASE_URL=https://vedarc-backend-api.onrender.com/api
```

### 3.4 Deploy
Click "Deploy" and wait for the build to complete.

---

## 🌐 **Step 4: Custom Domain Setup**

### 4.1 Domain Configuration in Vercel
1. Go to your Vercel project dashboard
2. Click "Settings" → "Domains"
3. Add your domain: `vedarc.co.in`
4. Add `www.vedarc.co.in` as well

### 4.2 DNS Configuration
Update your domain's DNS settings:

#### For Vercel (Frontend):
```
Type: A
Name: @
Value: 76.76.19.19

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### For Render (Backend) - Optional:
If you want `api.vedarc.co.in`:
```
Type: CNAME
Name: api
Value: vedarc-backend-api.onrender.com
```

### 4.3 SSL Certificate
- Vercel automatically provides SSL for your domain
- Render provides SSL automatically

---

## 🔒 **Step 5: Security Configuration**

### 5.1 Update Passwords
**CRITICAL:** Change these default passwords in Render environment variables:

```env
ADMIN_PASSWORD=your-very-secure-admin-password
HR_PASSWORD=your-very-secure-hr-password
MANAGER_PASSWORD=your-very-secure-manager-password
JWT_SECRET_KEY=your-very-long-random-secret-key
```

### 5.2 Email Configuration
Set up Gmail App Password:
1. Enable 2-factor authentication on Gmail
2. Generate App Password
3. Use it in `SMTP_PASSWORD`

---

## 🧪 **Step 6: Testing Deployment**

### 6.1 Test Backend Health
```bash
curl https://vedarc-backend-api.onrender.com/api/health
```

### 6.2 Test Frontend
1. Visit `https://vedarc.co.in`
2. Check browser console for errors
3. Test login functionality

### 6.3 Test API Communication
1. Open browser dev tools
2. Go to Network tab
3. Try to login
4. Verify API calls are working

---

## 🔧 **Step 7: Troubleshooting**

### Common Issues:

#### 1. CORS Errors
**Solution:** Verify `FRONTEND_ORIGIN` in Render environment variables

#### 2. Database Connection Issues
**Solution:** Check MongoDB Atlas network access and connection string

#### 3. Build Errors
**Solution:** Check Vercel build logs for missing dependencies

#### 4. Environment Variables Not Working
**Solution:** Redeploy after adding environment variables

---

## 📊 **Step 8: Monitoring & Maintenance**

### 8.1 Render Monitoring
- Check Render dashboard for service status
- Monitor logs for errors
- Set up alerts for downtime

### 8.2 Vercel Analytics
- Enable Vercel Analytics
- Monitor performance
- Track user behavior

### 8.3 Database Monitoring
- Monitor MongoDB Atlas metrics
- Set up alerts for storage/performance

---

## 🎉 **Deployment Complete!**

Your VEDARC Internship Platform is now live at:
- **Frontend:** https://vedarc.co.in
- **Backend:** https://vedarc-backend-api.onrender.com
- **API Health:** https://vedarc-backend-api.onrender.com/api/health

### Default Login Credentials:
- **Admin:** admin@vedarc.co.in / [your-admin-password]
- **HR:** hr@vedarc.co.in / [your-hr-password]
- **Manager:** manager@vedarc.co.in / [your-manager-password]

---

## 📞 **Support**

If you encounter issues:
1. Check Render logs
2. Check Vercel build logs
3. Verify environment variables
4. Test API endpoints individually
5. Check MongoDB Atlas status

**🎉 Congratulations! Your VEDARC Internship Platform is now live! 🎉** 