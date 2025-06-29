#!/usr/bin/env python3
import requests

try:
    response = requests.get('https://api.vedarc.co.in/api/internships')
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Error: {e}") 