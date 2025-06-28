# VEDARC Internship Platform - Complete Database Guide

## 🗄️ Database Overview

Your VEDARC Internship Platform uses **MongoDB** as the primary database. The database is fully configured and ready for both development and production deployment.

## 📊 Database Configuration

### ✅ **Current Setup**
- **Database**: MongoDB (NoSQL)
- **Connection**: Configured via environment variables
- **Collections**: 8 collections with proper relationships
- **Auto-Initialization**: Sample data created automatically

### 🔧 **Connection Configuration**

The database connection is configured in `backend/app.py`:

```python
# MongoDB Connection
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/vedarc_internship')
client = MongoClient(MONGODB_URI)
db = client.get_database()

# Collections
users = db['users']
internships = db['internships']
weeks = db['weeks']
submissions = db['submissions']
payments = db['payments']
certificates = db['certificates']
announcements = db['announcements']
admin_users = db['admin_users']
```

## 📋 Database Schema

### 1. **users** Collection
**Purpose**: Store student user accounts

```javascript
{
  "_id": ObjectId,
  "user_id": "VEDARC-FE-001",           // Unique user identifier
  "fullName": "John Doe",               // Full name
  "email": "john@example.com",          // Email address
  "whatsapp": "+1234567890",            // WhatsApp number
  "collegeName": "Example University",  // College/University
  "track": "Basic Frontend",            // Internship track
  "yearOfStudy": "3rd Year",            // Current year
  "passoutYear": 2025,                  // Graduation year
  "status": "Pending",                  // Pending/Active/Completed
  "password": "hashed_password",        // Bcrypt hashed password
  "payment_id": "PAY123456",            // Payment reference
  "certificate": "certificate_link",    // Certificate URL
  "created_at": ISODate,                // Registration date
  "activated_at": ISODate               // Activation date
}
```

### 2. **internships** Collection
**Purpose**: Store internship tracks

```javascript
{
  "_id": ObjectId,
  "track_name": "Basic Frontend",       // Track name
  "duration": "4 weeks",                // Duration
  "description": "Learn HTML, CSS...",  // Description
  "submission_type": "link",            // link/file
  "max_students": 50,                   // Maximum students
  "created_at": ISODate,                // Creation date
  "created_by": "system"                // Creator
}
```

### 3. **weeks** Collection
**Purpose**: Store weekly content for internships

```javascript
{
  "_id": ObjectId,
  "internship_id": "internship_id",     // Reference to internship
  "week_number": 1,                     // Week number
  "title": "Introduction to Frontend",  // Week title
  "description": "Week description",    // Description
  "track": "Basic Frontend",            // Track name
  "submission_type": "link",            // link/file
  "resources": [                        // Learning resources
    {
      "title": "Getting Started Guide",
      "link": "https://example.com/guide"
    }
  ],
  "created_at": ISODate,                // Creation date
  "created_by": "system"                // Creator
}
```

### 4. **submissions** Collection
**Purpose**: Store student assignment submissions

```javascript
{
  "_id": ObjectId,
  "user_id": "VEDARC-FE-001",           // Student user ID
  "fullName": "John Doe",               // Student name
  "track": "Basic Frontend",            // Track name
  "week": 1,                            // Week number
  "githubLink": "https://github.com/...", // GitHub link
  "deployedLink": "https://app.vercel.app", // Deployed link
  "description": "Assignment description", // Description
  "status": "Pending",                  // Pending/Approved/Rejected
  "feedback": "Review feedback",        // Feedback from reviewer
  "submitted_at": ISODate,              // Submission date
  "reviewed_at": ISODate,               // Review date
  "reviewed_by": "manager@vedarc.co.in" // Reviewer
}
```

### 5. **announcements** Collection
**Purpose**: Store system announcements

```javascript
{
  "_id": ObjectId,
  "title": "Welcome to VEDARC!",        // Announcement title
  "content": "Welcome message...",      // Content
  "priority": "high",                   // high/normal/low
  "created_at": ISODate,                // Creation date
  "created_by": "system"                // Creator
}
```

### 6. **certificates** Collection
**Purpose**: Store student certificates

```javascript
{
  "_id": ObjectId,
  "user_id": "VEDARC-FE-001",           // Student user ID
  "fullName": "John Doe",               // Student name
  "track": "Basic Frontend",            // Track name
  "certificate_link": "https://...",    // Certificate URL
  "issued_at": ISODate,                 // Issue date
  "issued_by": "admin@vedarc.co.in"     // Issuer
}
```

