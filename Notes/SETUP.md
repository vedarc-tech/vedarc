# VEDARC Internship Platform Setup Guide

## 🚀 Complete Setup Instructions

This guide will help you set up the VEDARC Internship Platform with both backend and frontend components.

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (v4.4 or higher)
- **Git**

## 🗄️ Database Setup

### 1. Install MongoDB

**Windows:**
```bash
# Download and install MongoDB Community Server from:
# https://www.mongodb.com/try/download/community

# Or use Chocolatey:
choco install mongodb
```

**macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
```

**Linux (Ubuntu):**
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org
```

### 2. Start MongoDB Service

**Windows:**
```bash
# Start MongoDB service
net start MongoDB

# Or start manually
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
```

**macOS/Linux:**
```bash
# Start MongoDB service
sudo systemctl start mongod

# Enable MongoDB to start on boot
sudo systemctl enable mongod

# Check status
sudo systemctl status mongod
```

### 3. Create Database and Collections

```bash
# Connect to MongoDB
mongosh

# Create database
use vedarc_internship

# Create collections (optional - they'll be created automatically)
db.createCollection('users')
db.createCollection('internships')
db.createCollection('weeks')
db.createCollection('submissions')
db.createCollection('payments')
db.createCollection('certificates')

# Exit MongoDB shell
exit
```

## 🔧 Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment (Recommended)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Create a `.env` file in the backend directory:
```env
# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=tech@vedarc.co.in
SMTP_PASSWORD=your-app-specific-password

# JWT Configuration
JWT_SECRET_KEY=vedarc-internship-secret-key-2024

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/vedarc_internship
```

### 5. Update Email Configuration
In `backend/app.py`, update the email settings:
```python
SMTP_USERNAME = "tech@vedarc.co.in"
SMTP_PASSWORD = "your-app-specific-password"  # Get this from Gmail
```

**To get Gmail App Password:**
1. Go to Google Account settings
2. Enable 2-factor authentication
3. Generate an App Password for "Mail"
4. Use that password in the configuration

### 6. Start Backend Server
```bash
python app.py
```

The backend will run on `http://localhost:5000`

## 🎨 Frontend Setup

### 1. Navigate to Project Root
```bash
cd ..  # If you're in backend directory
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🔐 Default Credentials

### HR Dashboard
- **URL:** `http://localhost:5173/hr-dashboard`
- **Username:** `hr@vedarc.co.in`
- **Password:** `vedarc_hr_2024`

### Admin Dashboard
- **URL:** `http://localhost:5173/admin-dashboard`
- **Username:** `admin@vedarc.co.in`
- **Password:** `vedarc_admin_2024`

## 📝 Initial Data Setup

### 1. Add Internship Tracks
Use the Admin Dashboard or add directly to MongoDB:

```javascript
// Connect to MongoDB
mongosh vedarc_internship

// Add internship tracks
db.internships.insertMany([
  {
    track_name: "Basic Frontend",
    duration: "4 weeks",
    description: "Learn HTML, CSS, JavaScript fundamentals",
    created_at: new Date()
  },
  {
    track_name: "Fullstack",
    duration: "6 weeks", 
    description: "Complete web development with React and Node.js",
    created_at: new Date()
  },
  {
    track_name: "AI & ML",
    duration: "8 weeks",
    description: "Machine learning and artificial intelligence",
    created_at: new Date()
  }
])
```

### 2. Add Weekly Content
```javascript
// Add weeks for Basic Frontend
db.weeks.insertMany([
  {
    track: "Basic Frontend",
    week_number: 1,
    resource_link: "https://drive.google.com/drive/folders/example1",
    submission_url: "https://forms.google.com/example1",
    created_at: new Date()
  },
  {
    track: "Basic Frontend", 
    week_number: 2,
    resource_link: "https://drive.google.com/drive/folders/example2",
    submission_url: "https://forms.google.com/example2",
    created_at: new Date()
  }
  // Add more weeks as needed
])
```

## 🧪 Testing the System

### 1. Test Registration
1. Go to `http://localhost:5173`
2. Scroll to "Internship Registration" section
3. Fill out the registration form
4. Submit and verify you get a User ID

### 2. Test HR Dashboard
1. Go to `http://localhost:5173/hr-dashboard`
2. Login with HR credentials
3. View pending registrations
4. Activate a user with a payment ID

### 3. Test Student Dashboard
1. Use the User ID and password sent to the student's email
2. Go to `http://localhost:5173/student-dashboard`
3. Login and view internship progress
4. Submit assignments

## 🔧 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```bash
# Check if MongoDB is running
sudo systemctl status mongod  # Linux/macOS
net start MongoDB             # Windows

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

**2. Port Already in Use**
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5000   # Windows
```

**3. Email Not Sending**
- Verify Gmail credentials
- Check if 2FA is enabled
- Use App Password instead of regular password
- Check firewall settings

**4. CORS Issues**
- Ensure backend is running on port 5000
- Check that frontend is making requests to correct URL
- Verify CORS configuration in backend

### Logs and Debugging

**Backend Logs:**
```bash
# Run with debug mode
python app.py

# Check logs in terminal output
```

**Frontend Logs:**
- Open browser Developer Tools (F12)
- Check Console tab for errors
- Check Network tab for API calls

## 🚀 Production Deployment

### Backend Deployment
1. Use a production WSGI server (Gunicorn)
2. Set up environment variables
3. Configure reverse proxy (Nginx)
4. Set up SSL certificates

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy to hosting service (Vercel, Netlify, etc.)
3. Update API endpoints to production URLs

### Database Deployment
1. Use MongoDB Atlas for cloud hosting
2. Set up proper authentication
3. Configure network access
4. Set up automated backups

## 📞 Support

For technical support or questions:
- Email: tech@vedarc.co.in
- GitHub Issues: [Create an issue](https://github.com/vedarc/internship-platform/issues)

## 🔄 Updates and Maintenance

### Regular Tasks
1. **Database Backups:** Set up automated daily backups
2. **Security Updates:** Keep dependencies updated
3. **Email Monitoring:** Check email delivery status
4. **Performance Monitoring:** Monitor server resources

### Adding New Features
1. Create feature branch
2. Implement changes
3. Test thoroughly
4. Update documentation
5. Deploy to staging
6. Deploy to production

---

**🎉 Congratulations! Your VEDARC Internship Platform is now ready to use!** 