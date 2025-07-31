#!/usr/bin/env python3
"""
Test script to verify Cloudinary connection
"""

import cloudinary
import cloudinary.uploader
import cloudinary.api
import os

# Your Cloudinary credentials
CLOUDINARY_CLOUD_NAME = "dkduhmrfp"
CLOUDINARY_API_KEY = "532412838481764"
CLOUDINARY_API_SECRET = "2ByTwqrNy1Xut979U_Hm2mitqOQ"

def test_cloudinary_connection():
    """Test Cloudinary connection and configuration"""
    print("🔍 Testing Cloudinary Connection...")
    
    try:
        # Configure Cloudinary
        cloudinary.config(
            cloud_name=CLOUDINARY_CLOUD_NAME,
            api_key=CLOUDINARY_API_KEY,
            api_secret=CLOUDINARY_API_SECRET
        )
        
        print("✅ Cloudinary configured successfully")
        
        # Test API connection
        result = cloudinary.api.ping()
        print(f"✅ Cloudinary API ping successful: {result}")
        
        # Test upload folder access
        result = cloudinary.api.resources(type="upload", max_results=1)
        print(f"✅ Cloudinary resources access successful")
        
        print("\n🎉 Cloudinary is working perfectly!")
        print(f"Cloud Name: {CLOUDINARY_CLOUD_NAME}")
        print(f"API Key: {CLOUDINARY_API_KEY}")
        print(f"API Secret: {CLOUDINARY_API_SECRET[:8]}...")
        
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
    print("🚀 Cloudinary Test Script")
    print("=" * 40)
    
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
        print("\n❌ Cloudinary connection failed. Check credentials.")
    
    print("\n📋 Environment Variables for Render:")
    print("CLOUDINARY_CLOUD_NAME=dkduhmrfp")
    print("CLOUDINARY_API_KEY=532412838481764")
    print("CLOUDINARY_API_SECRET=2ByTwqrNy1Xut979U_Hm2mitqOQ") 