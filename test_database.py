import os
from pymongo import MongoClient
from datetime import datetime

# MongoDB Connection
MONGODB_URI = 'mongodb+srv://vedarc:Vedarc6496@vedarc.venpk9a.mongodb.net/vedarc_internship?retryWrites=true&w=majority'

def test_database_connection():
    try:
        # Connect to MongoDB
        client = MongoClient(MONGODB_URI)
        db = client.vedarc_internship
        
        # Test connection
        client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        
        # Check if waitlist collection exists
        collections = db.list_collection_names()
        print(f"Available collections: {collections}")
        
        if 'waitlist' in collections:
            print("✅ Waitlist collection exists!")
            
            # Count waitlist documents
            waitlist_count = db.waitlist.count_documents({})
            print(f"📊 Total waitlist subscribers: {waitlist_count}")
            
            # Get recent waitlist entries
            recent_subscribers = list(db.waitlist.find().sort('subscribed_at', -1).limit(5))
            print(f"\n📋 Recent waitlist subscribers:")
            for i, subscriber in enumerate(recent_subscribers, 1):
                print(f"{i}. {subscriber.get('name', 'N/A')} - {subscriber.get('email', 'N/A')} - {subscriber.get('subscribed_at', 'N/A')}")
        else:
            print("❌ Waitlist collection does not exist!")
            
        # Check other related collections
        if 'contact_inquiries' in collections:
            contact_count = db.contact_inquiries.count_documents({})
            print(f"📊 Total contact inquiries: {contact_count}")
            
        if 'investor_inquiries' in collections:
            investor_count = db.investor_inquiries.count_documents({})
            print(f"📊 Total investor inquiries: {investor_count}")
            
        # Check users collection for HR users
        if 'users' in collections:
            hr_users = list(db.users.find({'user_type': 'hr'}))
            print(f"👥 HR users found: {len(hr_users)}")
            for user in hr_users:
                print(f"  - {user.get('username', 'N/A')} ({user.get('user_type', 'N/A')})")
        
        client.close()
        
    except Exception as e:
        print(f"❌ Database connection error: {e}")

if __name__ == "__main__":
    test_database_connection() 