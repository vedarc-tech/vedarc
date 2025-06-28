#!/usr/bin/env python3
"""
Test script to check and create templates for all three certificate types
"""

import requests
import json
import base64

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

def create_template_for_type(token, template_type):
    """Create a template for a specific type"""
    print(f"\n📝 Creating template for {template_type}...")
    
    # Template data for each type
    templates = {
        'offer': {
            'placeholders': {
                'student_name': {
                    'text': '{fullName}',
                    'x': 100,
                    'y': 200,
                    'font_size': 16,
                    'font_name': 'Helvetica',
                    'color': '#000000'
                },
                'track': {
                    'text': '{track}',
                    'x': 100,
                    'y': 250,
                    'font_size': 14,
                    'font_name': 'Helvetica',
                    'color': '#000000'
                },
                'date': {
                    'text': '{completion_date}',
                    'x': 100,
                    'y': 300,
                    'font_size': 12,
                    'font_name': 'Helvetica',
                    'color': '#000000'
                }
            },
            'orientation': 'portrait'
        },
        'completion': {
            'placeholders': {
                'student_name': {
                    'text': '{fullName}',
                    'x': 150,
                    'y': 250,
                    'font_size': 18,
                    'font_name': 'Helvetica-Bold',
                    'color': '#000000'
                },
                'track': {
                    'text': '{track}',
                    'x': 150,
                    'y': 300,
                    'font_size': 14,
                    'font_name': 'Helvetica',
                    'color': '#000000'
                },
                'completion_date': {
                    'text': '{completion_date}',
                    'x': 150,
                    'y': 350,
                    'font_size': 12,
                    'font_name': 'Helvetica',
                    'color': '#000000'
                }
            },
            'orientation': 'landscape'
        },
        'lor': {
            'placeholders': {
                'student_name': {
                    'text': '{fullName}',
                    'x': 100,
                    'y': 150,
                    'font_size': 16,
                    'font_name': 'Helvetica-Bold',
                    'color': '#000000'
                },
                'track': {
                    'text': '{track}',
                    'x': 100,
                    'y': 200,
                    'font_size': 14,
                    'font_name': 'Helvetica',
                    'color': '#000000'
                },
                'manager_name': {
                    'text': '{manager_name}',
                    'x': 100,
                    'y': 400,
                    'font_size': 12,
                    'font_name': 'Helvetica',
                    'color': '#000000'
                },
                'date': {
                    'text': '{completion_date}',
                    'x': 100,
                    'y': 450,
                    'font_size': 12,
                    'font_name': 'Helvetica',
                    'color': '#000000'
                }
            },
            'orientation': 'portrait'
        }
    }
    
    template_data = templates[template_type]
    
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.post(
        f'{BASE_URL}/admin/certificate-template',
        json={'type': template_type, 'template': template_data},
        headers=headers
    )
    
    if response.status_code == 200:
        print(f"✅ {template_type.title()} template created successfully")
        return True
    else:
        print(f"❌ Failed to create {template_type} template: {response.status_code} - {response.text}")
        return False

def get_template(token, template_type):
    """Get a template for a specific type"""
    print(f"📋 Getting {template_type} template...")
    
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(
        f'{BASE_URL}/admin/certificate-template?type={template_type}',
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        template = data.get('template', {})
        placeholders_count = len(template.get('placeholders', {}))
        orientation = template.get('orientation', 'N/A')
        print(f"✅ {template_type.title()} template retrieved - {placeholders_count} placeholders, {orientation} orientation")
        return True
    elif response.status_code == 404:
        print(f"⚠️  No {template_type} template found (404)")
        return False
    else:
        print(f"❌ Failed to get {template_type} template: {response.status_code} - {response.text}")
        return False

def test_student_certificate_download(token, certificate_type):
    """Test student certificate download (using a test user)"""
    print(f"📄 Testing {certificate_type} certificate download...")
    
    # First, create a test user if needed
    test_user_data = {
        'fullName': 'Test Student',
        'email': 'test@example.com',
        'whatsapp': '+1234567890',
        'collegeName': 'Test University',
        'track': 'Frontend Development',
        'yearOfStudy': '3rd Year',
        'passoutYear': 2025
    }
    
    # Register test user
    register_response = requests.post(f'{BASE_URL}/register', json=test_user_data)
    if register_response.status_code != 200:
        print(f"⚠️  Could not create test user: {register_response.status_code}")
        return False
    
    user_data = register_response.json()
    user_id = user_data.get('user_id')
    
    # Unlock certificate for this user (admin action)
    unlock_data = {
        'user_id': user_id,
        'certificate_type': certificate_type
    }
    
    headers = {'Authorization': f'Bearer {token}'}
    unlock_response = requests.post(
        f'{BASE_URL}/manager/certificates/unlock',
        json=unlock_data,
        headers=headers
    )
    
    if unlock_response.status_code != 200:
        print(f"⚠️  Could not unlock {certificate_type} certificate: {unlock_response.status_code}")
        return False
    
    # Login as student
    student_login_data = {
        'user_id': user_id,
        'password': user_data.get('password', 'default_password')
    }
    
    login_response = requests.post(f'{BASE_URL}/student/login', json=student_login_data)
    if login_response.status_code != 200:
        print(f"⚠️  Could not login as student: {login_response.status_code}")
        return False
    
    student_token = login_response.json().get('access_token')
    
    # Download certificate
    download_headers = {'Authorization': f'Bearer {student_token}'}
    download_response = requests.get(
        f'{BASE_URL}/student/certificates/{certificate_type}',
        headers=download_headers
    )
    
    if download_response.status_code == 200:
        print(f"✅ {certificate_type.title()} certificate downloaded successfully")
        return True
    else:
        print(f"❌ Failed to download {certificate_type} certificate: {download_response.status_code} - {download_response.text}")
        return False

def main():
    """Main test function"""
    print("🧪 Testing All Certificate Template Types")
    print("=" * 50)
    
    # Test admin login
    token = test_admin_login()
    if not token:
        print("❌ Cannot proceed without admin token")
        return
    
    # Test all three template types
    template_types = ['offer', 'completion', 'lor']
    results = {}
    
    for template_type in template_types:
        print(f"\n{'='*20} {template_type.upper()} {'='*20}")
        
        # Check if template exists
        exists = get_template(token, template_type)
        
        # Create template if it doesn't exist
        if not exists:
            created = create_template_for_type(token, template_type)
            if created:
                # Verify template was created
                get_template(token, template_type)
        
        # Test certificate download
        download_success = test_student_certificate_download(token, template_type)
        results[template_type] = {
            'template_exists': exists or created,
            'download_works': download_success
        }
    
    # Print summary
    print("\n" + "="*50)
    print("📊 FINAL TEST SUMMARY")
    print("="*50)
    
    for template_type, result in results.items():
        status = "✅" if result['template_exists'] and result['download_works'] else "❌"
        print(f"{status} {template_type.upper()}: Template={result['template_exists']}, Download={result['download_works']}")
    
    all_passed = all(result['template_exists'] and result['download_works'] for result in results.values())
    
    if all_passed:
        print("\n🎉 All certificate types are working correctly!")
        print("✅ Offer Letter templates saved and downloadable")
        print("✅ Certificate of Completion templates saved and downloadable") 
        print("✅ Letter of Recommendation templates saved and downloadable")
    else:
        print("\n⚠️  Some issues found. Please check the logs above.")

if __name__ == "__main__":
    main() 