### 7. **admin_users** Collection
**Purpose**: Store admin, HR, and manager accounts

```javascript
{
  "_id": ObjectId,
  "fullName": "VEDARC Admin",           // Full name
  "email": "admin@vedarc.co.in",        // Email
  "username": "admin@vedarc.co.in",     // Username
  "user_type": "admin",                 // admin/hr/manager
  "password": "hashed_password",        // Bcrypt hashed password
  "created_at": ISODate,                // Creation date
  "created_by": "system"                // Creator
}
```

### 8. **payments** Collection
**Purpose**: Store payment records (reserved for future use)

```javascript
{
  "_id": ObjectId,
  "user_id": "VEDARC-FE-001",           // Student user ID
  "payment_id": "PAY123456",            // Payment reference
  "amount": 999,                        // Amount
  "status": "completed",                // Payment status
  "created_at": ISODate                 // Payment date
}
```

## 🚀 Database Setup Options

### Option 1: MongoDB Atlas (Recommended for Production)

#### 1. **Create MongoDB Atlas Account**
- Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
- Sign up for free account
- Create new project

#### 2. **Create Cluster**
- Choose "Shared" (free tier)
- Select cloud provider (AWS/Google Cloud/Azure)
- Choose region closest to your users
- Click "Create"

#### 3. **Set Up Database Access**
- Go to "Database Access"
- Click "Add New Database User"
- Create username and password
- Select "Read and write to any database"
- Click "Add User"

#### 4. **Set Up Network Access**
- Go to "Network Access"
- Click "Add IP Address"
- For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
- For production: Add your server IP addresses

#### 5. **Get Connection String**
- Go to "Database"
- Click "Connect"
- Choose "Connect your application"
- Copy the connection string

#### 6. **Update Environment Variables**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vedarc_internship?retryWrites=true&w=majority
```

### Option 2: Local MongoDB (Development)

#### 1. **Install MongoDB**
**Windows:**
```bash
# Download from https://www.mongodb.com/try/download/community
# Install MongoDB Community Server
```

**macOS:**
```bash
brew install mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install mongodb
```

#### 2. **Start MongoDB Service**
**Windows:**
```bash
# MongoDB runs as a service automatically
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### 3. **Create Database**
```bash
mongo
use vedarc_internship
```

#### 4. **Environment Variable**
```env
MONGODB_URI=mongodb://localhost:27017/vedarc_internship
```

### Option 3: Docker MongoDB (Development)

#### 1. **Create docker-compose.yml**
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    container_name: vedarc_mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: vedarc_internship
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

#### 2. **Run MongoDB**
```bash
docker-compose up -d
```

#### 3. **Environment Variable**
```env
MONGODB_URI=mongodb://localhost:27017/vedarc_internship
```

## 🔄 Database Initialization

### ✅ **Automatic Initialization**

The database is automatically initialized when you start the backend:

```python
def initialize_database():
    """Initialize database with default data"""
    # Creates default internships, weeks, announcements, and admin users
```

### 📊 **Sample Data Created**

#### **Default Internships:**
1. **Basic Frontend** (4 weeks)
2. **Advanced Frontend** (6 weeks)
3. **Full Stack** (8 weeks)
4. **Backend** (6 weeks)

#### **Sample Weeks:**
- Week 1: Introduction to each track
- Week 2: Advanced concepts for each track

#### **Sample Announcements:**
- Welcome message
- Assignment submission guidelines

#### **Default Admin Users:**
- **Admin**: admin@vedarc.co.in / vedarc_admin_2024
- **HR**: hr@vedarc.co.in / vedarc_hr_2024
- **Manager**: manager@vedarc.co.in / vedarc_manager_2024

## 🔧 Database Configuration

### Environment Variables

Create `.env` file in backend directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vedarc_internship?retryWrites=true&w=majority

# For local development:
# MONGODB_URI=mongodb://localhost:27017/vedarc_internship
```

### Connection Options

```python
# Basic connection
MONGODB_URI = 'mongodb://localhost:27017/vedarc_internship'

# Atlas connection with options
MONGODB_URI = 'mongodb+srv://username:password@cluster.mongodb.net/vedarc_internship?retryWrites=true&w=majority&maxPoolSize=10&minPoolSize=5'

