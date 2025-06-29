#!/usr/bin/env python3
"""
Test script to diagnose MongoDB connection issues
"""

import os
import ssl
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_mongodb_connection():
    """Test different MongoDB connection configurations"""
    
    # Get MongoDB URI from environment
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb+srv://vedarc:Vedarc6496@vedarc.venpk9a.mongodb.net/vedarc_internship?retryWrites=true&w=majority')
    
    print("🔍 Testing MongoDB Connection...")
    print(f"URI: {MONGODB_URI.replace('vedarc:Vedarc6496@', '***:***@')}")
    print(f"Python version: {os.sys.version}")
    print(f"SSL version: {ssl.OPENSSL_VERSION}")
    print()
    
    # Test 1: Basic connection with default settings
    print("Test 1: Basic connection with default settings")
    try:
        client = MongoClient(MONGODB_URI, server_api=ServerApi('1'))
        client.admin.command('ping')
        print("✅ Success!")
        client.close()
    except Exception as e:
        print(f"❌ Failed: {e}")
    
    print()
    
    # Test 2: Connection with explicit SSL settings
    print("Test 2: Connection with explicit SSL settings")
    try:
        client = MongoClient(
            MONGODB_URI,
            server_api=ServerApi('1'),
            tls=True,
            tlsAllowInvalidCertificates=False,
            tlsAllowInvalidHostnames=False
        )
        client.admin.command('ping')
        print("✅ Success!")
        client.close()
    except Exception as e:
        print(f"❌ Failed: {e}")
    
    print()
    
    # Test 3: Connection with relaxed SSL settings
    print("Test 3: Connection with relaxed SSL settings")
    try:
        client = MongoClient(
            MONGODB_URI,
            server_api=ServerApi('1'),
            tls=True,
            tlsAllowInvalidCertificates=True,
            tlsAllowInvalidHostnames=True
        )
        client.admin.command('ping')
        print("✅ Success!")
        client.close()
    except Exception as e:
        print(f"❌ Failed: {e}")
    
    print()
    
    # Test 4: Connection with SSL disabled
    print("Test 4: Connection with SSL disabled")
    try:
        no_ssl_uri = MONGODB_URI.replace('mongodb+srv://', 'mongodb://')
        client = MongoClient(
            no_ssl_uri,
            server_api=ServerApi('1'),
            tls=False
        )
        client.admin.command('ping')
        print("✅ Success!")
        client.close()
    except Exception as e:
        print(f"❌ Failed: {e}")
    
    print()
    
    # Test 5: Connection with different timeout settings
    print("Test 5: Connection with different timeout settings")
    try:
        client = MongoClient(
            MONGODB_URI,
            server_api=ServerApi('1'),
            serverSelectionTimeoutMS=60000,
            connectTimeoutMS=60000,
            socketTimeoutMS=60000
        )
        client.admin.command('ping')
        print("✅ Success!")
        client.close()
    except Exception as e:
        print(f"❌ Failed: {e}")

if __name__ == "__main__":
    test_mongodb_connection() 