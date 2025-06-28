from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB Connection
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/vedarc_internship')
client = MongoClient(MONGODB_URI)
db = client.get_database()

# Collections
internships = db['internships']
weeks = db['weeks']

def clear_default_internships():
    """Clear default internships created by system"""
    try:
        # Find all internships created by 'system'
        system_internships = list(internships.find({"created_by": "system"}))
        
        if not system_internships:
            print("No default internships found to clear.")
            return
        
        print(f"Found {len(system_internships)} default internships to clear:")
        for internship in system_internships:
            print(f"- {internship['track_name']}")
        
        # Delete internships created by system
        result = internships.delete_many({"created_by": "system"})
        print(f"Deleted {result.deleted_count} internships")
        
        # Also delete related weeks for these internships
        for internship in system_internships:
            internship_id = str(internship['_id'])
            week_result = weeks.delete_many({"internship_id": internship_id})
            print(f"Deleted {week_result.deleted_count} weeks for {internship['track_name']}")
        
        print("Default internships and related weeks cleared successfully!")
        
    except Exception as e:
        print(f"Error clearing internships: {e}")

if __name__ == "__main__":
    clear_default_internships() 