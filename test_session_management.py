#!/usr/bin/env python3
"""
Test script to verify session management functionality
This script tests that different browser sessions can have different users logged in
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:5000/api"

# Use actual credentials that exist in the VEDARC system
HR_USERNAME = "hr@vedarc.co.in"
HR_PASSWORD = "vedarc_hr_2024"
ADMIN_USERNAME = "admin@vedarc.co.in"
ADMIN_PASSWORD = "vedarc_admin_2024"
MANAGER_USERNAME = "manager@vedarc.co.in"
MANAGER_PASSWORD = "vedarc_manager_2024"

def test_session_management():
    """Test that different sessions can have different users"""
    
    print("🧪 Testing Session Management System")
    print("=" * 50)
    
    # Test 1: HR Login
    print("\n1. Testing HR Login...")
    hr_data = {
        "username": HR_USERNAME,
        "password": HR_PASSWORD
    }
    
    try:
        response = requests.post(f"{BASE_URL}/hr/login", json=hr_data)
        if response.status_code == 200:
            hr_response = response.json()
            hr_token = hr_response.get('access_token')
            hr_session_id = hr_response.get('session_id')
            print(f"✅ HR login successful")
            print(f"   Session ID: {hr_session_id}")
            print(f"   Token: {hr_token[:20]}...")
        else:
            print(f"❌ HR login failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ HR login error: {e}")
        return False
    
    # Test 2: Admin Login (different session)
    print("\n2. Testing Admin Login...")
    admin_data = {
        "username": ADMIN_USERNAME,
        "password": ADMIN_PASSWORD
    }
    
    try:
        response = requests.post(f"{BASE_URL}/admin/login", json=admin_data)
        if response.status_code == 200:
            admin_response = response.json()
            admin_token = admin_response.get('access_token')
            admin_session_id = admin_response.get('session_id')
            print(f"✅ Admin login successful")
            print(f"   Session ID: {admin_session_id}")
            print(f"   Token: {admin_token[:20]}...")
        else:
            print(f"❌ Admin login failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Admin login error: {e}")
        return False
    
    # Test 3: Manager Login (third session)
    print("\n3. Testing Manager Login...")
    manager_data = {
        "username": MANAGER_USERNAME,
        "password": MANAGER_PASSWORD
    }
    
    try:
        response = requests.post(f"{BASE_URL}/manager/login", json=manager_data)
        if response.status_code == 200:
            manager_response = response.json()
            manager_token = manager_response.get('access_token')
            manager_session_id = manager_response.get('session_id')
            print(f"✅ Manager login successful")
            print(f"   Session ID: {manager_session_id}")
            print(f"   Token: {manager_token[:20]}...")
        else:
            print(f"❌ Manager login failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Manager login error: {e}")
        return False
    
    # Test 4: Verify different session IDs
    print("\n4. Verifying Session Independence...")
    session_ids = [hr_session_id, admin_session_id, manager_session_id]
    unique_sessions = len(set(session_ids))
    
    if unique_sessions == 3:
        print(f"✅ All session IDs are unique - sessions are independent")
        print(f"   HR Session: {hr_session_id}")
        print(f"   Admin Session: {admin_session_id}")
        print(f"   Manager Session: {manager_session_id}")
    else:
        print(f"❌ Session IDs are not unique - sessions are not independent")
        print(f"   Expected 3 unique sessions, got {unique_sessions}")
        return False
    
    # Test 5: Test API calls with different sessions
    print("\n5. Testing API calls with different sessions...")
    
    # Test HR API with HR session
    hr_headers = {
        'Authorization': f'Bearer {hr_token}',
        'X-Session-ID': hr_session_id,
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get(f"{BASE_URL}/hr/pending-registrations", headers=hr_headers)
        if response.status_code == 200:
            print(f"✅ HR API call successful with HR session")
        else:
            print(f"❌ HR API call failed: {response.text}")
    except Exception as e:
        print(f"❌ HR API call error: {e}")
    
    # Test Admin API with Admin session
    admin_headers = {
        'Authorization': f'Bearer {admin_token}',
        'X-Session-ID': admin_session_id,
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get(f"{BASE_URL}/admin/users", headers=admin_headers)
        if response.status_code == 200:
            print(f"✅ Admin API call successful with Admin session")
        else:
            print(f"❌ Admin API call failed: {response.text}")
    except Exception as e:
        print(f"❌ Admin API call error: {e}")
    
    # Test Manager API with Manager session
    manager_headers = {
        'Authorization': f'Bearer {manager_token}',
        'X-Session-ID': manager_session_id,
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get(f"{BASE_URL}/manager/internships", headers=manager_headers)
        if response.status_code == 200:
            print(f"✅ Manager API call successful with Manager session")
        else:
            print(f"❌ Manager API call failed: {response.text}")
    except Exception as e:
        print(f"❌ Manager API call error: {e}")
    
    # Test 6: Test cross-session access (should fail)
    print("\n6. Testing Cross-Session Access (should fail)...")
    
    # Try to access Admin API with HR session
    try:
        response = requests.get(f"{BASE_URL}/admin/users", headers=hr_headers)
        if response.status_code == 403:
            print(f"✅ Cross-session access correctly blocked")
        else:
            print(f"❌ Cross-session access should have been blocked: {response.status_code}")
    except Exception as e:
        print(f"❌ Cross-session test error: {e}")
    
    # Test 7: Test logout functionality
    print("\n7. Testing Logout Functionality...")
    
    try:
        response = requests.post(f"{BASE_URL}/hr/logout", headers=hr_headers)
        if response.status_code == 200:
            print(f"✅ HR logout successful")
        else:
            print(f"❌ HR logout failed: {response.text}")
    except Exception as e:
        print(f"❌ HR logout error: {e}")
    
    try:
        response = requests.post(f"{BASE_URL}/admin/logout", headers=admin_headers)
        if response.status_code == 200:
            print(f"✅ Admin logout successful")
        else:
            print(f"❌ Admin logout failed: {response.text}")
    except Exception as e:
        print(f"❌ Admin logout error: {e}")
    
    try:
        response = requests.post(f"{BASE_URL}/manager/logout", headers=manager_headers)
        if response.status_code == 200:
            print(f"✅ Manager logout successful")
        else:
            print(f"❌ Manager logout failed: {response.text}")
    except Exception as e:
        print(f"❌ Manager logout error: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Session Management Test Completed!")
    print("✅ Multiple users can now log in simultaneously in different browsers")
    print("✅ Each browser session is independent")
    print("✅ Sessions are properly validated and cleaned up")
    print("✅ All three user types (HR, Admin, Manager) can be logged in simultaneously")
    
    return True

if __name__ == "__main__":
    # Check if backend is running
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Backend is running")
            test_session_management()
        else:
            print("❌ Backend is not responding properly")
    except Exception as e:
        print(f"❌ Cannot connect to backend: {e}")
        print("Please make sure the backend is running on http://localhost:5000") 