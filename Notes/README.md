# VEDARC Technologies - Internship Platform

A comprehensive internship management system built with React and Flask, featuring a cyberpunk design aesthetic.

## 🚀 Features

### For Students
- **Public Registration**: Easy signup with unique User ID generation
- **Progress Tracking**: Real-time progress monitoring with visual indicators
- **Resource Access**: Weekly learning materials and assignments
- **Assignment Submission**: Upload assignments with status tracking
- **Certificate Download**: Automatic certificate generation upon completion

### For HR Team
- **Registration Management**: View and filter pending registrations
- **Payment Processing**: Manual payment verification and user activation
- **Email Notifications**: Automated login credential delivery
- **User Status Tracking**: Monitor student progress and completion

### For Admin/Super Admin
- **User Management**: Comprehensive user overview with filtering
- **Internship Tracks**: Add/edit internship programs and content
- **Weekly Content**: Manage learning resources and assignments
- **Analytics Dashboard**: Real-time statistics and insights
- **Certificate Management**: Upload and manage completion certificates

## 🎨 Design System

### Cyberpunk Aesthetic
- **Color Palette**: Deep blacks, neon magentas, cyans, and purples
- **Typography**: Orbitron + Rajdhani for headings, Inter for body text
- **Animations**: Framer Motion with glitch effects and neon glows
- **Components**: Modular design with consistent styling patterns

### Key Colors
```css
--neon-magenta: #00f9ff
--neon-cyan: #ff2d75  
--neon-purple: #7b2dff
--neon-orange: #ff2d75
--bg-dark: #0a0a12
--bg-void: #050508
```

## 🛠️ Technology Stack

### Frontend
- **React 19** with Vite
- **Framer Motion** for animations
- **React Router** for navigation
- **React Icons** for UI elements
- **CSS3** with custom properties

### Backend
- **Python Flask** with RESTful API
- **MongoDB** for data persistence
- **JWT** for authentication
- **SMTP** for email notifications
- **CORS** for cross-origin requests

## 📁 Project Structure

```
VEDARC-Frontend-main/
├── src/
│   ├── components/
│   │   ├── InternshipRegistration/     # Student registration form
│   │   ├── HRDashboard/               # HR management interface
│   │   ├── StudentDashboard/          # Student progress tracking
│   │   ├── AdminDashboard/            # Super admin controls
│   │   ├── Navbar/                    # Navigation component
│   │   ├── Hero/                      # Landing page hero
│   │   ├── About/                     # Company information
│   │   ├── Projects/                  # Portfolio showcase
│   │   └── Footer/                    # Site footer
│   ├── pages/
│   │   └── Home/                      # Main homepage
│   ├── assets/                        # Images and static files
│   ├── App.jsx                        # Main app component
│   └── main.jsx                       # App entry point
├── backend/
│   ├── app.py                         # Flask application
│   └── requirements.txt               # Python dependencies
├── SETUP.md                           # Detailed setup guide
└── README.md                          # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- MongoDB (v4.4+)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd VEDARC-Frontend-main
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Setup backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Configure environment**
   - Create `.env` file in backend directory
   - Set up MongoDB connection
   - Configure email settings

5. **Start development servers**
   ```bash
   # Terminal 1 - Frontend
   npm run dev
   
   # Terminal 2 - Backend
   cd backend
   python app.py
   ```

## 🔐 Default Credentials

### HR Dashboard
- **URL**: `http://localhost:5173/hr-dashboard`
- **Username**: `hr@vedarc.co.in`
- **Password**: `vedarc_hr_2024`

### Admin Dashboard
- **URL**: `http://localhost:5173/admin-dashboard`
- **Username**: `admin@vedarc.co.in`
- **Password**: `vedarc_admin_2024`

## 📋 API Endpoints

### Public Endpoints
- `POST /api/register` - Student registration
- `GET /api/internships` - List available internships

### HR Endpoints
- `POST /api/hr/login` - HR authentication
- `GET /api/hr/pending-registrations` - View pending registrations
- `POST /api/hr/activate-user` - Activate student account

### Student Endpoints
- `POST /api/student/login` - Student authentication
- `GET /api/student/internship-details` - Get internship progress
- `POST /api/student/submit-assignment` - Submit weekly assignment

### Admin Endpoints
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/users` - Get all users with filters
- `POST /api/admin/internships` - Add new internship track
- `POST /api/admin/weeks` - Add weekly content
- `POST /api/admin/certificates` - Upload completion certificates

## 🎯 User Workflow

### Student Journey
1. **Registration**: Fill out form on homepage
2. **Payment**: HR processes payment manually
3. **Activation**: Receive login credentials via email
4. **Learning**: Access weekly resources and submit assignments
5. **Completion**: Download certificate upon approval

### HR Workflow
1. **Login**: Access HR dashboard
2. **Review**: View pending registrations
3. **Process**: Verify payment and activate users
4. **Monitor**: Track student progress

### Admin Workflow
1. **Login**: Access admin dashboard
2. **Manage**: Add/edit internship tracks and content
3. **Monitor**: View analytics and user statistics
4. **Approve**: Review and approve submissions
5. **Certify**: Upload completion certificates

## 🔧 Configuration

### Email Setup
Configure SMTP settings in `backend/app.py`:
```python
SMTP_USERNAME = "tech@vedarc.co.in"
SMTP_PASSWORD = "your-app-specific-password"
```

### Database Setup
MongoDB collections are created automatically:
- `users` - Student information and progress
- `internships` - Available internship tracks
- `weeks` - Weekly content and resources
- `submissions` - Student assignment submissions
- `payments` - Payment verification records
- `certificates` - Completion certificates

## 🎨 Customization

### Adding New Internship Tracks
1. Use Admin Dashboard to add new tracks
2. Configure weekly content and resources
3. Set up assignment submission URLs

### Styling Modifications
- Update CSS variables in `src/index.css`
- Modify component styles in respective `.css` files
- Maintain cyberpunk aesthetic consistency

### Feature Extensions
- Add new dashboard tabs in Admin component
- Extend API endpoints in Flask backend
- Implement additional authentication methods

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
# Deploy dist/ folder to hosting service
```

### Backend Deployment
```bash
# Use production WSGI server (Gunicorn)
pip install gunicorn
gunicorn app:app
```

### Database Deployment
- Use MongoDB Atlas for cloud hosting
- Configure network access and authentication
- Set up automated backups

## 🐛 Troubleshooting

### Common Issues
1. **MongoDB Connection**: Ensure MongoDB service is running
2. **Email Delivery**: Verify SMTP credentials and 2FA settings
3. **CORS Errors**: Check backend CORS configuration
4. **Port Conflicts**: Ensure ports 5173 and 5000 are available

### Debug Mode
```bash
# Backend debug
python app.py

# Frontend debug
npm run dev
```

## 📞 Support

For technical support or questions:
- **Email**: tech@vedarc.co.in
- **Documentation**: See `SETUP.md` for detailed instructions
- **Issues**: Create GitHub issues for bug reports

## 🔄 Updates and Maintenance

### Regular Tasks
- Database backups (daily)
- Security updates (monthly)
- Email monitoring (weekly)
- Performance optimization (quarterly)

### Version Control
- Use feature branches for new development
- Test thoroughly before merging
- Update documentation with changes
- Tag releases for production deployments

---

## 🎉 About VEDARC Technologies

VEDARC Technologies is a forward-thinking software development company specializing in cutting-edge web applications and digital solutions. Our internship platform represents our commitment to education and technology innovation.

**Website**: [https://vedarc.co.in](https://vedarc.co.in)

---

*Built with ❤️ by VEDARC Technologies Team*
