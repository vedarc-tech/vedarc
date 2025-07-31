#!/usr/bin/env python3
"""
Test script to verify Cloudinary connection using environment variables
"""

import cloudinary
import cloudinary.uploader
import cloudinary.api
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_cloudinary_connection():
    """Test Cloudinary connection and configuration"""
    print("🔍 Testing Cloudinary Connection...")
    
    # Get credentials from environment variables
    cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME')
    api_key = os.getenv('CLOUDINARY_API_KEY')
    api_secret = os.getenv('CLOUDINARY_API_SECRET')
    
    if not all([cloud_name, api_key, api_secret]):
        print("❌ Cloudinary credentials not found in environment variables")
        print("Please set the following environment variables:")
        print("CLOUDINARY_CLOUD_NAME")
        print("CLOUDINARY_API_KEY")
        print("CLOUDINARY_API_SECRET")
        return False
    
    try:
        # Configure Cloudinary
        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret
        )
        
        print("✅ Cloudinary configured successfully")
        
        # Test API connection
        result = cloudinary.api.ping()
        print(f"✅ Cloudinary API ping successful: {result}")
        
        # Test upload folder access
        result = cloudinary.api.resources(type="upload", max_results=1)
        print(f"✅ Cloudinary resources access successful")
        
        print("\n🎉 Cloudinary is working perfectly!")
        print(f"Cloud Name: {cloud_name}")
        print(f"API Key: {api_key[:8]}...")
        print(f"API Secret: {api_secret[:8]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Cloudinary connection failed: {e}")
        return False

def test_image_upload():
    """Test image upload functionality"""
    print("\n🔍 Testing Image Upload...")
    
    try:
        # Create a simple test image (1x1 pixel)
        from PIL import Image
        import io
        
        # Create a small test image
        img = Image.new('RGB', (100, 100), color='red')
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            img_buffer,
            folder="vedarc/test",
            public_id="test_image",
            transformation=[
                {'width': 50, 'height': 50, 'crop': 'fill'},
                {'quality': 'auto', 'fetch_format': 'auto'}
            ]
        )
        
        print(f"✅ Test image uploaded successfully!")
        print(f"URL: {result['secure_url']}")
        print(f"Public ID: {result['public_id']}")
        
        # Clean up - delete the test image
        cloudinary.uploader.destroy(result['public_id'])
        print("✅ Test image cleaned up")
        
        return True
        
    except Exception as e:
        print(f"❌ Image upload test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Cloudinary Test Script (Environment Variables)")
    print("=" * 50)
    
    # Test connection
    connection_ok = test_cloudinary_connection()
    
    if connection_ok:
        # Test upload
        upload_ok = test_image_upload()
        
        if upload_ok:
            print("\n🎉 All tests passed! Cloudinary is ready to use.")
        else:
            print("\n⚠️ Connection works but upload failed.")
    else:
        print("\n❌ Cloudinary connection failed. Check environment variables.")
    
    print("\n📋 Environment Variables Setup:")
    print("1. Create a .env file in the backend directory")
    print("2. Add your Cloudinary credentials:")
    print("   CLOUDINARY_CLOUD_NAME=your_cloud_name")
    print("   CLOUDINARY_API_KEY=your_api_key")
    print("   CLOUDINARY_API_SECRET=your_api_secret")
    print("3. For Render deployment, add these as environment variables in your dashboard") 