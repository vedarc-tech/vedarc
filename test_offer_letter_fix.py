#!/usr/bin/env python3
"""
Test script to verify offer letter download works correctly
"""

import requests
import json

# Configuration
BASE_URL = 'http://localhost:5000/api'
ADMIN_CREDENTIALS = {
    'username': 'admin@vedarc.co.in',
    'password': 'vedarc_admin_2024'
}

def test_admin_login():
    """Test admin login and return token"""
    print("🔐 Testing admin login...")
    
    response = requests.post(f'{BASE_URL}/admin/login', json=ADMIN_CREDENTIALS)
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('access_token')
        print("✅ Admin login successful")
        return token
    else:
        print(f"❌ Admin login failed: {response.status_code} - {response.text}")
        return None

def test_offer_letter_download():
    """Test offer letter download for a student"""
    print("\n📄 Testing offer letter download...")
    
    # First, create a test student
    test_user_data = {
        'fullName': 'Test Student Offer',
        'email': 'testoffer@example.com',
        'whatsapp': '+1234567890',
        'collegeName': 'Test University',
        'track': 'Frontend Development',
        'yearOfStudy': '3rd Year',
        'passoutYear': 2025
    }
    
    # Register test user
    register_response = requests.post(f'{BASE_URL}/register', json=test_user_data)
    if register_response.status_code not in [200, 201]:  # Both 200 and 201 are success
        print(f"❌ Could not create test user: {register_response.status_code}")
        return False
    
    user_data = register_response.json()
    user_id = user_data.get('user_id')
    password = user_data.get('password')
    
    print(f"✅ Test user created: {user_id}")
    
    # Login as admin to activate the user
    admin_token = test_admin_login()
    if not admin_token:
        print("❌ Cannot proceed without admin token")
        return False
    
    # Activate the user (this should set offer_letter_unlocked to True)
    activate_data = {
        'user_id': user_id,
        'payment_id': 'test_payment_123'
    }
    
    headers = {'Authorization': f'Bearer {admin_token}'}
    activate_response = requests.post(
        f'{BASE_URL}/hr/activate-user',
        json=activate_data,
        headers=headers
    )
    
    if activate_response.status_code != 200:
        print(f"❌ Could not activate user: {activate_response.status_code} - {activate_response.text}")
        return False
    
    print("✅ User activated successfully")
    
    # Login as student
    student_login_data = {
        'user_id': user_id,
        'password': password
    }
    
    login_response = requests.post(f'{BASE_URL}/student/login', json=student_login_data)
    if login_response.status_code != 200:
        print(f"❌ Could not login as student: {login_response.status_code}")
        return False
    
    student_token = login_response.json().get('access_token')
    print("✅ Student login successful")
    
    # Try to download offer letter
    download_headers = {'Authorization': f'Bearer {student_token}'}
    download_response = requests.get(
        f'{BASE_URL}/student/certificates/offer',
        headers=download_headers
    )
    
    if download_response.status_code == 200:
        print("✅ Offer letter downloaded successfully!")
        print(f"   Content-Type: {download_response.headers.get('content-type', 'N/A')}")
        print(f"   Content-Length: {len(download_response.content)} bytes")
        return True
    else:
        print(f"❌ Failed to download offer letter: {download_response.status_code} - {download_response.text}")
        return False

def main():
    """Main test function"""
    print("🧪 Testing Offer Letter Download Fix")
    print("=" * 50)
    
    success = test_offer_letter_download()
    
    print("\n" + "="*50)
    if success:
        print("🎉 Offer letter download is working correctly!")
        print("✅ Students can now download offer letters by default")
        print("✅ No manager approval required for offer letters")
    else:
        print("❌ Offer letter download still has issues")
        print("   Please check the logs above for details")

if __name__ == "__main__":
    main() 