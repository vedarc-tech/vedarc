import requests
import json

# Test waitlist subscription
def test_waitlist_subscription():
    url = "https://api.vedarc.co.in/api/waitlist/subscribe"
    
    test_data = {
        "name": "Test User",
        "email": "test@example.com"
    }
    
    try:
        response = requests.post(url, json=test_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Waitlist subscription successful!")
        else:
            print("❌ Waitlist subscription failed!")
            
    except Exception as e:
        print(f"❌ Error: {e}")

# Test HR waitlist subscribers endpoint
def test_hr_waitlist_subscribers():
    url = "https://api.vedarc.co.in/api/hr/waitlist-subscribers"
    
    # You'll need to get a valid HR token first
    headers = {
        "Authorization": "Bearer YOUR_HR_TOKEN_HERE"
    }
    
    try:
        response = requests.get(url, headers=headers)
        print(f"HR Status Code: {response.status_code}")
        print(f"HR Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Found {data.get('total', 0)} waitlist subscribers")
        else:
            print("❌ Failed to fetch waitlist subscribers")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("Testing waitlist subscription...")
    test_waitlist_subscription()
    
    print("\nTesting HR waitlist subscribers endpoint...")
    test_hr_waitlist_subscribers() 