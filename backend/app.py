from flask import Flask, request, jsonify, send_file, session
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
from bson import ObjectId
import os
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import string
from dotenv import load_dotenv
from flask import abort
from io import BytesIO
from fpdf import FPDF
from werkzeug.utils import secure_filename
import base64
import uuid
from pymongo.server_api import ServerApi
import ssl

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'vedarc-internship-secret-key-2024')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-super-secret-key')

# Session Configuration for Multi-Browser Support
app.config['SESSION_TYPE'] = 'filesystem'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)
app.config['SESSION_COOKIE_SECURE'] = os.getenv('FLASK_ENV') == 'production'  # True in production with HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

jwt = JWTManager(app)

# CORS Configuration
FRONTEND_ORIGIN = os.getenv('FRONTEND_ORIGIN', 'http://localhost:5173')
ALLOWED_ORIGINS = [
    FRONTEND_ORIGIN,
    'https://vedarc.co.in',
    'https://www.vedarc.co.in',
    'http://localhost:3000',
    'http://localhost:5173'
]

# More robust CORS configuration
CORS(
    app,
    origins=ALLOWED_ORIGINS,
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization", "X-Session-ID", "Access-Control-Allow-Origin"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    expose_headers=["Content-Type", "Authorization", "X-Session-ID"]
)

# Global OPTIONS handler for all routes
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    """Handle OPTIONS requests for CORS preflight"""
    origin = request.headers.get('Origin')
    
    # Check if origin is allowed
    if origin in ALLOWED_ORIGINS:
        response = app.make_default_options_response()
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Session-ID'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Max-Age'] = '86400'  # 24 hours
        return response
    else:
        return jsonify({'error': 'Origin not allowed'}), 403

# MongoDB Connection
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb+srv://vedarc:Vedarc6496@vedarc.venpk9a.mongodb.net/vedarc_internship?retryWrites=true&w=majority')

# Enhanced MongoDB connection with proper SSL/TLS configuration
try:
    from pymongo.server_api import ServerApi
    
    # Try connection with proper SSL configuration
    client = MongoClient(
        MONGODB_URI, 
        server_api=ServerApi('1'),
        serverSelectionTimeoutMS=30000,  # Increased timeout
        connectTimeoutMS=30000,
        socketTimeoutMS=30000,
        tls=True,  # Enable TLS/SSL
        tlsAllowInvalidCertificates=False,  # Don't allow invalid certificates
        tlsAllowInvalidHostnames=False,  # Don't allow invalid hostnames
        directConnection=False,
        retryWrites=True,
        w='majority'
    )
    
    # Send a ping to confirm a successful connection
    client.admin.command('ping')
    print("✅ MongoDB Atlas connection successful!")
except Exception as e:
    print(f"❌ MongoDB Atlas connection failed: {e}")
    # Try alternative connection string with different SSL settings
    try:
        alt_uri = "mongodb+srv://vedarc:Vedarc6496@vedarc.venpk9a.mongodb.net/vedarc_internship?retryWrites=true&w=majority&ssl=true&ssl_cert_reqs=CERT_NONE"
        client = MongoClient(
            alt_uri, 
            server_api=ServerApi('1'),
            serverSelectionTimeoutMS=30000,
            connectTimeoutMS=30000,
            socketTimeoutMS=30000
        )
        client.admin.command('ping')
        print("✅ MongoDB Atlas connection successful with alternative SSL settings!")
    except Exception as e2:
        print(f"❌ Alternative connection also failed: {e2}")
        # Try with minimal SSL requirements and different TLS settings
        try:
            minimal_uri = "mongodb+srv://vedarc:Vedarc6496@vedarc.venpk9a.mongodb.net/vedarc_internship?retryWrites=true&w=majority&ssl=true"
            client = MongoClient(
                minimal_uri,
                server_api=ServerApi('1'),
                serverSelectionTimeoutMS=30000,
                tlsAllowInvalidCertificates=True,  # Allow invalid certificates as last resort
                tlsAllowInvalidHostnames=True,
                tlsInsecure=True  # Allow insecure TLS connections
            )
            client.admin.command('ping')
            print("✅ MongoDB Atlas connection successful with minimal SSL requirements!")
        except Exception as e3:
            print(f"❌ Minimal SSL connection also failed: {e3}")
            # Try with no SSL verification at all (last resort)
            try:
                no_ssl_uri = "mongodb+srv://vedarc:Vedarc6496@vedarc.venpk9a.mongodb.net/vedarc_internship?retryWrites=true&w=majority&ssl=false"
                client = MongoClient(
                    no_ssl_uri,
                    server_api=ServerApi('1'),
                    serverSelectionTimeoutMS=30000,
                    tls=False
                )
                client.admin.command('ping')
                print("✅ MongoDB Atlas connection successful with SSL disabled!")
            except Exception as e4:
                print(f"❌ SSL disabled connection also failed: {e4}")
                # Fallback to local MongoDB if Atlas fails
                try:
                    client = MongoClient('mongodb://localhost:27017/vedarc_internship', serverSelectionTimeoutMS=5000)
                    client.admin.command('ping')
                    print("⚠️ Using fallback local MongoDB connection")
                except Exception as local_error:
                    print(f"❌ Local MongoDB also failed: {local_error}")
                    # Create a dummy client to prevent crashes
                    client = None
                    print("⚠️ No MongoDB connection available")

db = client.vedarc_internship if client else None  # Explicitly specify database name

# CORS Middleware to ensure all responses have proper headers
@app.after_request
def after_request(response):
    """Add CORS headers to all responses"""
    origin = request.headers.get('Origin')
    if origin in ALLOWED_ORIGINS:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Session-ID'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

# Collections
if db:
    users = db['users']
    internships = db['internships']
    weeks = db['weeks']
    submissions = db['submissions']
    payments = db['payments']
    certificates = db['certificates']
    announcements = db['announcements']
    admin_users = db['admin_users']
    student_notifications = db['student_notifications']
    certificate_templates = db['certificate_templates']
    projects = db['projects']
    user_sessions = db['user_sessions']  # New collection for session management
else:
    # Create dummy collections to prevent crashes
    users = None
    internships = None
    weeks = None
    submissions = None
    payments = None
    certificates = None
    announcements = None
    admin_users = None
    student_notifications = None
    certificate_templates = None
    projects = None
    user_sessions = None

# Email Configuration
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
SMTP_USERNAME = os.getenv('SMTP_USERNAME', 'tech@vedarc.co.in')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', 'your-app-password')

# Admin Credentials
ADMIN_USERNAME = os.getenv('ADMIN_USERNAME', 'admin@vedarc.co.in')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'vedarc_admin_2024')
HR_USERNAME = os.getenv('HR_USERNAME', 'hr@vedarc.co.in')
HR_PASSWORD = os.getenv('HR_PASSWORD', 'vedarc_hr_2024')
MANAGER_USERNAME = os.getenv('MANAGER_USERNAME', 'manager@vedarc.co.in')
MANAGER_PASSWORD = os.getenv('MANAGER_PASSWORD', 'vedarc_manager_2024')

# Session Management Functions
def create_session_id():
    """Generate a unique session ID"""
    return str(uuid.uuid4())

def store_user_session(user_id, user_type, session_id, token):
    """Store user session in database"""
    session_data = {
        'session_id': session_id,
        'user_id': user_id,
        'user_type': user_type,
        'token': token,
        'created_at': datetime.utcnow(),
        'last_activity': datetime.utcnow(),
        'is_active': True
    }
    user_sessions.insert_one(session_data)

def update_session_activity(session_id):
    """Update session last activity"""
    user_sessions.update_one(
        {'session_id': session_id},
        {'$set': {'last_activity': datetime.utcnow()}}
    )

def get_session_data(session_id):
    """Get session data from database"""
    return user_sessions.find_one({'session_id': session_id, 'is_active': True})

def deactivate_session(session_id):
    """Deactivate a session"""
    user_sessions.update_one(
        {'session_id': session_id},
        {'$set': {'is_active': False, 'deactivated_at': datetime.utcnow()}}
    )

def cleanup_expired_sessions():
    """Clean up sessions older than 24 hours"""
    cutoff_time = datetime.utcnow() - timedelta(hours=24)
    user_sessions.update_many(
        {'last_activity': {'$lt': cutoff_time}, 'is_active': True},
        {'$set': {'is_active': False, 'deactivated_at': datetime.utcnow()}}
    )

def validate_session(session_id, user_id, user_type):
    """Validate if session is still valid"""
    session_data = get_session_data(session_id)
    if not session_data:
        return False
    
    if session_data['user_id'] != user_id or session_data['user_type'] != user_type:
        return False
    
    # Update last activity
    update_session_activity(session_id)
    return True

def send_email(to_email, subject, body):
    """Send email using SMTP"""
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'html'))
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False

def generate_user_id(track):
    """Generate unique User ID like VEDARC-FE-001"""
    print("DEBUG: Generating user_id for track:", track)
    track_code = track.replace(" ", "").upper()[:2]
    count = users.count_documents({"track": track})
    from time import time
    t = time()
    s = str(t)
    return f"VEDARC-{s[-5:]}"

def generate_password():
    """Generate random password"""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=8))

def get_user_type_from_username(username):
    """Detect user type from username"""
    if username == ADMIN_USERNAME:
        return 'admin'
    elif username == HR_USERNAME:
        return 'hr'
    elif username == MANAGER_USERNAME:
        return 'manager'
    elif username.startswith('VEDARC-'):
        return 'student'
    else:
        return 'student'

def fix_object_ids(obj):
    """Recursively convert ObjectId fields to strings in dicts/lists."""
    if isinstance(obj, list):
        return [fix_object_ids(item) for item in obj]
    elif isinstance(obj, dict):
        new_obj = {}
        for k, v in obj.items():
            if isinstance(v, ObjectId):
                new_obj[k] = str(v)
            elif isinstance(v, (dict, list)):
                new_obj[k] = fix_object_ids(v)
            else:
                new_obj[k] = v
        return new_obj
    else:
        return obj

# ============================================================================
# PUBLIC API ENDPOINTS
# ============================================================================

