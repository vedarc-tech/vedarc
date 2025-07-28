import os
from pymongo import MongoClient
from datetime import datetime

# MongoDB Connection
MONGODB_URI = 'mongodb+srv://vedarc:Vedarc6496@vedarc.venpk9a.mongodb.net/vedarc_internship?retryWrites=true&w=majority'

def check_users():
    try:
        # Connect to MongoDB
        client = MongoClient(MONGODB_URI)
        db = client.vedarc_internship
        
        # Test connection
        client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        
        # Check users collection
        if 'users' in db.list_collection_names():
            print("\n👥 Checking all users in database:")
            
            # Get all users
            all_users = list(db.users.find())
            print(f"📊 Total users: {len(all_users)}")
            
            if len(all_users) == 0:
                print("❌ No users found in database!")
                print("\n💡 This means:")
                print("   - No HR users can log in")
                print("   - No Admin users can log in")
                print("   - No Manager users can log in")
                print("   - HR Dashboard cannot access data")
                
                print("\n🔧 Solution: Create HR user account")
                print("   - Need to create an HR user with username: hr@vedarc.co.in")
                print("   - Or create an admin user to manage the system")
            else:
                # Group users by type
                user_types = {}
                for user in all_users:
                    user_type = user.get('user_type', 'unknown')
                    if user_type not in user_types:
                        user_types[user_type] = []
                    user_types[user_type].append(user)
                
                print(f"\n📋 Users by type:")
                for user_type, users in user_types.items():
                    print(f"  {user_type.upper()}: {len(users)} users")
                    for user in users:
                        username = user.get('username', user.get('user_id', 'N/A'))
                        print(f"    - {username}")
                
                # Check for HR users specifically
                hr_users = [u for u in all_users if u.get('user_type') == 'hr']
                if len(hr_users) == 0:
                    print("\n❌ No HR users found!")
                    print("💡 HR Dashboard cannot be accessed without HR users")
                else:
                    print(f"\n✅ Found {len(hr_users)} HR user(s)")
        else:
            print("❌ Users collection does not exist!")
        
        client.close()
        
    except Exception as e:
        print(f"❌ Database connection error: {e}")

if __name__ == "__main__":
    check_users() 