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
from email.mime.base import MIMEBase
from email import encoders
import random
import string
import re
from dotenv import load_dotenv
from flask import abort
from io import BytesIO
from fpdf import FPDF
from werkzeug.utils import secure_filename
import base64
import uuid
from pymongo.server_api import ServerApi
import ssl
import razorpay
import hashlib
import hmac

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

# Razorpay Configuration
RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID', 'rzp_live_0KhcjQzPRIDLaw')
RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET', '1F1HYYfx8DALjMlAtlPges5K')
RAZORPAY_WEBHOOK_SECRET = os.getenv('RAZORPAY_WEBHOOK_SECRET', 'vedarc@6496')

# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

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
if db is not None:
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
    system_settings = db['system_settings']  # Global system settings collection
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
    system_settings = None

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

def send_email(to_email, subject, body, attachment_path=None):
    """Send email using SMTP with optional attachment"""
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'html'))
        
        # Add attachment if provided
        if attachment_path and os.path.exists(attachment_path):
            with open(attachment_path, 'rb') as attachment:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment.read())
                encoders.encode_base64(part)
                part.add_header('Content-Disposition', f'attachment; filename= {os.path.basename(attachment_path)}')
                msg.attach(part)
        
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

def verify_razorpay_signature(payload, signature):
    """Verify Razorpay webhook signature"""
    try:
        razorpay_client.utility.verify_webhook_signature(payload, signature, RAZORPAY_WEBHOOK_SECRET)
        return True
    except Exception as e:
        print(f"Signature verification failed: {e}")
        return False

def create_payment_order(registration_data, amount=299):
    """Create a Razorpay order for payment"""
    try:
        # Generate a temporary receipt ID
        temp_receipt = f'vedarc_temp_{datetime.utcnow().strftime("%Y%m%d%H%M%S")}'
        
        # Create order data
        order_data = {
            'amount': amount * 100,  # Razorpay expects amount in paise
            'currency': 'INR',
            'receipt': temp_receipt,
            'notes': {
                'email': registration_data['email'],
                'track': registration_data['track'],
                'temp_registration': True
            }
        }
        
        # Create order with Razorpay
        order = razorpay_client.order.create(data=order_data)
        
        # Store payment record in database
        payment_data = {
            'order_id': order['id'],
            'amount': amount,
            'currency': 'INR',
            'status': 'created',
            'registration_data': registration_data,
            'created_at': datetime.utcnow(),
            'payment_id': None,
            'verified': False,
            'user_id': None,  # Will be set after payment success
            'temp_registration': True
        }
        
        if payments is not None:
            payments.insert_one(payment_data)
        
        return {
            'order_id': order['id'],
            'amount': amount,
            'currency': 'INR',
            'key_id': RAZORPAY_KEY_ID
        }
        
    except Exception as e:
        print(f"Error creating payment order: {e}")
        return None

def verify_payment(payment_id, order_id, signature):
    """Verify payment with Razorpay"""
    try:
        # Verify payment signature
        params_dict = {
            'razorpay_payment_id': payment_id,
            'razorpay_order_id': order_id,
            'razorpay_signature': signature
        }
        
        razorpay_client.utility.verify_payment_signature(params_dict)
        
        # Get payment details from Razorpay
        payment = razorpay_client.payment.fetch(payment_id)
        
        return payment['status'] == 'captured'
        
    except Exception as e:
        print(f"Payment verification failed: {e}")
        return False

# ============================================================================
# PUBLIC API ENDPOINTS
# ============================================================================

