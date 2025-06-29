#!/usr/bin/env python3
"""
Script to add sample internship data to VEDARC database
"""

import requests
import json
from datetime import datetime

def add_sample_internships():
    """Add sample internship data"""
    
    # Sample internship data
    sample_internships = [
        {
            "track_name": "Frontend Development",
            "description": "Learn modern frontend technologies including React, JavaScript, HTML, and CSS. Build responsive web applications and master the latest frontend frameworks.",
            "duration": "8 weeks",
            "fee": 999,
            "features": [
                "React.js Fundamentals",
                "Modern JavaScript (ES6+)",
                "Responsive Design",
                "State Management",
                "API Integration",
                "Deployment Strategies"
            ],
            "requirements": [
                "Basic programming knowledge",
                "Familiarity with HTML/CSS",
                "Laptop with internet connection"
            ],
            "created_at": datetime.utcnow().isoformat(),
            "is_active": True
        },
        {
            "track_name": "Backend Development",
            "description": "Master backend development with Node.js, Express, MongoDB, and RESTful APIs. Learn server-side programming and database management.",
            "duration": "8 weeks",
            "fee": 1299,
            "features": [
                "Node.js & Express.js",
                "MongoDB Database",
                "RESTful API Design",
                "Authentication & Authorization",
                "Error Handling",
                "Testing & Deployment"
            ],
            "requirements": [
                "Basic programming knowledge",
                "Understanding of HTTP",
                "Laptop with internet connection"
            ],
            "created_at": datetime.utcnow().isoformat(),
            "is_active": True
        },
        {
            "track_name": "Full Stack Development",
            "description": "Comprehensive full-stack development program covering both frontend and backend technologies. Build complete web applications from scratch.",
            "duration": "12 weeks",
            "fee": 1999,
            "features": [
                "Frontend: React.js, HTML, CSS",
                "Backend: Node.js, Express",
                "Database: MongoDB",
                "Authentication & Security",
                "Deployment & DevOps",
                "Project Portfolio"
            ],
            "requirements": [
                "Basic programming knowledge",
                "Dedication to learn",
                "Laptop with internet connection"
            ],
            "created_at": datetime.utcnow().isoformat(),
            "is_active": True
        },
        {
            "track_name": "Data Science",
            "description": "Learn data science fundamentals including Python, machine learning, data analysis, and visualization. Work with real-world datasets.",
            "duration": "10 weeks",
            "fee": 1499,
            "features": [
                "Python Programming",
                "Data Analysis with Pandas",
                "Machine Learning Basics",
                "Data Visualization",
                "Statistical Analysis",
                "Real-world Projects"
            ],
            "requirements": [
                "Basic mathematics",
                "Logical thinking",
                "Laptop with internet connection"
            ],
            "created_at": datetime.utcnow().isoformat(),
            "is_active": True
        }
    ]
    
    print("🚀 Adding sample internship data...")
    
    # You'll need to add these via the manager API or directly to the database
    # For now, let's create a simple script that can be run manually
    
    print("📋 Sample Internships to add:")
    for i, internship in enumerate(sample_internships, 1):
        print(f"\n{i}. {internship['track_name']}")
        print(f"   Duration: {internship['duration']}")
        print(f"   Fee: ₹{internship['fee']}")
        print(f"   Description: {internship['description'][:100]}...")
    
    print("\n" + "="*60)
    print("📝 To add this data, you can:")
    print("1. Use the Manager Dashboard to create internships")
    print("2. Or run this script with database connection")
    print("3. Or manually add via MongoDB")
    
    return sample_internships

def test_internships_after_fix():
    """Test if internships endpoint works after adding data"""
    try:
        response = requests.get('https://api.vedarc.co.in/api/internships')
        print(f"\n🔍 Testing internships endpoint: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            internships = data.get('internships', [])
            print(f"✅ Found {len(internships)} internships")
            
            for internship in internships:
                print(f"   - {internship.get('track_name', 'Unknown')}")
            
            return True
        else:
            print(f"❌ Still getting error: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data}")
            except:
                print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    print("🎯 VEDARC Sample Data Generator")
    print("=" * 50)
    
    # Generate sample data
    sample_data = add_sample_internships()
    
    print("\n🔧 Quick Fix Options:")
    print("1. Login to Manager Dashboard (manager@vedarc.co.in)")
    print("2. Go to Internships section")
    print("3. Add the sample internships manually")
    print("4. Or contact the backend developer to add sample data")
    
    # Test current status
    print("\n🧪 Testing current status...")
    test_internships_after_fix() 