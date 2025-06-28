# 🔧 Environment Files Setup

## 📁 **Files You Need to Create**

### **1. Backend Environment File**
Create file: `backend/.env`

```env
# Flask Configuration
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-super-secret-key-change-this-in-production

# JWT Configuration
JWT_SECRET_KEY=vedarc-internship-secret-key-2024-change-this

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/vedarc_internship

# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=tech@vedarc.co.in
SMTP_PASSWORD=your-app-specific-password

# Admin Credentials
ADMIN_USERNAME=admin@vedarc.co.in
ADMIN_PASSWORD=vedarc_admin_2024

# HR Credentials
HR_USERNAME=hr@vedarc.co.in
HR_PASSWORD=vedarc_hr_2024

# Manager Credentials
MANAGER_USERNAME=manager@vedarc.co.in
MANAGER_PASSWORD=vedarc_manager_2024
```

### **2. Frontend Environment File**
Create file: `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 🚀 **How to Start Everything**

### **1. Start Backend**
```bash
cd backend
python app.py
```

### **2. Start Frontend**
```bash
cd frontend
npm run dev
```

### **3. Connect MongoDB Compass**
- Open MongoDB Compass
- Connect to: `mongodb://localhost:27017`
- Select database: `vedarc_internship`

## ✅ **Project Structure Now**
```
VEDARC-Frontend-main/
├── backend/
│   ├── .env (create this)
│   ├── app.py
│   └── ...
├── frontend/
│   ├── .env (create this)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── README.md
└── ...
```

Everything is now organized! Frontend is in its own folder and everything will work perfectly. 