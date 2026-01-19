"""
Test script for face blurring functionality
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from utils.face_blur import FaceBlurrer
import cv2

def test_face_blur():
    """Test face blurring with a sample image"""
    
    print("="*60)
    print("Face Blurring Test")
    print("="*60)
    
    # Initialize blurrer
    print("\n1. Initializing face blurrer...")
    blurrer = FaceBlurrer(blur_amount=99)
    
    # Test with classroom images
    test_images = [
        'data/classroom1.jfif',
        'data/classroom2.png',
        'data/classroom3.avif',
        'data/classroom5.jpg',
    ]
    
    for image_path in test_images:
        if not os.path.exists(image_path):
            print(f"⚠️  Skipping {image_path} (not found)")
            continue
        
        print(f"\n2. Processing: {image_path}")
        
        # Process image
        success, face_count, output_path, locations = blurrer.process_image_file(
            image_path,
            draw_boxes=False  # Set to True to see detection boxes
        )
        
        if success:
            print(f"   ✓ Success!")
            print(f"   ✓ Faces detected: {face_count}")
            print(f"   ✓ Output saved: {output_path}")
            if locations:
                print(f"   ✓ Face locations: {locations}")
        else:
            print(f"   ✗ Failed to process")
    
    print("\n" + "="*60)
    print("Test Complete!")
    print("="*60)
    print("\nCheck the output files (*_blurred.*) to verify face blurring")

if __name__ == '__main__':
    test_face_blur()
