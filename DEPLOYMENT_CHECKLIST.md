# 🚀 VEDARC Deployment Checklist

## ✅ **Pre-Deployment (COMPLETED)**
- [x] Backend code optimized for Render
- [x] Frontend code optimized for Vercel
- [x] Environment variables configured
- [x] CORS settings updated
- [x] Build process tested
- [x] Dependencies updated
- [x] MongoDB Atlas connection string ready

## 🔧 **Step 1: MongoDB Atlas (COMPLETED)**
- [x] MongoDB Atlas account created
- [x] Cluster: vedarc.venpk9a.mongodb.net
- [x] Database user: vedarc
- [x] Connection string: `mongodb+srv://vedarc:Vedarc6496@vedarc.venpk9a.mongodb.net/vedarc_internship?retryWrites=true&w=majority`

## 🎯 **Step 2: Render Backend**
- [ ] Sign up for Render
- [ ] Connect GitHub repository
- [ ] Create new Web Service
- [ ] Configure:
  - Name: `vedarc-backend-api`
  - Root Directory: `backend`
  - Build Command: `pip install -r requirements.txt`
  - Start Command: `gunicorn app:app`
- [ ] Set environment variables:
  - `FLASK_ENV=production`
  - `MONGODB_URI=mongodb+srv://vedarc:Vedarc6496@vedarc.venpk9a.mongodb.net/vedarc_internship?retryWrites=true&w=majority`
  - `JWT_SECRET_KEY=vedarc-super-secret-jwt-key-2024-change-this`
  - `SMTP_SERVER=smtp.gmail.com`
  - `SMTP_PORT=587`
  - `SMTP_USERNAME=tech@vedarc.co.in`
  - `SMTP_PASSWORD=your-gmail-app-password`
  - `ADMIN_USERNAME=admin@vedarc.co.in`
  - `ADMIN_PASSWORD=vedarc-admin-2024-secure`
  - `HR_USERNAME=hr@vedarc.co.in`
  - `HR_PASSWORD=vedarc-hr-2024-secure`
  - `MANAGER_USERNAME=manager@vedarc.co.in`
  - `MANAGER_PASSWORD=vedarc-manager-2024-secure`
  - `FRONTEND_ORIGIN=https://vedarc.co.in`
- [ ] Deploy and get backend URL

## 🎨 **Step 3: Vercel Frontend**
- [ ] Sign up for Vercel
- [ ] Import GitHub repository
- [ ] Configure:
  - Framework: Vite
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] Set environment variable:
  - `VITE_API_BASE_URL=https://vedarc-backend-api.onrender.com/api`
- [ ] Deploy frontend

## 🌐 **Step 4: Custom Domain**
- [ ] Add domain in Vercel: `vedarc.co.in`
- [ ] Add `www.vedarc.co.in`
- [ ] Update DNS records:
  - A record: `@` → `76.76.19.19`
  - CNAME record: `www` → `cname.vercel-dns.com`
- [ ] Wait for DNS propagation

## 🔒 **Step 5: Security**
- [ ] Change default admin passwords
- [ ] Set up Gmail App Password
- [ ] Verify SSL certificates
- [ ] Test all login flows

## 🧪 **Step 6: Testing**
- [ ] Test backend health: `https://vedarc-backend-api.onrender.com/api/health`
- [ ] Test frontend: `https://vedarc.co.in`
- [ ] Test login functionality
- [ ] Test API communication
- [ ] Check browser console for errors

## 📊 **Step 7: Monitoring**
- [ ] Set up Render monitoring
- [ ] Enable Vercel Analytics
- [ ] Monitor MongoDB Atlas
- [ ] Set up error alerts

---

## 🎯 **Quick Commands**

### Test Backend Health
```bash
curl https://vedarc-backend-api.onrender.com/api/health
```

### Check Frontend Build
```bash
cd frontend
npm run build
```

### Test Local Backend
```bash
cd backend
python app.py
```

---

## 📞 **Support URLs**
- **Render Dashboard:** https://dashboard.render.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Domain DNS:** Your domain registrar

---

## 🎉 **Success Indicators**
- ✅ Backend responds to health check
- ✅ Frontend loads without errors
- ✅ Login works for all user types
- ✅ API calls succeed
- ✅ SSL certificates active
- ✅ Custom domain working

**🎉 Your VEDARC Internship Platform will be live at https://vedarc.co.in! 🎉** 