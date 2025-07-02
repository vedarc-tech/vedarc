#!/usr/bin/env python3
"""
Test script for the featured projects API endpoint
"""

import requests
import json

def test_featured_projects_api():
    """Test the featured projects API endpoint"""
    
    # Test local development server
    base_url = "http://localhost:5000"
    endpoint = "/api/featured-projects"
    
    try:
        print("Testing Featured Projects API...")
        print(f"URL: {base_url}{endpoint}")
        
        response = requests.get(f"{base_url}{endpoint}")
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ API Response Successful!")
            print(f"Number of projects: {len(data.get('featured_projects', []))}")
            
            # Display first project as example
            if data.get('featured_projects'):
                first_project = data['featured_projects'][0]
                print("\n📋 Sample Project:")
                print(f"Title: {first_project.get('title')}")
                print(f"Student: {first_project.get('student_name')}")
                print(f"University: {first_project.get('university')}")
                print(f"Completion Rate: {first_project.get('completion_rate')}%")
                print(f"Tags: {', '.join(first_project.get('tags', []))}")
            
            return True
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the backend server is running on localhost:5000")
        return False
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")
        return False

if __name__ == "__main__":
    test_featured_projects_api() 