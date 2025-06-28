# 🚀 Quick VEDARC Deployment Guide

## 📋 **Your Configuration**
- **MongoDB:** `mongodb+srv://vedarc:Vedarc6496@vedarc.venpk9a.mongodb.net/vedarc_internship`
- **Frontend:** Vercel (vedarc.co.in)
- **Backend:** Render (vedarc-backend-api.onrender.com)
- **Domain:** vedarc.co.in

---

## 🎯 **Step 1: Deploy Backend on Render (5 minutes)**

### 1.1 Go to Render
1. Visit [https://render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"

### 1.2 Connect Repository
1. Connect your VEDARC GitHub repository
2. Configure service:
   - **Name:** `vedarc-backend-api`
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`

### 1.3 Set Environment Variables
Add these in Render dashboard:

```env
FLASK_ENV=production
MONGODB_URI=mongodb+srv://vedarc:Vedarc6496@vedarc.venpk9a.mongodb.net/vedarc_internship?retryWrites=true&w=majority
JWT_SECRET_KEY=vedarc-super-secret-jwt-key-2024-change-this
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=tech@vedarc.co.in
SMTP_PASSWORD=your-gmail-app-password
ADMIN_USERNAME=admin@vedarc.co.in
ADMIN_PASSWORD=vedarc-admin-2024-secure
HR_USERNAME=hr@vedarc.co.in
HR_PASSWORD=vedarc-hr-2024-secure
MANAGER_USERNAME=manager@vedarc.co.in
MANAGER_PASSWORD=vedarc-manager-2024-secure
FRONTEND_ORIGIN=https://vedarc.co.in
```

### 1.4 Deploy
Click "Create Web Service" and wait for deployment.

---

## 🎨 **Step 2: Deploy Frontend on Vercel (5 minutes)**

### 2.1 Go to Vercel
1. Visit [https://vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"

### 2.2 Import Repository
1. Select your VEDARC repository
2. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 2.3 Set Environment Variable
Add this environment variable:
```env
VITE_API_BASE_URL=https://vedarc-backend-api.onrender.com/api
```

### 2.4 Deploy
Click "Deploy" and wait for build completion.

---

## 🌐 **Step 3: Setup Custom Domain (5 minutes)**

### 3.1 Add Domain in Vercel
1. Go to your Vercel project dashboard
2. Click "Settings" → "Domains"
3. Add: `vedarc.co.in`
4. Add: `www.vedarc.co.in`

### 3.2 Update DNS Records
At your domain registrar, add these records:

```
Type: A
Name: @
Value: 76.76.19.19

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## 🔒 **Step 4: Security Setup (5 minutes)**

### 4.1 Gmail App Password
1. Enable 2-factor authentication on Gmail
2. Generate App Password
3. Update `SMTP_PASSWORD` in Render

### 4.2 Change Default Passwords
Update these in Render environment variables:
```env
ADMIN_PASSWORD=your-very-secure-admin-password
HR_PASSWORD=your-very-secure-hr-password
MANAGER_PASSWORD=your-very-secure-manager-password
JWT_SECRET_KEY=your-very-long-random-secret-key
```

---

## 🧪 **Step 5: Testing (5 minutes)**

### 5.1 Test Backend
```bash
curl https://vedarc-backend-api.onrender.com/api/health
```
Should return: `{"status": "healthy", "message": "VEDARC API is running"}`

### 5.2 Test Frontend
1. Visit `https://vedarc.co.in`
2. Check browser console for errors
3. Test login with:
   - **Admin:** admin@vedarc.co.in / vedarc-admin-2024-secure
   - **HR:** hr@vedarc.co.in / vedarc-hr-2024-secure
   - **Manager:** manager@vedarc.co.in / vedarc-manager-2024-secure

---

## 🎉 **Success!**

Your VEDARC Internship Platform is now live at:
- **Frontend:** https://vedarc.co.in
- **Backend:** https://vedarc-backend-api.onrender.com
- **API Health:** https://vedarc-backend-api.onrender.com/api/health

---

## 📞 **If You Need Help**

### Common Issues:
1. **CORS Errors:** Check `FRONTEND_ORIGIN` in Render
2. **Database Errors:** Verify MongoDB connection string
3. **Build Errors:** Check Vercel build logs
4. **Domain Issues:** Wait for DNS propagation (up to 24 hours)

### Support:
- **Render Logs:** Check Render dashboard
- **Vercel Logs:** Check Vercel dashboard
- **MongoDB:** Check Atlas dashboard

**🎉 Your VEDARC Internship Platform is ready to go live! 🎉** 