@app.route('/api/register', methods=['POST'])
def register():
    """Student registration endpoint"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['fullName', 'email', 'whatsapp', 'collegeName', 'track', 'yearOfStudy', 'passoutYear']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Check if email already exists
        if users.find_one({"email": data['email']}):
            return jsonify({"error": "Email already registered"}), 400
        
        # Generate User ID
        user_id = generate_user_id(data['track'])
        
        # Create user document
        user_data = {
            "user_id": user_id,
            "fullName": data['fullName'],
            "email": data['email'],
            "whatsapp": data['whatsapp'],
            "collegeName": data['collegeName'],
            "track": data['track'],
            "yearOfStudy": data['yearOfStudy'],
            "passoutYear": data['passoutYear'],
            "status": "Pending",
            "created_at": datetime.utcnow(),
            "password": None,
            "payment_id": None,
            "activated_at": None,
            # Certificate unlock fields
            "certificate_unlocked": False,
            "lor_unlocked": False,
            "admin_certificate_approval": False,
            "admin_lor_approval": False,
            "certificate_unlocked_by": None,
            "lor_unlocked_by": None,
            "certificate_unlocked_at": None,
            "lor_unlocked_at": None,
            "project_completion_status": "Not Started",  # Not Started, In Progress, Completed, Excellent
            "course_completion_percentage": 0
        }
        
        # Save to database
        result = users.insert_one(user_data)
        
        return jsonify({
            "success": True,
            "message": f"Thank you for registering! Your User ID is {user_id}. Our HR will contact you soon on WhatsApp.",
            "user_id": user_id
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/internships', methods=['GET'])
def get_internships():
    """Get all available internship tracks"""
    try:
        if not internships:
            return jsonify({"error": "Database connection not available"}), 503
        
        internship_list = list(internships.find({}, {"_id": 0}))
        return jsonify({"internships": internship_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# STUDENT API ENDPOINTS
# ============================================================================

@app.route('/api/student/login', methods=['POST'])
def student_login():
    """Student login endpoint"""
    try:
        data = request.json
        user_id = data.get('user_id')
        password = data.get('password')
        
        if not user_id or not password:
            return jsonify({"error": "Missing user_id or password"}), 400
        
        # Find user
        user = users.find_one({"user_id": user_id})
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401
        
        if user['status'] != "Active":
            return jsonify({"error": "Account not activated. Please contact HR."}), 401
        
        if not check_password_hash(user['password'], password):
            return jsonify({"error": "Invalid credentials"}), 401
        
        # Create access token
        access_token = create_access_token(identity=user_id)
        
        # Create unique session ID for this browser instance
        session_id = create_session_id()
        
        # Store session in database
        store_user_session(user_id, 'student', session_id, access_token)
        
        # Clean up expired sessions
        cleanup_expired_sessions()
        
        return jsonify({
            "access_token": access_token,
            "session_id": session_id,
            "user": {
                "user_id": user['user_id'],
                "fullName": user['fullName'],
                "email": user['email'],
                "track": user['track']
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/student/internship-details', methods=['GET'])
@jwt_required()
def get_internship_details():
    """Get student's internship details"""
    try:
        current_user = get_jwt_identity()
        user = users.find_one({"user_id": current_user})
        if not user:
            return jsonify({"error": "User not found"}), 404
        internship = internships.find_one({"track_name": user['track']})
        if not internship:
            return jsonify({"error": "Internship not found"}), 404
        week_list = list(weeks.find({"track": user['track']}, {"_id": 0}))
        week_list.sort(key=lambda x: x['week_number'])
        submission_list = list(submissions.find({"user_id": current_user}, {}))
        # Convert datetime objects
        for submission in submission_list:
            if 'submitted_at' in submission and submission['submitted_at'] is not None:
                submission['submitted_at'] = submission['submitted_at'].isoformat()
            if 'reviewed_at' in submission and submission['reviewed_at'] is not None:
                submission['reviewed_at'] = submission['reviewed_at'].isoformat()
        # Fix ObjectId fields
        internship = fix_object_ids(internship)
        submission_list = fix_object_ids(submission_list)
        return jsonify({
            "internship": internship,
            "weeks": week_list,
            "submissions": submission_list,
            "user": {
                "user_id": user['user_id'],
                "fullName": user['fullName'],
                "email": user['email'],
                "track": user['track'],
                "status": user['status'],
                # Certificate unlock status fields
                "certificate_unlocked": user.get('certificate_unlocked', False),
                "lor_unlocked": user.get('lor_unlocked', False),
                "admin_certificate_approval": user.get('admin_certificate_approval', False),
                "admin_lor_approval": user.get('admin_lor_approval', False),
                "certificate_unlocked_at": user.get('certificate_unlocked_at'),
                "lor_unlocked_at": user.get('lor_unlocked_at'),
                "course_completion_percentage": user.get('course_completion_percentage', 0),
                "project_completion_status": user.get('project_completion_status', 'Not Started')
            }
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/student/weeks', methods=['GET'])
@jwt_required()
def student_get_weeks():
    """Get weeks for student's track"""
    try:
        current_user = get_jwt_identity()
        
        # Find user
        user = users.find_one({"user_id": current_user})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Get weeks for this track
        week_list = list(weeks.find({"track": user['track']}, {"_id": 0}))
        week_list.sort(key=lambda x: x['week_number'])
        
        return jsonify({"weeks": week_list}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/student/announcements', methods=['GET'])
@jwt_required()
def student_get_announcements():
    """Get announcements for students"""
    try:
        current_user = get_jwt_identity()
        
        # Find user
        user = users.find_one({"user_id": current_user})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Get announcements (all announcements are visible to students)
        announcement_list = list(announcements.find({}, {"_id": 0}))
        announcement_list.sort(key=lambda x: x['created_at'], reverse=True)
        
        # Convert datetime objects
        for announcement in announcement_list:
            if 'created_at' in announcement and announcement['created_at'] is not None:
                announcement['created_at'] = announcement['created_at'].isoformat()
            if 'updated_at' in announcement and announcement['updated_at'] is not None:
                announcement['updated_at'] = announcement['updated_at'].isoformat()
        
        return jsonify({"announcements": announcement_list}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/student/submit-assignment', methods=['POST'])
@jwt_required()
def submit_assignment():
    """Submit assignment endpoint"""
    try:
        current_user = get_jwt_identity()
        
        # Find user
        user = users.find_one({"user_id": current_user})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        data = request.json
        required_fields = ['week', 'githubLink', 'deployedLink']
        
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Check if submission already exists for this week
        existing_submission = submissions.find_one({
            "user_id": current_user,
            "week": data['week']
        })
        
        if existing_submission:
            return jsonify({"error": f"Submission for week {data['week']} already exists"}), 400
        
        # Create submission data
        submission_data = {
            "user_id": current_user,
            "fullName": user['fullName'],
            "track": user['track'],
            "week": data['week'],
            "submission_type": "link",
            "githubLink": data['githubLink'],
            "deployedLink": data['deployedLink'],
            "description": data.get('description', ''),
            "status": "Pending",
            "submitted_at": datetime.utcnow()
        }
        
        result = submissions.insert_one(submission_data)
        
        return jsonify({
            "success": True,
            "message": f"Assignment for week {data['week']} submitted successfully"
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/student/submissions', methods=['GET'])
@jwt_required()
def student_get_submissions():
    """Get student's submissions"""
    try:
        current_user = get_jwt_identity()
        submission_list = list(submissions.find({"user_id": current_user}, {}))
        for submission in submission_list:
            if 'submitted_at' in submission and submission['submitted_at'] is not None:
                submission['submitted_at'] = submission['submitted_at'].isoformat()
            if 'reviewed_at' in submission and submission['reviewed_at'] is not None:
                submission['reviewed_at'] = submission['reviewed_at'].isoformat()
        submission_list = fix_object_ids(submission_list)
        return jsonify({"submissions": submission_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/student/certificate', methods=['GET'])
@jwt_required()
def student_get_certificate():
    """Get student's certificate (legacy endpoint)"""
    try:
        current_user = get_jwt_identity()
        user = users.find_one({"user_id": current_user})
        if not user:
            return jsonify({"error": "User not found"}), 404
        certificate = certificates.find_one({"user_id": current_user})
        if not certificate:
            return jsonify({"error": "Certificate not found"}), 404
        if 'issued_at' in certificate and certificate['issued_at'] is not None:
            certificate['issued_at'] = certificate['issued_at'].isoformat()
        certificate = fix_object_ids(certificate)
        return jsonify({"certificate": certificate}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/student/notifications', methods=['GET'])
@jwt_required()
def student_get_notifications():
    """Get student's notifications"""
    try:
        current_user = get_jwt_identity()
        notifications = list(student_notifications.find({"user_id": current_user, "is_read": False}))
        for notification in notifications:
            if 'created_at' in notification and notification['created_at'] is not None:
                notification['created_at'] = notification['created_at'].isoformat()
        notifications = fix_object_ids(notifications)
        return jsonify({"notifications": notifications}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/student/notifications/<notification_id>/read', methods=['POST'])
@jwt_required()
def student_mark_notification_read(notification_id):
    """Mark notification as read"""
    try:
        current_user = get_jwt_identity()
        
        # Update notification to mark as read
        result = student_notifications.update_one(
            {"_id": ObjectId(notification_id), "user_id": current_user},
            {"$set": {"is_read": True, "read_at": datetime.utcnow()}}
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "Notification not found"}), 404
        
        return jsonify({"success": True, "message": "Notification marked as read"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/student/notifications/read-all', methods=['POST'])
@jwt_required()
def student_mark_all_notifications_read():
    """Mark all notifications as read"""
    try:
        current_user = get_jwt_identity()
        
        # Update all unread notifications for the student
        result = student_notifications.update_many(
            {"user_id": current_user, "is_read": False},
            {"$set": {"is_read": True, "read_at": datetime.utcnow()}}
        )
        
        return jsonify({
            "success": True, 
            "message": f"Marked {result.modified_count} notifications as read"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

class PDFWithBackground(FPDF):
    def __init__(self, bg_path, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.bg_path = bg_path
    def header(self):
        # Set background image (full page)
        self.image(self.bg_path, x=0, y=0, w=297, h=210)

# ============================================================================
# HR API ENDPOINTS
# ============================================================================

@app.route('/api/hr/login', methods=['POST'])
def hr_login():
    """HR login endpoint"""
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        if username == HR_USERNAME and password == HR_PASSWORD:
            access_token = create_access_token(identity=username)
            
            # Create unique session ID for this browser instance
            session_id = create_session_id()
            
            # Store session in database
            store_user_session(username, 'hr', session_id, access_token)
            
            # Clean up expired sessions
            cleanup_expired_sessions()
            
            return jsonify({
                "access_token": access_token,
                "session_id": session_id
            }), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/login', methods=['POST', 'OPTIONS'])
def admin_login():
    """Admin login endpoint"""
    if request.method == 'OPTIONS':
        return '', 200
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            access_token = create_access_token(identity=username)
            
            # Create unique session ID for this browser instance
            session_id = create_session_id()
            
            # Store session in database
            store_user_session(username, 'admin', session_id, access_token)
            
            # Clean up expired sessions
            cleanup_expired_sessions()
            
            return jsonify({
                "access_token": access_token,
                "session_id": session_id
            }), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/hr/pending-registrations', methods=['GET'])
@jwt_required()
def get_pending_registrations():
    """Get pending registrations for HR"""
    try:
        current_user = get_jwt_identity()
        if current_user != HR_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        track_filter = request.args.get('track')
        date_filter = request.args.get('date')
        query = {"status": "Pending"}
        if track_filter:
            query["track"] = track_filter
        if date_filter:
            query["created_at"] = {"$gte": datetime.strptime(date_filter, "%Y-%m-%d")}
        pending_users = list(users.find(query, {"password": 0}))
        for user in pending_users:
            user['_id'] = str(user['_id'])
            user['created_at'] = user['created_at'].isoformat()
        pending_users = fix_object_ids(pending_users)
        return jsonify({"registrations": pending_users}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/hr/activate-user', methods=['POST'])
@jwt_required()
def activate_user():
    # print("Activating User")
    """Activate user endpoint for HR"""
    try:
        current_user = get_jwt_identity()
        if current_user != HR_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        data = request.json
        user_id = data.get('user_id')
        payment_id = data.get('payment_id')
        if not user_id or not payment_id:
            return jsonify({"error": "Missing user_id or payment_id"}), 400
        # Find user
        user = users.find_one({"user_id": user_id})
        if not user:
            return jsonify({"error": "User not found"}), 404
        print("DEBUG: Activating user_id: - ", user_id, "Current status:", user.get('status'))
        # Print user name
        print("DEBUG: User name:", user.get('fullName'))
        if user['status'] != "Pending":
            current_status = user.get('status', 'Unknown')
            # print("DEBUG: Current status:", current_status)
            return jsonify({
                "error": f"User is not pending. Current status: {current_status}. User may have been activated already or status changed."
            }), 400 
        
        # Check if user already has a payment_id (already activated)
        if user.get('payment_id'):
            # print("DEBUG: User already has a payment_id:", user['payment_id'])
            return jsonify({
                "error": f"User {user_id} has already been activated with payment ID: {user['payment_id']}"
            }), 400
        
        # Generate password
        password = generate_password()
        hashed_password = generate_password_hash(password)
        
        # Update user
        update_result = users.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "status": "Active",
                    "password": hashed_password,
                    "payment_id": payment_id,
                    "activated_at": datetime.utcnow(),
                    "offer_letter_unlocked": True  # Offer letter available by default when activated
                }
            }
        )
        
        # Verify the update was successful
        if update_result.modified_count == 0:
            print(f"ERROR: Failed to update user {user_id} in database")
            return jsonify({"error": "Failed to update user in database"}), 500
        
        print(f"SUCCESS: User {user_id} activated successfully. Modified count: {update_result.modified_count}")
        
        # Verify the update by fetching the user again
        updated_user = users.find_one({"user_id": user_id})
        if not updated_user or updated_user.get('status') != 'Active':
            print(f"ERROR: User {user_id} status verification failed. Current status: {updated_user.get('status') if updated_user else 'User not found'}")
            return jsonify({"error": "User activation failed - status verification failed"}), 500
        
        print(f"VERIFICATION: User {user_id} status confirmed as: {updated_user.get('status')}")
        
        # Create notifications for existing announcements
        existing_announcements = list(announcements.find({}))
        if existing_announcements:
            notification_data = []
            for announcement in existing_announcements:
                notification_data.append({
                    "user_id": user_id,
                    "announcement_id": str(announcement['_id']),
                    "title": announcement['title'],
                    "content": announcement['content'],
                    "priority": announcement.get('priority', 'normal'),
                    "is_read": False,
                    "created_at": datetime.utcnow()
                })
            
            if notification_data:
                student_notifications.insert_many(notification_data)
        
        # Send email with credentials
        email_body = f"""
        <h2>Welcome to VEDARC Internship Program!</h2>
        <p>Your account has been activated successfully.</p>
        <p><strong>User ID:</strong> {user_id}</p>
        <p><strong>Password:</strong> {password}</p>
        <p>Please login at: <a href="https://vedarc-frontend.vercel.app">VEDARC Internship Platform</a></p>
        <p>Best regards,<br>VEDARC Team</p>
        """
        
        send_email(user['email'], "VEDARC Internship - Account Activated", email_body)
        
        return jsonify({
            "success": True,
            "message": f"User {user_id} activated successfully. Credentials sent to {user['email']}"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/hr/reset-student-password', methods=['POST'])
@jwt_required()
def reset_student_password():
    """Reset student password endpoint for HR"""
    try:
        current_user = get_jwt_identity()
        if current_user != HR_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({"error": "Missing user_id"}), 400
        
        # Find user
        user = users.find_one({"user_id": user_id})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Generate new password
        new_password = generate_password()
        hashed_password = generate_password_hash(new_password)
        
        # Update user password
        users.update_one(
            {"user_id": user_id},
            {"$set": {"password": hashed_password}}
        )
        
        # Send email with new password
        email_body = f"""
        <h2>VEDARC Internship - Password Reset</h2>
        <p>Your password has been reset successfully.</p>
        <p><strong>User ID:</strong> {user_id}</p>
        <p><strong>New Password:</strong> {new_password}</p>
        <p>Please login at: <a href="https://vedarc-frontend.vercel.app">VEDARC Internship Platform</a></p>
        <p>Best regards,<br>VEDARC Team</p>
        """
        
        send_email(user['email'], "VEDARC Internship - Password Reset", email_body)
        
        return jsonify({
            "success": True,
            "message": f"Password reset successful. New credentials sent to {user['email']}"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/hr/statistics', methods=['GET'])
@jwt_required()
def get_hr_statistics():
    """Get HR statistics including activated accounts count"""
    try:
        current_user = get_jwt_identity()
        if current_user != HR_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Get counts for different user statuses
        pending_count = users.count_documents({"status": "Pending"})
        active_count = users.count_documents({"status": "Active"})
        total_registrations = users.count_documents({})
        
        # Get track-wise breakdown - dynamically fetch from internships collection
        track_stats = {}
        
        # Get all available tracks from internships collection
        available_tracks = list(internships.find({}, {"track_name": 1, "_id": 0}))
        track_names = [track['track_name'] for track in available_tracks]
        
        # If no tracks found in internships collection, use default tracks
        if not track_names:
            track_names = ["Basic Frontend", "Advanced Frontend", "Full Stack", "Backend"]
        
        for track in track_names:
            track_stats[track] = {
                "pending": users.count_documents({"track": track, "status": "Pending"}),
                "active": users.count_documents({"track": track, "status": "Active"}),
                "total": users.count_documents({"track": track})
            }
        
        # Get recent activations (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_activations = users.count_documents({
            "status": "Active",
            "activated_at": {"$gte": week_ago}
        })
        
        # Get today's activations
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_activations = users.count_documents({
            "status": "Active",
            "activated_at": {"$gte": today}
        })
        
        return jsonify({
            "statistics": {
                "pending_registrations": pending_count,
                "activated_accounts": active_count,
                "total_registrations": total_registrations,
                "recent_activations_7_days": recent_activations,
                "today_activations": today_activations,
                "track_breakdown": track_stats
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/hr/available-tracks', methods=['GET'])
@jwt_required()
def hr_get_available_tracks():
    """Get available internship tracks for HR"""
    try:
        current_user = get_jwt_identity()
        if current_user != HR_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Get all available tracks
        tracks = list(internships.find({}, {"track_name": 1, "_id": 0}))
        track_names = [track['track_name'] for track in tracks]
        
        return jsonify({"tracks": track_names}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/hr/debug-user-status', methods=['GET'])
@jwt_required()
def debug_user_status():
    """Debug endpoint to check user status"""
    try:
        current_user = get_jwt_identity()
        if current_user != HR_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "Missing user_id parameter"}), 400
        
        # Find user
        user = users.find_one({"user_id": user_id})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "user_id": user_id,
            "status": user.get('status'),
            "payment_id": user.get('payment_id'),
            "activated_at": user.get('activated_at'),
            "created_at": user.get('created_at'),
            "email": user.get('email'),
            "fullName": user.get('fullName')
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/hr/fix-inconsistent-users', methods=['POST'])
@jwt_required()
def fix_inconsistent_users():
    """Fix users who have payment_id but status is still Pending"""
    try:
        current_user = get_jwt_identity()
        if current_user != HR_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Find users with payment_id but status is Pending
        inconsistent_users = list(users.find({
            "payment_id": {"$exists": True, "$ne": None},
            "status": "Pending"
        }))
        
        fixed_count = 0
        for user in inconsistent_users:
            # Update status to Active
            result = users.update_one(
                {"user_id": user['user_id']},
                {"$set": {"status": "Active"}}
            )
            if result.modified_count > 0:
                fixed_count += 1
                print(f"Fixed inconsistent user: {user['user_id']}")
        
        return jsonify({
            "success": True,
            "message": f"Fixed {fixed_count} inconsistent users",
            "fixed_count": fixed_count
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/hr/deactivate-user', methods=['POST'])
@jwt_required()
def deactivate_user():
    """Deactivate user endpoint for HR"""
    try:
        print("DEBUG: Deactivate endpoint called")
        current_user = get_jwt_identity()
        if current_user != HR_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        print(f"DEBUG: Received data: {data}")
        
        user_id = data.get('user_id')
        reason = data.get('reason')
        
        print(f"DEBUG: user_id: {user_id}, reason: {reason}")
        
        if not user_id or not reason:
            return jsonify({"error": "Missing user_id or reason"}), 400
        
        # Find user
        user = users.find_one({"user_id": user_id})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        if user['status'] != "Pending":
            current_status = user.get('status', 'Unknown')
            return jsonify({
                "error": f"User is not pending. Current status: {current_status}."
            }), 400
        
        # Delete the user from the database
        result = users.delete_one({"user_id": user_id})
        
        if result.deleted_count == 0:
            return jsonify({"error": "Failed to deactivate user"}), 500
        
        return jsonify({
            "success": True,
            "message": f"User {user_id} has been deactivated successfully"
        }), 200
        
    except Exception as e:
        print(f"DEBUG: Exception in deactivate_user: {e}")
        return jsonify({"error": str(e)}), 500

# ============================================================================
# MANAGER API ENDPOINTS
# ============================================================================

@app.route('/api/manager/login', methods=['POST'])
def manager_login():
    """Manager login endpoint"""
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        if username == MANAGER_USERNAME and password == MANAGER_PASSWORD:
            access_token = create_access_token(identity=username)
            
            # Create unique session ID for this browser instance
            session_id = create_session_id()
            
            # Store session in database
            store_user_session(username, 'manager', session_id, access_token)
            
            # Clean up expired sessions
            cleanup_expired_sessions()
            
            return jsonify({
                "access_token": access_token,
                "session_id": session_id
            }), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/internships', methods=['GET'])
@jwt_required()
def manager_get_internships():
    """Get internships managed by manager"""
    try:
        current_user = get_jwt_identity()
        if current_user != MANAGER_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        internship_list = list(internships.find({}))
        for internship in internship_list:
            if '_id' in internship:
                internship['_id'] = str(internship['_id'])
            student_count = users.count_documents({"track": internship['track_name']})
            internship['student_count'] = student_count
        internship_list = fix_object_ids(internship_list)
        return jsonify({"internships": internship_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/internships', methods=['POST'])
@jwt_required()
def manager_create_internship():
    """Create new internship track"""
    try:
        current_user = get_jwt_identity()
        if current_user != MANAGER_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        required_fields = ['track_name', 'duration', 'description']
        
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Check if internship already exists
        if internships.find_one({"track_name": data['track_name']}):
            return jsonify({"error": "Internship track already exists"}), 400
        
        internship_data = {
            "track_name": data['track_name'],
            "duration": data['duration'],
            "description": data['description'],
            "submission_type": "link",
            "max_students": data.get('max_students', 50),
            "created_at": datetime.utcnow(),
            "created_by": current_user
        }
        
        result = internships.insert_one(internship_data)
        
        return jsonify({
            "success": True,
            "message": f"Internship '{data['track_name']}' created successfully"
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/internships/<internship_id>', methods=['PUT'])
@jwt_required()
def manager_update_internship(internship_id):
    """Update internship track"""
    try:
        current_user = get_jwt_identity()
        if current_user != MANAGER_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        update_data = {}
        
        for field in ['track_name', 'duration', 'description', 'max_students']:
            if field in data:
                update_data[field] = data[field]
        
        if not update_data:
            return jsonify({"error": "No fields to update"}), 400
        
        update_data['updated_at'] = datetime.utcnow()
        update_data['updated_by'] = current_user
        
        result = internships.update_one(
            {"_id": ObjectId(internship_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "Internship not found"}), 404
        
        return jsonify({"success": True, "message": "Internship updated successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/internships/<internship_id>', methods=['DELETE'])
@jwt_required()
def manager_delete_internship(internship_id):
    """Delete internship track"""
    try:
        current_user = get_jwt_identity()
        if current_user != MANAGER_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Get internship details first
        internship = internships.find_one({"_id": ObjectId(internship_id)})
        if not internship:
            return jsonify({"error": "Internship not found"}), 404
        
        # Delete internship
        result = internships.delete_one({"_id": ObjectId(internship_id)})
        
        if result.deleted_count == 0:
            return jsonify({"error": "Internship not found"}), 404
        
        # Clean up related data
        # Delete related weeks
        weeks.delete_many({"internship_id": internship_id})
        
        # Delete related submissions for this track
        submissions.delete_many({"track": internship['track_name']})
        
        return jsonify({"success": True, "message": "Internship deleted successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# MANAGER ANNOUNCEMENT ENDPOINTS
# ============================================================================

@app.route('/api/manager/announcements', methods=['GET'])
@jwt_required()
def manager_get_announcements():
    """Get all announcements for manager"""
    try:
        current_user = get_jwt_identity()
        if current_user != MANAGER_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        announcement_list = list(announcements.find({}))
        for announcement in announcement_list:
            if 'created_at' in announcement and announcement['created_at'] is not None:
                announcement['created_at'] = announcement['created_at'].isoformat()
            if 'updated_at' in announcement and announcement['updated_at'] is not None:
                announcement['updated_at'] = announcement['updated_at'].isoformat()
        announcement_list = fix_object_ids(announcement_list)
        return jsonify({"announcements": announcement_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/announcements', methods=['POST'])
@jwt_required()
def manager_create_announcement():
    """Create new announcement"""
    try:
        current_user = get_jwt_identity()
        if current_user != MANAGER_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        required_fields = ['title', 'content']
        
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        announcement_data = {
            "title": data['title'],
            "content": data['content'],
            "priority": data.get('priority', 'normal'),
            "created_at": datetime.utcnow(),
            "created_by": current_user,
            "is_active": True
        }
        
        result = announcements.insert_one(announcement_data)
        
        return jsonify({
            "success": True,
            "message": "Announcement created successfully"
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/announcements/<announcement_id>', methods=['PUT'])
@jwt_required()
def manager_update_announcement(announcement_id):
    """Update announcement"""
    try:
        current_user = get_jwt_identity()
        if current_user != MANAGER_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        update_data = {}
        
        for field in ['title', 'content', 'priority', 'is_active']:
            if field in data:
                update_data[field] = data[field]
        
        if not update_data:
            return jsonify({"error": "No fields to update"}), 400
        
        update_data['updated_at'] = datetime.utcnow()
        update_data['updated_by'] = current_user
        
        result = announcements.update_one(
            {"_id": ObjectId(announcement_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "Announcement not found"}), 404
        
        return jsonify({"success": True, "message": "Announcement updated successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/announcements/<announcement_id>', methods=['DELETE'])
@jwt_required()
def manager_delete_announcement(announcement_id):
    """Delete announcement"""
    try:
        current_user = get_jwt_identity()
        if current_user != MANAGER_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        result = announcements.delete_one({"_id": ObjectId(announcement_id)})
        
        if result.deleted_count == 0:
            return jsonify({"error": "Announcement not found"}), 404
        
        return jsonify({"success": True, "message": "Announcement deleted successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# MANAGER INTERNSHIP MANAGEMENT ENDPOINTS
# ============================================================================

@app.route('/api/manager/internships/<internship_id>/weeks', methods=['GET'])
@jwt_required()
def manager_get_weeks(internship_id):
    try:
        current_user = get_jwt_identity()
        if current_user != MANAGER_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        internship = internships.find_one({"_id": ObjectId(internship_id)})
        if not internship:
            return jsonify({"error": "Internship not found"}), 404
        week_list = list(weeks.find({"track": internship['track_name']}))
        week_list.sort(key=lambda x: x['week_number'])
        week_list = fix_object_ids(week_list)
        return jsonify({"weeks": week_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/internships/<internship_id>/weeks', methods=['POST'])
@jwt_required()
def manager_add_week(internship_id):
    """Add week to internship with daily content structure"""
    try:
        current_user = get_jwt_identity()
        if current_user != MANAGER_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Get internship details
        internship = internships.find_one({"_id": ObjectId(internship_id)})
        if not internship:
            return jsonify({"error": "Internship not found"}), 404
        
        data = request.json
        required_fields = ['week_number', 'title', 'description', 'daily_content']
        
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Validate daily content structure
        daily_content = data.get('daily_content', [])
        if not isinstance(daily_content, list) or len(daily_content) == 0:
            return jsonify({"error": "Daily content must be a non-empty array"}), 400
        
        if len(daily_content) > 7:
            return jsonify({"error": "Maximum 7 days allowed per week"}), 400
        
        # Validate each day's content
        for i, day in enumerate(daily_content):
            if not isinstance(day, dict):
                return jsonify({"error": f"Day {i+1} must be an object"}), 400
            
            required_day_fields = ['day', 'topic', 'main_learning', 'module', 'reference_link']
            for field in required_day_fields:
                if not day.get(field):
                    return jsonify({"error": f"Day {i+1} missing required field: {field}"}), 400
        
        # Check if week already exists for this track
        if weeks.find_one({"track": internship['track_name'], "week_number": data['week_number']}):
            return jsonify({"error": f"Week {data['week_number']} already exists for {internship['track_name']}"}), 400
        
        week_data = {
            "week_number": data['week_number'],
            "title": data['title'],
            "description": data['description'],
            "track": internship['track_name'],
            "internship_id": internship_id,
            "submission_type": "link",
            "daily_content": daily_content,  # New tabular structure
            "resources": data.get('resources', []),
            "created_at": datetime.utcnow(),
            "created_by": current_user,
            "lab_task": data.get('lab_task', None)  # <-- Add this line
        }
        
        result = weeks.insert_one(week_data)
        
        return jsonify({
            "success": True,
            "message": f"Week {data['week_number']} added successfully with {len(daily_content)} days of content"
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/internships/<internship_id>/weeks/<week_id>', methods=['PUT'])
@jwt_required()
def manager_update_week(internship_id, week_id):
    """Update week with daily content structure"""
    try:
        current_user = get_jwt_identity()
        if current_user != MANAGER_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        update_data = {}
        
        for field in ['title', 'description', 'resources', 'daily_content', 'lab_task']:
            if field in data:
                if field == 'daily_content':
                    # Validate daily content structure
                    daily_content = data.get('daily_content', [])
                    if not isinstance(daily_content, list) or len(daily_content) == 0:
                        return jsonify({"error": "Daily content must be a non-empty array"}), 400
                    
                    if len(daily_content) > 7:
                        return jsonify({"error": "Maximum 7 days allowed per week"}), 400
                    
                    # Validate each day's content
                    for i, day in enumerate(daily_content):
                        if not isinstance(day, dict):
                            return jsonify({"error": f"Day {i+1} must be an object"}), 400
                        
                        required_day_fields = ['day', 'topic', 'main_learning', 'module', 'reference_link']
                        for field_name in required_day_fields:
                            if not day.get(field_name):
                                return jsonify({"error": f"Day {i+1} missing required field: {field_name}"}), 400
                    
                    update_data[field] = data[field]
                elif field == 'lab_task':
                    if data['lab_task'] is not None:
                        if not isinstance(data['lab_task'], dict) or not data['lab_task'].get('title'):
                            return jsonify({"error": "lab_task must be an object with at least a title"}), 400
                        update_data['lab_task'] = data['lab_task']
                else:
                    update_data[field] = data[field]
        
        if not update_data:
            return jsonify({"error": "No fields to update"}), 400
        
        update_data['updated_at'] = datetime.utcnow()
        update_data['updated_by'] = current_user
        
        result = weeks.update_one(
            {"_id": ObjectId(week_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "Week not found"}), 404
        
        return jsonify({"success": True, "message": "Week updated successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/internships/<internship_id>/weeks/<week_id>', methods=['DELETE'])
@jwt_required()
def manager_delete_week(internship_id, week_id):
    """Delete week"""
    try:
        current_user = get_jwt_identity()
        if current_user != MANAGER_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        result = weeks.delete_one({"_id": ObjectId(week_id)})
        
        if result.deleted_count == 0:
            return jsonify({"error": "Week not found"}), 404
        
        return jsonify({"success": True, "message": "Week deleted successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/internships/<internship_id>/students', methods=['GET'])
@jwt_required()
def manager_get_students(internship_id):
    """Get students for specific internship"""
    try:
        current_user = get_jwt_identity()
        if current_user != MANAGER_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Get internship details
        internship = internships.find_one({"_id": ObjectId(internship_id)})
        if not internship:
            return jsonify({"error": "Internship not found"}), 404
        
        # Get students for this track
        student_list = list(users.find({"track": internship['track_name']}, {"_id": 0}))
        
        # Convert datetime objects
        for student in student_list:
            if 'created_at' in student and student['created_at'] is not None:
                student['created_at'] = student['created_at'].isoformat()
            if 'activated_at' in student and student['activated_at'] is not None:
                student['activated_at'] = student['activated_at'].isoformat()
            if 'certificate_unlocked_at' in student and student['certificate_unlocked_at'] is not None:
                student['certificate_unlocked_at'] = student['certificate_unlocked_at'].isoformat()
            if 'lor_unlocked_at' in student and student['lor_unlocked_at'] is not None:
                student['lor_unlocked_at'] = student['lor_unlocked_at'].isoformat()
        
        return jsonify({"students": student_list}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/internships/<internship_id>/submissions', methods=['GET'])
@jwt_required()
def manager_get_submissions(internship_id):
    try:
        current_user = get_jwt_identity()
        if current_user != MANAGER_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        internship = internships.find_one({"_id": ObjectId(internship_id)})
        if not internship:
            return jsonify({"error": "Internship not found"}), 404
        week_filter = request.args.get('week')
        status_filter = request.args.get('status')
        query = {"track": internship['track_name']}
        if week_filter:
            query["week"] = int(week_filter)
        if status_filter:
            query["status"] = status_filter
        submission_list = list(submissions.find(query))
        for submission in submission_list:
            if 'submitted_at' in submission and submission['submitted_at'] is not None:
                submission['submitted_at'] = submission['submitted_at'].isoformat()
            if 'reviewed_at' in submission and submission['reviewed_at'] is not None:
                submission['reviewed_at'] = submission['reviewed_at'].isoformat()
        submission_list = fix_object_ids(submission_list)
        return jsonify({"submissions": submission_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/submissions/<submission_id>/review', methods=['POST'])
@jwt_required()
def manager_review_submission(submission_id):
    """Review submission endpoint"""
    try:
        current_user = get_jwt_identity()
        
        # Verify manager
        manager = admin_users.find_one({"username": current_user, "user_type": "manager"})
        if not manager:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        status = data.get('status')
        feedback = data.get('feedback', '')
        
        if not status:
            return jsonify({"error": "Missing status"}), 400
        
        # Find submission
        submission = submissions.find_one({"_id": ObjectId(submission_id)})
        if not submission:
            return jsonify({"error": "Submission not found"}), 404
        
        # Update submission
        update_data = {
            "status": status,
            "feedback": feedback,
            "reviewed_by": current_user,
            "reviewed_at": datetime.utcnow()
        }
        
        submissions.update_one(
            {"_id": ObjectId(submission_id)},
            {"$set": update_data}
        )
        
        # Update user's course completion percentage
        user_id = submission['user_id']
        user_submissions = list(submissions.find({"user_id": user_id}))
        
        # Get the user's track to find total weeks
        user = users.find_one({"user_id": user_id})
        if user:
            track_name = user.get('track')
            # Get total weeks for this track
            total_weeks = weeks.count_documents({"track": track_name})
            
            if total_weeks > 0:
                # Count approved submissions
                approved_submissions = len([s for s in user_submissions if s.get('status') == 'approved'])
                completion_percentage = (approved_submissions / total_weeks) * 100
                
                users.update_one(
                    {"user_id": user_id},
                    {"$set": {"course_completion_percentage": completion_percentage}}
                )
        
        return jsonify({"success": True, "message": "Submission reviewed successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# CERTIFICATE UNLOCK ENDPOINTS FOR MANAGERS
# ============================================================================

@app.route('/api/manager/certificates/unlock', methods=['POST'])
@jwt_required()
def manager_unlock_certificate():
    """Unlock certificate for student"""
    try:
        print("DEBUG: Certificate unlock endpoint called")
        current_user = get_jwt_identity()
        
        # Verify manager
        manager = admin_users.find_one({"username": current_user, "user_type": "manager"})
        if not manager:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        print(f"DEBUG: Certificate unlock received data: {data}")
        
        user_id = data.get('user_id')
        certificate_type = data.get('certificate_type')  # 'completion' or 'lor'
        
        print(f"DEBUG: user_id: {user_id}, certificate_type: {certificate_type}")
        
        if not user_id or not certificate_type:
            return jsonify({"error": "Missing user_id or certificate_type"}), 400
        
        if certificate_type not in ['completion', 'lor']:
            return jsonify({"error": "Invalid certificate type"}), 400
        
        # Find user
        user = users.find_one({"user_id": user_id})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Check if user has 100% course completion for certificate
        if certificate_type == 'completion':
            if user.get('course_completion_percentage', 0) < 100:
                return jsonify({"error": "Student must have 100% course completion to unlock certificate"}), 400
            
            # Check admin approval
            if not user.get('admin_certificate_approval', False):
                return jsonify({
                    "error": "Admin approval required",
                    "requires_admin_approval": True,
                    "message": "Certificate unlock requires admin approval. Please contact admin."
                }), 403
        
        # Check project completion status for LOR
        if certificate_type == 'lor':
            project_status = user.get('project_completion_status', 'Not Started')
            if project_status not in ['Completed', 'Excellent']:
                return jsonify({"error": "Project must be completed with status 'Completed' or 'Excellent' to unlock LOR"}), 400
            
            # Check admin approval
            if not user.get('admin_lor_approval', False):
                return jsonify({
                    "error": "Admin approval required",
                    "requires_admin_approval": True,
                    "message": "LOR unlock requires admin approval. Please contact admin."
                }), 403
        
        # Update user certificate unlock status
        update_data = {}
        if certificate_type == 'completion':
            update_data.update({
                "certificate_unlocked": True,
                "certificate_unlocked_by": current_user,
                "certificate_unlocked_at": datetime.utcnow()
            })
        else:  # lor
            update_data.update({
                "lor_unlocked": True,
                "lor_unlocked_by": current_user,
                "lor_unlocked_at": datetime.utcnow()
            })
        
        users.update_one(
            {"user_id": user_id},
            {"$set": update_data}
        )
        
        # Create notification for student
        certificate_name = "Certificate of Completion" if certificate_type == 'completion' else "Letter of Recommendation"
        notification_data = {
            "user_id": user_id,
            "title": f"{certificate_name} Unlocked!",
            "content": f"Your {certificate_name} has been unlocked by your internship manager. You can now download it from your dashboard.",
            "priority": "high",
            "is_read": False,
            "created_at": datetime.utcnow()
        }
        student_notifications.insert_one(notification_data)
        
        return jsonify({
            "success": True,
            "message": f"{certificate_type.upper()} unlocked successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/certificates/bulk-unlock', methods=['POST'])
@jwt_required()
def manager_bulk_unlock_certificates():
    """Bulk unlock certificates for multiple students"""
    try:
        current_user = get_jwt_identity()
        
        # Verify manager
        manager = admin_users.find_one({"username": current_user, "user_type": "manager"})
        if not manager:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        user_ids = data.get('user_ids', [])
        certificate_type = data.get('certificate_type')  # 'completion' or 'lor'
        
        if not user_ids or not certificate_type:
            return jsonify({"error": "Missing user_ids or certificate_type"}), 400
        
        if certificate_type not in ['completion', 'lor']:
            return jsonify({"error": "Invalid certificate type"}), 400
        
        results = {
            "successful": [],
            "failed": [],
            "requires_admin_approval": []
        }
        
        for user_id in user_ids:
            try:
                # Find user
                user = users.find_one({"user_id": user_id})
                if not user:
                    results["failed"].append({"user_id": user_id, "error": "User not found"})
                    continue
                
                # Check course completion for certificate
                if certificate_type == 'completion':
                    if user.get('course_completion_percentage', 0) < 100:
                        results["failed"].append({
                            "user_id": user_id, 
                            "error": "Student must have 100% course completion"
                        })
                        continue
                    
                    # Check admin approval
                    if not user.get('admin_certificate_approval', False):
                        results["requires_admin_approval"].append({
                            "user_id": user_id,
                            "name": user.get('fullName', 'Unknown'),
                            "error": "Admin approval required"
                        })
                        continue
                
                # Check project completion for LOR
                if certificate_type == 'lor':
                    project_status = user.get('project_completion_status', 'Not Started')
                    if project_status not in ['Completed', 'Excellent']:
                        results["failed"].append({
                            "user_id": user_id,
                            "error": f"Project status must be 'Completed' or 'Excellent', current: {project_status}"
                        })
                        continue
                    
                    # Check admin approval
                    if not user.get('admin_lor_approval', False):
                        results["requires_admin_approval"].append({
                            "user_id": user_id,
                            "name": user.get('fullName', 'Unknown'),
                            "error": "Admin approval required"
                        })
                        continue
                
                # Update user certificate unlock status
                update_data = {}
                if certificate_type == 'completion':
                    update_data.update({
                        "certificate_unlocked": True,
                        "certificate_unlocked_by": current_user,
                        "certificate_unlocked_at": datetime.utcnow()
                    })
                else:  # lor
                    update_data.update({
                        "lor_unlocked": True,
                        "lor_unlocked_by": current_user,
                        "lor_unlocked_at": datetime.utcnow()
                    })
                
                users.update_one(
                    {"user_id": user_id},
                    {"$set": update_data}
                )
                
                # Create notification for student
                certificate_name = "Certificate of Completion" if certificate_type == 'completion' else "Letter of Recommendation"
                notification_data = {
                    "user_id": user_id,
                    "title": f"{certificate_name} Unlocked!",
                    "content": f"Your {certificate_name} has been unlocked by your internship manager. You can now download it from your dashboard.",
                    "priority": "high",
                    "is_read": False,
                    "created_at": datetime.utcnow()
                }
                student_notifications.insert_one(notification_data)
                
                results["successful"].append({
                    "user_id": user_id,
                    "name": user.get('fullName', 'Unknown')
                })
                
            except Exception as e:
                results["failed"].append({
                    "user_id": user_id,
                    "error": str(e)
                })
        
        return jsonify({
            "success": True,
            "results": results,
            "message": f"Bulk unlock completed. {len(results['successful'])} successful, {len(results['failed'])} failed, {len(results['requires_admin_approval'])} require admin approval."
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/students/<internship_id>', methods=['GET'])
@jwt_required()
def manager_get_students_with_certificates(internship_id):
    """Get students with certificate unlock status"""
    try:
        current_user = get_jwt_identity()
        
        # Verify manager
        manager = admin_users.find_one({"username": current_user, "user_type": "manager"})
        if not manager:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Find internship
        internship = internships.find_one({"_id": ObjectId(internship_id)})
        if not internship:
            return jsonify({"error": "Internship not found"}), 404
        
        # Get students for this internship track
        track_name = internship['track_name']
        students = list(users.find({"track": track_name, "status": "Active"}))
        
        # Convert ObjectId and datetime fields
        for student in students:
            if '_id' in student:
                student['_id'] = str(student['_id'])
            if 'created_at' in student and student['created_at'] is not None:
                student['created_at'] = student['created_at'].isoformat()
            if 'activated_at' in student and student['activated_at'] is not None:
                student['activated_at'] = student['activated_at'].isoformat()
            if 'certificate_unlocked_at' in student and student['certificate_unlocked_at'] is not None:
                student['certificate_unlocked_at'] = student['certificate_unlocked_at'].isoformat()
            if 'lor_unlocked_at' in student and student['lor_unlocked_at'] is not None:
                student['lor_unlocked_at'] = student['lor_unlocked_at'].isoformat()
        
        return jsonify({"students": students}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# ADMIN CERTIFICATE APPROVAL ENDPOINTS
# ============================================================================

@app.route('/api/admin/certificate-approval', methods=['POST'])
@jwt_required()
def admin_approve_certificate():
    """Admin approve certificate unlock"""
    try:
        current_user = get_jwt_identity()
        if current_user != ADMIN_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        user_id = data.get('user_id')
        certificate_type = data.get('certificate_type')  # 'completion' or 'lor'
        approved = data.get('approved', True)
        
        if not user_id or not certificate_type:
            return jsonify({"error": "Missing user_id or certificate_type"}), 400
        
        if certificate_type not in ['completion', 'lor']:
            return jsonify({"error": "Invalid certificate type"}), 400
        
        # Find user
        user = users.find_one({"user_id": user_id})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Update approval status
        if certificate_type == 'completion':
            users.update_one(
                {"user_id": user_id},
                {"$set": {"admin_certificate_approval": approved}}
            )
        else:  # lor
            users.update_one(
                {"user_id": user_id},
                {"$set": {"admin_lor_approval": approved}}
            )
        
        # Create notification for student
        certificate_name = "Certificate of Completion" if certificate_type == 'completion' else "Letter of Recommendation"
        notification_data = {
            "user_id": user_id,
            "title": f"{certificate_name} Admin Approval",
            "content": f"Admin approval for your {certificate_name} has been {'granted' if approved else 'revoked'}. Contact your manager for next steps.",
            "priority": "high" if approved else "normal",
            "is_read": False,
            "created_at": datetime.utcnow()
        }
        student_notifications.insert_one(notification_data)
        
        return jsonify({
            "success": True,
            "message": f"{certificate_type.upper()} approval {'granted' if approved else 'revoked'} successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/certificate-approval/bulk', methods=['POST'])
@jwt_required()
def admin_bulk_approve_certificates():
    """Admin bulk approve certificates"""
    try:
        current_user = get_jwt_identity()
        if current_user != ADMIN_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        user_ids = data.get('user_ids', [])
        certificate_type = data.get('certificate_type')  # 'completion' or 'lor'
        approved = data.get('approved', True)
        
        if not user_ids or not certificate_type:
            return jsonify({"error": "Missing user_ids or certificate_type"}), 400
        
        if certificate_type not in ['completion', 'lor']:
            return jsonify({"error": "Invalid certificate type"}), 400
        
        # Update approval status for all users
        if certificate_type == 'completion':
            users.update_many(
                {"user_id": {"$in": user_ids}},
                {"$set": {"admin_certificate_approval": approved}}
            )
        else:  # lor
            users.update_many(
                {"user_id": {"$in": user_ids}},
                {"$set": {"admin_lor_approval": approved}}
            )
        
        # Create notifications for all users
        certificate_name = "Certificate of Completion" if certificate_type == 'completion' else "Letter of Recommendation"
        notification_data = []
        for user_id in user_ids:
            notification_data.append({
                "user_id": user_id,
                "title": f"{certificate_name} Admin Approval",
                "content": f"Admin approval for your {certificate_name} has been {'granted' if approved else 'revoked'}. Contact your manager for next steps.",
                "priority": "high" if approved else "normal",
                "is_read": False,
                "created_at": datetime.utcnow()
            })
        
        if notification_data:
            student_notifications.insert_many(notification_data)
        
        return jsonify({
            "success": True,
            "message": f"Bulk {certificate_type.upper()} approval {'granted' if approved else 'revoked'} for {len(user_ids)} users"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# ADMIN API ENDPOINTS
# ============================================================================

@app.route('/api/admin/weeks', methods=['GET'])
@jwt_required()
def admin_get_weeks():
    """Get all weeks for admin"""
    try:
        current_user = get_jwt_identity()
        if current_user != ADMIN_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Get filter parameters
        track_filter = request.args.get('track')
        
        # Build query
        query = {}
        if track_filter:
            query["track"] = track_filter
        
        week_list = list(weeks.find(query, {"_id": 0}))
        week_list.sort(key=lambda x: (x['track'], x['week_number']))
        
        return jsonify({"weeks": week_list}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/weeks', methods=['POST'])
@jwt_required()
def admin_add_week():
    """Add weekly content"""
    try:
        current_user = get_jwt_identity()
        if current_user != ADMIN_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        required_fields = ['week_number', 'title', 'description', 'track']
        
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Check if week already exists for this track
        if weeks.find_one({"track": data['track'], "week_number": data['week_number']}):
            return jsonify({"error": f"Week {data['week_number']} already exists for {data['track']}"}), 400
        
        week_data = {
            "week_number": data['week_number'],
            "title": data['title'],
            "description": data['description'],
            "track": data['track'],
            "submission_type": "link",
            "resources": data.get('resources', []),
            "created_at": datetime.utcnow(),
            "created_by": current_user
        }
        
        result = weeks.insert_one(week_data)
        
        return jsonify({
            "success": True,
            "message": f"Week {data['week_number']} added successfully for {data['track']}"
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/weeks/<week_id>', methods=['PUT'])
@jwt_required()
def admin_update_week(week_id):
    """Update week"""
    try:
        current_user = get_jwt_identity()
        if current_user != ADMIN_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        update_data = {}
        
        for field in ['title', 'description', 'resources']:
            if field in data:
                update_data[field] = data[field]
        
        if not update_data:
            return jsonify({"error": "No fields to update"}), 400
        
        update_data['updated_at'] = datetime.utcnow()
        update_data['updated_by'] = current_user
        
        result = weeks.update_one(
            {"_id": ObjectId(week_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "Week not found"}), 404
        
        return jsonify({"success": True, "message": "Week updated successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/weeks/<week_id>', methods=['DELETE'])
@jwt_required()
def admin_delete_week(week_id):
    """Delete week"""
    try:
        current_user = get_jwt_identity()
        if current_user != ADMIN_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        result = weeks.delete_one({"_id": ObjectId(week_id)})
        
        if result.deleted_count == 0:
            return jsonify({"error": "Week not found"}), 404
        
        return jsonify({"success": True, "message": "Week deleted successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/submissions', methods=['GET'])
@jwt_required()
def admin_get_submissions():
    """Get all submissions for admin"""
    try:
        current_user = get_jwt_identity()
        if current_user != ADMIN_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        # Get filter parameters
        track_filter = request.args.get('track')
        status_filter = request.args.get('status')
        week_filter = request.args.get('week')
        # Build query
        query = {}
        if track_filter:
            query["track"] = track_filter
        if status_filter:
            query["status"] = status_filter
        if week_filter:
            query["week"] = int(week_filter)
        submission_list = list(submissions.find(query))
        # Convert datetime objects
        for submission in submission_list:
            if 'submitted_at' in submission and submission['submitted_at'] is not None:
                submission['submitted_at'] = submission['submitted_at'].isoformat()
            if 'reviewed_at' in submission and submission['reviewed_at'] is not None:
                submission['reviewed_at'] = submission['reviewed_at'].isoformat()
        # Fix ObjectId fields
        submission_list = fix_object_ids(submission_list)
        return jsonify({"submissions": submission_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/submissions/<submission_id>', methods=['PUT'])
@jwt_required()
def admin_update_submission(submission_id):
    """Update submission status"""
    try:
        current_user = get_jwt_identity()
        if current_user != ADMIN_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        status = data.get('status')
        feedback = data.get('feedback', '')
        
        if not status:
            return jsonify({"error": "Missing status"}), 400
        
        # Update submission
        result = submissions.update_one(
            {"_id": ObjectId(submission_id)},
            {
                "$set": {
                    "status": status,
                    "feedback": feedback,
                    "reviewed_at": datetime.utcnow(),
                    "reviewed_by": current_user
                }
            }
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "Submission not found"}), 404
        
        return jsonify({"success": True, "message": "Submission updated successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/certificates', methods=['GET'])
@jwt_required()
def admin_get_certificates():
    """Get all certificates for admin"""
    try:
        current_user = get_jwt_identity()
        if current_user != ADMIN_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        certificate_list = list(certificates.find({}, {"_id": 0}))
        
        # Convert datetime objects
        for certificate in certificate_list:
            if 'issued_at' in certificate and certificate['issued_at'] is not None:
                certificate['issued_at'] = certificate['issued_at'].isoformat()
        
        return jsonify({"certificates": certificate_list}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/certificates', methods=['POST'])
@jwt_required()
def admin_upload_certificate():
    """Upload certificate"""
    try:
        current_user = get_jwt_identity()
        if current_user != ADMIN_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({"error": "Missing user_id"}), 400
        
        # Find user
        user = users.find_one({"user_id": user_id})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Check if certificate already exists
        existing_certificate = certificates.find_one({"user_id": user_id})
        if existing_certificate:
            return jsonify({"error": "Certificate already exists for this user"}), 400
        
        # Generate certificate link (in production, this would upload to cloud storage)
        certificate_link = f"https://vedarc-certificates.s3.amazonaws.com/{user_id}_certificate.pdf"
        
        # Save certificate record
        certificate_data = {
            "user_id": user_id,
            "fullName": user['fullName'],
            "track": user['track'],
            "certificate_link": certificate_link,
            "issued_at": datetime.utcnow(),
            "issued_by": current_user
        }
        
        result = certificates.insert_one(certificate_data)
        
        # Update user status
        users.update_one(
            {"user_id": user_id},
            {"$set": {"certificate": certificate_link}}
        )
        
        return jsonify({
            "success": True,
            "message": "Certificate generated successfully",
            "certificate_link": certificate_link
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/certificates/<certificate_id>', methods=['DELETE'])
@jwt_required()
def admin_delete_certificate(certificate_id):
    """Delete certificate"""
    try:
        current_user = get_jwt_identity()
        if current_user != ADMIN_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Get certificate first
        certificate = certificates.find_one({"_id": ObjectId(certificate_id)})
        if not certificate:
            return jsonify({"error": "Certificate not found"}), 404
        
        # Delete certificate
        result = certificates.delete_one({"_id": ObjectId(certificate_id)})
        
        # Remove certificate from user
        users.update_one(
            {"user_id": certificate['user_id']},
            {"$unset": {"certificate": ""}}
        )
        
        return jsonify({"success": True, "message": "Certificate deleted successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/reset-user-password', methods=['POST'])
@jwt_required()
def admin_reset_user_password():
    """Reset any user's password"""
    try:
        current_user = get_jwt_identity()
        if current_user != ADMIN_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        user_id = data.get('user_id')
        user_type = data.get('user_type')
        
        if not user_id or not user_type:
            return jsonify({"error": "Missing user_id or user_type"}), 400
        
        # Generate new password
        new_password = generate_password()
        hashed_password = generate_password_hash(new_password)
        
        if user_type == 'student':
            # Reset student password
            user = users.find_one({"user_id": user_id})
            if not user:
                return jsonify({"error": "Student not found"}), 404
            
            users.update_one(
                {"user_id": user_id},
                {"$set": {"password": hashed_password}}
            )
            
            # Send email
            email_body = f"""
            <h2>VEDARC Internship - Password Reset</h2>
            <p>Your password has been reset by admin.</p>
            <p><strong>User ID:</strong> {user_id}</p>
            <p><strong>New Password:</strong> {new_password}</p>
            <p>Please login at: <a href="https://vedarc-frontend.vercel.app">VEDARC Internship Platform</a></p>
            <p>Best regards,<br>VEDARC Team</p>
            """
            
            send_email(user['email'], "VEDARC Internship - Password Reset", email_body)
            
        else:
            # For other user types, update admin_users collection
            admin_user = admin_users.find_one({"username": user_id})
            if not admin_user:
                return jsonify({"error": f"{user_type.title()} user not found"}), 404
            
            admin_users.update_one(
                {"username": user_id},
                {"$set": {"password": hashed_password}}
            )
            
            # Send email
            email_body = f"""
            <h2>VEDARC Admin - Password Reset</h2>
            <p>Your password has been reset by admin.</p>
            <p><strong>Username:</strong> {user_id}</p>
            <p><strong>New Password:</strong> {new_password}</p>
            <p>Please login at: <a href="https://vedarc-frontend.vercel.app">VEDARC Admin Panel</a></p>
            <p>Best regards,<br>VEDARC Team</p>
            """
            
            send_email(admin_user['email'], "VEDARC Admin - Password Reset", email_body)
        
        return jsonify({
            "success": True,
            "message": f"Password reset successful for {user_type}"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/create-user', methods=['POST'])
@jwt_required()
def admin_create_user():
    """Create new user account"""
    try:
        current_user = get_jwt_identity()
        if current_user != ADMIN_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        required_fields = ['fullName', 'email', 'username', 'user_type', 'password']
        
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Check if username already exists
        if admin_users.find_one({"username": data['username']}):
            return jsonify({"error": "Username already exists"}), 400
        
        # Hash password
        hashed_password = generate_password_hash(data['password'])
        
        user_data = {
            "fullName": data['fullName'],
            "email": data['email'],
            "username": data['username'],
            "user_type": data['user_type'],
            "password": hashed_password,
            "created_at": datetime.utcnow(),
            "created_by": current_user
        }
        
        result = admin_users.insert_one(user_data)
        
        return jsonify({
            "success": True,
            "message": f"{data['user_type'].title()} account created successfully"
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/user-types', methods=['GET'])
@jwt_required()
def admin_get_user_types():
    """Get available user types"""
    try:
        current_user = get_jwt_identity()
        if current_user != ADMIN_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        user_types = ["student", "hr", "manager", "admin"]
        return jsonify({"user_types": user_types}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/internships', methods=['GET'])
@jwt_required()
def admin_get_internships():
    """Get all available internship tracks for admin"""
    try:
        current_user = get_jwt_identity()
        if current_user != ADMIN_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        internship_list = list(internships.find({}))
        
        # Convert ObjectId to string and calculate counts for each internship
        for internship in internship_list:
            if '_id' in internship:
                internship['_id'] = str(internship['_id'])
            
            # Calculate student count for this internship track
            student_count = users.count_documents({"track": internship['track_name']})
            internship['student_count'] = student_count
            
            # Calculate week count for this internship track
            week_count = weeks.count_documents({"track": internship['track_name']})
            internship['week_count'] = week_count
        
        return jsonify({"internships": internship_list}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/users', methods=['GET'])
@jwt_required()
def admin_get_users():
    """Get all users for admin"""
    try:
        current_user = get_jwt_identity()
        if current_user != ADMIN_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Get filter parameters
        track_filter = request.args.get('track')
        status_filter = request.args.get('status')
        
        # Build query
        query = {}
        if track_filter:
            query["track"] = track_filter
        if status_filter:
            query["status"] = status_filter
        
        # Get users
        user_list = list(users.find(query, {"password": 0}))
        
        # Convert ObjectId to string for JSON serialization
        for user in user_list:
            user['_id'] = str(user['_id'])
            if 'created_at' in user and user['created_at'] is not None:
                user['created_at'] = user['created_at'].isoformat()
            if 'activated_at' in user and user['activated_at'] is not None:
                user['activated_at'] = user['activated_at'].isoformat()
        
        return jsonify({"users": user_list}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/internships', methods=['POST'])
@jwt_required()
def admin_create_internship():
    """Create new internship"""
    try:
        current_user = get_jwt_identity()
        if current_user != ADMIN_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        required_fields = ['title', 'description', 'track', 'duration', 'start_date', 'end_date']
        
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Create internship
        internship_data = {
            "title": data['title'],
            "description": data['description'],
            "track": data['track'],
            "duration": data['duration'],
            "start_date": data['start_date'],
            "end_date": data['end_date'],
            "created_by": current_user,
            "created_at": datetime.utcnow(),
            "status": "active"
        }
        
        result = internships.insert_one(internship_data)
        
        return jsonify({
            "success": True,
            "message": "Internship created successfully",
            "internship_id": str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

        if current_user != ADMIN_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        student_id = data.get('student_id')
        certificate_type = data.get('certificate_type', 'completion')
        
        if not student_id:
            return jsonify({"error": "Missing student_id"}), 400
        
        # Find user
        user = users.find_one({"user_id": student_id})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Update user certificate unlock status
        if certificate_type == 'completion':
            users.update_one(
                {"user_id": student_id},
                {
                    "$set": {
                        "certificate_unlocked": True,
                        "certificate_unlocked_by": current_user,
                        "certificate_unlocked_at": datetime.utcnow(),
                        "admin_certificate_approval": True
                    }
                }
            )
        elif certificate_type == 'lor':
            users.update_one(
                {"user_id": student_id},
                {
                    "$set": {
                        "lor_unlocked": True,
                        "lor_unlocked_by": current_user,
                        "lor_unlocked_at": datetime.utcnow(),
                        "admin_lor_approval": True
                    }
                }
            )
        
        return jsonify({
            "success": True,
            "message": f"{certificate_type.upper()} released successfully for {student_id}"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    db_status = "connected" if client and db else "disconnected"
    
    # Try to ping the database if connected
    db_ping = "unknown"
    if client and db:
        try:
            client.admin.command('ping')
            db_ping = "success"
        except Exception as e:
            db_ping = f"failed: {str(e)}"
    
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "VEDARC Internship Backend",
        "database": {
            "status": db_status,
            "ping": db_ping,
            "collections_available": bool(db)
        },
        "mongodb_uri": MONGODB_URI.replace(MONGODB_URI.split('@')[0].split('//')[1].split(':')[0], '***') if '@' in MONGODB_URI else "not_configured"
    }), 200

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def recalculate_completion_percentages():
    """Recalculate completion percentages for all students"""
    try:
        # Get all active students
        all_students = list(users.find({"status": "Active"}))
        
        for student in all_students:
            user_id = student['user_id']
            track_name = student.get('track')
            print(f"[DEBUG] Processing user_id: {user_id}, track: {track_name}")
            
            if track_name:
                # Get total weeks for this track
                total_weeks = weeks.count_documents({"track": track_name})
                print(f"[DEBUG] Total weeks for track '{track_name}': {total_weeks}")
                
                if total_weeks > 0:
                    # Get all submissions for this student
                    user_submissions = list(submissions.find({"user_id": user_id}))
                    
                    # Count approved submissions
                    approved_submissions = len([s for s in user_submissions if s.get('status') == 'approved'])
                    completion_percentage = (approved_submissions / total_weeks) * 100
                    print(f"[DEBUG] user_id: {user_id}, approved_submissions: {approved_submissions}, completion_percentage: {completion_percentage}")
                    
                    # Update student's completion percentage
                    users.update_one(
                        {"user_id": user_id},
                        {"$set": {"course_completion_percentage": completion_percentage}}
                    )
        
        return True
    except Exception as e:
        print(f"Error recalculating completion percentages: {e}")
        return False

@app.route('/api/manager/recalculate-completion', methods=['POST'])
@jwt_required()
def manager_recalculate_completion():
    """Recalculate completion percentages for all students"""
    try:
        current_user = get_jwt_identity()
        
        # Verify manager
        manager = admin_users.find_one({"username": current_user, "user_type": "manager"})
        if not manager:
            return jsonify({"error": "Unauthorized"}), 403
        
        success = recalculate_completion_percentages()
        
        if success:
            return jsonify({
                "success": True,
                "message": "Completion percentages recalculated successfully"
            }), 200
        else:
            return jsonify({
                "error": "Failed to recalculate completion percentages"
            }), 500
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# INITIALIZE DATABASE WITH DEFAULT DATA
# ============================================================================

def initialize_database():
    """Initialize database with default data"""
    try:
        # Create sample announcements only
        sample_announcements = [
            {
                "title": "Welcome to VEDARC Internship Program!",
                "content": "Welcome all students to the VEDARC Internship Program. We're excited to have you on board!",
                "priority": "high",
                "created_at": datetime.utcnow(),
                "created_by": "system"
            },
            {
                "title": "Assignment Submission Guidelines",
                "content": "Please ensure all assignments are submitted with proper GitHub links and deployed URLs.",
                "priority": "normal",
                "created_at": datetime.utcnow(),
                "created_by": "system"
            }
        ]
        
        for announcement in sample_announcements:
            if not announcements.find_one({"title": announcement["title"]}):
                announcements.insert_one(announcement)
        
        # Create admin users if they don't exist
        admin_users_list = [
            {
                "fullName": "VEDARC Admin",
                "email": ADMIN_USERNAME,
                "username": ADMIN_USERNAME,
                "user_type": "admin",
                "password": generate_password_hash(ADMIN_PASSWORD),
                "created_at": datetime.utcnow(),
                "created_by": "system"
            },
            {
                "fullName": "VEDARC HR",
                "email": HR_USERNAME,
                "username": HR_USERNAME,
                "user_type": "hr",
                "password": generate_password_hash(HR_PASSWORD),
                "created_at": datetime.utcnow(),
                "created_by": "system"
            },
            {
                "fullName": "VEDARC Manager",
                "email": MANAGER_USERNAME,
                "username": MANAGER_USERNAME,
                "user_type": "manager",
                "password": generate_password_hash(MANAGER_PASSWORD),
                "created_at": datetime.utcnow(),
                "created_by": "system"
            }
        ]
        
        for admin_user in admin_users_list:
            if not admin_users.find_one({"username": admin_user["username"]}):
                admin_users.insert_one(admin_user)
        
        print("Database initialized successfully!")
        print("Admin users and sample announcements created.")
        print("Note: No default internships created. Internship Manager must create internships manually.")
        
    except Exception as e:
        print(f"Error initializing database: {e}")

# ================= Certificate Template Management =========================

@app.route('/api/admin/certificate-template', methods=['POST'])
@jwt_required()
def save_certificate_template():
    """Save or update a certificate template (admin only)"""
    current_user = get_jwt_identity()
    if current_user != ADMIN_USERNAME:
        return jsonify({"error": "Unauthorized"}), 403
    
    try:
        data = request.json
        template_type = data.get('type')  # 'completion', 'lor', 'offer'
        template_data = data.get('template')
        
        if template_type not in ['completion', 'lor', 'offer']:
            return jsonify({"error": "Invalid template type"}), 400
        
        if not template_data:
            return jsonify({"error": "Missing template data"}), 400
        
        # Validate template structure
        required_fields = ['placeholders', 'orientation']
        for field in required_fields:
            if field not in template_data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Additional validation for placeholders
        if not isinstance(template_data.get('placeholders'), dict):
            return jsonify({"error": "Placeholders must be an object"}), 400
        
        if len(template_data.get('placeholders', {})) == 0:
            return jsonify({"error": "At least one placeholder element is required"}), 400
        
        # Validate orientation
        if template_data.get('orientation') not in ['portrait', 'landscape']:
            return jsonify({"error": "Orientation must be either 'portrait' or 'landscape'"}), 400
        
        # Save template to database
        certificate_templates.update_one(
            {"type": template_type},
            {"$set": {
                "template": template_data, 
                "updated_at": datetime.utcnow(),
                "created_by": current_user
            }},
            upsert=True
        )
        
        return jsonify({
            "success": True, 
            "message": f"{template_type.title()} template saved successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/certificate-template', methods=['GET'])
@jwt_required()
def get_certificate_template():
    """Get a certificate template by type (admin only)"""
    current_user = get_jwt_identity()
    if current_user != ADMIN_USERNAME:
        return jsonify({"error": "Unauthorized"}), 403
    
    try:
        template_type = request.args.get('type')
        if template_type not in ['completion', 'lor', 'offer']:
            return jsonify({"error": "Invalid template type"}), 400
        
        doc = certificate_templates.find_one({"type": template_type})
        if not doc:
            return jsonify({"error": f"No template set for {template_type}"}), 404
        
        return jsonify({"template": doc['template']}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/certificate-template/upload', methods=['POST'])
@jwt_required()
def upload_template_file():
    """Upload template file (PDF or image) with placeholder detection (admin only)"""
    current_user = get_jwt_identity()
    if current_user != ADMIN_USERNAME:
        return jsonify({"error": "Unauthorized"}), 403
    
    try:
        # Check for either 'file' or 'image' field (for backward compatibility)
        file_field = None
        if 'file' in request.files:
            file_field = 'file'
        elif 'image' in request.files:
            file_field = 'image'
        else:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files[file_field]
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if file:
            # Get file extension
            file_ext = os.path.splitext(file.filename)[1].lower()
            
            # Validate file type
            allowed_extensions = ['.pdf', '.png', '.jpg', '.jpeg', '.gif']
            if file_ext not in allowed_extensions:
                return jsonify({"error": f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"}), 400
            
            # Generate unique filename
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            filename = f"template_{timestamp}_{secure_filename(file.filename)}"
            
            # Save to templates directory
            templates_dir = os.path.join(os.getcwd(), 'templates')
            os.makedirs(templates_dir, exist_ok=True)
            
            file_path = os.path.join(templates_dir, filename)
            file.save(file_path)
            
            # Detect placeholders if it's a PDF
            detected_placeholders = {}
            if file_ext == '.pdf':
                detected_placeholders = detect_pdf_placeholders(file_path)
            
            # Return the file path and detected placeholders
            return jsonify({
                "success": True,
                "file_path": f"/templates/{filename}",
                "filename": filename,
                "file_type": file_ext[1:],  # Remove the dot
                "detected_placeholders": detected_placeholders
            }), 200
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def detect_pdf_placeholders(pdf_path):
    """Detect placeholders in PDF file by extracting text and finding {placeholder} patterns"""
    try:
        import PyPDF2
        import re
        
        placeholders = {}
        placeholder_pattern = r'\{([^}]+)\}'
        
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            for page_num, page in enumerate(pdf_reader.pages):
                text = page.extract_text()
                
                # Find all placeholders in the text
                matches = re.findall(placeholder_pattern, text)
                
                for i, placeholder in enumerate(matches):
                    placeholder_id = f"placeholder_{page_num}_{i}"
                    placeholders[placeholder_id] = {
                        "placeholder": placeholder,
                        "text": f"{{{placeholder}}}",
                        "page": page_num,
                        "x": 50,  # Default position
                        "y": 50,
                        "font_size": 12,
                        "font_name": "Helvetica",
                        "color": "#000000"
                    }
        
        return placeholders
        
    except ImportError:
        # If PyPDF2 is not available, return empty placeholders
        return {}
    except Exception as e:
        print(f"Error detecting placeholders: {e}")
        return {}

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

@app.route('/templates/<filename>')
def serve_template_file(filename):
    """Serve uploaded template files (images and PDFs)"""
    try:
        templates_dir = os.path.join(os.getcwd(), 'templates')
        file_path = os.path.join(templates_dir, filename)
        
        if os.path.exists(file_path):
            # Determine MIME type based on file extension
            file_ext = os.path.splitext(filename)[1].lower()
            mime_types = {
                '.pdf': 'application/pdf',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif'
            }
            
            mime_type = mime_types.get(file_ext, 'application/octet-stream')
            
            return send_file(file_path, mimetype=mime_type)
        else:
            return jsonify({"error": "File not found"}), 404
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def generate_certificate_from_template(template_data, student_data, certificate_type):
    """Generate certificate PDF using template and student data"""
    try:
        # Try to import required libraries
        try:
            from reportlab.pdfgen import canvas
            from reportlab.lib.pagesizes import A4, landscape
            from reportlab.lib.units import mm
            from reportlab.pdfbase import pdfmetrics
            from reportlab.pdfbase.ttfonts import TTFont
            from PIL import Image
            import io
            import PyPDF2
            import base64
        except ImportError as e:
            print(f"Missing required library for certificate generation: {e}")
            # Create a simple text-based certificate as fallback
            return create_simple_certificate(template_data, student_data, certificate_type)
        
        # Get template info
        template_file_path = template_data.get('template_file', '')
        placeholders = template_data.get('placeholders', {})
        orientation = template_data.get('orientation', 'portrait')
        background_image = template_data.get('background_image', '')
        backgroundColor = template_data.get('backgroundColor', '#ffffff')
        borderColor = template_data.get('borderColor', '#cccccc')
        
        # Set page size based on orientation
        if orientation == 'landscape':
            pagesize = landscape(A4)
        else:
            pagesize = A4
        
        # Create PDF buffer
        buffer = io.BytesIO()
        
        # Check if we have a PDF template
        if template_file_path and template_file_path.endswith('.pdf'):
            # Use PDF template as background
            try:
                # Handle both absolute and relative paths
                if template_file_path.startswith('/'):
                    pdf_path = os.path.join(os.getcwd(), template_file_path.lstrip('/'))
                else:
                    pdf_path = template_file_path
                
                if os.path.exists(pdf_path):
                    # Create new PDF with template as background
                    c = canvas.Canvas(buffer, pagesize=pagesize)
                    width, height = pagesize
                    
                    # Add the template PDF as background
                    c.saveState()
                    c.translate(0, 0)
                    c.drawImage(pdf_path, 0, 0, width=width, height=height, mask='auto')
                    c.restoreState()
                    
                    # Add text placeholders on top
                    for placeholder_id, placeholder_data in placeholders.items():
                        text = placeholder_data.get('text', '')
                        x = placeholder_data.get('x', 0) * mm
                        y = height - (placeholder_data.get('y', 0) * mm)  # Convert from top-left to bottom-left
                        font_size = placeholder_data.get('fontSize', 12)
                        font_family = placeholder_data.get('fontFamily', 'Helvetica')
                        color = placeholder_data.get('color', '#000000')
                        
                        # Replace placeholders with actual data
                        text = replace_placeholders(text, student_data)
                        
                        # Set font and color
                        c.setFont(font_family, font_size)
                        
                        # Convert hex color to RGB
                        try:
                            rgb_color = hex_to_rgb(color)
                            c.setFillColorRGB(rgb_color[0]/255, rgb_color[1]/255, rgb_color[2]/255)
                        except:
                            c.setFillColorRGB(0, 0, 0)  # Default to black if color conversion fails
                        
                        # Draw text
                        c.drawString(x, y, text)
                    
                    c.save()
                    buffer.seek(0)
                    return buffer
                    
            except Exception as e:
                print(f"Error using PDF template: {e}")
                # Fall back to basic generation
        
        # Create certificate with background image or color
        c = canvas.Canvas(buffer, pagesize=pagesize)
        width, height = pagesize
        
        # Set background color
        try:
            rgb_bg = hex_to_rgb(backgroundColor)
            c.setFillColorRGB(rgb_bg[0]/255, rgb_bg[1]/255, rgb_bg[2]/255)
            c.rect(0, 0, width, height, fill=1)
        except:
            # Default white background
            c.setFillColorRGB(1, 1, 1)
            c.rect(0, 0, width, height, fill=1)
        
        # Add background image if provided
        if background_image:
            try:
                # Handle base64 encoded images
                if background_image.startswith('data:image'):
                    # Extract base64 data
                    header, encoded = background_image.split(",", 1)
                    image_data = base64.b64decode(encoded)
                    
                    # Create temporary file
                    temp_img_path = os.path.join(os.getcwd(), 'temp_bg.png')
                    with open(temp_img_path, 'wb') as f:
                        f.write(image_data)
                    
                    # Draw background image
                    c.drawImage(temp_img_path, 0, 0, width=width, height=height)
                    
                    # Clean up temp file
                    os.remove(temp_img_path)
                else:
                    # Handle file path
                    if background_image.startswith('/'):
                        img_path = os.path.join(os.getcwd(), background_image.lstrip('/'))
                    else:
                        img_path = background_image
                    
                    if os.path.exists(img_path):
                        c.drawImage(img_path, 0, 0, width=width, height=height)
                        
            except Exception as e:
                print(f"Error loading background image: {e}")
        
        # Add border if specified
        if borderColor:
            try:
                rgb_border = hex_to_rgb(borderColor)
                c.setStrokeColorRGB(rgb_border[0]/255, rgb_border[1]/255, rgb_border[2]/255)
                c.setLineWidth(2)
                c.rect(10, 10, width-20, height-20)
            except:
                pass
        
        # Add text placeholders
        for placeholder_id, placeholder_data in placeholders.items():
            text = placeholder_data.get('text', '')
            x = placeholder_data.get('x', 0) * mm
            y = height - (placeholder_data.get('y', 0) * mm)  # Convert from top-left to bottom-left
            font_size = placeholder_data.get('fontSize', 12)
            font_family = placeholder_data.get('fontFamily', 'Helvetica')
            color = placeholder_data.get('color', '#000000')
            
            # Replace placeholders with actual data
            text = replace_placeholders(text, student_data)
            
            # Set font and color
            c.setFont(font_family, font_size)
            
            # Convert hex color to RGB
            try:
                rgb_color = hex_to_rgb(color)
                c.setFillColorRGB(rgb_color[0]/255, rgb_color[1]/255, rgb_color[2]/255)
            except:
                c.setFillColorRGB(0, 0, 0)  # Default to black if color conversion fails
            
            # Draw text
            c.drawString(x, y, text)
        
        # Save PDF
        c.save()
        buffer.seek(0)
        
        return buffer
        
    except Exception as e:
        print(f"Error generating certificate: {e}")
        # Fall back to simple certificate
        return create_simple_certificate(template_data, student_data, certificate_type)

def create_simple_certificate(template_data, student_data, certificate_type):
    """Create a simple text-based certificate when advanced libraries are not available"""
    try:
        import io
        
        # Create a simple text certificate
        certificate_text = f"""
CERTIFICATE OF {certificate_type.upper()}

This is to certify that

{student_data.get('fullName', 'Student Name')}

has successfully completed the {student_data.get('track', 'Track')} program.

Completion Date: {student_data.get('completion_date', 'Date')}
Manager: {student_data.get('manager_name', 'Manager')}

Issued by: VEDARC TECHNOLOGIES
        """
        
        # Create a simple text file as fallback
        buffer = io.BytesIO()
        buffer.write(certificate_text.encode('utf-8'))
        buffer.seek(0)
        
        return buffer
        
    except Exception as e:
        print(f"Error creating simple certificate: {e}")
        # Return empty buffer as last resort
        import io
        buffer = io.BytesIO()
        buffer.write(b"Certificate generation failed")
        buffer.seek(0)
        return buffer

def replace_placeholders(text, student_data):
    """Replace placeholders in text with actual student data"""
    replacements = {
        '{student_name}': student_data.get('fullName', ''),
        '{track_name}': student_data.get('track', ''),
        '{completion_date}': student_data.get('completion_date', ''),
        '{current_date}': datetime.utcnow().strftime('%d %B %Y'),
        '{manager_name}': student_data.get('manager_name', ''),
        '{company_name}': 'VEDARC TECHNOLOGIES',
        '{user_id}': student_data.get('user_id', ''),
        '{fullName}': student_data.get('fullName', ''),
        '{track}': student_data.get('track', ''),
        '{completion_date}': student_data.get('completion_date', ''),
        '{manager_name}': student_data.get('manager_name', ''),
        '{company_name}': 'VEDARC TECHNOLOGIES'
    }
    
    for placeholder, value in replacements.items():
        text = text.replace(placeholder, str(value))
    
    return text

@app.route('/api/student/certificates/<certificate_type>', methods=['GET'])
@jwt_required()
def student_download_certificate(certificate_type):
    """Download certificate for student using template"""
    try:
        current_user = get_jwt_identity()
        user = users.find_one({"user_id": current_user})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        if certificate_type not in ['completion', 'lor', 'offer']:
            return jsonify({"error": "Invalid certificate type"}), 400
        
        # Check if certificate is unlocked
        if certificate_type == 'completion':
            if not user.get('certificate_unlocked', False):
                return jsonify({"error": "Certificate of Completion is not unlocked yet"}), 403
        elif certificate_type == 'lor':
            if not user.get('lor_unlocked', False):
                return jsonify({"error": "Letter of Recommendation is not unlocked yet"}), 403
        elif certificate_type == 'offer':
            # Offer letter is available by default when account is activated
            # No unlock check needed for offer letter
            pass
        
        # Get template for this certificate type
        template_doc = certificate_templates.find_one({"type": certificate_type})
        if not template_doc:
            return jsonify({"error": f"No template found for {certificate_type} certificate"}), 404
        
        template_data = template_doc['template']
        
        # Prepare student data
        student_data = {
            'fullName': user['fullName'],
            'track': user.get('track', ''),
            'completion_date': user.get('completion_date', datetime.utcnow().strftime('%d %B %Y')),
            'manager_name': user.get('manager_name', ''),
            'user_id': user['user_id']
        }
        
        # Generate certificate PDF
        pdf_buffer = generate_certificate_from_template(template_data, student_data, certificate_type)
        
        # Generate filename
        filename = f"{certificate_type}-{user['fullName'].replace(' ', '-')}.pdf"
        
        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/generate-certificate', methods=['POST'])
@jwt_required()
def admin_generate_certificate():
    """Generate certificate for student using template"""
    try:
        current_user = get_jwt_identity()
        if current_user != ADMIN_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        user_id = data.get('user_id')
        certificate_type = data.get('certificate_type', 'completion')
        
        if not user_id:
            return jsonify({"error": "Missing user_id"}), 400
        
        # Find user
        user = users.find_one({"user_id": user_id})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Get template for this certificate type
        template_doc = certificate_templates.find_one({"type": certificate_type})
        if not template_doc:
            return jsonify({"error": f"No template found for {certificate_type} certificate"}), 404
        
        template_data = template_doc['template']
        
        # Prepare student data
        student_data = {
            'fullName': user['fullName'],
            'track': user.get('track', ''),
            'completion_date': data.get('completion_date', datetime.utcnow().strftime('%d %B %Y')),
            'manager_name': data.get('manager_name', ''),
            'user_id': user['user_id']
        }
        
        # Generate certificate PDF
        pdf_buffer = generate_certificate_from_template(template_data, student_data, certificate_type)
        
        # Save certificate record
        certificate_data = {
            "user_id": user_id,
            "fullName": user['fullName'],
            "track": user.get('track', ''),
            "certificate_type": certificate_type,
            "issued_at": datetime.utcnow(),
            "issued_by": current_user
        }
        
        result = certificates.insert_one(certificate_data)
        
        # Update user status
        if certificate_type == 'completion':
            users.update_one(
                {"user_id": user_id},
                {"$set": {"certificate_generated": True}}
            )
        elif certificate_type == 'lor':
            users.update_one(
                {"user_id": user_id},
                {"$set": {"lor_generated": True}}
            )
        elif certificate_type == 'offer':
            users.update_one(
                {"user_id": user_id},
                {"$set": {"offer_letter_generated": True}}
            )
        
        # Create notification for student
        certificate_names = {
            'completion': 'Certificate of Completion',
            'lor': 'Letter of Recommendation',
            'offer': 'Offer Letter'
        }
        certificate_name = certificate_names.get(certificate_type, 'Certificate')
        
        notification_data = {
            "user_id": user_id,
            "title": f"{certificate_name} Generated!",
            "content": f"Your {certificate_name} has been generated and is now available for download.",
            "priority": "high",
            "is_read": False,
            "created_at": datetime.utcnow()
        }
        student_notifications.insert_one(notification_data)
        
        # Return PDF for download
        filename = f"{certificate_type}-{user['fullName'].replace(' ', '-')}.pdf"
        
        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/certificates/generate', methods=['POST'])
@jwt_required()
def manager_generate_certificate():
    """Generate certificate for student (manager only)"""
    try:
        current_user = get_jwt_identity()
        
        # Verify manager
        manager = admin_users.find_one({"username": current_user, "user_type": "manager"})
        if not manager:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        user_id = data.get('user_id')
        certificate_type = data.get('certificate_type')  # 'completion' or 'lor'
        
        if not user_id or not certificate_type:
            return jsonify({"error": "Missing user_id or certificate_type"}), 400
        
        if certificate_type not in ['completion', 'lor']:
            return jsonify({"error": "Invalid certificate type"}), 400
        
        # Find user
        user = users.find_one({"user_id": user_id})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Check if certificate is unlocked
        if certificate_type == 'completion':
            if not user.get('certificate_unlocked', False):
                return jsonify({"error": "Certificate of Completion is not unlocked for this student"}), 400
        elif certificate_type == 'lor':
            if not user.get('lor_unlocked', False):
                return jsonify({"error": "Letter of Recommendation is not unlocked for this student"}), 400
        
        # Check if certificate already exists
        existing_certificate = certificates.find_one({
            "user_id": user_id,
            "certificate_type": certificate_type
        })
        
        if existing_certificate:
            return jsonify({"error": f"{certificate_type.title()} certificate already exists for this student"}), 400
        
        # Generate certificate link (in production, this would generate actual certificate)
        certificate_link = f"https://vedarc-certificates.s3.amazonaws.com/{user_id}_{certificate_type}_certificate.pdf"
        
        # Save certificate record
        certificate_data = {
            "user_id": user_id,
            "fullName": user['fullName'],
            "track": user['track'],
            "certificate_type": certificate_type,
            "certificate_link": certificate_link,
            "issued_at": datetime.utcnow(),
            "issued_by": current_user
        }
        
        result = certificates.insert_one(certificate_data)
        
        # Create notification for student
        certificate_name = "Certificate of Completion" if certificate_type == 'completion' else "Letter of Recommendation"
        notification_data = {
            "user_id": user_id,
            "title": f"{certificate_name} Generated!",
            "content": f"Your {certificate_name} has been generated and is now available for download.",
            "priority": "high",
            "is_read": False,
            "created_at": datetime.utcnow()
        }
        student_notifications.insert_one(notification_data)
        
        return jsonify({
            "success": True,
            "message": f"{certificate_type.title()} certificate generated successfully",
            "certificate_link": certificate_link,
            "certificate_id": str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/student/daily-completion', methods=['POST'])
@jwt_required()
def student_mark_daily_completion():
    """Mark daily completion for student"""
    try:
        current_user = get_jwt_identity()
        
        # Find user
        user = users.find_one({"user_id": current_user})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        data = request.json
        week_number = data.get('week_number')
        day_number = data.get('day_number')
        completed = data.get('completed', True)
        
        if not week_number or not day_number:
            return jsonify({"error": "Missing week_number or day_number"}), 400
        
        # Find the week
        week = weeks.find_one({"track": user['track'], "week_number": week_number})
        if not week:
            return jsonify({"error": "Week not found"}), 404
        
        # Check if day exists in the week
        daily_content = week.get('daily_content', [])
        day_exists = any(day.get('day') == day_number for day in daily_content)
        if not day_exists:
            return jsonify({"error": f"Day {day_number} not found in week {week_number}"}), 404
        
        # Update or create daily completion record
        completion_key = f"daily_completion.week_{week_number}.day_{day_number}"
        
        if completed:
            # Mark as completed
            users.update_one(
                {"user_id": current_user},
                {"$set": {completion_key: {
                    "completed": True,
                    "completed_at": datetime.utcnow()
                }}}
            )
        else:
            # Mark as not completed
            users.update_one(
                {"user_id": current_user},
                {"$unset": {completion_key: ""}}
            )
        
        return jsonify({
            "success": True,
            "message": f"Day {day_number} marked as {'completed' if completed else 'not completed'}"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/student/daily-completion/<week_number>', methods=['GET'])
@jwt_required()
def student_get_daily_completion(week_number):
    """Get daily completion status for a week"""
    try:
        current_user = get_jwt_identity()
        
        # Find user
        user = users.find_one({"user_id": current_user})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Get completion status for the week
        completion_data = user.get('daily_completion', {})
        week_completion = completion_data.get(f'week_{week_number}', {})
        
        return jsonify({
            "week_number": week_number,
            "daily_completion": week_completion
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ================= PROJECT ASSIGNMENT MODULE =========================

@app.route('/api/manager/project/templates', methods=['GET'])
@jwt_required()
def manager_get_project_templates():
    """Get all project templates for an internship"""
    try:
        current_user = get_jwt_identity()
        if current_user != MANAGER_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        internship_id = request.args.get('internship_id')
        if not internship_id:
            return jsonify({"error": "Missing internship_id"}), 400
        # Get project templates for this internship
        templates = list(projects.find({"internship_id": internship_id, "is_template": True}))
        for t in templates:
            t['_id'] = str(t['_id'])
            if t.get('created_at'): t['created_at'] = t['created_at'].isoformat()
        return jsonify({"templates": templates}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/project/templates', methods=['POST'])
@jwt_required()
def manager_create_project_template():
    """Create a new project template"""
    try:
        current_user = get_jwt_identity()
        if current_user != MANAGER_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        data = request.json
        internship_id = data.get('internship_id')
        title = data.get('title')
        description = data.get('description')
        upload_link = data.get('upload_link', '')
        if not internship_id or not title or not description:
            return jsonify({"error": "Missing required fields"}), 400
        template_data = {
            "internship_id": internship_id,
            "title": title,
            "description": description,
            "upload_link": upload_link,
            "is_template": True,
            "created_at": datetime.utcnow(),
            "created_by": current_user
        }
        result = projects.insert_one(template_data)
        return jsonify({"success": True, "message": "Project template created", "template_id": str(result.inserted_id)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/project/templates/<template_id>', methods=['PUT'])
@jwt_required()
def manager_update_project_template(template_id):
    """Update a project template"""
    try:
        current_user = get_jwt_identity()
        if current_user != MANAGER_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        data = request.json
        update_data = {}
        for field in ['title', 'description', 'upload_link']:
            if field in data:
                update_data[field] = data[field]
        if not update_data:
            return jsonify({"error": "No fields to update"}), 400
        update_data['updated_at'] = datetime.utcnow()
        update_data['updated_by'] = current_user
        result = projects.update_one({"_id": ObjectId(template_id), "is_template": True}, {"$set": update_data})
        if result.modified_count == 0:
            return jsonify({"error": "Template not found"}), 404
        return jsonify({"success": True, "message": "Template updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/project/templates/<template_id>', methods=['DELETE'])
@jwt_required()
def manager_delete_project_template(template_id):
    """Delete a project template"""
    try:
        current_user = get_jwt_identity()
        if current_user != MANAGER_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        result = projects.delete_one({"_id": ObjectId(template_id), "is_template": True})
        if result.deleted_count == 0:
            return jsonify({"error": "Template not found"}), 404
        return jsonify({"success": True, "message": "Template deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/project/assign', methods=['POST'])
@jwt_required()
def manager_assign_project():
    """Assign a project template to a student"""
    try:
        current_user = get_jwt_identity()
        if current_user != MANAGER_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        data = request.json
        user_id = data.get('user_id')
        template_id = data.get('template_id')
        if not user_id or not template_id:
            return jsonify({"error": "Missing required fields"}), 400
        # Check if student exists
        user = users.find_one({"user_id": user_id})
        if not user:
            return jsonify({"error": "Student not found"}), 404
        # Get template
        template = projects.find_one({"_id": ObjectId(template_id), "is_template": True})
        if not template:
            return jsonify({"error": "Project template not found"}), 404
        # Check if student already has a project for this internship
        existing_project = projects.find_one({"user_id": user_id, "internship_id": template['internship_id'], "is_template": {"$ne": True}})
        if existing_project:
            return jsonify({"error": "Student already has a project assigned for this internship"}), 400
        # Create project assignment from template
        project_data = {
            "user_id": user_id,
            "internship_id": template['internship_id'],
            "title": template['title'],
            "description": template['description'],
            "upload_link": template['upload_link'],
            "template_id": template_id,
            "status": "Assigned",
            "assigned_at": datetime.utcnow(),
            "submitted_at": None,
            "reviewed_at": None,
            "review_status": None,
            "review_feedback": None,
            "is_template": False
        }
        result = projects.insert_one(project_data)
        return jsonify({"success": True, "message": "Project assigned to student", "project_id": str(result.inserted_id)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/project/list', methods=['GET'])
@jwt_required()
def manager_list_projects():
    """List all projects for an internship"""
    try:
        current_user = get_jwt_identity()
        if current_user != MANAGER_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        internship_id = request.args.get('internship_id')
        if not internship_id:
            return jsonify({"error": "Missing internship_id"}), 400
        # Get only assigned projects (not templates)
        project_list = list(projects.find({"internship_id": internship_id, "is_template": {"$ne": True}}))
        for p in project_list:
            p['_id'] = str(p['_id'])
            if p.get('assigned_at'): p['assigned_at'] = p['assigned_at'].isoformat()
            if p.get('submitted_at'): p['submitted_at'] = p['submitted_at'].isoformat()
            if p.get('reviewed_at'): p['reviewed_at'] = p['reviewed_at'].isoformat()
        return jsonify({"projects": project_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/project/review', methods=['POST'])
@jwt_required()
def manager_review_project():
    """Approve or reject a student's project submission"""
    try:
        current_user = get_jwt_identity()
        if current_user != MANAGER_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        data = request.json
        project_id = data.get('project_id')
        review_status = data.get('review_status')  # 'Approved' or 'Rejected'
        review_feedback = data.get('review_feedback', '')
        if not project_id or review_status not in ['Approved', 'Rejected']:
            return jsonify({"error": "Missing or invalid fields"}), 400
        project = projects.find_one({"_id": ObjectId(project_id)})
        if not project:
            return jsonify({"error": "Project not found"}), 404
        projects.update_one({"_id": ObjectId(project_id)}, {"$set": {
            "review_status": review_status,
            "review_feedback": review_feedback,
            "reviewed_at": datetime.utcnow(),
            "status": review_status
        }})
        # If approved, unlock LOR for the student
        if review_status == 'Approved':
            users.update_one({"user_id": project['user_id']}, {"$set": {
                "lor_unlocked": True,
                "lor_unlocked_by": current_user,
                "lor_unlocked_at": datetime.utcnow(),
                "project_completion_status": "Completed"
            }})
        return jsonify({"success": True, "message": f"Project {review_status.lower()}"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/student/project/optin', methods=['POST'])
@jwt_required()
def student_project_optin():
    """Student opts in for a final project"""
    try:
        current_user = get_jwt_identity()
        user = users.find_one({"user_id": current_user})
        if not user:
            return jsonify({"error": "User not found"}), 404
        internship_id = request.json.get('internship_id')
        if not internship_id:
            return jsonify({"error": "Missing internship_id"}), 400
        # Mark opt-in in user profile
        users.update_one({"user_id": current_user}, {"$set": {"project_optin": True}})
        # Optionally, create a placeholder project request
        projects.insert_one({
            "user_id": current_user,
            "internship_id": internship_id,
            "status": "Opted-In",
            "opted_in_at": datetime.utcnow(),
            "is_template": False
        })
        return jsonify({"success": True, "message": "Opted in for final project"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/student/project/submit', methods=['POST'])
@jwt_required()
def student_submit_project():
    """Student submits project upload link"""
    try:
        current_user = get_jwt_identity()
        user = users.find_one({"user_id": current_user})
        if not user:
            return jsonify({"error": "User not found"}), 404
        data = request.json
        internship_id = data.get('internship_id')
        upload_link = data.get('upload_link')
        if not internship_id or not upload_link:
            return jsonify({"error": "Missing required fields"}), 400
        project = projects.find_one({"user_id": current_user, "internship_id": internship_id, "is_template": {"$ne": True}})
        if not project:
            return jsonify({"error": "Project not found"}), 404
        projects.update_one({"_id": project["_id"]}, {"$set": {
            "upload_link": upload_link,
            "status": "Submitted",
            "submitted_at": datetime.utcnow()
        }})
        return jsonify({"success": True, "message": "Project submitted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/student/project/status', methods=['GET'])
@jwt_required()
def student_project_status():
    """Get student's project status"""
    try:
        current_user = get_jwt_identity()
        internship_id = request.args.get('internship_id')
        if not internship_id:
            return jsonify({"error": "Missing internship_id"}), 400
        project = projects.find_one({"user_id": current_user, "internship_id": internship_id, "is_template": {"$ne": True}})
        if not project:
            # Return null project instead of 404 error - this is normal for students without assigned projects
            return jsonify({"project": None, "message": "No project assigned yet"}), 200
        project['_id'] = str(project['_id'])
        if project.get('assigned_at'): project['assigned_at'] = project['assigned_at'].isoformat()
        if project.get('submitted_at'): project['submitted_at'] = project['submitted_at'].isoformat()
        if project.get('reviewed_at'): project['reviewed_at'] = project['reviewed_at'].isoformat()
        return jsonify({"project": project}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/certificate-placeholders', methods=['GET'])
@jwt_required()
def get_certificate_placeholders():
    """Get available placeholder options for certificate templates"""
    current_user = get_jwt_identity()
    if current_user != ADMIN_USERNAME:
        return jsonify({"error": "Unauthorized"}), 403
    
    try:
        placeholders = {
            "student_name": {
                "placeholder": "{student_name}",
                "description": "Student's full name",
                "example": "John Doe"
            },
            "track_name": {
                "placeholder": "{track_name}",
                "description": "Internship track name",
                "example": "Full Stack Development"
            },
            "completion_date": {
                "placeholder": "{completion_date}",
                "description": "Course completion date",
                "example": "15 December 2024"
            },
            "current_date": {
                "placeholder": "{current_date}",
                "description": "Current date when certificate is generated",
                "example": "27 June 2025"
            },
            "manager_name": {
                "placeholder": "{manager_name}",
                "description": "Manager's name",
                "example": "Sarah Johnson"
            },
            "company_name": {
                "placeholder": "{company_name}",
                "description": "Company name",
                "example": "VEDARC TECHNOLOGIES"
            },
            "user_id": {
                "placeholder": "{user_id}",
                "description": "Student's user ID",
                "example": "VEDARC-12345"
            },
            "fullName": {
                "placeholder": "{fullName}",
                "description": "Student's full name (alternative)",
                "example": "John Doe"
            },
            "track": {
                "placeholder": "{track}",
                "description": "Internship track (alternative)",
                "example": "Full Stack Development"
            }
        }
        
        return jsonify({
            "placeholders": placeholders,
            "usage_instructions": "Use these placeholders in your certificate template text. They will be automatically replaced with actual student data when generating certificates."
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# LOGOUT ENDPOINTS
# ============================================================================

@app.route('/api/student/logout', methods=['POST'])
@jwt_required()
def student_logout():
    """Student logout endpoint"""
    try:
        current_user = get_jwt_identity()
        session_id = request.headers.get('X-Session-ID')
        
        if session_id:
            deactivate_session(session_id)
        
        return jsonify({"message": "Logged out successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/hr/logout', methods=['POST'])
@jwt_required()
def hr_logout():
    """HR logout endpoint"""
    try:
        current_user = get_jwt_identity()
        session_id = request.headers.get('X-Session-ID')
        
        if session_id:
            deactivate_session(session_id)
        
        return jsonify({"message": "Logged out successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/logout', methods=['POST'])
@jwt_required()
def admin_logout():
    """Admin logout endpoint"""
    try:
        current_user = get_jwt_identity()
        session_id = request.headers.get('X-Session-ID')
        
        if session_id:
            deactivate_session(session_id)
        
        return jsonify({"message": "Logged out successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/logout', methods=['POST'])
@jwt_required()
def manager_logout():
    """Manager logout endpoint"""
    try:
        current_user = get_jwt_identity()
        session_id = request.headers.get('X-Session-ID')
        
        if session_id:
            deactivate_session(session_id)
        
        return jsonify({"message": "Logged out successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# SESSION VALIDATION MIDDLEWARE
# ============================================================================

def validate_session_middleware():
    """Middleware to validate session on protected routes"""
    session_id = request.headers.get('X-Session-ID')
    if session_id:
        session_data = get_session_data(session_id)
        if not session_data:
            return jsonify({"error": "Invalid or expired session"}), 401
        # Update session activity
        update_session_activity(session_id)

@app.route('/api/admin/certificate-preview', methods=['POST'])
@jwt_required()
def admin_certificate_preview():
    """Generate certificate preview using template (no real user required)"""
    try:
        current_user = get_jwt_identity()
        if current_user != ADMIN_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        template = data.get('template')
        preview_data = data.get('preview_data', {})
        certificate_type = data.get('certificate_type', 'completion')
        
        if not template:
            return jsonify({"error": "Missing template data"}), 400
        
        # Prepare sample student data for preview
        student_data = {
            'fullName': preview_data.get('studentName', 'John Doe'),
            'track': preview_data.get('trackName', 'Sample Track'),
            'completion_date': preview_data.get('completionDate', datetime.utcnow().strftime('%d %B %Y')),
            'manager_name': preview_data.get('managerName', 'Sample Manager'),
            'user_id': 'preview'
        }
        
        # Generate certificate PDF using the provided template
        pdf_buffer = generate_certificate_from_template(template, student_data, certificate_type)
        
        # Return PDF for download
        filename = f"preview-{certificate_type}-template.pdf"
        
        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/student/project/templates', methods=['GET'])
@jwt_required()
def student_get_project_templates():
    """Get project templates for student's internship track"""
    try:
        current_user = get_jwt_identity()
        internship_id = request.args.get('internship_id')
        if not internship_id:
            return jsonify({"error": "Missing internship_id"}), 400
        
        # Get project templates for this internship
        templates = list(projects.find({"internship_id": internship_id, "is_template": True}))
        for t in templates:
            t['_id'] = str(t['_id'])
            if t.get('created_at'): t['created_at'] = t['created_at'].isoformat()
        
        return jsonify({"templates": templates}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/student/project/auto-assign', methods=['POST'])
@jwt_required()
def student_auto_assign_project():
    """Auto-assign project to student when they reach 100% completion"""
    try:
        current_user = get_jwt_identity()
        user = users.find_one({"user_id": current_user})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        internship_id = request.json.get('internship_id')
        if not internship_id:
            return jsonify({"error": "Missing internship_id"}), 400
        
        # Check if student already has a project for this internship
        existing_project = projects.find_one({
            "user_id": current_user, 
            "internship_id": internship_id, 
            "is_template": {"$ne": True}
        })
        if existing_project:
            return jsonify({"error": "Student already has a project assigned for this internship"}), 400
        
        # Get available project templates for this internship
        templates = list(projects.find({"internship_id": internship_id, "is_template": True}))
        if not templates:
            return jsonify({"error": "No project templates available for this internship track"}), 404
        
        # Select the first available template (you can implement more sophisticated selection logic)
        template = templates[0]
        
        # Create project assignment from template
        project_data = {
            "user_id": current_user,
            "internship_id": internship_id,
            "title": template['title'],
            "description": template['description'],
            "upload_link": template.get('upload_link', ''),
            "template_id": str(template['_id']),
            "status": "Assigned",
            "assigned_at": datetime.utcnow(),
            "submitted_at": None,
            "reviewed_at": None,
            "review_status": None,
            "review_feedback": None,
            "is_template": False,
            "auto_assigned": True  # Mark as auto-assigned
        }
        
        result = projects.insert_one(project_data)
        
        return jsonify({
            "success": True, 
            "message": "Project auto-assigned successfully", 
            "project_id": str(result.inserted_id),
            "project": {
                "title": template['title'],
                "description": template['description'],
                "upload_link": template.get('upload_link', ''),
                "status": "Assigned"
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Test database connection at startup
    if client and db:
        try:
            client.admin.command('ping')
            print("✅ Database connection test successful at startup")
            initialize_database()
        except Exception as e:
            print(f"❌ Database connection test failed at startup: {e}")
    else:
        print("⚠️ No database connection available at startup")
    
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(debug=debug, host='0.0.0.0', port=port) 