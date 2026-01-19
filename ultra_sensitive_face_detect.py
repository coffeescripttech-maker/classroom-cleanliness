"""
Ultra-sensitive face detection with multiple methods
"""

import cv2
import sys
import os

def ultra_detect_faces(image_path):
    """Try multiple detection methods with very sensitive settings"""
    
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        return
    
    image = cv2.imread(image_path)
    if image is None:
        print(f"❌ Failed to load image")
        return
    
    print(f"📸 Image: {image.shape[1]}x{image.shape[0]} pixels")
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)
    
    result = image.copy()
    total_faces = 0
    
    # Try multiple cascades with very sensitive settings
    cascades = [
        ('frontalface_default', cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'),
        ('frontalface_alt', cv2.data.haarcascades + 'haarcascade_frontalface_alt.xml'),
        ('frontalface_alt2', cv2.data.haarcascades + 'haarcascade_frontalface_alt2.xml'),
        ('profileface', cv2.data.haarcascades + 'haarcascade_profileface.xml'),
    ]
    
    all_detections = []
    
    for name, cascade_path in cascades:
        cascade = cv2.CascadeClassifier(cascade_path)
        
        # Try with very sensitive settings
        for scale in [1.05, 1.1, 1.15]:
            for neighbors in [1, 2, 3]:
                faces = cascade.detectMultiScale(
                    gray,
                    scaleFactor=scale,
                    minNeighbors=neighbors,
                    minSize=(15, 15),  # Very small minimum
                    flags=cv2.CASCADE_SCALE_IMAGE
                )
                
                if len(faces) > 0:
                    print(f"✅ {name} (scale={scale}, neighbors={neighbors}): {len(faces)} face(s)")
                    for (x, y, w, h) in faces:
                        all_detections.append((x, y, w, h, name))
    
    # Draw all detections
    if len(all_detections) > 0:
        print(f"\n📊 Total detections: {len(all_detections)}")
        for i, (x, y, w, h, method) in enumerate(all_detections):
            color = (0, 255, 0) if i % 2 == 0 else (255, 0, 0)
            cv2.rectangle(result, (x, y), (x+w, y+h), color, 2)
            cv2.putText(result, f"{method[:8]}", (x, y-5), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.4, color, 1)
        
        debug_path = image_path.replace('.jpg', '_ultra_debug.jpg')
        cv2.imwrite(debug_path, result)
        print(f"✅ Saved: {debug_path}")
    else:
        print("\n❌ No faces detected with any method")
        print("This image likely doesn't contain detectable faces")
    
    return len(all_detections)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python ultra_sensitive_face_detect.py <image_path>")
        sys.exit(1)
    
    ultra_detect_faces(sys.argv[1])