# Connection with authentication
MONGODB_URI = 'mongodb://username:password@localhost:27017/vedarc_internship'
```

## 📈 Database Performance

### ✅ **Optimizations Implemented**

1. **Connection Pooling**: Efficient connection management
2. **Indexing**: Proper indexes on frequently queried fields
3. **Query Optimization**: Efficient queries with proper filtering
4. **Error Handling**: Graceful error handling for database operations

### 🔍 **Recommended Indexes**

```javascript
// Users collection
db.users.createIndex({ "user_id": 1 }, { unique: true })
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "track": 1 })
db.users.createIndex({ "status": 1 })

// Submissions collection
db.submissions.createIndex({ "user_id": 1 })
db.submissions.createIndex({ "track": 1 })
db.submissions.createIndex({ "week": 1 })
db.submissions.createIndex({ "status": 1 })

// Weeks collection
db.weeks.createIndex({ "track": 1 })
db.weeks.createIndex({ "internship_id": 1 })
db.weeks.createIndex({ "week_number": 1 })

// Announcements collection
db.announcements.createIndex({ "created_at": -1 })
```

## 🔒 Database Security

### ✅ **Security Measures**

1. **Authentication**: Username/password authentication
2. **Network Security**: IP whitelisting for production
3. **Data Encryption**: TLS/SSL encryption in transit
4. **Access Control**: Role-based access control
5. **Backup**: Regular automated backups (Atlas)

### 🛡️ **Production Security Checklist**

- [ ] Use strong database passwords
- [ ] Enable network access restrictions
- [ ] Use TLS/SSL connections
- [ ] Regular security updates
- [ ] Monitor database access
- [ ] Implement backup strategy

## 📊 Database Monitoring

### MongoDB Atlas Monitoring (Recommended)

1. **Performance Monitoring**: Real-time performance metrics
2. **Query Analysis**: Slow query identification
3. **Resource Usage**: CPU, memory, disk usage
4. **Connection Monitoring**: Active connections tracking

### Local Monitoring

```bash
# Check database status
mongo --eval "db.stats()"

# Check collection statistics
mongo vedarc_internship --eval "db.users.stats()"

# Monitor queries
mongo --eval "db.setProfilingLevel(1)"
```

## 🔄 Database Migration

### Backup and Restore

#### **Backup Database**
```bash
# MongoDB Atlas (automatic)
# Local MongoDB
mongodump --db vedarc_internship --out backup/

# Docker MongoDB
docker exec vedarc_mongodb mongodump --db vedarc_internship --out /data/backup/
```

#### **Restore Database**
```bash
# Local MongoDB
mongorestore --db vedarc_internship backup/vedarc_internship/

# Docker MongoDB
docker exec vedarc_mongodb mongorestore --db vedarc_internship /data/backup/vedarc_internship/
```

## 🚨 Common Database Issues

### 1. **Connection Issues**
**Symptoms**: "Connection refused" or "Authentication failed"
**Solutions**:
- Check MongoDB service is running
- Verify connection string
- Check network access (Atlas)
- Verify credentials

### 2. **Performance Issues**
**Symptoms**: Slow queries or timeouts
**Solutions**:
- Add proper indexes
- Optimize queries
- Check connection pooling
- Monitor resource usage

### 3. **Data Consistency Issues**
**Symptoms**: Missing or duplicate data
**Solutions**:
- Check application logic
- Verify unique constraints
- Review data validation
- Check for race conditions

## 📞 Database Support

### MongoDB Atlas Support
- 24/7 support for paid plans
- Documentation: [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- Community forum: [MongoDB Community](https://community.mongodb.com/)

### Local MongoDB Support
- Documentation: [MongoDB Manual](https://docs.mongodb.com/manual/)
- Community forum: [MongoDB Community](https://community.mongodb.com/)

## ✅ Database Verification

### Test Database Connection
```bash
cd backend
python -c "
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/vedarc_internship'))
db = client.get_database()
print('✅ Database connection successful!')
print(f'Database: {db.name}')
print(f'Collections: {db.list_collection_names()}')
"
```

### Test Database Operations
```bash
cd backend
python test_backend.py
# This will test all database operations
```

---

## 🎯 **Database Status: READY**

Your VEDARC Internship Platform database is:

- ✅ **Fully Configured**: MongoDB with proper collections
- ✅ **Auto-Initialized**: Sample data created automatically
- ✅ **Production Ready**: Supports Atlas and local deployment
- ✅ **Secure**: Authentication and encryption ready
- ✅ **Optimized**: Proper indexing and performance tuning
- ✅ **Monitored**: Ready for production monitoring

**Your database is ready for deployment! 🚀** 