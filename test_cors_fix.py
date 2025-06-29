#!/usr/bin/env python3
"""
Test script to verify CORS fix for VEDARC backend
"""

import requests
import json

def test_backend_health():
    """Test if backend is responding"""
    try:
        response = requests.get('https://api.vedarc.co.in/api/health')
        print(f"✅ Health check: {response.status_code}")
        if response.status_code == 200:
            print(f"   Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_cors_preflight():
    """Test CORS preflight request"""
    try:
        headers = {
            'Origin': 'https://www.vedarc.co.in',
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type'
        }
        response = requests.options('https://api.vedarc.co.in/api/internships', headers=headers)
        print(f"✅ CORS preflight: {response.status_code}")
        
        # Check CORS headers
        cors_headers = [
            'Access-Control-Allow-Origin',
            'Access-Control-Allow-Methods',
            'Access-Control-Allow-Headers',
            'Access-Control-Allow-Credentials'
        ]
        
        for header in cors_headers:
            if header in response.headers:
                print(f"   {header}: {response.headers[header]}")
            else:
                print(f"   ❌ Missing header: {header}")
        
        return response.status_code in [200, 204]
    except Exception as e:
        print(f"❌ CORS preflight failed: {e}")
        return False

def test_internships_endpoint():
    """Test the internships endpoint"""
    try:
        headers = {
            'Origin': 'https://www.vedarc.co.in',
            'Content-Type': 'application/json'
        }
        response = requests.get('https://api.vedarc.co.in/api/internships', headers=headers)
        print(f"✅ Internships endpoint: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Found {len(data.get('internships', []))} internships")
        
        # Check CORS headers
        if 'Access-Control-Allow-Origin' in response.headers:
            print(f"   CORS Origin: {response.headers['Access-Control-Allow-Origin']}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Internships endpoint failed: {e}")
        return False

def test_unauthorized_origin():
    """Test that unauthorized origins are rejected"""
    try:
        headers = {
            'Origin': 'https://malicious-site.com',
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type'
        }
        response = requests.options('https://api.vedarc.co.in/api/internships', headers=headers)
        print(f"✅ Unauthorized origin test: {response.status_code}")
        
        if response.status_code == 403:
            print("   ✅ Correctly rejected unauthorized origin")
            return True
        else:
            print(f"   ⚠️ Unexpected status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Unauthorized origin test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🔍 Testing VEDARC Backend CORS Configuration")
    print("=" * 50)
    
    tests = [
        ("Backend Health", test_backend_health),
        ("CORS Preflight", test_cors_preflight),
        ("Internships Endpoint", test_internships_endpoint),
        ("Unauthorized Origin", test_unauthorized_origin)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n🧪 Testing: {test_name}")
        print("-" * 30)
        result = test_func()
        results.append((test_name, result))
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! CORS configuration is working correctly.")
        print("\n📝 Next steps:")
        print("1. Create .env.local file in frontend directory")
        print("2. Deploy updated frontend")
        print("3. Test the complete application")
    else:
        print("⚠️ Some tests failed. Please check the backend configuration.")
        print("\n🔧 Troubleshooting:")
        print("1. Verify backend is deployed and running")
        print("2. Check backend logs for errors")
        print("3. Ensure CORS configuration is applied")

if __name__ == "__main__":
    main() 