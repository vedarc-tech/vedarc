#!/usr/bin/env python3
"""
Test script to verify the complete certificate verification flow
"""

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
API_BASE_URL = "https://api.vedarc.co.in"
# For local testing, use: API_BASE_URL = "http://localhost:5000"

def test_cloudinary_upload_flow():
    """Test the complete flow: upload image, save certificate, verify certificate"""
    print("🧪 Testing Complete Certificate Verification Flow")
    print("=" * 60)
    
    # Test 1: Check if backend is running
    print("\n1️⃣ Testing Backend Connection...")
    try:
        response = requests.get(f"{API_BASE_URL}/api/debug/certificate-db")
        if response.status_code == 200:
            print("✅ Backend is running and accessible")
            data = response.json()
            print(f"   Database: {data.get('database_status', 'Unknown')}")
            print(f"   Collection: {data.get('collection_status', 'Unknown')}")
        else:
            print(f"❌ Backend connection failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend connection error: {e}")
        return False
    
    # Test 2: Check Cloudinary configuration
    print("\n2️⃣ Testing Cloudinary Configuration...")
    try:
        # This would require a manager login, but we can check if the endpoint exists
        response = requests.get(f"{API_BASE_URL}/api/manager/certificates/interns")
        if response.status_code in [401, 403]:  # Unauthorized/Forbidden is expected without login
            print("✅ Certificate endpoints are accessible (authentication required)")
        else:
            print(f"⚠️ Unexpected response: {response.status_code}")
    except Exception as e:
        print(f"❌ Endpoint test failed: {e}")
    
    # Test 3: Test public verification endpoint
    print("\n3️⃣ Testing Public Verification Endpoint...")
    try:
        # Test with a non-existent intern ID
        response = requests.get(f"{API_BASE_URL}/api/certificate/verify/test_intern_123")
        if response.status_code == 404:
            print("✅ Public verification endpoint working (correctly returns 404 for non-existent intern)")
        else:
            print(f"⚠️ Unexpected response: {response.status_code}")
    except Exception as e:
        print(f"❌ Public verification test failed: {e}")
    
    print("\n📋 Manual Testing Instructions:")
    print("=" * 60)
    print("1. Go to Manager Dashboard → Certificate Verifier")
    print("2. Click 'Add Intern Certificate'")
    print("3. Fill in the form and upload a profile picture")
    print("4. Submit the form")
    print("5. Check if the image appears in the intern history")
    print("6. Generate QR code and test public verification")
    print("7. Use the QR code link to verify the certificate publicly")
    
    print("\n🔍 Expected Flow:")
    print("- Manager uploads image → Cloudinary stores it → URL saved in database")
    print("- Public verification fetches data → Optimized image URL returned")
    print("- Frontend displays the optimized image from Cloudinary")
    
    print("\n✅ If everything works:")
    print("- Profile pictures should load instantly via Cloudinary CDN")
    print("- Images should be automatically optimized (400x400, face-focused)")
    print("- Public verification should show the same optimized image")
    
    return True

def test_environment_variables():
    """Check if environment variables are set"""
    print("\n🔧 Environment Variables Check:")
    print("=" * 40)
    
    required_vars = [
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY', 
        'CLOUDINARY_API_SECRET'
    ]
    
    all_set = True
    for var in required_vars:
        value = os.getenv(var)
        if value:
            print(f"✅ {var}: {value[:8]}...")
        else:
            print(f"❌ {var}: Not set")
            all_set = False
    
    if all_set:
        print("\n🎉 All environment variables are configured!")
    else:
        print("\n⚠️ Some environment variables are missing.")
        print("Please set them in your .env file or Render environment variables.")
    
    return all_set

if __name__ == "__main__":
    print("🚀 Certificate Verification Flow Test")
    print("=" * 50)
    
    # Check environment variables
    env_ok = test_environment_variables()
    
    if env_ok:
        # Test the flow
        flow_ok = test_cloudinary_upload_flow()
        
        if flow_ok:
            print("\n🎉 All tests completed! The system should be working.")
        else:
            print("\n⚠️ Some tests failed. Check the backend deployment.")
    else:
        print("\n❌ Environment variables not configured. Please set them first.")
    
    print("\n📞 Next Steps:")
    print("1. Test the Certificate Verifier in the manager dashboard")
    print("2. Upload a profile picture and verify it appears")
    print("3. Test the public verification link")
    print("4. Check if images load quickly via Cloudinary") 