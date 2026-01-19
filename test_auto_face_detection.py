"""
Test automatic face detection on upload
"""

import requests
import json
import os

# Test the face detection endpoint directly
def test_face_detection_endpoint():
    url = "http://localhost:5000/detect-faces"
    
    # Use absolute path
    abs_path = os.path.abspath("web-portal/public/uploads/Grade-7/Section-A/2026-01-19/original_12-31-44.jpg")
    
    data = {
        "image_id": 29,
        "image_path": abs_path,
        "relative_path": "Grade-7/Section-A/2026-01-19/original_12-31-44.jpg"
    }
    
    print("Testing face detection endpoint...")
    print(f"POST {url}")
    print(f"Image path: {abs_path}")
    print(f"Exists: {os.path.exists(abs_path)}")
    
    try:
        response = requests.post(url, json=data)
        print(f"\nStatus: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            result = response.json()
            if result['success']:
                print(f"\n✅ Success!")
                print(f"   Faces detected: {result['faces_detected']}")
                if result['faces_detected'] > 0:
                    print(f"   Blurred image: {result['blurred_image_path']}")
            else:
                print(f"\n❌ Failed: {result.get('error')}")
        else:
            print(f"\n❌ HTTP Error: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("\n❌ Could not connect to Python API")
        print("   Make sure the Python API is running on http://localhost:5000")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == '__main__':
    test_face_detection_endpoint()
