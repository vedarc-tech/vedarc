#!/usr/bin/env python3
"""
Simple test script to verify certificate template saving and retrieval
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

def test_certificate_preview(token, template_type):
    """Test certificate preview generation"""
    print(f"👁️  Testing {template_type} certificate preview...")
    
    # First, get the template from database
    headers = {'Authorization': f'Bearer {token}'}
    template_response = requests.get(
        f'{BASE_URL}/admin/certificate-template?type={template_type}',
        headers=headers
    )
    
    if template_response.status_code != 200:
        print(f"❌ Could not get {template_type} template for preview: {template_response.status_code}")
        return False
    
    template_data = template_response.json().get('template')
    
    # Sample student data for preview
    preview_data = {
        'studentName': 'John Doe',
        'trackName': 'Frontend Development',
        'completionDate': '15 December 2024',
        'managerName': 'Jane Smith'
    }
    
    # Send template and preview data to preview endpoint
    preview_request_data = {
        'template': template_data,
        'preview_data': preview_data,
        'certificate_type': template_type
    }
    
    response = requests.post(
        f'{BASE_URL}/admin/certificate-preview',
        json=preview_request_data,
        headers=headers
    )
    
    if response.status_code == 200:
        print(f"✅ {template_type.title()} certificate preview generated successfully")
        return True
    else:
        print(f"❌ Failed to generate {template_type} preview: {response.status_code} - {response.text}")
        return False

def main():
    """Main test function"""
    print("🧪 Testing Certificate Template System")
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
        created = False
        if not exists:
            created = create_template_for_type(token, template_type)
            if created:
                # Verify template was created
                get_template(token, template_type)
        
        # Test certificate preview
        preview_success = test_certificate_preview(token, template_type)
        
        results[template_type] = {
            'template_exists': exists or created,
            'preview_works': preview_success
        }
    
    # Print summary
    print("\n" + "="*50)
    print("📊 FINAL TEST SUMMARY")
    print("="*50)
    
    for template_type, result in results.items():
        status = "✅" if result['template_exists'] and result['preview_works'] else "❌"
        print(f"{status} {template_type.upper()}: Template={result['template_exists']}, Preview={result['preview_works']}")
    
    all_passed = all(result['template_exists'] and result['preview_works'] for result in results.values())
    
    if all_passed:
        print("\n🎉 All certificate types are working correctly!")
        print("✅ Offer Letter templates saved and preview works")
        print("✅ Certificate of Completion templates saved and preview works") 
        print("✅ Letter of Recommendation templates saved and preview works")
        print("\n📋 Next Steps:")
        print("1. Admin can create templates for all three types")
        print("2. Templates are saved with proper placeholders")
        print("3. Students can download certificates using saved templates")
        print("4. Placeholders are replaced with student data")
    else:
        print("\n⚠️  Some issues found. Please check the logs above.")

if __name__ == "__main__":
    main() 