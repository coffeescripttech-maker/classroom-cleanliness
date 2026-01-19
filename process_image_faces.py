"""
Quick script to process an uploaded image for face detection
"""

import sys
import os
import json
from utils.face_blur import FaceBlurrer
import mysql.connector
from pathlib import Path

def process_image_for_faces(image_id):
    """Process an image and update database with face detection results"""
    
    # Connect to database
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="classroom_cleanliness"
    )
    cursor = db.cursor(dictionary=True)
    
    try:
        # Get image info
        cursor.execute(
            "SELECT id, image_path FROM captured_images WHERE id = %s",
            (image_id,)
        )
        image = cursor.fetchone()
        
        if not image:
            print(f"❌ Image {image_id} not found")
            return False
        
        print(f"📸 Processing image: {image['image_path']}")
        
        # Build full path
        image_path = os.path.join('web-portal', 'public', 'uploads', image['image_path'])
        
        if not os.path.exists(image_path):
            print(f"❌ Image file not found: {image_path}")
            return False
        
        # Initialize face blurrer
        blurrer = FaceBlurrer(blur_amount=99)
        
        # Generate output path for blurred image
        path_parts = Path(image['image_path']).parts
        filename = path_parts[-1]
        blurred_filename = filename.replace('original_', 'blurred_')
        blurred_relative_path = str(Path(*path_parts[:-1]) / blurred_filename)
        blurred_full_path = os.path.join('web-portal', 'public', 'uploads', blurred_relative_path)
        
        # Process image
        print("🔍 Detecting faces...")
        success, face_count, output_path, face_locations = blurrer.process_image_file(
            image_path,
            blurred_full_path
        )
        
        if not success:
            print("❌ Failed to process image")
            return False
        
        print(f"✅ Detected {face_count} face(s)")
        
        # Update database
        if face_count > 0:
            cursor.execute(
                """UPDATE captured_images 
                   SET blurred_image_path = %s,
                       faces_detected = %s,
                       face_locations = %s
                   WHERE id = %s""",
                (blurred_relative_path, face_count, json.dumps(face_locations), image_id)
            )
        else:
            cursor.execute(
                """UPDATE captured_images 
                   SET faces_detected = 0,
                       face_locations = NULL
                   WHERE id = %s""",
                (image_id,)
            )
        
        db.commit()
        
        print(f"✅ Database updated!")
        print(f"   - Faces detected: {face_count}")
        if face_count > 0:
            print(f"   - Blurred image: {blurred_relative_path}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        cursor.close()
        db.close()


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python process_image_faces.py <image_id>")
        print("Example: python process_image_faces.py 29")
        sys.exit(1)
    
    image_id = int(sys.argv[1])
    success = process_image_for_faces(image_id)
    
    if success:
        print(f"\n✅ Done! Refresh the page: http://localhost:3000/dashboard/images/{image_id}")
    else:
        print("\n❌ Processing failed")
