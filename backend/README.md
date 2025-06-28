# VEDARC Internship Platform - Backend

A comprehensive Flask-based backend API for the VEDARC Internship Platform, providing complete functionality for student registration, internship management, assignment submission, and administrative tasks.

## 🚀 Features

### Complete User Management
- **Student Registration & Authentication**: Secure registration with unique User IDs
- **HR Management**: User activation, password reset, and registration approval
- **Manager Dashboard**: Internship and content management
- **Admin Panel**: Complete system administration

### Internship Management
- **Multiple Tracks**: Basic Frontend, Advanced Frontend, Full Stack, Backend
- **Weekly Content**: Structured weekly assignments with resources
- **Assignment Submission**: GitHub and deployed link submissions
- **Progress Tracking**: Real-time submission status and feedback

### Advanced Features
- **JWT Authentication**: Secure token-based authentication
- **Email Notifications**: Automated email sending for account activation and password resets
- **Certificate Generation**: Automated certificate creation and management
- **Announcement System**: Real-time announcements for all users
- **Comprehensive API**: 40+ endpoints covering all functionality

## 📋 API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/internships` - Get all internship tracks
- `POST /api/register` - Student registration

### Student Endpoints
- `POST /api/student/login` - Student login
- `GET /api/student/internship-details` - Get internship details
- `GET /api/student/weeks` - Get weekly content
- `GET /api/student/announcements` - Get announcements
- `POST /api/student/submit-assignment` - Submit assignment
- `GET /api/student/submissions` - Get user submissions
- `GET /api/student/certificate` - Get certificate

### HR Endpoints
- `POST /api/hr/login` - HR login
- `GET /api/hr/pending-registrations` - Get pending registrations
- `POST /api/hr/activate-user` - Activate user account
- `POST /api/hr/reset-student-password` - Reset student password

### Manager Endpoints
- `POST /api/manager/login` - Manager login
- `GET /api/manager/internships` - Get internships
- `POST /api/manager/internships` - Create internship
- `PUT /api/manager/internships/<id>` - Update internship
- `DELETE /api/manager/internships/<id>` - Delete internship
- `GET /api/manager/internships/<id>/weeks` - Get weeks
- `POST /api/manager/internships/<id>/weeks` - Add week
- `PUT /api/manager/internships/<id>/weeks/<week_id>` - Update week
- `DELETE /api/manager/internships/<id>/weeks/<week_id>` - Delete week
- `GET /api/manager/announcements` - Get announcements
- `POST /api/manager/announcements` - Create announcement
- `PUT /api/manager/announcements/<id>` - Update announcement
- `DELETE /api/manager/announcements/<id>` - Delete announcement
- `GET /api/manager/internships/<id>/students` - Get students
- `GET /api/manager/internships/<id>/submissions` - Get submissions
- `POST /api/manager/submissions/<id>/review` - Review submission

### Admin Endpoints
- `POST /api/admin/login` - Admin login
- `GET /api/admin/users` - Get all users
- `GET /api/admin/internships` - Get all internships
- `POST /api/admin/internships` - Add internship
- `PUT /api/admin/internships/<id>` - Update internship
- `DELETE /api/admin/internships/<id>` - Delete internship
- `GET /api/admin/weeks` - Get all weeks
- `POST /api/admin/weeks` - Add week
- `PUT /api/admin/weeks/<id>` - Update week
- `DELETE /api/admin/weeks/<id>` - Delete week
- `GET /api/admin/submissions` - Get all submissions
- `PUT /api/admin/submissions/<id>` - Update submission
- `GET /api/admin/certificates` - Get all certificates
- `POST /api/admin/certificates` - Upload certificate
- `DELETE /api/admin/certificates/<id>` - Delete certificate
- `POST /api/admin/reset-user-password` - Reset user password
- `POST /api/admin/create-user` - Create user account
- `GET /api/admin/user-types` - Get user types

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.8+
- MongoDB (local or Atlas)
- SMTP server for email notifications

### 1. Clone and Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Configuration
Copy `env.example` to `.env` and configure:
```bash
cp env.example .env
```

Edit `.env` with your configuration:
```env
# Flask Configuration
FLASK_APP=app.py
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-change-this-in-production

# JWT Configuration
JWT_SECRET_KEY=vedarc-internship-secret-key-2024-change-this

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/vedarc_internship
# For production (MongoDB Atlas):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vedarc_internship?retryWrites=true&w=majority

# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=tech@vedarc.co.in
SMTP_PASSWORD=your-app-specific-password

# Admin Credentials (change these in production)
ADMIN_USERNAME=admin@vedarc.co.in
ADMIN_PASSWORD=vedarc_admin_2024

# HR Credentials (change these in production)
HR_USERNAME=hr@vedarc.co.in
HR_PASSWORD=vedarc_hr_2024

# Manager Credentials (change these in production)
MANAGER_USERNAME=manager@vedarc.co.in
MANAGER_PASSWORD=vedarc_manager_2024
```

