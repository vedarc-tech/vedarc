#!/usr/bin/env python3
"""
Comprehensive test for certificate template saving
"""

import requests
import json

# Test configuration
BASE_URL = "http://localhost:5000/api"
ADMIN_CREDENTIALS = {
    "username": "admin@vedarc.co.in",
    "password": "vedarc_admin_2024"
}

def test_admin_login():
    """Test admin login"""
    print("Testing admin login...")
    response = requests.post(f"{BASE_URL}/admin/login", json=ADMIN_CREDENTIALS)
    if response.status_code == 200:
        token = response.json().get('access_token')
        print("✅ Admin login successful")
        return token
    else:
        print(f"❌ Admin login failed: {response.text}")
        return None

def test_valid_template_save(token):
    """Test saving a valid template"""
    print("\nTesting valid template save...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Valid template data
    template_data = {
        "type": "completion",
        "template": {
            "orientation": "portrait",
            "backgroundColor": "#ffffff",
            "borderColor": "#000000",
            "background_image": "",
            "placeholders": {
                "title": {
                    "text": "CERTIFICATE OF COMPLETION",
                    "x": 100,
                    "y": 100,
                    "fontSize": 24,
                    "fontFamily": "Helvetica-Bold",
                    "color": "#000000"
                },
                "student_name": {
                    "text": "This is to certify that {fullName}",
                    "x": 100,
                    "y": 200,
                    "fontSize": 16,
                    "fontFamily": "Helvetica",
                    "color": "#000000"
                }
            }
        }
    }
    
    response = requests.post(f"{BASE_URL}/admin/certificate-template", 
                           json=template_data, headers=headers)
    
    if response.status_code == 200:
        print("✅ Valid template saved successfully")
        return True
    else:
        print(f"❌ Valid template save failed: {response.text}")
        return False

def test_invalid_template_save(token):
    """Test saving invalid templates to ensure validation works"""
    print("\nTesting invalid template validation...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test cases for invalid templates
    test_cases = [
        {
            "name": "Missing placeholders",
            "template": {
                "type": "completion",
                "template": {
                    "orientation": "portrait"
                }
            }
        },
        {
            "name": "Missing orientation",
            "template": {
                "type": "completion",
                "template": {
                    "placeholders": {"test": {"text": "test"}}
                }
            }
        },
        {
            "name": "Empty placeholders",
            "template": {
                "type": "completion",
                "template": {
                    "orientation": "portrait",
                    "placeholders": {}
                }
            }
        },
        {
            "name": "Invalid orientation",
            "template": {
                "type": "completion",
                "template": {
                    "orientation": "invalid",
                    "placeholders": {"test": {"text": "test"}}
                }
            }
        }
    ]
    
    all_passed = True
    for test_case in test_cases:
        response = requests.post(f"{BASE_URL}/admin/certificate-template", 
                               json=test_case["template"], headers=headers)
        
        if response.status_code == 400:
            print(f"✅ {test_case['name']} correctly rejected")
        else:
            print(f"❌ {test_case['name']} should have been rejected but wasn't")
            all_passed = False
    
    return all_passed

def test_template_retrieval(token):
    """Test retrieving saved template"""
    print("\nTesting template retrieval...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(f"{BASE_URL}/admin/certificate-template?type=completion", 
                          headers=headers)
    
    if response.status_code == 200:
        template = response.json().get('template')
        if template and 'placeholders' in template and 'orientation' in template:
            print("✅ Template retrieved successfully")
            print(f"   Orientation: {template['orientation']}")
            print(f"   Placeholders count: {len(template['placeholders'])}")
            return True
        else:
            print("❌ Retrieved template is missing required fields")
            return False
    else:
        print(f"❌ Template retrieval failed: {response.text}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing Certificate Template Saving")
    print("=" * 60)
    
    # Test admin login
    token = test_admin_login()
    if not token:
        print("❌ Cannot proceed without admin token")
        return
    
    # Test valid template saving
    valid_save = test_valid_template_save(token)
    
    # Test invalid template validation
    validation_works = test_invalid_template_save(token)
    
    # Test template retrieval
    retrieval_works = test_template_retrieval(token)
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Summary:")
    print(f"Admin Login: {'✅' if token else '❌'}")
    print(f"Valid Template Save: {'✅' if valid_save else '❌'}")
    print(f"Invalid Template Validation: {'✅' if validation_works else '❌'}")
    print(f"Template Retrieval: {'✅' if retrieval_works else '❌'}")
    
    if token and valid_save and validation_works and retrieval_works:
        print("\n🎉 All tests passed! Template saving is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Please check the implementation.")

if __name__ == "__main__":
    main() 