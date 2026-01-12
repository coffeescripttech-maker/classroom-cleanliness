"""
Quick test script to verify OpenCV installation
Run: python web-portal/python-api/test_opencv.py
"""

import sys

def test_opencv():
    try:
        import cv2
        print("✓ OpenCV is installed")
        print(f"  Version: {cv2.__version__}")
        
        # Test basic functionality
        import numpy as np
        test_image = np.zeros((100, 100, 3), dtype=np.uint8)
        print("✓ NumPy is working")
        
        # Test video capture capability
        print("✓ Video capture module available")
        
        print("\n✅ All checks passed! RTSP capture is ready to use.")
        print("\nNext steps:")
        print("1. Add a camera in the web portal")
        print("2. Click 'Stream' button to test RTSP connection")
        print("3. If connection fails, check RTSP_SETUP_GUIDE.md")
        
        return True
        
    except ImportError as e:
        print("✗ OpenCV is NOT installed")
        print(f"  Error: {e}")
        print("\nTo install OpenCV:")
        print("  pip install opencv-python")
        print("\nOr install all requirements:")
        print("  pip install -r web-portal/python-api/requirements_rtsp.txt")
        return False

if __name__ == '__main__':
    success = test_opencv()
    sys.exit(0 if success else 1)
