#!/usr/bin/env python3
"""
VEDARC Backend Test Script
Tests all API endpoints to ensure they're working correctly
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:5000/api"
TEST_EMAIL = "test@example.com"
TEST_USER_ID = "VEDARC-FE-001"

def print_test_result(test_name, success, message=""):
    """Print test result with formatting"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} {test_name}")
    if message and not success:
        print(f"   Error: {message}")
    print()

def test_health_check():
    """Test health check endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        success = response.status_code == 200
        data = response.json() if success else {}
        message = data.get('error', '') if not success else ''
        print_test_result("Health Check", success, message)
        return success
    except Exception as e:
        print_test_result("Health Check", False, str(e))
        return False

def test_public_endpoints():
    """Test public endpoints"""
    print("=== Testing Public Endpoints ===")
    
    # Test get internships
    try:
        response = requests.get(f"{BASE_URL}/internships")
        success = response.status_code == 200
        data = response.json() if success else {}
        message = data.get('error', '') if not success else ''
        print_test_result("Get Internships", success, message)
    except Exception as e:
        print_test_result("Get Internships", False, str(e))
    
    # Test student registration
    try:
        registration_data = {
            "fullName": "Test Student",
            "email": TEST_EMAIL,
            "whatsapp": "+1234567890",
            "collegeName": "Test University",
            "track": "Basic Frontend",
            "yearOfStudy": "3rd Year",
            "passoutYear": 2025
        }
        response = requests.post(f"{BASE_URL}/register", json=registration_data)
        success = response.status_code in [201, 400]  # 400 if email already exists
        data = response.json() if success else {}
        message = data.get('error', '') if not success else ''
        print_test_result("Student Registration", success, message)
    except Exception as e:
        print_test_result("Student Registration", False, str(e))

def test_admin_endpoints():
    """Test admin endpoints"""
    print("=== Testing Admin Endpoints ===")
    
    # Test admin login
    try:
        login_data = {
            "username": "admin@vedarc.co.in",
            "password": "vedarc_admin_2024"
        }
        response = requests.post(f"{BASE_URL}/admin/login", json=login_data)
        success = response.status_code == 200
        data = response.json() if success else {}
        message = data.get('error', '') if not success else ''
        
        if success:
            admin_token = data.get('access_token')
            print_test_result("Admin Login", True)
            
            # Test admin get users
            headers = {"Authorization": f"Bearer {admin_token}"}
            response = requests.get(f"{BASE_URL}/admin/users", headers=headers)
            success = response.status_code == 200
            data = response.json() if success else {}
            message = data.get('error', '') if not success else ''
            print_test_result("Admin Get Users", success, message)
            
            # Test admin get internships
            response = requests.get(f"{BASE_URL}/admin/internships", headers=headers)
            success = response.status_code == 200
            data = response.json() if success else {}
            message = data.get('error', '') if not success else ''
            print_test_result("Admin Get Internships", success, message)
            
            # Test admin get weeks
            response = requests.get(f"{BASE_URL}/admin/weeks", headers=headers)
            success = response.status_code == 200
            data = response.json() if success else {}
            message = data.get('error', '') if not success else ''
            print_test_result("Admin Get Weeks", success, message)
            
            # Test admin get user types
            response = requests.get(f"{BASE_URL}/admin/user-types", headers=headers)
            success = response.status_code == 200
            data = response.json() if success else {}
            message = data.get('error', '') if not success else ''
            print_test_result("Admin Get User Types", success, message)
            
        else:
            print_test_result("Admin Login", False, message)
            
    except Exception as e:
        print_test_result("Admin Login", False, str(e))

def test_hr_endpoints():
    """Test HR endpoints"""
    print("=== Testing HR Endpoints ===")
    
    # Test HR login
    try:
        login_data = {
            "username": "hr@vedarc.co.in",
            "password": "vedarc_hr_2024"
        }
        response = requests.post(f"{BASE_URL}/hr/login", json=login_data)
        success = response.status_code == 200
        data = response.json() if success else {}
        message = data.get('error', '') if not success else ''
        
        if success:
            hr_token = data.get('access_token')
            print_test_result("HR Login", True)
            
            # Test HR get pending registrations
            headers = {"Authorization": f"Bearer {hr_token}"}
            response = requests.get(f"{BASE_URL}/hr/pending-registrations", headers=headers)
            success = response.status_code == 200
            data = response.json() if success else {}
            message = data.get('error', '') if not success else ''
            print_test_result("HR Get Pending Registrations", success, message)
            
        else:
            print_test_result("HR Login", False, message)
            
    except Exception as e:
        print_test_result("HR Login", False, str(e))

def test_manager_endpoints():
    """Test Manager endpoints"""
    print("=== Testing Manager Endpoints ===")
    
    # Test Manager login
    try:
        login_data = {
            "username": "manager@vedarc.co.in",
            "password": "vedarc_manager_2024"
        }
        response = requests.post(f"{BASE_URL}/manager/login", json=login_data)
        success = response.status_code == 200
        data = response.json() if success else {}
        message = data.get('error', '') if not success else ''
        
        if success:
            manager_token = data.get('access_token')
            print_test_result("Manager Login", True)
            
            # Test Manager get internships
            headers = {"Authorization": f"Bearer {manager_token}"}
            response = requests.get(f"{BASE_URL}/manager/internships", headers=headers)
            success = response.status_code == 200
            data = response.json() if success else {}
            message = data.get('error', '') if not success else ''
            print_test_result("Manager Get Internships", success, message)
            
            # Test Manager get announcements
            response = requests.get(f"{BASE_URL}/manager/announcements", headers=headers)
            success = response.status_code == 200
            data = response.json() if success else {}
            message = data.get('error', '') if not success else ''
            print_test_result("Manager Get Announcements", success, message)
            
        else:
            print_test_result("Manager Login", False, message)
            
    except Exception as e:
        print_test_result("Manager Login", False, str(e))

def test_student_endpoints():
    """Test Student endpoints"""
    print("=== Testing Student Endpoints ===")
    
    # Note: Student endpoints require an activated student account
    # This is a basic test that should fail gracefully if no activated students exist
    
    try:
        login_data = {
            "user_id": TEST_USER_ID,
            "password": "testpassword"
        }
        response = requests.post(f"{BASE_URL}/student/login", json=login_data)
        success = response.status_code in [200, 401]  # 401 is expected if student not activated
        data = response.json() if success else {}
        message = data.get('error', '') if not success else ''
        
        if response.status_code == 200:
            student_token = data.get('access_token')
            print_test_result("Student Login", True)
            
            # Test student endpoints with token
            headers = {"Authorization": f"Bearer {student_token}"}
            
            response = requests.get(f"{BASE_URL}/student/internship-details", headers=headers)
            success = response.status_code == 200
            data = response.json() if success else {}
            message = data.get('error', '') if not success else ''
            print_test_result("Student Get Internship Details", success, message)
            
        else:
            print_test_result("Student Login", False, "Student account not activated (expected)")
            
    except Exception as e:
        print_test_result("Student Login", False, str(e))

def main():
    """Run all tests"""
    print("🚀 VEDARC Backend Test Suite")
    print("=" * 50)
    print(f"Testing backend at: {BASE_URL}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Test health check first
    if not test_health_check():
        print("❌ Backend server is not running or not accessible!")
        print("Please start the backend server first:")
        print("cd backend && python app.py")
        return
    
    # Run all test suites
    test_public_endpoints()
    test_admin_endpoints()
    test_hr_endpoints()
    test_manager_endpoints()
    test_student_endpoints()
    
    print("=" * 50)
    print("✅ Test suite completed!")
    print("Note: Some tests may fail if the database is empty or not properly initialized.")
    print("Run the backend server to initialize the database with sample data.")

if __name__ == "__main__":
    main() 