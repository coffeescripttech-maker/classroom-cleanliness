"""
Debug script to visualize face detection on an image
Shows detected faces with bounding boxes
"""

import cv2
import sys
import os
from utils.face_blur import FaceBlurrer

def debug_face_detection(image_path):
    """
    Debug face detection by showing the image with detected faces
    """
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        return
    
    # Load image
    image = cv2.imread(image_path)
    if image is None:
        print(f"❌ Failed to load image: {image_path}")
        return
    
    print(f"📸 Image loaded: {image.shape[1]}x{image.shape[0]} pixels")
    
    # Initialize face detector with more sensitive settings
    blurrer = FaceBlurrer(blur_amount=99, scale_factor=1.1, min_neighbors=3)
    
    # Detect faces
    faces = blurrer.detect_faces(image)
    print(f"✅ Detected {len(faces)} face(s)")
    
    # Draw rectangles around detected faces
    result = image.copy()
    for i, (x, y, w, h) in enumerate(faces):
        print(f"   Face {i+1}: x={x}, y={y}, width={w}, height={h}")
        cv2.rectangle(result, (x, y), (x+w, y+h), (0, 255, 0), 3)
        cv2.putText(result, f"Face {i+1}", (x, y-10), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
    
    # Save debug image
    debug_path = image_path.replace('.jpg', '_debug.jpg')
    cv2.imwrite(debug_path, result)
    print(f"✅ Debug image saved: {debug_path}")
    
    # Also create blurred version
    if len(faces) > 0:
        blurred_image, face_count, face_locations = blurrer.blur_faces(image)
        blurred_path = image_path.replace('.jpg', '_blurred_debug.jpg')
        cv2.imwrite(blurred_path, blurred_image)
        print(f"✅ Blurred image saved: {blurred_path}")
    
    return len(faces)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python debug_face_detection.py <image_path>")
        print("Example: python debug_face_detection.py web-portal/public/uploads/Grade-7/Section-A/2026-01-19/original_12-31-44.jpg")
        sys.exit(1)
    
    image_path = sys.argv[1]
    face_count = debug_face_detection(image_path)
    
    if face_count and face_count > 0:
        print(f"\n✅ Found {face_count} face(s)! Check the debug image to see the detections.")
    else:
        print("\n⚠️ No faces detected. This could mean:")
        print("   - The image doesn't contain visible faces")
        print("   - Faces are too small or at unusual angles")
        print("   - Lighting conditions make detection difficult")
        print("   - Faces are partially obscured")