@app.route('/api/register', methods=['POST'])
def register():
    """Student registration endpoint with payment integration - User ID generated after payment"""
    try:
        # Check if database is available
        if users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        data = request.json
        
        # Validate required fields
        required_fields = ['fullName', 'email', 'whatsapp', 'collegeName', 'track', 'yearOfStudy', 'passoutYear']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Check if email already exists
        if users.find_one({"email": data['email']}):
            return jsonify({"error": "Email already registered"}), 400
        
        # Create temporary registration data (without user_id)
        registration_data = {
            "fullName": data['fullName'],
            "email": data['email'],
            "whatsapp": data['whatsapp'],
            "collegeName": data['collegeName'],
            "track": data['track'],
            "yearOfStudy": data['yearOfStudy'],
            "passoutYear": data['passoutYear'],
            "status": "Payment Pending",
            "created_at": datetime.utcnow(),
            "temp_registration": True  # Mark as temporary registration
        }
        
        # Create payment order with registration data
        payment_order = create_payment_order(registration_data, amount=299)  # ₹299 for internship
        
        if not payment_order:
            return jsonify({"error": "Failed to create payment order. Please try again."}), 500
        
        return jsonify({
            "success": True,
            "message": "Please complete the payment to complete your registration.",
            "payment_order": payment_order,
            "registration_data": registration_data
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/verify-payment', methods=['POST'])
def verify_payment_endpoint():
    """Verify payment and create user account"""
    try:
        # Check if database is available
        if users is None or payments is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        data = request.json
        
        # Validate required fields
        required_fields = ['razorpay_payment_id', 'razorpay_order_id', 'razorpay_signature']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        payment_id = data['razorpay_payment_id']
        order_id = data['razorpay_order_id']
        signature = data['razorpay_signature']
        
        # Verify payment with Razorpay
        if not verify_payment(payment_id, order_id, signature):
            return jsonify({"error": "Payment verification failed"}), 400
        
        # Get payment record from database
        payment_record = payments.find_one({"order_id": order_id})
        if not payment_record:
            return jsonify({"error": "Payment record not found"}), 404
        
        registration_data = payment_record.get('registration_data', {})
        
        # Generate User ID after successful payment
        user_id = generate_user_id(registration_data['track'])
        password = generate_password()
        hashed_password = generate_password_hash(password)
        
        # Create complete user document with Active status
        user_data = {
            "user_id": user_id,
            "fullName": registration_data['fullName'],
            "email": registration_data['email'],
            "whatsapp": registration_data['whatsapp'],
            "collegeName": registration_data['collegeName'],
            "track": registration_data['track'],
            "yearOfStudy": registration_data['yearOfStudy'],
            "passoutYear": registration_data['passoutYear'],
            "status": "Active",  # Automatically set to Active after payment
            "created_at": datetime.utcnow(),
            "password": hashed_password,
            "payment_id": payment_id,  # Store real Razorpay payment ID
            "activated_at": datetime.utcnow(),
            "activated_by": "payment_system",  # Mark as activated by payment system
            # Certificate unlock fields
            "certificate_unlocked": False,
            "lor_unlocked": False,
            "admin_certificate_approval": False,
            "admin_lor_approval": False,
            "certificate_unlocked_by": None,
            "lor_unlocked_by": None,
            "certificate_unlocked_at": None,
            "lor_unlocked_at": None,
            "project_completion_status": "Not Started",
            "course_completion_percentage": 0
        }
        
        # Save user to database
        users.insert_one(user_data)
        
        # Update payment record
        payments.update_one(
            {"order_id": order_id},
            {
                "$set": {
                    "payment_id": payment_id,
                    "status": "completed",
                    "verified": True,
                    "verified_at": datetime.utcnow(),
                    "user_id": user_id,
                    "temp_registration": False
                }
            }
        )
        
        # Send styled invoice email
        try:
            email_subject = "Payment Successful - VEDARC Internship (Invoice & Credentials)"
            email_body = get_payment_invoice_email(user_data, user_id, payment_id, order_id, password)
            send_email(user_data['email'], email_subject, email_body)
        except Exception as e:
            print(f"Failed to send payment confirmation email: {e}")
        
        return jsonify({
            "success": True,
            "message": "Payment verified successfully! Your account has been created and activated.",
            "user_id": user_id,
            "payment_id": payment_id,
            "transaction_id": payment_id
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/razorpay-webhook', methods=['POST'])
def razorpay_webhook():
    """Handle Razorpay webhook notifications"""
    try:
        # Get the webhook payload
        payload = request.get_data(as_text=True)
        signature = request.headers.get('X-Razorpay-Signature')
        
        # Verify webhook signature
        if not verify_razorpay_signature(payload, signature):
            return jsonify({"error": "Invalid signature"}), 400
        
        # Parse the payload
        webhook_data = request.json
        
        # Handle different webhook events
        event = webhook_data.get('event')
        
        if event == 'payment.captured':
            # Payment was successful
            payment_data = webhook_data.get('payload', {}).get('payment', {}).get('entity', {})
            order_data = webhook_data.get('payload', {}).get('order', {}).get('entity', {})
            
            payment_id = payment_data.get('id')
            order_id = order_data.get('id')
            
            if payment_id and order_id:
                # Get payment record from database
                payment_record = payments.find_one({"order_id": order_id})
                if payment_record and payment_record.get('temp_registration'):
                    # This is a new registration, create user account
                    registration_data = payment_record.get('registration_data', {})
                    
                    # Generate User ID
                    user_id = generate_user_id(registration_data['track'])
                    password = generate_password()
                    hashed_password = generate_password_hash(password)
                    
                    # Create complete user document
                    user_data = {
                        "user_id": user_id,
                        "fullName": registration_data['fullName'],
                        "email": registration_data['email'],
                        "whatsapp": registration_data['whatsapp'],
                        "collegeName": registration_data['collegeName'],
                        "track": registration_data['track'],
                        "yearOfStudy": registration_data['yearOfStudy'],
                        "passoutYear": registration_data['passoutYear'],
                        "status": "Active",  # Active after payment
                        "created_at": datetime.utcnow(),
                        "password": hashed_password,
                        "payment_id": payment_id,
                        "activated_at": datetime.utcnow(),
                        # Certificate unlock fields
                        "certificate_unlocked": False,
                        "lor_unlocked": False,
                        "admin_certificate_approval": False,
                        "admin_lor_approval": False,
                        "certificate_unlocked_by": None,
                        "lor_unlocked_by": None,
                        "certificate_unlocked_at": None,
                        "lor_unlocked_at": None,
                        "project_completion_status": "Not Started",
                        "course_completion_percentage": 0
                    }
                    
                    # Save user to database
                    users.insert_one(user_data)
                    
                    # Update payment record
                    payments.update_one(
                        {"order_id": order_id},
                        {
                            "$set": {
                                "payment_id": payment_id,
                                "status": "completed",
                                "verified": True,
                                "verified_at": datetime.utcnow(),
                                "webhook_received": True,
                                "user_id": user_id,
                                "temp_registration": False
                            }
                        }
                    )
                    # Send styled invoice email
                    try:
                        email_subject = "Payment Successful - VEDARC Internship (Invoice & Credentials)"
                        email_body = get_payment_invoice_email(user_data, user_id, payment_id, order_id, password)
                        send_email(user_data['email'], email_subject, email_body)
                    except Exception as e:
                        print(f"Failed to send payment confirmation email: {e}")
                    print(f"Payment webhook processed: {payment_id} for new user {user_id}")
        
        return jsonify({"status": "success"}), 200
        
    except Exception as e:
        print(f"Webhook error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/internships', methods=['GET'])
def get_internships():
    """Get all available internship tracks"""
    try:
        # Check if database is available
        if internships is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        internship_list = list(internships.find({}, {"_id": 0}))
        return jsonify({"internships": internship_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/featured-projects', methods=['GET'])
def get_featured_projects():
    """Get featured projects for public showcase"""
    try:
        # Check if database is available
        if projects is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        # Get featured projects (approved and completed projects)
        featured_projects = list(projects.find({
            "is_template": {"$ne": True},
            "review_status": "Approved",
            "status": "Approved"
        }, {
            '_id': 0,
            'user_id': 0,
            'internship_id': 0,
            'template_id': 0,
            'assigned_at': 0,
            'submitted_at': 0,
            'reviewed_at': 0,
            'review_feedback': 0,
            'auto_assigned': 0
        }).limit(12))
        
        # If no approved projects, return sample featured projects
        if not featured_projects:
            featured_projects = [
                {
                    "title": "AI-Powered E-commerce Recommendation System",
                    "description": "Developed a machine learning model that provides personalized product recommendations, increasing sales by 35% and improving user engagement by 45%.",
                    "tags": ["Python", "Machine Learning", "TensorFlow", "React", "MongoDB"],
                    "status": "Completed",
                    "completion_rate": 98,
                    "student_name": "Priya Sharma",
                    "university": "IIT Delhi",
                    "year": 2024
                },
                {
                    "title": "Blockchain-Based Supply Chain Tracker",
                    "description": "Built a decentralized application for tracking products through the supply chain, ensuring transparency and reducing fraud by 60%.",
                    "tags": ["Solidity", "Web3.js", "React", "Node.js", "IPFS"],
                    "status": "Completed",
                    "completion_rate": 95,
                    "student_name": "Rahul Kumar",
                    "university": "BITS Pilani",
                    "year": 2024
                },
                {
                    "title": "IoT Smart Home Automation System",
                    "description": "Created an intelligent home automation system using IoT sensors and cloud computing, enabling remote control and energy optimization.",
                    "tags": ["Arduino", "Python", "AWS IoT", "React Native", "MQTT"],
                    "status": "Completed",
                    "completion_rate": 92,
                    "student_name": "Ananya Patel",
                    "university": "VIT Vellore",
                    "year": 2024
                },
                {
                    "title": "Cybersecurity Threat Detection Platform",
                    "description": "Developed a real-time threat detection system using machine learning algorithms, achieving 94% accuracy in identifying malicious activities.",
                    "tags": ["Python", "Cybersecurity", "Machine Learning", "Docker", "Kubernetes"],
                    "status": "Completed",
                    "completion_rate": 96,
                    "student_name": "Vikram Singh",
                    "university": "NIT Trichy",
                    "year": 2024
                },
                {
                    "title": "Cloud-Native Microservices Architecture",
                    "description": "Designed and implemented a scalable microservices architecture for a fintech application, reducing deployment time by 70%.",
                    "tags": ["Docker", "Kubernetes", "Node.js", "PostgreSQL", "Redis"],
                    "status": "Completed",
                    "completion_rate": 94,
                    "student_name": "Meera Iyer",
                    "university": "IIIT Hyderabad",
                    "year": 2024
                },
                {
                    "title": "Data Analytics Dashboard for Healthcare",
                    "description": "Built a comprehensive analytics dashboard for healthcare data visualization, helping doctors make data-driven decisions.",
                    "tags": ["Python", "Tableau", "SQL", "Flask", "D3.js"],
                    "status": "Completed",
                    "completion_rate": 91,
                    "student_name": "Arjun Reddy",
                    "university": "Manipal Institute of Technology",
                    "year": 2024
                }
            ]
        
        return jsonify({"featured_projects": featured_projects}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/company-projects', methods=['GET'])
def get_company_projects():
    """Get company projects for public showcase"""
    try:
        # If you have a real collection, fetch from DB here
        # For now, use sample data
        company_projects = [
            {
                "title": "Smart Campus Automation Platform",
                "description": "Developed an IoT-driven automation system for university campuses, integrating smart lighting, security, and energy management. Reduced energy costs by 30% for clients.",
                "tags": ["IoT", "Python", "AWS", "React", "Node.js"],
                "status": "Deployed",
                "impact": "30% energy cost reduction",
                "client": "ABC University",
                "year": 2023
            },
            {
                "title": "Healthcare Data Analytics Suite",
                "description": "Built a HIPAA-compliant analytics dashboard for hospitals, enabling real-time patient monitoring and predictive analytics for better outcomes.",
                "tags": ["Python", "Django", "Tableau", "PostgreSQL"],
                "status": "Live",
                "impact": "Improved patient outcomes by 20%",
                "client": "MediCare Hospitals",
                "year": 2022
            },
            {
                "title": "E-Governance Portal",
                "description": "Designed and deployed a secure, scalable portal for government services, handling over 1 million users with 99.99% uptime.",
                "tags": ["Java", "Spring Boot", "Angular", "MySQL", "Docker"],
                "status": "Live",
                "impact": "1M+ users, 99.99% uptime",
                "client": "State Government",
                "year": 2022
            },
            {
                "title": "AI Document Processing Engine",
                "description": "Implemented an AI-powered document processing system for a financial firm, automating 95% of manual paperwork and reducing errors.",
                "tags": ["AI", "Python", "TensorFlow", "Flask"],
                "status": "Production",
                "impact": "95% automation, error reduction",
                "client": "FinTrust Corp",
                "year": 2023
            }
        ]
        return jsonify({"company_projects": company_projects}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# STUDENT API ENDPOINTS
# ============================================================================

@app.route('/api/student/login', methods=['POST'])
def student_login():
    """Student login endpoint"""
    try:
        # Check if database is available
        if users is None or user_sessions is None:
            return jsonify({"error": "Database connection not available"}), 503
        
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
            if user['status'] == "Disabled":
                return jsonify({"error": "Account has been disabled. Please contact HR for assistance."}), 401
            else:
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
        # Check if database is available
        if users is None or internships is None or weeks is None or submissions is None:
            return jsonify({"error": "Database connection not available"}), 503
        
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
        # Check if database is available
        if users is None or weeks is None:
            return jsonify({"error": "Database connection not available"}), 503
        
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
        # Check if database is available
        if users is None or announcements is None:
            return jsonify({"error": "Database connection not available"}), 503
        
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
        # Check if database is available
        if admin_users is None or user_sessions is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({"error": "Missing username or password"}), 400
        
        # Find HR user
        hr_user = admin_users.find_one({"username": username, "user_type": "hr"})
        if not hr_user:
            return jsonify({"error": "Invalid credentials"}), 401
        
        if not check_password_hash(hr_user['password'], password):
            return jsonify({"error": "Invalid credentials"}), 401
        
        # Create access token
        access_token = create_access_token(identity=username)
        
        # Create unique session ID for this browser instance
        session_id = create_session_id()
        
        # Store session in database
        store_user_session(username, 'hr', session_id, access_token)
        
        # Clean up expired sessions
        cleanup_expired_sessions()
        
        return jsonify({
            "access_token": access_token,
            "session_id": session_id,
            "user": {
                "username": hr_user['username'],
                "fullName": hr_user['fullName'],
                "user_type": hr_user['user_type']
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/login', methods=['POST', 'OPTIONS'])
def admin_login():
    """Admin login endpoint"""
    try:
        # Check if database is available
        if admin_users is None or user_sessions is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({"error": "Missing username or password"}), 400
        
        # Find admin user
        admin_user = admin_users.find_one({"username": username, "user_type": "admin"})
        if not admin_user:
            return jsonify({"error": "Invalid credentials"}), 401
        
        if not check_password_hash(admin_user['password'], password):
            return jsonify({"error": "Invalid credentials"}), 401
            
        # Create access token
        access_token = create_access_token(identity=username)
        
        # Create unique session ID for this browser instance
        session_id = create_session_id()
        
        # Store session in database
        store_user_session(username, 'admin', session_id, access_token)
        
        # Clean up expired sessions
        cleanup_expired_sessions()
        
        return jsonify({
            "access_token": access_token,
            "session_id": session_id,
            "user": {
                "username": admin_user['username'],
                "fullName": admin_user['fullName'],
                "user_type": admin_user['user_type']
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/hr/pending-registrations', methods=['GET'])
@jwt_required()
def hr_get_pending_registrations():
    """Get all users for HR dashboard"""
    try:
        # Check if database is available
        if users is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify HR
        hr_user = admin_users.find_one({"username": current_user, "user_type": "hr"})
        if not hr_user:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Get query parameters
        track_filter = request.args.get('track', '')
        date_filter = request.args.get('date', '')
        status_filter = request.args.get('status', 'all')
        
        # Build query
        query = {}
        if track_filter:
            query["track"] = track_filter
        if date_filter:
            # Convert date string to datetime for comparison
            try:
                filter_date = datetime.strptime(date_filter, '%Y-%m-%d')
                next_date = filter_date + timedelta(days=1)
                query["created_at"] = {
                    "$gte": filter_date,
                    "$lt": next_date
                }
            except ValueError:
                pass  # Invalid date format, ignore filter
        
        # Filter by status
        if status_filter == 'pending':
            query["status"] = "Pending"
        elif status_filter == 'active':
            query["status"] = "Active"
        elif status_filter == 'disabled':
            query["status"] = "Disabled"
        elif status_filter == 'all':
            # No status filter - get all users
            pass
        
        # Get users
        users_list = list(users.find(query).sort("created_at", -1))
        
        # Convert ObjectId and datetime fields
        for user in users_list:
            if '_id' in user:
                user['_id'] = str(user['_id'])
            if 'created_at' in user and user['created_at'] is not None:
                user['created_at'] = user['created_at'].isoformat()
            if 'activated_at' in user and user['activated_at'] is not None:
                user['activated_at'] = user['activated_at'].isoformat()
            if 'disabled_at' in user and user['disabled_at'] is not None:
                user['disabled_at'] = user['disabled_at'].isoformat()
        
        return jsonify({
            "success": True,
            "registrations": users_list
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/hr/available-tracks', methods=['GET'])
@jwt_required()
def hr_get_available_tracks():
    """Get available internship tracks"""
    try:
        # Check if database is available
        if internships is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify HR
        hr_user = admin_users.find_one({"username": current_user, "user_type": "hr"})
        if not hr_user:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Get all internship tracks
        tracks = list(internships.find({}, {"track_name": 1, "description": 1, "_id": 0}))
        
        return jsonify({
            "success": True,
            "tracks": tracks
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/hr/activate-user', methods=['POST'])
@jwt_required()
def hr_activate_user():
    """Enable a disabled user (set status to Active)"""
    try:
        # Check if database is available
        if users is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify HR
        hr_user = admin_users.find_one({"username": current_user, "user_type": "hr"})
        if not hr_user:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({"error": "Missing user_id"}), 400
        
        # Find user
        user = users.find_one({"user_id": user_id})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Only allow enabling users with status "Disabled"
        if user['status'] != "Disabled":
            return jsonify({"error": f"User cannot be enabled from current status: {user['status']}. Only 'Disabled' users can be enabled."}), 400
        
        # Check if user has a valid payment ID (required for activation)
        if not user.get('payment_id'):
            return jsonify({"error": f"User {user_id} cannot be enabled without a valid payment ID. Please ensure payment was completed."}), 400
        
        # Generate new password for the user
        password = generate_password()
        hashed_password = generate_password_hash(password)
        
        # Update user status to Active
        users.update_one(
            {"user_id": user_id},
            {"$set": {
                "status": "Active",
                "activated_at": datetime.utcnow(),
                "activated_by": current_user,
                "password": hashed_password,
                "enabled_at": datetime.utcnow(),
                "enabled_by": current_user
            }}
        )
        
        # Send styled activation email
        email_subject = "VEDARC Internship Account Re-activated"
        email_body = get_activation_email(user, user_id, password)
        try:
            send_email(user['email'], email_subject, email_body)
        except Exception as email_error:
            print(f"Failed to send email to {user['email']}: {str(email_error)}")
        
        return jsonify({
            "success": True,
            "message": f"User {user_id} enabled successfully. New password: {password}",
            "password": password
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/hr/deactivate-user', methods=['POST'])
@jwt_required()
def hr_deactivate_user():
    """Disable an active user (set status to Disabled)"""
    try:
        # Check if database is available
        if users is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify HR
        hr_user = admin_users.find_one({"username": current_user, "user_type": "hr"})
        if not hr_user:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        user_id = data.get('user_id')
        reason = data.get('reason')
        
        if not user_id:
            return jsonify({"error": "Missing user_id"}), 400
        
        if not reason or not reason.strip():
            return jsonify({"error": "Reason is required for account deactivation"}), 400
        
        # Find user
        user = users.find_one({"user_id": user_id})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Only allow disabling users with status "Active"
        if user['status'] != "Active":
            return jsonify({"error": f"User cannot be disabled from current status: {user['status']}. Only 'Active' users can be disabled."}), 400
        
        # Update user status to Disabled
        users.update_one(
            {"user_id": user_id},
            {"$set": {
                "status": "Disabled",
                "disabled_at": datetime.utcnow(),
                "disabled_by": current_user,
                "disable_reason": reason
            }}
        )
        
        # Send styled deactivation email
        email_subject = "VEDARC Internship Account Disabled"
        email_body = get_deactivation_email(user, user_id, reason)
        try:
            send_email(user['email'], email_subject, email_body)
        except Exception as email_error:
            print(f"Failed to send email to {user['email']}: {str(email_error)}")
        
        return jsonify({
            "success": True,
            "message": f"User {user_id} disabled successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/hr/reset-student-password', methods=['POST'])
@jwt_required()
def hr_reset_student_password():
    """Reset student password"""
    try:
        # Check if database is available
        if users is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify HR
        hr_user = admin_users.find_one({"username": current_user, "user_type": "hr"})
        if not hr_user:
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
            {"$set": {
                "password": hashed_password,
                "password_reset_at": datetime.utcnow(),
                "password_reset_by": current_user
            }}
        )
        
        return jsonify({
            "success": True,
            "message": f"Password reset successfully for user {user_id}",
            "new_password": new_password
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/hr/statistics', methods=['GET'])
@jwt_required()
def hr_get_statistics():
    """Get HR dashboard statistics"""
    try:
        # Check if database is available
        if users is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify HR
        hr_user = admin_users.find_one({"username": current_user, "user_type": "hr"})
        if not hr_user:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Calculate statistics
        total_users = users.count_documents({})
        pending_users = users.count_documents({"status": "Pending"})
        active_users = users.count_documents({"status": "Active"})
        disabled_users = users.count_documents({"status": "Disabled"})
        
        # Get track-wise statistics
        track_stats = {}
        tracks = list(internships.find({}, {"track_name": 1}))
        
        for track in tracks:
            track_name = track['track_name']
            track_stats[track_name] = {
                "total": users.count_documents({"track": track_name}),
                "pending": users.count_documents({"track": track_name, "status": "Pending"}),
                "active": users.count_documents({"track": track_name, "status": "Active"}),
                "disabled": users.count_documents({"track": track_name, "status": "Disabled"})
            }
        
        # Get recent activity (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_registrations = users.count_documents({
            "created_at": {"$gte": week_ago}
        })
        recent_activations = users.count_documents({
            "activated_at": {"$gte": week_ago}
        })
        
        # Get today's activations
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_activations = users.count_documents({
            "status": "Active",
            "activated_at": {"$gte": today}
        })
        
        statistics = {
            "pending_registrations": pending_users,
            "activated_accounts": active_users,
            "disabled_accounts": disabled_users,
            "total_registrations": total_users,
            "recent_activations_7_days": recent_activations,
            "today_activations": today_activations,
            "track_breakdown": track_stats
        }
        
        return jsonify({
            "success": True,
            "statistics": statistics
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/hr/debug-user-status', methods=['GET'])
@jwt_required()
def hr_debug_user_status():
    """Debug user status for HR"""
    try:
        # Check if database is available
        if users is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify HR
        hr_user = admin_users.find_one({"username": current_user, "user_type": "hr"})
        if not hr_user:
            return jsonify({"error": "Unauthorized"}), 403
        
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "Missing user_id"}), 400
        
        # Find user
        user = users.find_one({"user_id": user_id})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Return user status information
        return jsonify({
            "success": True,
            "user_status": {
                "user_id": user['user_id'],
                "status": user['status'],
                "track": user.get('track'),
                "created_at": user.get('created_at'),
                "activated_at": user.get('activated_at'),
                "rejected_at": user.get('rejected_at'),
                "payment_id": user.get('payment_id'),
                "rejection_reason": user.get('rejection_reason')
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/hr/fix-inconsistent-users', methods=['POST'])
@jwt_required()
def hr_fix_inconsistent_users():
    """Fix inconsistent user statuses"""
    try:
        # Check if database is available
        if users is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify HR
        hr_user = admin_users.find_one({"username": current_user, "user_type": "hr"})
        if not hr_user:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Find users with inconsistent statuses
        inconsistent_users = list(users.find({
            "$or": [
                {"status": {"$exists": False}},
                {"status": ""},
                {"status": None}
            ]
        }))
        
        fixed_count = 0
        for user in inconsistent_users:
            # Set default status based on other fields
            if user.get('activated_at'):
                new_status = "Active"
            elif user.get('rejected_at'):
                new_status = "Rejected"
            else:
                new_status = "Pending"
            
            users.update_one(
                {"_id": user['_id']},
                {"$set": {"status": new_status}}
            )
            fixed_count += 1
        
        return jsonify({
            "success": True,
            "message": f"Fixed {fixed_count} inconsistent users",
            "fixed_count": fixed_count
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/hr/bulk-enable', methods=['POST'])
@jwt_required()
def hr_bulk_enable():
    """Bulk enable all users who have paid but are not yet active"""
    try:
        # Check if database is available
        if users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        # Find all users with status 'Pending' and a valid payment_id
        pending_paid_users = list(users.find({"status": "Pending", "payment_id": {"$ne": None}}))
        updated_count = 0
        for user in pending_paid_users:
            users.update_one({"_id": user["_id"]}, {"$set": {"status": "Active", "activated_at": datetime.utcnow()}})
            updated_count += 1
        return jsonify({"success": True, "updated": updated_count}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# ADMIN CERTIFICATE APPROVAL ENDPOINTS
# ============================================================================

@app.route('/api/admin/certificate-approval', methods=['POST'])
@jwt_required()
def admin_approve_certificate():
    """Admin approve certificate for a student"""
    try:
        # Check if database is available
        if users is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify admin
        admin = admin_users.find_one({"username": current_user, "user_type": "admin"})
        if not admin:
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
        # Check if database is available
        if users is None or weeks is None:
            return jsonify({"error": "Database connection not available"}), 503
        
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
        # Check if database is available
        if projects is None:
            return jsonify({"error": "Database connection not available"}), 503
        
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
        result = projects.update_one(
            {"_id": ObjectId(template_id), "is_template": True},
            {"$set": update_data}
        )
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
            "upload_link": template['upload_link'],
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
                "upload_link": template['upload_link'],
                "status": "Assigned"
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/login', methods=['POST'])
def manager_login():
    """Manager login endpoint"""
    try:
        # Check if database is available
        if admin_users is None or user_sessions is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({"error": "Missing username or password"}), 400
        
        # Find manager user
        manager_user = admin_users.find_one({"username": username, "user_type": "manager"})
        if not manager_user:
            return jsonify({"error": "Invalid credentials"}), 401
        
        if not check_password_hash(manager_user['password'], password):
            return jsonify({"error": "Invalid credentials"}), 401
        
        # Create access token
        access_token = create_access_token(identity=username)
        
        # Create unique session ID for this browser instance
        session_id = create_session_id()
        
        # Store session in database
        store_user_session(username, 'manager', session_id, access_token)
        
        # Clean up expired sessions
        cleanup_expired_sessions()
        
        return jsonify({
            "access_token": access_token,
            "session_id": session_id,
            "user": {
                "username": manager_user['username'],
                "fullName": manager_user['fullName'],
                "user_type": manager_user['user_type']
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/internships', methods=['GET'])
@jwt_required()
def manager_get_internships():
    """Get internships managed by this manager"""
    try:
        # Check if database is available
        if internships is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify manager
        manager = admin_users.find_one({"username": current_user, "user_type": "manager"})
        if not manager:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Get all internships (managers can see all internships)
        internship_list = list(internships.find({}))
        
        # Convert ObjectId fields
        for internship in internship_list:
            if '_id' in internship:
                internship['_id'] = str(internship['_id'])
        
        return jsonify({
            "success": True,
            "internships": internship_list
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/internships', methods=['POST'])
@jwt_required()
def manager_create_internship():
    """Create new internship"""
    try:
        # Check if database is available
        if internships is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify manager
        manager = admin_users.find_one({"username": current_user, "user_type": "manager"})
        if not manager:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        track_name = data.get('track_name')
        description = data.get('description')
        duration = data.get('duration')
        
        if not track_name or not description:
            return jsonify({"error": "Missing required fields"}), 400
        
        # Check if track already exists
        existing_track = internships.find_one({"track_name": track_name})
        if existing_track:
            return jsonify({"error": "Track already exists"}), 400
        
        # Create internship
        internship_data = {
            "track_name": track_name,
            "description": description,
            "duration": duration,
            "created_by": current_user,
            "created_at": datetime.utcnow(),
            "is_active": True
        }
        
        result = internships.insert_one(internship_data)
        
        return jsonify({
            "success": True,
            "message": "Internship created successfully",
            "internship_id": str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/internships/<internship_id>', methods=['PUT'])
@jwt_required()
def manager_update_internship(internship_id):
    """Update internship"""
    try:
        # Check if database is available
        if internships is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify manager
        manager = admin_users.find_one({"username": current_user, "user_type": "manager"})
        if not manager:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        
        # Update internship
        update_data = {}
        if 'track_name' in data:
            update_data['track_name'] = data['track_name']
        if 'description' in data:
            update_data['description'] = data['description']
        if 'duration' in data:
            update_data['duration'] = data['duration']
        if 'is_active' in data:
            update_data['is_active'] = data['is_active']
        
        update_data['updated_by'] = current_user
        update_data['updated_at'] = datetime.utcnow()
        
        result = internships.update_one(
            {"_id": ObjectId(internship_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Internship not found"}), 404
        
        return jsonify({
            "success": True,
            "message": "Internship updated successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/internships/<internship_id>', methods=['DELETE'])
@jwt_required()
def manager_delete_internship(internship_id):
    """Delete internship"""
    try:
        # Check if database is available
        if internships is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify manager
        manager = admin_users.find_one({"username": current_user, "user_type": "manager"})
        if not manager:
            return jsonify({"error": "Unauthorized"}), 403
        
        result = internships.delete_one({"_id": ObjectId(internship_id)})
        
        if result.deleted_count == 0:
            return jsonify({"error": "Internship not found"}), 404
        
        return jsonify({
            "success": True,
            "message": "Internship deleted successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/announcements', methods=['GET'])
@jwt_required()
def manager_get_announcements():
    """Get announcements"""
    try:
        # Check if database is available
        if announcements is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify manager
        manager = admin_users.find_one({"username": current_user, "user_type": "manager"})
        if not manager:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Get all announcements
        announcement_list = list(announcements.find({}).sort("created_at", -1))
        
        # Convert ObjectId and datetime fields
        for announcement in announcement_list:
            if '_id' in announcement:
                announcement['_id'] = str(announcement['_id'])
            if 'created_at' in announcement and announcement['created_at'] is not None:
                announcement['created_at'] = announcement['created_at'].isoformat()
            if 'updated_at' in announcement and announcement['updated_at'] is not None:
                announcement['updated_at'] = announcement['updated_at'].isoformat()
        
        return jsonify({
            "success": True,
            "announcements": announcement_list
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/announcements', methods=['POST'])
@jwt_required()
def manager_create_announcement():
    """Create announcement"""
    try:
        # Check if database is available
        if announcements is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify manager
        manager = admin_users.find_one({"username": current_user, "user_type": "manager"})
        if not manager:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        title = data.get('title')
        content = data.get('content')
        
        if not title or not content:
            return jsonify({"error": "Missing title or content"}), 400
        
        # Create announcement
        announcement_data = {
            "title": title,
            "content": content,
            "created_by": current_user,
            "created_at": datetime.utcnow(),
            "is_active": True
        }
        
        result = announcements.insert_one(announcement_data)
        
        return jsonify({
            "success": True,
            "message": "Announcement created successfully",
            "announcement_id": str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/announcements/<announcement_id>', methods=['PUT'])
@jwt_required()
def manager_update_announcement(announcement_id):
    """Update announcement"""
    try:
        # Check if database is available
        if announcements is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify manager
        manager = admin_users.find_one({"username": current_user, "user_type": "manager"})
        if not manager:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        
        # Update announcement
        update_data = {}
        if 'title' in data:
            update_data['title'] = data['title']
        if 'content' in data:
            update_data['content'] = data['content']
        if 'is_active' in data:
            update_data['is_active'] = data['is_active']
        
        update_data['updated_by'] = current_user
        update_data['updated_at'] = datetime.utcnow()
        
        result = announcements.update_one(
            {"_id": ObjectId(announcement_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Announcement not found"}), 404
        
        return jsonify({
            "success": True,
            "message": "Announcement updated successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/announcements/<announcement_id>', methods=['DELETE'])
@jwt_required()
def manager_delete_announcement(announcement_id):
    """Delete announcement"""
    try:
        # Check if database is available
        if announcements is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify manager
        manager = admin_users.find_one({"username": current_user, "user_type": "manager"})
        if not manager:
            return jsonify({"error": "Unauthorized"}), 403
        
        result = announcements.delete_one({"_id": ObjectId(announcement_id)})
        
        if result.deleted_count == 0:
            return jsonify({"error": "Announcement not found"}), 404
        
        return jsonify({
            "success": True,
            "message": "Announcement deleted successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/internships/<internship_id>/weeks', methods=['GET'])
@jwt_required()
def manager_get_weeks(internship_id):
    """Get weeks for an internship"""
    try:
        # Check if database is available
        if weeks is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify manager
        manager = admin_users.find_one({"username": current_user, "user_type": "manager"})
        if not manager:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Get internship to find track
        internship = internships.find_one({"_id": ObjectId(internship_id)})
        if not internship:
            return jsonify({"error": "Internship not found"}), 404
        
        # Get weeks for this track
        week_list = list(weeks.find({"track": internship['track_name']}).sort("week_number", 1))
        
        # Convert ObjectId fields
        for week in week_list:
            if '_id' in week:
                week['_id'] = str(week['_id'])
        
        return jsonify({
            "success": True,
            "weeks": week_list
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/internships/<internship_id>/weeks', methods=['POST'])
@jwt_required()
def manager_add_week(internship_id):
    """Add week to internship"""
    try:
        # Check if database is available
        if weeks is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify manager
        manager = admin_users.find_one({"username": current_user, "user_type": "manager"})
        if not manager:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Get internship to find track
        internship = internships.find_one({"_id": ObjectId(internship_id)})
        if not internship:
            return jsonify({"error": "Internship not found"}), 404
        
        data = request.json
        week_number = data.get('week_number')
        title = data.get('title')
        description = data.get('description')
        daily_content = data.get('daily_content', [])
        
        if not week_number or not title:
            return jsonify({"error": "Missing week_number or title"}), 400
        
        # Check if week already exists
        existing_week = weeks.find_one({
            "track": internship['track_name'],
            "week_number": week_number
        })
        if existing_week:
            return jsonify({"error": f"Week {week_number} already exists for this track"}), 400
        
        # Create week
        week_data = {
            "track": internship['track_name'],
            "week_number": week_number,
            "title": title,
            "description": description,
            "daily_content": daily_content,
            "created_by": current_user,
            "created_at": datetime.utcnow()
        }
        
        result = weeks.insert_one(week_data)
        
        return jsonify({
            "success": True,
            "message": f"Week {week_number} added successfully",
            "week_id": str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/internships/<internship_id>/weeks/<week_id>', methods=['PUT'])
@jwt_required()
def manager_update_week(internship_id, week_id):
    """Update week"""
    try:
        # Check if database is available
        if weeks is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify manager
        manager = admin_users.find_one({"username": current_user, "user_type": "manager"})
        if not manager:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        
        # Update week
        update_data = {}
        if 'title' in data:
            update_data['title'] = data['title']
        if 'description' in data:
            update_data['description'] = data['description']
        if 'daily_content' in data:
            update_data['daily_content'] = data['daily_content']
        
        update_data['updated_by'] = current_user
        update_data['updated_at'] = datetime.utcnow()
        
        result = weeks.update_one(
            {"_id": ObjectId(week_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Week not found"}), 404
        
        return jsonify({
            "success": True,
            "message": "Week updated successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/internships/<internship_id>/weeks/<week_id>', methods=['DELETE'])
@jwt_required()
def manager_delete_week(internship_id, week_id):
    """Delete week"""
    try:
        # Check if database is available
        if weeks is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify manager
        manager = admin_users.find_one({"username": current_user, "user_type": "manager"})
        if not manager:
            return jsonify({"error": "Unauthorized"}), 403
        
        result = weeks.delete_one({"_id": ObjectId(week_id)})
        
        if result.deleted_count == 0:
            return jsonify({"error": "Week not found"}), 404
        
        return jsonify({
            "success": True,
            "message": "Week deleted successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/internships/<internship_id>/students', methods=['GET'])
@jwt_required()
def manager_get_students(internship_id):
    """Get students for an internship"""
    try:
        # Check if database is available
        if users is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify manager
        manager = admin_users.find_one({"username": current_user, "user_type": "manager"})
        if not manager:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Get internship to find track
        internship = internships.find_one({"_id": ObjectId(internship_id)})
        if not internship:
            return jsonify({"error": "Internship not found"}), 404
        
        # Get students for this track
        students = list(users.find({"track": internship['track_name']}))
        
        # Convert ObjectId and datetime fields
        for student in students:
            if '_id' in student:
                student['_id'] = str(student['_id'])
            if 'created_at' in student and student['created_at'] is not None:
                student['created_at'] = student['created_at'].isoformat()
            if 'activated_at' in student and student['activated_at'] is not None:
                student['activated_at'] = student['activated_at'].isoformat()
        
        return jsonify({
            "success": True,
            "students": students
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/internships/<internship_id>/submissions', methods=['GET'])
@jwt_required()
def manager_get_submissions(internship_id):
    """Get submissions for an internship"""
    try:
        # Check if database is available
        if submissions is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify manager
        manager = admin_users.find_one({"username": current_user, "user_type": "manager"})
        if not manager:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Get internship to find track
        internship = internships.find_one({"_id": ObjectId(internship_id)})
        if not internship:
            return jsonify({"error": "Internship not found"}), 404
        
        # Get query parameters
        week_filter = request.args.get('week', '')
        status_filter = request.args.get('status', '')
        
        # Build query
        query = {"track": internship['track_name']}
        if week_filter:
            query["week"] = int(week_filter)
        if status_filter:
            query["status"] = status_filter
        
        # Get submissions
        submission_list = list(submissions.find(query).sort("submitted_at", -1))
        
        # Convert ObjectId and datetime fields
        for submission in submission_list:
            if '_id' in submission:
                submission['_id'] = str(submission['_id'])
            if 'submitted_at' in submission and submission['submitted_at'] is not None:
                submission['submitted_at'] = submission['submitted_at'].isoformat()
            if 'reviewed_at' in submission and submission['reviewed_at'] is not None:
                submission['reviewed_at'] = submission['reviewed_at'].isoformat()
        
        return jsonify({
            "success": True,
            "submissions": submission_list
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/submissions/<submission_id>/review', methods=['POST'])
@jwt_required()
def manager_review_submission(submission_id):
    """Review submission"""
    try:
        # Check if database is available
        if submissions is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify manager
        manager = admin_users.find_one({"username": current_user, "user_type": "manager"})
        if not manager:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        status = data.get('status')  # 'approved', 'rejected', 'needs_revision'
        feedback = data.get('feedback', '')
        score = data.get('score')
        
        if not status:
            return jsonify({"error": "Missing status"}), 400
        
        if status not in ['approved', 'rejected', 'needs_revision']:
            return jsonify({"error": "Invalid status"}), 400
        
        # Update submission
        update_data = {
            "status": status,
            "feedback": feedback,
            "reviewed_by": current_user,
            "reviewed_at": datetime.utcnow()
        }
        
        if score is not None:
            update_data["score"] = score
        
        result = submissions.update_one(
            {"_id": ObjectId(submission_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Submission not found"}), 404
        
        return jsonify({
            "success": True,
            "message": "Submission reviewed successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/certificates/unlock', methods=['POST'])
@jwt_required()
def manager_unlock_certificate():
    """Unlock certificate for student"""
    try:
        # Check if database is available
        if users is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
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
        
        # Find user
        user = users.find_one({"user_id": user_id})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
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
        
        return jsonify({
            "success": True,
            "message": f"{certificate_type.title()} certificate unlocked successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/certificates/generate', methods=['POST'])
@jwt_required()
def manager_generate_certificate():
    """Generate certificate for student"""
    try:
        # Check if database is available
        if users is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
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
        
        # Generate certificate (this would call the certificate generation function)
        # For now, just return success
        return jsonify({
            "success": True,
            "message": f"{certificate_type.title()} certificate generated successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/recalculate-completion', methods=['POST'])
@jwt_required()
def manager_recalculate_completion():
    """Recalculate completion percentages for all students"""
    try:
        # Check if database is available
        if users is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify manager
        manager = admin_users.find_one({"username": current_user, "user_type": "manager"})
        if not manager:
            return jsonify({"error": "Unauthorized"}), 403
        
        # This would call the recalculate_completion_percentages function
        # For now, just return success
        return jsonify({
            "success": True,
            "message": "Completion percentages recalculated successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/students/<internship_id>', methods=['GET'])
@jwt_required()
def manager_get_students_with_certificates(internship_id):
    """Get students with certificate unlock status"""
    try:
        # Check if database is available
        if users is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
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

@app.route('/api/manager/certificates/bulk-unlock', methods=['POST'])
@jwt_required()
def manager_bulk_unlock_certificates():
    """Bulk unlock certificates for multiple students"""
    try:
        # Check if database is available
        if users is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
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
                    results["failed"].append({
                        "user_id": user_id,
                        "error": "User not found"
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

# ============================================================================
# ADMIN API ENDPOINTS
# ============================================================================

@app.route('/api/admin/users', methods=['GET'])
@jwt_required()
def admin_get_users():
    """Get all users for admin"""
    try:
        # Check if database is available
        if users is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify admin
        admin_user = admin_users.find_one({"username": current_user, "user_type": "admin"})
        if not admin_user:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Get query parameters
        track_filter = request.args.get('track', '')
        status_filter = request.args.get('status', '')
        
        # Build query
        query = {}
        if track_filter:
            query["track"] = track_filter
        if status_filter:
            query["status"] = status_filter
        
        # Get users
        user_list = list(users.find(query).sort("created_at", -1))
        
        # Convert ObjectId and datetime fields
        for user in user_list:
            if '_id' in user:
                user['_id'] = str(user['_id'])
            if 'created_at' in user and user['created_at'] is not None:
                user['created_at'] = user['created_at'].isoformat()
            if 'activated_at' in user and user['activated_at'] is not None:
                user['activated_at'] = user['activated_at'].isoformat()
        
        return jsonify({
            "success": True,
            "users": user_list
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/internships', methods=['GET'])
@jwt_required()
def admin_get_internships():
    """Get all internships for admin"""
    try:
        # Check if database is available
        if internships is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify admin
        admin_user = admin_users.find_one({"username": current_user, "user_type": "admin"})
        if not admin_user:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Get all internships
        internship_list = list(internships.find({}))
        
        # Convert ObjectId fields
        for internship in internship_list:
            if '_id' in internship:
                internship['_id'] = str(internship['_id'])
        
        return jsonify({
            "success": True,
            "internships": internship_list
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/internships', methods=['POST'])
@jwt_required()
def admin_create_internship():
    """Create new internship for admin"""
    try:
        # Check if database is available
        if internships is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify admin
        admin_user = admin_users.find_one({"username": current_user, "user_type": "admin"})
        if not admin_user:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        
        # Validate required fields
        required_fields = ['track_name', 'description', 'duration', 'requirements']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Create internship
        internship_data = {
            "track_name": data['track_name'],
            "description": data['description'],
            "duration": data['duration'],
            "requirements": data['requirements'],
            "created_by": current_user,
            "created_at": datetime.utcnow()
        }
        
        result = internships.insert_one(internship_data)
        
        return jsonify({
            "success": True,
            "message": "Internship created successfully",
            "internship_id": str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/submissions', methods=['GET'])
@jwt_required()
def admin_get_submissions():
    """Get all submissions for admin"""
    try:
        # Check if database is available
        if submissions is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify admin
        admin_user = admin_users.find_one({"username": current_user, "user_type": "admin"})
        if not admin_user:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Get query parameters
        track_filter = request.args.get('track', '')
        status_filter = request.args.get('status', '')
        week_filter = request.args.get('week', '')
        
        # Build query
        query = {}
        if track_filter:
            query["track"] = track_filter
        if status_filter:
            query["status"] = status_filter
        if week_filter:
            query["week_number"] = int(week_filter)
        
        # Get submissions
        submission_list = list(submissions.find(query).sort("submitted_at", -1))
        
        # Convert ObjectId and datetime fields
        for submission in submission_list:
            if '_id' in submission:
                submission['_id'] = str(submission['_id'])
            if 'submitted_at' in submission and submission['submitted_at'] is not None:
                submission['submitted_at'] = submission['submitted_at'].isoformat()
            if 'reviewed_at' in submission and submission['reviewed_at'] is not None:
                submission['reviewed_at'] = submission['reviewed_at'].isoformat()
        
        return jsonify({
            "success": True,
            "submissions": submission_list
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/submissions/<submission_id>', methods=['PUT'])
@jwt_required()
def admin_update_submission(submission_id):
    """Update submission status for admin"""
    try:
        # Check if database is available
        if submissions is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify admin
        admin_user = admin_users.find_one({"username": current_user, "user_type": "admin"})
        if not admin_user:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        status = data.get('status')
        
        if not status:
            return jsonify({"error": "Missing status"}), 400
        
        # Update submission
        result = submissions.update_one(
            {"_id": ObjectId(submission_id)},
            {"$set": {
                "status": status,
                "reviewed_by": current_user,
                "reviewed_at": datetime.utcnow()
            }}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Submission not found"}), 404
        
        return jsonify({
            "success": True,
            "message": "Submission updated successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/reset-user-password', methods=['POST'])
@jwt_required()
def admin_reset_user_password():
    """Reset any user's password (Admin)"""
    try:
        # Check if database is available
        if users is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify admin
        admin_user = admin_users.find_one({"username": current_user, "user_type": "admin"})
        if not admin_user:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        user_id = data.get('user_id')
        user_type = data.get('user_type')
        
        if not user_id or not user_type:
            return jsonify({"error": "Missing user_id or user_type"}), 400
        
        # Generate new password
        new_password = generate_password()
        hashed_password = generate_password_hash(new_password)
        
        # Update user password based on type
        if user_type == 'student':
            result = users.update_one(
                {"user_id": user_id},
                {"$set": {
                    "password": hashed_password,
                    "password_reset_at": datetime.utcnow(),
                    "password_reset_by": current_user
                }}
            )
        else:
            result = admin_users.update_one(
                {"username": user_id},
                {"$set": {
                    "password": hashed_password,
                    "password_reset_at": datetime.utcnow(),
                    "password_reset_by": current_user
                }}
            )
        
        if result.matched_count == 0:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "success": True,
            "message": f"Password reset successfully for {user_id}",
            "new_password": new_password
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/create-user', methods=['POST'])
@jwt_required()
def admin_create_user():
    """Create new user account (Admin)"""
    try:
        # Check if database is available
        if users is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify admin
        admin_user = admin_users.find_one({"username": current_user, "user_type": "admin"})
        if not admin_user:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        
        # Validate required fields
        required_fields = ['username', 'password', 'user_type', 'fullName']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Generate password hash
        hashed_password = generate_password_hash(data['password'])
        
        # Create user based on type
        if data['user_type'] == 'student':
            # For students, we need additional fields
            if not data.get('email') or not data.get('track'):
                return jsonify({"error": "Students require email and track"}), 400
            
            user_data = {
                "user_id": data['username'],
                "fullName": data['fullName'],
                "email": data['email'],
                "track": data['track'],
                "password": hashed_password,
                "status": "Active",
                "created_at": datetime.utcnow(),
                "activated_at": datetime.utcnow(),
                "activated_by": current_user
            }
            
            # Check if user already exists
            if users.find_one({"user_id": data['username']}):
                return jsonify({"error": "Student with this user ID already exists"}), 400
            
            result = users.insert_one(user_data)
        else:
            # For admin users
            user_data = {
                "username": data['username'],
                "password": hashed_password,
                "fullName": data['fullName'],
                "user_type": data['user_type'],
                "created_by": current_user,
                "created_at": datetime.utcnow()
            }
            
            # Check if user already exists
            if admin_users.find_one({"username": data['username']}):
                return jsonify({"error": "User with this username already exists"}), 400
            
            result = admin_users.insert_one(user_data)
        
        return jsonify({
            "success": True,
            "message": f"{data['user_type']} user created successfully",
            "user_id": str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/user-types', methods=['GET'])
@jwt_required()
def admin_get_user_types():
    """Get all user types for dropdown"""
    try:
        # Check if database is available
        if admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify admin
        admin_user = admin_users.find_one({"username": current_user, "user_type": "admin"})
        if not admin_user:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Return available user types
        user_types = [
            {"value": "student", "label": "Student"},
            {"value": "hr", "label": "HR"},
            {"value": "manager", "label": "Manager"},
            {"value": "admin", "label": "Admin"}
        ]
        
        return jsonify({
            "success": True,
            "user_types": user_types
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/generate-certificate', methods=['POST'])
@jwt_required()
def admin_generate_certificate():
    """Generate certificate for admin"""
    try:
        # Check if database is available
        if users is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify admin
        admin_user = admin_users.find_one({"username": current_user, "user_type": "admin"})
        if not admin_user:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        user_id = data.get('user_id')
        certificate_type = data.get('certificate_type')
        
        if not user_id or not certificate_type:
            return jsonify({"error": "Missing user_id or certificate_type"}), 400
        
        # Find user
        user = users.find_one({"user_id": user_id})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Generate certificate (placeholder - would implement actual certificate generation)
        return jsonify({
            "success": True,
            "message": f"{certificate_type} certificate generated successfully for {user_id}"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/release-certificate', methods=['POST'])
@jwt_required()
def admin_release_certificate():
    """Release certificate for student"""
    try:
        # Check if database is available
        if users is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify admin
        admin_user = admin_users.find_one({"username": current_user, "user_type": "admin"})
        if not admin_user:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        student_id = data.get('student_id')
        certificate_type = data.get('certificate_type')
        
        if not student_id or not certificate_type:
            return jsonify({"error": "Missing student_id or certificate_type"}), 400
        
        # Find user
        user = users.find_one({"user_id": student_id})
        if not user:
            return jsonify({"error": "Student not found"}), 404
        
        # Update certificate status
        update_data = {}
        if certificate_type == 'completion':
            update_data.update({
                "certificate_unlocked": True,
                "certificate_unlocked_by": current_user,
                "certificate_unlocked_at": datetime.utcnow()
            })
        elif certificate_type == 'lor':
            update_data.update({
                "lor_unlocked": True,
                "lor_unlocked_by": current_user,
                "lor_unlocked_at": datetime.utcnow()
            })
        
        users.update_one(
            {"user_id": student_id},
            {"$set": update_data}
        )
        
        return jsonify({
            "success": True,
            "message": f"{certificate_type} certificate released for {student_id}"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/certificate-approval/bulk', methods=['POST'])
@jwt_required()
def admin_bulk_approve_certificates():
    """Bulk approve certificates for admin"""
    try:
        # Check if database is available
        if users is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify admin
        admin_user = admin_users.find_one({"username": current_user, "user_type": "admin"})
        if not admin_user:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        user_ids = data.get('user_ids', [])
        certificate_type = data.get('certificate_type')
        
        if not user_ids or not certificate_type:
            return jsonify({"error": "Missing user_ids or certificate_type"}), 400
        
        results = {
            "successful": [],
            "failed": []
        }
        
        for user_id in user_ids:
            try:
                # Find user
                user = users.find_one({"user_id": user_id})
                if not user:
                    results["failed"].append({
                        "user_id": user_id,
                        "error": "User not found"
                    })
                    continue
                
                # Update certificate approval status
                update_data = {}
                if certificate_type == 'completion':
                    update_data.update({
                        "admin_certificate_approval": True,
                        "admin_certificate_approval_by": current_user,
                        "admin_certificate_approval_at": datetime.utcnow()
                    })
                elif certificate_type == 'lor':
                    update_data.update({
                        "admin_lor_approval": True,
                        "admin_lor_approval_by": current_user,
                        "admin_lor_approval_at": datetime.utcnow()
                    })
                
                users.update_one(
                    {"user_id": user_id},
                    {"$set": update_data}
                )
                
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
            "message": f"Bulk approval completed. {len(results['successful'])} successful, {len(results['failed'])} failed."
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/certificate-template', methods=['POST'])
@jwt_required()
def admin_set_certificate_template():
    """Save certificate template for admin"""
    try:
        # Check if database is available
        if certificate_templates is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify admin
        admin_user = admin_users.find_one({"username": current_user, "user_type": "admin"})
        if not admin_user:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        template_type = data.get('type')
        template = data.get('template')
        
        if not template_type or not template:
            return jsonify({"error": "Missing type or template"}), 400
        
        # Save or update template
        certificate_templates.update_one(
            {"type": template_type},
            {"$set": {
                "template": template,
                "updated_by": current_user,
                "updated_at": datetime.utcnow()
            }},
            upsert=True
        )
        
        return jsonify({
            "success": True,
            "message": f"Certificate template for {template_type} saved successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/certificate-template', methods=['GET'])
@jwt_required()
def admin_get_certificate_template():
    """Get certificate template by type for admin"""
    try:
        # Check if database is available
        if certificate_templates is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify admin
        admin_user = admin_users.find_one({"username": current_user, "user_type": "admin"})
        if not admin_user:
            return jsonify({"error": "Unauthorized"}), 403
        
        template_type = request.args.get('type')
        if not template_type:
            return jsonify({"error": "Missing type parameter"}), 400
        
        # Get template
        template_doc = certificate_templates.find_one({"type": template_type})
        if not template_doc:
            return jsonify({"error": "Template not found"}), 404
        
        return jsonify({
            "success": True,
            "template": template_doc['template']
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/certificate-template/upload', methods=['POST'])
@jwt_required()
def admin_upload_template_file():
    """Upload template file (PDF or image) for admin"""
    try:
        # Check if database is available
        if admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify admin
        admin_user = admin_users.find_one({"username": current_user, "user_type": "admin"})
        if not admin_user:
            return jsonify({"error": "Unauthorized"}), 403
        
        # This would handle file upload - placeholder implementation
        return jsonify({
            "success": True,
            "message": "Template file uploaded successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manager/students-export/<internship_id>', methods=['GET'])
@jwt_required()
def manager_export_students_csv(internship_id):
    """Get students data for CSV export with internship track information"""
    try:
        # Check if database is available
        if users is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
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
        students = list(users.find({"track": track_name}))
        
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
        
        return jsonify({
            "success": True,
            "students": students,
            "internship_track": track_name,
            "internship_duration": internship.get('duration', ''),
            "internship_description": internship.get('description', '')
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# PAYMENT MANAGEMENT ENDPOINTS
# ============================================================================

@app.route('/api/admin/payments', methods=['GET'])
@jwt_required()
def get_payments():
    """Get all payment records for admin/HR dashboard"""
    try:
        # Check if database is available
        if payments is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        # Get all payment records
        payment_records = list(payments.find({}, {'_id': 0}))
        
        # Format the data for frontend
        formatted_payments = []
        for payment in payment_records:
            formatted_payment = {
                'order_id': payment.get('order_id'),
                'payment_id': payment.get('payment_id'),
                'user_id': payment.get('user_id'),
                'amount': payment.get('amount'),
                'currency': payment.get('currency'),
                'status': payment.get('status'),
                'verified': payment.get('verified', False),
                'created_at': payment.get('created_at'),
                'verified_at': payment.get('verified_at'),
                'registration_data': payment.get('registration_data', {})
            }
            formatted_payments.append(formatted_payment)
        
        return jsonify({
            "success": True,
            "payments": formatted_payments
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/hr/users', methods=['GET'])
@jwt_required()
def hr_get_all_users():
    """Get all users for HR dashboard"""
    try:
        if users is None:
            return jsonify({"error": "Database connection not available"}), 503
        user_list = list(users.find({}, {'_id': 0, 'password': 0}))
        return jsonify({"users": user_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 5. HR delete user: permanently delete user account with reason
@app.route('/api/hr/delete-user', methods=['POST'])
@jwt_required()
def hr_delete_user():
    """Permanently delete a user account"""
    try:
        # Check if database is available
        if users is None or admin_users is None:
            return jsonify({"error": "Database connection not available"}), 503
        
        current_user = get_jwt_identity()
        
        # Verify HR
        hr_user = admin_users.find_one({"username": current_user, "user_type": "hr"})
        if not hr_user:
            return jsonify({"error": "Unauthorized"}), 403
        
        data = request.json
        user_id = data.get('user_id')
        reason = data.get('reason')
        
        if not user_id:
            return jsonify({"error": "Missing user_id"}), 400
        
        if not reason or not reason.strip():
            return jsonify({"error": "Reason is required for account deletion"}), 400
        
        # Find user
        user = users.find_one({"user_id": user_id})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Store user data before deletion for email
        user_email = user['email']
        user_name = user['fullName']
        
        # Delete user from database
        users.delete_one({"user_id": user_id})
        
        # Send styled deletion email
        email_subject = "VEDARC Internship Account Deleted"
        email_body = get_deactivation_email({"fullName": user_name, "email": user_email}, user_id, f"Account permanently deleted: {reason}")
        try:
            send_email(user_email, email_subject, email_body)
        except Exception as email_error:
            print(f"Failed to send email to {user_email}: {str(email_error)}")
        
        return jsonify({
            "success": True,
            "message": f"User {user_id} permanently deleted successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_payment_invoice_email(user, user_id, payment_id, order_id, password):
    # Generate invoice number
    invoice_number = f"INV-{datetime.utcnow().strftime('%Y%m%d')}-{payment_id[-6:]}"
    
    return f"""
<html>
  <body style='background: #f8f9fa; margin: 0; padding: 0; font-family: Arial, sans-serif;'>
    <table width='100%' cellpadding='0' cellspacing='0' style='background: #f8f9fa; min-height: 100vh;'>
      <tr>
        <td align='center' style='padding: 40px 0;'>
          <table width='600' cellpadding='0' cellspacing='0' style='background: #ffffff; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;'>
            <!-- Header -->
            <tr>
              <td style='background: linear-gradient(135deg, #4f8cff, #ff00cc); padding: 30px; text-align: center;'>
                <h1 style='margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 1px;'>VEDARC TECHNOLOGIES PRIVATE LIMITED</h1>
                <p style='margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;'>Vedarc Virtual Technical Internship Drive 2025</p>
              </td>
            </tr>
            
            <!-- Invoice Header -->
            <tr>
              <td style='padding: 30px; border-bottom: 1px solid #e9ecef;'>
                <table width='100%' cellpadding='0' cellspacing='0'>
                  <tr>
                    <td style='width: 50%;'>
                      <h2 style='margin: 0 0 20px 0; color: #333; font-size: 24px; font-weight: 600;'>INVOICE</h2>
                      <div style='margin-bottom: 15px;'>
                        <strong style='color: #666; font-size: 14px;'>Invoice Number:</strong><br>
                        <span style='color: #333; font-size: 16px; font-weight: 600;'>{invoice_number}</span>
                      </div>
                      <div style='margin-bottom: 15px;'>
                        <strong style='color: #666; font-size: 14px;'>Date:</strong><br>
                        <span style='color: #333; font-size: 16px;'>{datetime.utcnow().strftime('%B %d, %Y')}</span>
                      </div>
                      <div>
                        <strong style='color: #666; font-size: 14px;'>Payment Status:</strong><br>
                        <span style='color: #28a745; font-size: 16px; font-weight: 600;'>PAID</span>
                      </div>
                    </td>
                    <td style='width: 50%; text-align: right;'>
                      <div style='margin-bottom: 15px;'>
                        <strong style='color: #666; font-size: 14px;'>Bill To:</strong><br>
                        <span style='color: #333; font-size: 16px; font-weight: 600;'>{user['fullName']}</span><br>
                        <span style='color: #666; font-size: 14px;'>{user['email']}</span><br>
                        <span style='color: #666; font-size: 14px;'>{user['collegeName']}</span>
                      </div>
                      <div>
                        <strong style='color: #666; font-size: 14px;'>User ID:</strong><br>
                        <span style='color: #4f8cff; font-size: 16px; font-weight: 600;'>{user_id}</span>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Invoice Details -->
            <tr>
              <td style='padding: 30px;'>
                <table width='100%' cellpadding='0' cellspacing='0' style='border-collapse: collapse;'>
                  <thead>
                    <tr style='background: #f8f9fa;'>
                      <th style='padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6; color: #333; font-size: 14px; font-weight: 600;'>Description</th>
                      <th style='padding: 15px; text-align: center; border-bottom: 2px solid #dee2e6; color: #333; font-size: 14px; font-weight: 600;'>Track</th>
                      <th style='padding: 15px; text-align: right; border-bottom: 2px solid #dee2e6; color: #333; font-size: 14px; font-weight: 600;'>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style='padding: 15px; border-bottom: 1px solid #dee2e6; color: #333; font-size: 16px;'>
                        VEDARC Virtual Technical Internship Program<br>
                        <small style='color: #666;'>Complete internship program with certificate</small>
                      </td>
                      <td style='padding: 15px; text-align: center; border-bottom: 1px solid #dee2e6; color: #333; font-size: 16px;'>
                        {user['track']}
                      </td>
                      <td style='padding: 15px; text-align: right; border-bottom: 1px solid #dee2e6; color: #333; font-size: 16px; font-weight: 600;'>
                        ₹299.00
                      </td>
                    </tr>
                  </tbody>
                </table>
                
                <!-- Total -->
                <table width='100%' cellpadding='0' cellspacing='0' style='margin-top: 20px;'>
                  <tr>
                    <td style='width: 70%;'></td>
                    <td style='width: 30%;'>
                      <table width='100%' cellpadding='0' cellspacing='0' style='border-collapse: collapse;'>
                        <tr>
                          <td style='padding: 10px 0; border-bottom: 1px solid #dee2e6;'>
                            <strong style='color: #333; font-size: 16px;'>Total:</strong>
                          </td>
                          <td style='padding: 10px 0; text-align: right; border-bottom: 1px solid #dee2e6;'>
                            <strong style='color: #333; font-size: 18px;'>₹299.00</strong>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Payment Information -->
            <tr>
              <td style='padding: 0 30px 30px 30px;'>
                <div style='background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;'>
                  <h3 style='margin: 0 0 15px 0; color: #333; font-size: 18px; font-weight: 600;'>Payment Information</h3>
                  <table width='100%' cellpadding='0' cellspacing='0'>
                    <tr>
                      <td style='width: 50%;'>
                        <div style='margin-bottom: 10px;'>
                          <strong style='color: #666; font-size: 14px;'>Payment ID:</strong><br>
                          <span style='color: #333; font-size: 14px;'>{payment_id}</span>
                        </div>
                        <div>
                          <strong style='color: #666; font-size: 14px;'>Order ID:</strong><br>
                          <span style='color: #333; font-size: 14px;'>{order_id}</span>
                        </div>
                      </td>
                      <td style='width: 50%;'>
                        <div style='margin-bottom: 10px;'>
                          <strong style='color: #666; font-size: 14px;'>Payment Method:</strong><br>
                          <span style='color: #333; font-size: 14px;'>Razorpay Online Payment</span>
                        </div>
                        <div>
                          <strong style='color: #666; font-size: 14px;'>Payment Date:</strong><br>
                          <span style='color: #333; font-size: 14px;'>{datetime.utcnow().strftime('%B %d, %Y at %I:%M %p')}</span>
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
            
            <!-- Account Credentials -->
            <tr>
              <td style='padding: 0 30px 30px 30px;'>
                <div style='background: linear-gradient(135deg, #4f8cff, #ff00cc); border-radius: 8px; padding: 20px; margin-bottom: 20px;'>
                  <h3 style='margin: 0 0 15px 0; color: #ffffff; font-size: 18px; font-weight: 600;'>Your Account Credentials</h3>
                  <table width='100%' cellpadding='0' cellspacing='0'>
                    <tr>
                      <td style='width: 50%;'>
                        <div style='margin-bottom: 10px;'>
                          <strong style='color: #ffffff; font-size: 14px;'>User ID:</strong><br>
                          <span style='color: #ffffff; font-size: 16px; font-weight: 600;'>{user_id}</span>
                        </div>
                      </td>
                      <td style='width: 50%;'>
                        <div style='margin-bottom: 10px;'>
                          <strong style='color: #ffffff; font-size: 14px;'>Password:</strong><br>
                          <span style='color: #ffffff; font-size: 16px; font-weight: 600;'>{password}</span>
                        </div>
                      </td>
                    </tr>
                  </table>
                  <p style='margin: 15px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;'>
                    <strong>Important:</strong> Please keep your credentials safe and do not share them with anyone.
                  </p>
                </div>
              </td>
            </tr>
            
            <!-- Action Button -->
            <tr>
              <td style='padding: 0 30px 30px 30px; text-align: center;'>
                <a href='https://www.vedarc.co.in/unified-login' style='display: inline-block; background: linear-gradient(135deg, #4f8cff, #ff00cc); color: #ffffff; text-decoration: none; font-weight: 700; padding: 15px 40px; border-radius: 50px; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(79, 140, 255, 0.3);'>
                  Login to Your Dashboard
                </a>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style='background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;'>
                <p style='margin: 0 0 10px 0; color: #666; font-size: 14px;'>
                  <strong>VEDARC TECHNOLOGIES PRIVATE LIMITED</strong><br>
                  Virtual Technical Internship Program
                </p>
                <p style='margin: 0 0 15px 0; color: #999; font-size: 12px;'>
                  This is an automatically generated invoice. For any queries, please contact our support team.
                </p>
                <div style='margin-top: 15px; padding-top: 15px; border-top: 1px solid #e9ecef;'>
                  <p style='margin: 0 0 8px 0; color: #666; font-size: 13px;'>
                    <strong>Follow us on social media:</strong>
                  </p>
                  <a href='https://www.instagram.com/vedarc.tech?igsh=bmYxcTZuZndncHB1&utm_source=qr' style='display: inline-block; background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;'>
                    📸 @vedarc.tech
                  </a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
"""

# --- Ensure get_deactivation_email is defined before any endpoint uses it ---
def get_deactivation_email(user, user_id, reason):
    return f"""
    <html>
      <body style='background: #18192a; margin: 0; padding: 0;'>
        <table width='100%' cellpadding='0' cellspacing='0' style='background: #18192a; min-height: 100vh;'>
          <tr>
            <td align='center' style='padding: 40px 0;'>
              <table width='480' cellpadding='0' cellspacing='0' style='background: #23244a; border-radius: 14px; box-shadow: 0 4px 32px rgba(80,0,255,0.10); padding: 36px 32px 28px 32px; font-family: Segoe UI, Arial, sans-serif;'>
                <tr>
                  <td align='center' style='padding-bottom: 8px;'>
                    <h1 style='margin: 0; color: #ff4f4f; font-size: 22px; font-weight: 800; letter-spacing: 1px; text-shadow: 0 0 8px #ff4f4f99;'>VEDARC TECHNOLOGIES PRIVATE LIMITED</h1>
                    <div style='color: #ff00cc; font-size: 16px; font-weight: 600; margin-top: 2px; margin-bottom: 18px; letter-spacing: 0.5px; text-shadow: 0 0 6px #ff00cc55;'>
                      Vedarc Virtual Technical Internship Drive 2025
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style='color: #e0e6f8; font-size: 16px; padding-bottom: 16px;'>
                    <p style='margin: 0 0 12px 0;'>Dear <b>{user['fullName']}</b>,</p>
                    <p style='margin: 0 0 12px 0; color: #ff4f4f;'>We regret to inform you that your VEDARC internship account (User ID: <b>{user_id}</b>) has been <b>deactivated</b>.</p>
                    <div style='background: #1a1b2e; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #ff4f4f33;'>
                      <div><b>Reason:</b> <span style='color: #ff4f4f;'>{reason or 'No reason provided.'}</span></div>
                    </div>
                    <p style='margin: 0 0 16px 0;'>If you believe this was a mistake, please contact our support team.</p>
                    <p style='margin: 0; color: #e0e6f8; font-size: 15px;'>Best regards,<br/>VEDARC Team</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    """

# --- Ensure get_activation_email is defined before any endpoint uses it ---
def get_activation_email(user, user_id, password):
    return f"""
    <html>
      <body style='background: #18192a; margin: 0; padding: 0;'>
        <table width='100%' cellpadding='0' cellspacing='0' style='background: #18192a; min-height: 100vh;'>
          <tr>
            <td align='center' style='padding: 40px 0;'>
              <table width='480' cellpadding='0' cellspacing='0' style='background: #23244a; border-radius: 14px; box-shadow: 0 4px 32px rgba(80,0,255,0.10); padding: 36px 32px 28px 32px; font-family: Segoe UI, Arial, sans-serif;'>
                <tr>
                  <td align='center' style='padding-bottom: 8px;'>
                    <h1 style='margin: 0; color: #4f8cff; font-size: 22px; font-weight: 800; letter-spacing: 1px; text-shadow: 0 0 8px #4f8cff99;'>VEDARC TECHNOLOGIES PRIVATE LIMITED</h1>
                    <div style='color: #ff00cc; font-size: 16px; font-weight: 600; margin-top: 2px; margin-bottom: 18px; letter-spacing: 0.5px; text-shadow: 0 0 6px #ff00cc55;'>
                      Vedarc Virtual Technical Internship Drive 2025
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style='color: #e0e6f8; font-size: 16px; padding-bottom: 16px;'>
                    <p style='margin: 0 0 12px 0;'>Dear <b>{user['fullName']}</b>,</p>
                    <p style='margin: 0 0 12px 0;'>Your VEDARC internship account has been <b style='color:#4f8cff;'>successfully activated!</b></p>
                    <div style='background: #1a1b2e; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #4f8cff33;'>
                      <div style='margin-bottom: 6px;'><b>User ID:</b> <span style='color: #4f8cff;'>{user_id}</span></div>
                      <div><b>Password:</b> <span style='color: #ff00cc;'>{password}</span></div>
                    </div>
                    <p style='margin: 0 0 16px 0;'>
                      You can now log in to your student dashboard using the button below:
                    </p>
                    <div style='text-align: center; margin-bottom: 16px;'>
                      <a href='https://www.vedarc.co.in/unified-login' style='display: inline-block; background: linear-gradient(90deg,#4f8cff,#ff00cc); color: #fff; text-decoration: none; font-weight: 700; padding: 12px 32px; border-radius: 6px; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 2px 12px #4f8cff33;'>Login to Dashboard</a>
                    </div>
                    <p style='margin: 0 0 8px 0; color: #b3b8e0; font-size: 14px;'>
                      <i>Please keep your credentials safe and do not share them with anyone.</i>
                    </p>
                    <p style='margin: 0; color: #e0e6f8; font-size: 15px;'>Best regards,<br/>VEDARC Team</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    """

# --- INTERNSHIP APPLICATION ENDPOINTS ---

# Create internship_applications collection
if db is not None:
    internship_applications = db['internship_applications']

def generate_otp():
    """Generate a 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))

def get_internship_application_email_template(applicant_name, otp):
    """Email template for internship application OTP"""
    return f"""
    <html>
      <body style='background: #18192a; margin: 0; padding: 0;'>
        <table width='100%' cellpadding='0' cellspacing='0' style='background: #18192a; min-height: 100vh;'>
          <tr>
            <td align='center' style='padding: 40px 0;'>
              <table width='480' cellpadding='0' cellspacing='0' style='background: #23244a; border-radius: 14px; box-shadow: 0 4px 32px rgba(80,0,255,0.10); padding: 36px 32px 28px 32px; font-family: Segoe UI, Arial, sans-serif;'>
                <tr>
                  <td align='center' style='padding-bottom: 8px;'>
                    <h1 style='margin: 0; color: #4f8cff; font-size: 22px; font-weight: 800; letter-spacing: 1px; text-shadow: 0 0 8px #4f8cff99;'>VEDARC TECHNOLOGIES PRIVATE LIMITED</h1>
                    <div style='color: #ff00cc; font-size: 16px; font-weight: 600; margin-top: 2px; margin-bottom: 18px; letter-spacing: 0.5px; text-shadow: 0 0 6px #ff00cc55;'>
                      AI Engineer (Part Time Application) Verification
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style='color: #e0e6f8; font-size: 16px; padding-bottom: 16px;'>
                    <p style='margin: 0 0 12px 0;'>Dear <b>{applicant_name}</b>,</p>
                    <p style='margin: 0 0 12px 0;'>Thank you for your interest in our AI Engineer (Part Time Application) Program!</p>
                    <p style='margin: 0 0 16px 0;'>Please use the following verification code to complete your application:</p>
                    <div style='background: #1a1b2e; border-radius: 8px; padding: 20px; margin-bottom: 16px; border: 1px solid #4f8cff33; text-align: center;'>
                      <div style='color: #4f8cff; font-size: 24px; font-weight: 700; letter-spacing: 4px;'>{otp}</div>
                      <div style='color: #b3b8e0; font-size: 14px; margin-top: 8px;'>Enter this code in the application form</div>
                    </div>
                    <p style='margin: 0 0 8px 0; color: #b3b8e0; font-size: 14px;'>
                      <i>This code will expire in 10 minutes for security purposes.</i>
                    </p>
                    <p style='margin: 0; color: #e0e6f8; font-size: 15px;'>Best regards,<br/>VEDARC AI Team</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    """

def get_internship_application_confirmation_email(application_data):
    """Email template for application confirmation"""
    return f"""
    <html>
      <body style='background: #18192a; margin: 0; padding: 0;'>
        <table width='100%' cellpadding='0' cellspacing='0' style='background: #18192a; min-height: 100vh;'>
          <tr>
            <td align='center' style='padding: 40px 0;'>
              <table width='480' cellpadding='0' cellspacing='0' style='background: #23244a; border-radius: 14px; box-shadow: 0 4px 32px rgba(80,0,255,0.10); padding: 36px 32px 28px 32px; font-family: Segoe UI, Arial, sans-serif;'>
                <tr>
                  <td align='center' style='padding-bottom: 8px;'>
                    <h1 style='margin: 0; color: #4f8cff; font-size: 22px; font-weight: 800; letter-spacing: 1px; text-shadow: 0 0 8px #4f8cff99;'>VEDARC TECHNOLOGIES PRIVATE LIMITED</h1>
                    <div style='color: #ff00cc; font-size: 16px; font-weight: 600; margin-top: 2px; margin-bottom: 18px; letter-spacing: 0.5px; text-shadow: 0 0 6px #ff00cc55;'>
                      AI Engineer (Part Time Application) Application Received
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style='color: #e0e6f8; font-size: 16px; padding-bottom: 16px;'>
                    <p style='margin: 0 0 12px 0;'>Dear <b>{application_data['fullName']}</b>,</p>
                    <p style='margin: 0 0 12px 0;'>Thank you for submitting your application for our AI Engineer - Part Time Program!</p>
                    <div style='background: #1a1b2e; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #4f8cff33;'>
                      <div style='margin-bottom: 8px;'><b>Application Details:</b></div>
                      <div style='margin-bottom: 4px;'>• <b>Name:</b> {application_data['fullName']}</div>
                      <div style='margin-bottom: 4px;'>• <b>Email:</b> {application_data['email']}</div>
                      <div style='margin-bottom: 4px;'>• <b>Phone:</b> {application_data['phoneNumber']}</div>
                      <div style='margin-bottom: 4px;'>• <b>Area of Interest:</b> {application_data['areaOfInterest']}</div>
                      <div style='margin-bottom: 4px;'>• <b>LinkedIn:</b> {application_data['linkedinUrl']}</div>
                    </div>
                    <p style='margin: 0 0 16px 0;'>
                      Our team will review your application and get back to you within 3-5 business days.
                    </p>
                    <p style='margin: 0 0 8px 0; color: #b3b8e0; font-size: 14px;'>
                      <i>If you have any questions, please contact us at tech@vedarc.co.in</i>
                    </p>
                    <p style='margin: 0; color: #e0e6f8; font-size: 15px;'>Best regards,<br/>VEDARC AI Team</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    """

def get_internship_application_notification_email(application_data):
    """Email template for HR notification"""
    return f"""
    <html>
      <body style='background: #18192a; margin: 0; padding: 0;'>
        <table width='100%' cellpadding='0' cellspacing='0' style='background: #18192a; min-height: 100vh;'>
          <tr>
            <td align='center' style='padding: 40px 0;'>
              <table width='480' cellpadding='0' cellspacing='0' style='background: #23244a; border-radius: 14px; box-shadow: 0 4px 32px rgba(80,0,255,0.10); padding: 36px 32px 28px 32px; font-family: Segoe UI, Arial, sans-serif;'>
                <tr>
                  <td align='center' style='padding-bottom: 8px;'>
                    <h1 style='margin: 0; color: #4f8cff; font-size: 22px; font-weight: 800; letter-spacing: 1px; text-shadow: 0 0 8px #4f8cff99;'>VEDARC TECHNOLOGIES PRIVATE LIMITED</h1>
                    <div style='color: #ff00cc; font-size: 16px; font-weight: 600; margin-top: 2px; margin-bottom: 18px; letter-spacing: 0.5px; text-shadow: 0 0 6px #ff00cc55;'>
                      New AI Engineer (Part Time Application) Application Received
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style='color: #e0e6f8; font-size: 16px; padding-bottom: 16px;'>
                    <p style='margin: 0 0 12px 0;'>A new AI Engineer (Part Time Application) application has been submitted:</p>
                    <div style='background: #1a1b2e; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #4f8cff33;'>
                      <div style='margin-bottom: 8px;'><b>Applicant Details:</b></div>
                      <div style='margin-bottom: 4px;'>• <b>Name:</b> {application_data['fullName']}</div>
                      <div style='margin-bottom: 4px;'>• <b>Email:</b> {application_data['email']}</div>
                      <div style='margin-bottom: 4px;'>• <b>Phone:</b> {application_data['phoneNumber']}</div>
                      <div style='margin-bottom: 4px;'>• <b>Area of Interest:</b> {application_data['areaOfInterest']}</div>
                      <div style='margin-bottom: 4px;'>• <b>LinkedIn:</b> {application_data['linkedinUrl']}</div>
                      <div style='margin-bottom: 4px;'>• <b>Why Join:</b> {application_data['whyJoin'][:100]}...</div>
                      <div style='margin-bottom: 4px;'>• <b>Portfolio Links:</b> {application_data.get('portfolioLinks', 'Not provided')}</div>
                      <div style='margin-bottom: 4px;'>• <b>Resume:</b> Attached</div>
                    </div>
                    <p style='margin: 0 0 16px 0;'>
                      Please review this application and take appropriate action.
                    </p>
                    <p style='margin: 0; color: #e0e6f8; font-size: 15px;'>Best regards,<br/>VEDARC AI System</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    """

# Store OTPs temporarily (in production, use Redis or similar)
otp_store = {}

@app.route('/api/internship-application/send-otp', methods=['POST'])
def send_internship_application_otp():
    """Send OTP for internship application verification"""
    try:
        if 'email' not in request.form or 'fullName' not in request.form:
            return jsonify({'error': 'Email and full name are required'}), 400
        
        email = request.form['email'].strip()
        full_name = request.form['fullName'].strip()
        
        # Validate email format
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Generate OTP
        otp = generate_otp()
        
        # Store OTP with timestamp (10 minutes expiry)
        otp_store[email] = {
            'otp': otp,
            'timestamp': datetime.now(),
            'full_name': full_name
        }
        
        # Send OTP email
        email_body = get_internship_application_email_template(full_name, otp)
        send_email(email, 'VEDARC AI Engineer (Part Time Application) - Email Verification', email_body)
        
        return jsonify({'message': 'OTP sent successfully'}), 200
        
    except Exception as e:
        print(f"Error sending OTP: {e}")
        return jsonify({'error': 'Failed to send OTP'}), 500

@app.route('/api/internship-application/submit', methods=['POST'])
def submit_internship_application():
    """Submit internship application with OTP verification"""
    try:
        # Check if all required fields are present
        required_fields = ['fullName', 'email', 'phoneNumber', 'linkedinUrl', 'areaOfInterest', 'whyJoin', 'otp']
        for field in required_fields:
            if field not in request.form:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Get form data
        full_name = request.form['fullName'].strip()
        email = request.form['email'].strip()
        phone_number = request.form['phoneNumber'].strip()
        linkedin_url = request.form['linkedinUrl'].strip()
        area_of_interest = request.form['areaOfInterest'].strip()
        why_join = request.form['whyJoin'].strip()
        portfolio_links = request.form.get('portfolioLinks', '').strip()
        ai_experience = request.form.get('aiExperience', '').strip()
        otp = request.form['otp'].strip()
        
        # Validate OTP
        if email not in otp_store:
            return jsonify({'error': 'OTP not found. Please request a new OTP'}), 400
        
        stored_otp_data = otp_store[email]
        if stored_otp_data['otp'] != otp:
            return jsonify({'error': 'Invalid OTP'}), 400
        
        # Check OTP expiry (10 minutes)
        if (datetime.now() - stored_otp_data['timestamp']).total_seconds() > 600:
            del otp_store[email]
            return jsonify({'error': 'OTP has expired. Please request a new OTP'}), 400
        
        # Validate file upload
        if 'resume' not in request.files:
            return jsonify({'error': 'Resume file is required'}), 400
        
        resume_file = request.files['resume']
        if resume_file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file type and size
        if not resume_file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Only PDF files are allowed'}), 400
        
        # Check file size (2MB limit)
        resume_file.seek(0, 2)  # Seek to end
        file_size = resume_file.tell()
        resume_file.seek(0)  # Reset to beginning
        
        if file_size > 2 * 1024 * 1024:  # 2MB
            return jsonify({'error': 'File size must be less than 2MB'}), 400
        
        # Generate unique filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"resume_{email.replace('@', '_').replace('.', '_')}_{timestamp}.pdf"
        
        # Save file (in production, use cloud storage)
        upload_folder = 'uploads/resumes'
        os.makedirs(upload_folder, exist_ok=True)
        file_path = os.path.join(upload_folder, filename)
        resume_file.save(file_path)
        
        # Create application document
        application_data = {
            'fullName': full_name,
            'email': email,
            'phoneNumber': phone_number,
            'linkedinUrl': linkedin_url,
            'areaOfInterest': area_of_interest,
            'whyJoin': why_join,
            'portfolioLinks': portfolio_links,
            'aiExperience': int(ai_experience) if ai_experience.isdigit() else 0,
            'resumeFilename': filename,
            'resumePath': file_path,
            'submittedAt': datetime.now(),
            'status': 'pending'
        }
        
        # Save to database
        result = internship_applications.insert_one(application_data)
        application_id = str(result.inserted_id)
        
        # Send confirmation email to applicant
        confirmation_email = get_internship_application_confirmation_email(application_data)
        send_email(email, 'VEDARC AI Engineer (Part Time Application) - Confirmation', confirmation_email)
        
        # Send notification email to HR
        notification_email = get_internship_application_notification_email(application_data)
        send_email('tech@vedarc.co.in', f'New AI Engineer (Part Time Application) - {full_name}', notification_email, attachment_path=file_path)
        
        # Clean up OTP
        del otp_store[email]
        
        return jsonify({
            'message': 'Application submitted successfully',
            'applicationId': application_id
        }), 200
        
    except Exception as e:
        print(f"Error submitting application: {e}")
        return jsonify({'error': 'Failed to submit application'}), 500

@app.route('/api/hr/internship-applications', methods=['GET'])
@jwt_required()
def hr_get_internship_applications():
    """Get all internship applications for HR dashboard"""
    try:
        current_user = get_jwt_identity()
        if current_user != HR_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Get applications with pagination
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        skip = (page - 1) * limit
        
        # Get total count
        total_count = internship_applications.count_documents({})
        
        # Get applications
        applications = list(internship_applications.find({}).sort('submittedAt', -1).skip(skip).limit(limit))
        
        # Convert ObjectId to string
        for app in applications:
            app['_id'] = str(app['_id'])
            app['submittedAt'] = app['submittedAt'].isoformat()
        
        return jsonify({
            'applications': applications,
            'total': total_count,
            'page': page,
            'limit': limit,
            'pages': (total_count + limit - 1) // limit
        }), 200
        
    except Exception as e:
        print(f"Error getting applications: {e}")
        return jsonify({'error': 'Failed to get applications'}), 500

@app.route('/api/hr/internship-applications/<application_id>/resume', methods=['GET'])
@jwt_required()
def hr_download_resume(application_id):
    """Download resume for HR"""
    try:
        current_user = get_jwt_identity()
        if current_user != HR_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Get application
        application = internship_applications.find_one({'_id': ObjectId(application_id)})
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        
        # Check if file exists
        file_path = application.get('resumePath')
        if not file_path or not os.path.exists(file_path):
            return jsonify({'error': 'Resume file not found'}), 404
        
        # Send file
        return send_file(file_path, as_attachment=True, download_name=application['resumeFilename'])
        
    except Exception as e:
        print(f"Error downloading resume: {e}")
        return jsonify({'error': 'Failed to download resume'}), 500

@app.route('/api/hr/internship-applications/<application_id>', methods=['DELETE'])
@jwt_required()
def hr_delete_application(application_id):
    """Delete internship application and resume file"""
    try:
        current_user = get_jwt_identity()
        if current_user != HR_USERNAME:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Get application
        application = internship_applications.find_one({'_id': ObjectId(application_id)})
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        
        # Delete resume file
        file_path = application.get('resumePath')
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
        
        # Delete from database
        internship_applications.delete_one({'_id': ObjectId(application_id)})
        
        return jsonify({'message': 'Application deleted successfully'}), 200
        
    except Exception as e:
        print(f"Error deleting application: {e}")
        return jsonify({'error': 'Failed to delete application'}), 500

# ============================================================================
# WAITLIST, CONTACT, AND INVESTOR INQUIRY ENDPOINTS
# ============================================================================

@app.route('/api/waitlist/subscribe', methods=['POST'])
def waitlist_subscribe():
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        
        if not name or not email:
            return jsonify({'error': 'Name and email are required'}), 400
        
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Check if already subscribed
        existing = db.waitlist.find_one({'email': email})
        if existing:
            return jsonify({'error': 'Email already subscribed to waitlist'}), 409
        
        # Add to waitlist
        waitlist_entry = {
            'name': name,
            'email': email,
            'subscribed_at': datetime.utcnow(),
            'status': 'active'
        }
        
        db.waitlist.insert_one(waitlist_entry)
        
        # Send notification email to tech@vedarc.co.in
        subject = f"New Waitlist Subscription: {name}"
        body = f"""
        New waitlist subscription received:
        
        Name: {name}
        Email: {email}
        Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}
        
        Total waitlist subscribers: {db.waitlist.count_documents({})}
        """
        
        try:
            send_email('tech@vedarc.co.in', subject, body)
        except Exception as e:
            print(f"Failed to send waitlist notification email: {e}")
        
        return jsonify({'message': 'Successfully subscribed to waitlist!'})
        
    except Exception as e:
        print(f"Error in waitlist subscription: {e}")
        return jsonify({'error': 'Failed to subscribe to waitlist'}), 500

@app.route('/api/contact/submit', methods=['POST'])
def contact_submit():
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        company = data.get('company', '').strip()
        subject = data.get('subject', '').strip()
        message = data.get('message', '').strip()
        
        if not name or not email or not message:
            return jsonify({'error': 'Name, email, and message are required'}), 400
        
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Store contact inquiry
        contact_entry = {
            'name': name,
            'email': email,
            'company': company,
            'subject': subject,
            'message': message,
            'submitted_at': datetime.utcnow(),
            'status': 'new'
        }
        
        db.contact_inquiries.insert_one(contact_entry)
        
        # Send notification email to tech@vedarc.co.in
        subject = f"New Contact Inquiry: {subject or 'General Inquiry'}"
        body = f"""
        New contact inquiry received:
        
        Name: {name}
        Email: {email}
        Company: {company or 'Not specified'}
        Subject: {subject or 'General Inquiry'}
        Message: {message}
        
        Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}
        
        Total contact inquiries: {db.contact_inquiries.count_documents({})}
        """
        
        try:
            send_email('tech@vedarc.co.in', subject, body)
        except Exception as e:
            print(f"Failed to send contact notification email: {e}")
        
        return jsonify({'message': 'Thank you for your message! We\'ll get back to you soon.'})
        
    except Exception as e:
        print(f"Error in contact submission: {e}")
        return jsonify({'error': 'Failed to submit contact form'}), 500

@app.route('/api/investor/inquiry', methods=['POST'])
def investor_inquiry():
    try:
        data = request.get_json()
        full_name = data.get('fullName', '').strip()
        email = data.get('email', '').strip().lower()
        company = data.get('company', '').strip()
        investor_type = data.get('investorType', '').strip()
        message = data.get('message', '').strip()
        
        if not full_name or not email or not investor_type:
            return jsonify({'error': 'Full name, email, and investor type are required'}), 400
        
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Store investor inquiry
        investor_entry = {
            'full_name': full_name,
            'email': email,
            'company': company,
            'investor_type': investor_type,
            'message': message,
            'submitted_at': datetime.utcnow(),
            'status': 'new'
        }
        
        db.investor_inquiries.insert_one(investor_entry)
        
        # Send notification email to tech@vedarc.co.in
        subject = f"New Investor Inquiry: {full_name} from {company or 'Unknown Company'}"
        body = f"""
        New investor inquiry received:
        
        Name: {full_name}
        Email: {email}
        Company: {company or 'Not specified'}
        Investor Type: {investor_type}
        Message: {message or 'No additional message'}
        
        Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}
        
        Total investor inquiries: {db.investor_inquiries.count_documents({})}
        """
        
        try:
            send_email('tech@vedarc.co.in', subject, body)
        except Exception as e:
            print(f"Failed to send investor notification email: {e}")
        
        return jsonify({'message': 'Thank you for your interest! We\'ll contact you within 24 hours.'})
        
    except Exception as e:
        print(f"Error in investor inquiry: {e}")
        return jsonify({'error': 'Failed to submit investor inquiry'}), 500

# ============================================================================
# HR DASHBOARD EXTENDED ENDPOINTS
# ============================================================================

@app.route('/api/hr/waitlist-subscribers', methods=['GET'])
@jwt_required()
def hr_get_waitlist_subscribers():
    try:
        current_user = get_jwt_identity()
        user_data = db.users.find_one({'_id': ObjectId(current_user)})
        
        if not user_data or user_data.get('user_type') != 'hr':
            return jsonify({'error': 'Unauthorized access'}), 403
        
        # Get waitlist subscribers with pagination
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        skip = (page - 1) * limit
        
        subscribers = list(db.waitlist.find().sort('subscribed_at', -1).skip(skip).limit(limit))
        total = db.waitlist.count_documents({})
        
        # Convert ObjectId to string for JSON serialization
        for subscriber in subscribers:
            subscriber['_id'] = str(subscriber['_id'])
            subscriber['subscribed_at'] = subscriber['subscribed_at'].isoformat()
        
        return jsonify({
            'subscribers': subscribers,
            'total': total,
            'page': page,
            'pages': (total + limit - 1) // limit
        })
        
    except Exception as e:
        print(f"Error fetching waitlist subscribers: {e}")
        return jsonify({'error': 'Failed to fetch waitlist subscribers'}), 500

@app.route('/api/hr/contact-inquiries', methods=['GET'])
@jwt_required()
def hr_get_contact_inquiries():
    try:
        current_user = get_jwt_identity()
        user_data = db.users.find_one({'_id': ObjectId(current_user)})
        
        if not user_data or user_data.get('user_type') != 'hr':
            return jsonify({'error': 'Unauthorized access'}), 403
        
        # Get contact inquiries with pagination
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        skip = (page - 1) * limit
        
        inquiries = list(db.contact_inquiries.find().sort('submitted_at', -1).skip(skip).limit(limit))
        total = db.contact_inquiries.count_documents({})
        
        # Convert ObjectId to string for JSON serialization
        for inquiry in inquiries:
            inquiry['_id'] = str(inquiry['_id'])
            inquiry['submitted_at'] = inquiry['submitted_at'].isoformat()
        
        return jsonify({
            'inquiries': inquiries,
            'total': total,
            'page': page,
            'pages': (total + limit - 1) // limit
        })
        
    except Exception as e:
        print(f"Error fetching contact inquiries: {e}")
        return jsonify({'error': 'Failed to fetch contact inquiries'}), 500

@app.route('/api/hr/investor-inquiries', methods=['GET'])
@jwt_required()
def hr_get_investor_inquiries():
    try:
        current_user = get_jwt_identity()
        user_data = db.users.find_one({'_id': ObjectId(current_user)})
        
        if not user_data or user_data.get('user_type') != 'hr':
            return jsonify({'error': 'Unauthorized access'}), 403
        
        # Get investor inquiries with pagination
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        skip = (page - 1) * limit
        
        inquiries = list(db.investor_inquiries.find().sort('submitted_at', -1).skip(skip).limit(limit))
        total = db.investor_inquiries.count_documents({})
        
        # Convert ObjectId to string for JSON serialization
        for inquiry in inquiries:
            inquiry['_id'] = str(inquiry['_id'])
            inquiry['submitted_at'] = inquiry['submitted_at'].isoformat()
        
        return jsonify({
            'inquiries': inquiries,
            'total': total,
            'page': page,
            'pages': (total + limit - 1) // limit
        })
        
    except Exception as e:
        print(f"Error fetching investor inquiries: {e}")
        return jsonify({'error': 'Failed to fetch investor inquiries'}), 500

@app.route('/api/hr/update-inquiry-status', methods=['POST'])
@jwt_required()
def hr_update_inquiry_status():
    try:
        current_user = get_jwt_identity()
        user_data = db.users.find_one({'_id': ObjectId(current_user)})
        
        if not user_data or user_data.get('user_type') != 'hr':
            return jsonify({'error': 'Unauthorized access'}), 403
        
        data = request.get_json()
        inquiry_id = data.get('inquiry_id')
        inquiry_type = data.get('inquiry_type')  # 'contact', 'investor', 'waitlist'
        new_status = data.get('status')
        notes = data.get('notes', '')
        
        if not inquiry_id or not inquiry_type or not new_status:
            return jsonify({'error': 'Inquiry ID, type, and status are required'}), 400
        
        # Update status based on inquiry type
        if inquiry_type == 'contact':
            result = db.contact_inquiries.update_one(
                {'_id': ObjectId(inquiry_id)},
                {'$set': {'status': new_status, 'notes': notes, 'updated_at': datetime.utcnow()}}
            )
        elif inquiry_type == 'investor':
            result = db.investor_inquiries.update_one(
                {'_id': ObjectId(inquiry_id)},
                {'$set': {'status': new_status, 'notes': notes, 'updated_at': datetime.utcnow()}}
            )
        elif inquiry_type == 'waitlist':
            result = db.waitlist.update_one(
                {'_id': ObjectId(inquiry_id)},
                {'$set': {'status': new_status, 'notes': notes, 'updated_at': datetime.utcnow()}}
            )
        else:
            return jsonify({'error': 'Invalid inquiry type'}), 400
        
        if result.modified_count == 0:
            return jsonify({'error': 'Inquiry not found'}), 404
        
        return jsonify({'message': 'Status updated successfully'})
        
    except Exception as e:
        print(f"Error updating inquiry status: {e}")
        return jsonify({'error': 'Failed to update inquiry status'}), 500

# --- SYSTEM SETTINGS ENDPOINTS ---

# Helper to get or create the system settings document
SYSTEM_SETTINGS_ID = 'global_settings'
def get_system_settings():
    settings = system_settings.find_one({'_id': SYSTEM_SETTINGS_ID})
    if not settings:
        # Default: registration enabled
        settings = {'_id': SYSTEM_SETTINGS_ID, 'internship_registration_enabled': True}
        system_settings.insert_one(settings)
    return settings

def update_system_settings(data):
    system_settings.update_one({'_id': SYSTEM_SETTINGS_ID}, {'$set': data}, upsert=True)
    return get_system_settings()

# Public endpoint to get current system settings
@app.route('/api/system/settings', methods=['GET'])
def public_get_system_settings():
    settings = get_system_settings()
    return jsonify({
        'internship_registration_enabled': settings.get('internship_registration_enabled', True)
    })

# Manager-only endpoints to get/update system settings
from flask_jwt_extended import jwt_required, get_jwt_identity

@app.route('/api/manager/system/settings', methods=['GET'])
@jwt_required()
def manager_get_system_settings():
    current_user = get_jwt_identity()
    if current_user != MANAGER_USERNAME:
        return jsonify({"error": "Unauthorized"}), 403
    settings = get_system_settings()
    return jsonify({
        'internship_registration_enabled': settings.get('internship_registration_enabled', True)
    })

@app.route('/api/manager/system/settings', methods=['PUT'])
@jwt_required()
def manager_update_system_settings():
    current_user = get_jwt_identity()
    if current_user != MANAGER_USERNAME:
        return jsonify({"error": "Unauthorized"}), 403
    data = request.get_json()
    if not data or 'internship_registration_enabled' not in data:
        return jsonify({"error": "Missing internship_registration_enabled"}), 400
    updated = update_system_settings({'internship_registration_enabled': bool(data['internship_registration_enabled'])})
    return jsonify({
        'internship_registration_enabled': updated.get('internship_registration_enabled', True)
    })

# ============================================================================
# CERTIFICATE VERIFIER ENDPOINTS
# ============================================================================

@app.route('/api/certificate/verify/<intern_id>', methods=['GET'])
def verify_certificate(intern_id):
    """Public endpoint to verify an intern certificate"""
    try:
        # Find the intern certificate
        intern = db.intern_certificates.find_one({'internId': intern_id})
        
        if not intern:
            return jsonify({'error': 'Certificate not found'}), 404
        
        # Return certificate details (excluding sensitive information)
        certificate_data = {
            'firstName': intern.get('firstName'),
            'lastName': intern.get('lastName'),
            'internId': intern.get('internId'),
            'institute': intern.get('institute'),
            'startDate': intern.get('startDate'),
            'endDate': intern.get('endDate'),
            'internshipTitle': intern.get('internshipTitle'),
            'grade': intern.get('grade'),
            'profilePicture': intern.get('profilePicture'),
            'created_at': intern.get('created_at')
        }
        
        return jsonify({'certificate': certificate_data})
    except Exception as e:
        print(f"Error verifying certificate: {e}")
        return jsonify({'error': 'Failed to verify certificate'}), 500

@app.route('/api/manager/certificates/interns', methods=['GET'])
@jwt_required()
def manager_get_intern_certificates():
    """Get all intern certificates for manager"""
    try:
        user_id = get_jwt_identity()
        user = db.users.find_one({'_id': ObjectId(user_id)})
        
        if not user or user.get('user_type') != 'manager':
            return jsonify({'error': 'Unauthorized access'}), 403
        
        # Get all intern certificates
        try:
            interns = list(db.intern_certificates.find().sort('created_at', -1))
            
            # Convert ObjectId to string for JSON serialization
            for intern in interns:
                intern['_id'] = str(intern['_id'])
            
            return jsonify({'interns': interns})
        except Exception as db_error:
            print(f"Database error fetching interns: {db_error}")
            return jsonify({'interns': [], 'message': 'No intern certificates found'})
            
    except Exception as e:
        print(f"Error fetching intern certificates: {e}")
        return jsonify({'error': 'Failed to fetch intern certificates'}), 500

@app.route('/api/manager/certificates/interns', methods=['POST'])
@jwt_required()
def manager_add_intern_certificate():
    """Add a new intern certificate"""
    try:
        user_id = get_jwt_identity()
        user = db.users.find_one({'_id': ObjectId(user_id)})
        
        if not user or user.get('user_type') != 'manager':
            return jsonify({'error': 'Unauthorized access'}), 403
        
        # Handle form data with file upload
        profile_picture = None
        if 'profilePicture' in request.files:
            file = request.files['profilePicture']
            if file and file.filename:
                try:
                    # Create uploads directory if it doesn't exist
                    upload_dir = "uploads/profile_pictures"
                    os.makedirs(upload_dir, exist_ok=True)
                    
                    # Save file to a secure location
                    filename = secure_filename(file.filename)
                    file_path = os.path.join(upload_dir, filename)
                    file.save(file_path)
                    profile_picture = file_path
                except Exception as file_error:
                    print(f"Error saving file: {file_error}")
                    # Continue without profile picture if file save fails
                    profile_picture = None
        
        # Get form data
        intern_data = {
            'firstName': request.form.get('firstName'),
            'lastName': request.form.get('lastName'),
            'internId': request.form.get('internId'),
            'institute': request.form.get('institute'),
            'startDate': request.form.get('startDate'),
            'endDate': request.form.get('endDate'),
            'internshipTitle': request.form.get('internshipTitle'),
            'grade': request.form.get('grade'),
            'profilePicture': profile_picture,
            'created_at': datetime.utcnow(),
            'created_by': user_id
        }
        
        # Validate required fields
        required_fields = ['firstName', 'lastName', 'internId', 'institute', 'startDate', 'endDate', 'internshipTitle', 'grade']
        for field in required_fields:
            if not intern_data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if intern ID already exists
        existing_intern = db.intern_certificates.find_one({'internId': intern_data['internId']})
        if existing_intern:
            return jsonify({'error': 'Intern ID already exists'}), 400
        
        # Insert the intern certificate
        try:
            result = db.intern_certificates.insert_one(intern_data)
            
            # Return the created intern data
            intern_data['_id'] = str(result.inserted_id)
            
            return jsonify({'intern': intern_data, 'message': 'Intern certificate added successfully'})
        except Exception as db_error:
            print(f"Database error: {db_error}")
            return jsonify({'error': 'Failed to save intern certificate to database'}), 500
            
    except Exception as e:
        print(f"Error adding intern certificate: {e}")
        return jsonify({'error': 'Failed to add intern certificate'}), 500

@app.route('/api/manager/certificates/qr-code', methods=['POST'])
@jwt_required()
def manager_save_qr_code():
    """Save QR code for an intern certificate"""
    try:
        user_id = get_jwt_identity()
        user = db.users.find_one({'_id': ObjectId(user_id)})
        
        if not user or user.get('user_type') != 'manager':
            return jsonify({'error': 'Unauthorized access'}), 403
        
        data = request.get_json()
        intern_id = data.get('internId')
        qr_code_data_url = data.get('qrCodeDataUrl')
        
        if not intern_id or not qr_code_data_url:
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Update the intern certificate with QR code
        try:
            result = db.intern_certificates.update_one(
                {'internId': intern_id},
                {'$set': {'qrCodeDataUrl': qr_code_data_url}}
            )
            
            if result.matched_count == 0:
                return jsonify({'error': 'Intern certificate not found'}), 404
            
            return jsonify({'message': 'QR code saved successfully'})
        except Exception as db_error:
            print(f"Database error saving QR code: {db_error}")
            return jsonify({'error': 'Failed to save QR code to database'}), 500
            
    except Exception as e:
        print(f"Error saving QR code: {e}")
        return jsonify({'error': 'Failed to save QR code'}), 500

@app.route('/api/manager/certificates/interns/<intern_id>', methods=['DELETE'])
@jwt_required()
def manager_delete_intern_certificate(intern_id):
    """Delete an intern certificate"""
    try:
        user_id = get_jwt_identity()
        user = db.users.find_one({'_id': ObjectId(user_id)})
        
        if not user or user.get('user_type') != 'manager':
            return jsonify({'error': 'Unauthorized access'}), 403
        
        # Delete the intern certificate
        result = db.intern_certificates.delete_one({'internId': intern_id})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Intern certificate not found'}), 404
        
        return jsonify({'message': 'Intern certificate deleted successfully'})
    except Exception as e:
        print(f"Error deleting intern certificate: {e}")
        return jsonify({'error': 'Failed to delete intern certificate'}), 500

if __name__ == '__main__':
    # Test database connection at startup
    if client is not None and db is not None:
        try:
            client.admin.command('ping')
            print("✅ Database connection test successful at startup")
        except Exception as e:
            print(f"❌ Database connection test failed at startup: {e}")
    else:
        print("⚠️ No database connection available at startup")
    
    initialize_database()
    
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(debug=debug, host='0.0.0.0', port=port) 