### 3. Run the Application
```bash
python app.py
```

The server will start on `http://localhost:5000` and automatically initialize the database with sample data.

## 🧪 Testing

Run the comprehensive test suite:
```bash
python test_backend.py
```

This will test all endpoints and provide detailed feedback on functionality.

## 📊 Database Schema

### Collections

#### users
- `user_id` (String): Unique user identifier (e.g., VEDARC-FE-001)
- `fullName` (String): Full name
- `email` (String): Email address
- `whatsapp` (String): WhatsApp number
- `collegeName` (String): College/University name
- `track` (String): Internship track
- `yearOfStudy` (String): Current year of study
- `passoutYear` (Number): Expected graduation year
- `status` (String): Pending/Active/Completed
- `password` (String): Hashed password
- `payment_id` (String): Payment reference
- `certificate` (String): Certificate link
- `created_at` (Date): Registration date
- `activated_at` (Date): Activation date

#### internships
- `track_name` (String): Internship track name
- `duration` (String): Duration (e.g., "4 weeks")
- `description` (String): Track description
- `submission_type` (String): link/file
- `max_students` (Number): Maximum students allowed
- `created_at` (Date): Creation date
- `created_by` (String): Creator username

#### weeks
- `internship_id` (String): Reference to internship
- `week_number` (Number): Week number
- `title` (String): Week title
- `description` (String): Week description
- `track` (String): Track name
- `submission_type` (String): link/file
- `resources` (Array): Learning resources
- `created_at` (Date): Creation date
- `created_by` (String): Creator username

#### submissions
- `user_id` (String): Student user ID
- `fullName` (String): Student name
- `track` (String): Track name
- `week` (Number): Week number
- `githubLink` (String): GitHub repository link
- `deployedLink` (String): Deployed application link
- `description` (String): Assignment description
- `status` (String): Pending/Approved/Rejected
- `feedback` (String): Review feedback
- `submitted_at` (Date): Submission date
- `reviewed_at` (Date): Review date
- `reviewed_by` (String): Reviewer username

#### announcements
- `title` (String): Announcement title
- `content` (String): Announcement content
- `priority` (String): high/normal/low
- `created_at` (Date): Creation date
- `created_by` (String): Creator username

#### certificates
- `user_id` (String): Student user ID
- `fullName` (String): Student name
- `track` (String): Track name
- `certificate_link` (String): Certificate URL
- `issued_at` (Date): Issue date
- `issued_by` (String): Issuer username

#### admin_users
- `fullName` (String): Full name
- `email` (String): Email address
- `username` (String): Username
- `user_type` (String): admin/hr/manager
- `password` (String): Hashed password
- `created_at` (Date): Creation date
- `created_by` (String): Creator username

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password hashing
- **CORS Protection**: Cross-origin resource sharing protection
- **Input Validation**: Comprehensive input validation
- **Error Handling**: Secure error handling without information leakage

## 📧 Email Integration

The system includes automated email notifications for:
- Account activation
- Password resets
- Important announcements

Configure SMTP settings in `.env` for email functionality.

## 🚀 Deployment

### Local Development
```bash
python app.py
```

### Production Deployment
1. Set `FLASK_ENV=production` in `.env`
2. Use a production WSGI server like Gunicorn:
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Docker Deployment
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

## 🔧 Configuration

### Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET_KEY`: JWT signing key
- `SMTP_*`: Email configuration
- `ADMIN_*`: Admin credentials
- `HR_*`: HR credentials
- `MANAGER_*`: Manager credentials

### Default Credentials
- **Admin**: admin@vedarc.co.in / vedarc_admin_2024
- **HR**: hr@vedarc.co.in / vedarc_hr_2024
- **Manager**: manager@vedarc.co.in / vedarc_manager_2024

⚠️ **Important**: Change default credentials in production!

## 📈 Performance

- **Database Indexing**: Optimized MongoDB queries
- **Connection Pooling**: Efficient database connections
- **Response Caching**: Strategic response caching
- **Error Handling**: Graceful error handling

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify MongoDB is running
   - Check connection string in `.env`

2. **Email Not Sending**
   - Verify SMTP credentials
   - Check firewall settings
   - Use app-specific passwords for Gmail

3. **JWT Token Issues**
   - Verify JWT_SECRET_KEY is set
   - Check token expiration settings

4. **CORS Errors**
   - Verify CORS configuration
   - Check frontend URL in CORS settings

### Logs
Check application logs for detailed error information:
```bash
tail -f logs/app.log
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: tech@vedarc.co.in
- Documentation: Check the API documentation
- Issues: Create an issue on GitHub

---

**VEDARC Internship Platform Backend** - Complete, secure, and production-ready! 🚀 