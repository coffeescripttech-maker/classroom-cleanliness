"""
Python Flask API Bridge
Connects Next.js web portal to Python AI system
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import cv2
from datetime import datetime

# Add parent directory (CLEANLENESS) to path to import main
parent_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, parent_dir)

try:
    from main import ClassroomCleanliness
    MAIN_IMPORTED = True
except ImportError as e:
    print(f"Warning: Could not import main.py: {e}")
    print(f"Looking in: {parent_dir}")
    print("The API will run but analysis will not work until main.py is accessible.")
    MAIN_IMPORTED = False
    ClassroomCleanliness = None

# Import face blurring utility
try:
    utils_dir = os.path.join(parent_dir, 'utils')
    sys.path.insert(0, utils_dir)
    from face_blur import FaceBlurrer
    FACE_BLUR_AVAILABLE = True
    print("✓ Face blurring utility loaded")
except ImportError as e:
    print(f"Warning: Could not import face_blur: {e}")
    FACE_BLUR_AVAILABLE = False
    FaceBlurrer = None

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js

# Initialize AI system
ai_system = None
if MAIN_IMPORTED and ClassroomCleanliness:
    try:
        print("Initializing AI system...")
        ai_system = ClassroomCleanliness(use_owlvit=True)
        print("✓ AI system ready!")
    except Exception as e:
        print(f"Warning: Could not initialize AI system: {e}")
        print("The API will run but analysis will not work.")
else:
    print("⚠️  AI system not initialized - main.py not found")
    print("The API will run in demo mode.")

# Initialize face blurrer
face_blurrer = None
if FACE_BLUR_AVAILABLE and FaceBlurrer:
    try:
        print("Initializing face blurrer...")
        face_blurrer = FaceBlurrer(blur_amount=99)
        print("✓ Face blurrer ready!")
    except Exception as e:
        print(f"Warning: Could not initialize face blurrer: {e}")
        print("Face blurring will be disabled.")
else:
    print("⚠️  Face blurrer not initialized")

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy' if ai_system else 'limited',
        'message': 'Python AI API is running',
        'ai_system_ready': ai_system is not None,
        'owlvit_enabled': ai_system.use_owlvit if ai_system else False
    })

@app.route('/api/analyze', methods=['POST'])
def analyze_image():
    """
    Analyze classroom image
    
    Request body:
    {
        "image_path": "path/to/image.jpg",
        "classroom_id": "Room 101",
        "use_owlvit": true
    }
    """
    try:
        # Check if AI system is available
        if not ai_system:
            return jsonify({
                'success': False,
                'error': 'AI system not initialized. Please ensure main.py is accessible.'
            }), 503
        
        data = request.json
        image_path = data.get('image_path')
        classroom_id = data.get('classroom_id')
        use_owlvit = data.get('use_owlvit', True)
        
        if not image_path or not classroom_id:
            return jsonify({
                'success': False,
                'error': 'image_path and classroom_id are required'
            }), 400
        
        # Check if file exists
        if not os.path.exists(image_path):
            return jsonify({
                'success': False,
                'error': f'Image file not found: {image_path}'
            }), 404
        
        # Step 1: Blur faces for privacy (if available)
        blurred_image_path = None
        face_count = 0
        face_locations = []
        
        if face_blurrer:
            try:
                print(f"🔒 Blurring faces in image...")
                
                # Parse original image path to extract Grade/Section structure
                path_parts = image_path.replace('\\', '/').split('/')
                
                # Find Grade and Section folders
                grade_folder = None
                section_folder = None
                for i, part in enumerate(path_parts):
                    if part.startswith('Grade-'):
                        grade_folder = part
                        if i + 1 < len(path_parts) and path_parts[i + 1].startswith('Section-'):
                            section_folder = path_parts[i + 1]
                        break
                
                # Get original filename
                original_filename = os.path.basename(image_path)
                name_without_ext = os.path.splitext(original_filename)[0]
                
                # Create date folder (YYYY-MM-DD format)
                date_folder = datetime.now().strftime('%Y-%m-%d')
                
                # Create blurred filename
                time_str = datetime.now().strftime('%H-%M-%S')
                blurred_filename = f"blurred_{time_str}.jpg"
                
                # Build organized path
                if grade_folder and section_folder:
                    relative_path = os.path.join(grade_folder, section_folder, date_folder, blurred_filename)
                else:
                    relative_path = os.path.join(date_folder, blurred_filename)
                
                # Full path for saving
                web_portal_path = os.path.join(
                    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                    'public', 'uploads', relative_path
                )
                
                # Ensure directory exists
                os.makedirs(os.path.dirname(web_portal_path), exist_ok=True)
                
                # Blur faces
                success, face_count, _, face_locations = face_blurrer.process_image_file(
                    image_path,
                    web_portal_path,
                    draw_boxes=False
                )
                
                if success:
                    blurred_image_path = relative_path.replace('\\', '/')
                    print(f"✓ Faces blurred: {face_count} face(s) detected")
                    print(f"✓ Blurred image saved: {blurred_image_path}")
                else:
                    print(f"⚠️  Face blurring failed, continuing with original image")
                    
            except Exception as e:
                print(f"⚠️  Error during face blurring: {e}")
                import traceback
                traceback.print_exc()
                # Continue without face blurring
        else:
            print("⚠️  Face blurrer not available, skipping face detection")
        
        # Step 2: Analyze classroom (use blurred image if available, otherwise original)
        analysis_image_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            'public', 'uploads', blurred_image_path
        ) if blurred_image_path else image_path
        
        print(f"Analyzing {classroom_id}: {analysis_image_path}")
        result = ai_system.analyze_classroom(analysis_image_path, classroom_id)
        
        if result is None:
            return jsonify({
                'success': False,
                'error': 'Analysis failed'
            }), 500
        
        # Debug: Check what's in result
        print(f"DEBUG: Result keys: {result.keys()}")
        print(f"DEBUG: Has annotated_image: {'annotated_image' in result}")
        if 'annotated_image' in result:
            print(f"DEBUG: annotated_image is None: {result['annotated_image'] is None}")
            if result['annotated_image'] is not None:
                print(f"DEBUG: annotated_image shape: {result['annotated_image'].shape}")
        
        # Save annotated image with detections drawn by OpenCV
        annotated_image_path = None
        if 'annotated_image' in result and result['annotated_image'] is not None:
            try:
                # Parse original image path to extract Grade/Section structure
                # Expected format: uploads/Grade-X/Section-Y/image.jpg
                path_parts = image_path.replace('\\', '/').split('/')
                
                # Find Grade and Section folders
                grade_folder = None
                section_folder = None
                for i, part in enumerate(path_parts):
                    if part.startswith('Grade-'):
                        grade_folder = part
                        if i + 1 < len(path_parts) and path_parts[i + 1].startswith('Section-'):
                            section_folder = path_parts[i + 1]
                        break
                
                # Get original filename
                original_filename = os.path.basename(image_path)
                name_without_ext = os.path.splitext(original_filename)[0]
                
                # Create date folder (YYYY-MM-DD format)
                date_folder = datetime.now().strftime('%Y-%m-%d')
                
                # Create annotated filename with time only (since date is in folder)
                time_str = datetime.now().strftime('%H-%M-%S')
                annotated_filename = f"annotated_{time_str}.jpg"
                
                # Build organized path: Grade-X/Section-Y/YYYY-MM-DD/annotated_HH-MM-SS.jpg
                if grade_folder and section_folder:
                    relative_path = os.path.join(grade_folder, section_folder, date_folder, annotated_filename)
                else:
                    # Fallback: just use date folder
                    relative_path = os.path.join(date_folder, annotated_filename)
                
                # Full path for saving
                web_portal_path = os.path.join(
                    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                    'public', 'uploads', relative_path
                )
                
                print(f"DEBUG: Organized path: {relative_path}")
                print(f"DEBUG: Saving to: {web_portal_path}")
                
                # Ensure directory exists
                os.makedirs(os.path.dirname(web_portal_path), exist_ok=True)
                
                # Save annotated image
                success = cv2.imwrite(web_portal_path, result['annotated_image'])
                
                if success:
                    # Return relative path for web access (with forward slashes)
                    annotated_image_path = relative_path.replace('\\', '/')
                    print(f"✓ Saved annotated image: {annotated_image_path}")
                else:
                    print(f"✗ Failed to save annotated image with cv2.imwrite")
                
            except Exception as e:
                print(f"Warning: Could not save annotated image: {e}")
                import traceback
                traceback.print_exc()
                # Continue without annotated image
        else:
            print("DEBUG: No annotated_image in result or it is None")
        
        # Format response
        response = {
            'success': True,
            'scores': result['scores'],
            'total_score': result['total_score'],
            'rating': result['rating'],
            'detections': result.get('detections', []),
            'annotated_image_path': annotated_image_path,  # Annotated with detections
            'blurred_image_path': blurred_image_path,      # NEW: Blurred for privacy
            'faces_detected': face_count,                   # NEW: Number of faces
            'face_locations': face_locations,               # NEW: Face coordinates
            'classroom_id': classroom_id
        }
        
        print(f"✓ Analysis complete: {result['total_score']}/50 ({result['rating']})")
        print(f"DEBUG: Returning annotated_image_path: {annotated_image_path}")
        print(f"DEBUG: Returning blurred_image_path: {blurred_image_path}")
        print(f"DEBUG: Faces detected: {face_count}")
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error analyzing image: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/batch-analyze', methods=['POST'])
def batch_analyze():
    """
    Analyze multiple images
    
    Request body:
    {
        "images": [
            {"image_path": "...", "classroom_id": "..."},
            {"image_path": "...", "classroom_id": "..."}
        ]
    }
    """
    try:
        # Check if AI system is available
        if not ai_system:
            return jsonify({
                'success': False,
                'error': 'AI system not initialized. Please ensure main.py is accessible.'
            }), 503
        
        data = request.json
        images = data.get('images', [])
        
        if not images:
            return jsonify({
                'success': False,
                'error': 'images array is required'
            }), 400
        
        results = []
        
        for img in images:
            image_path = img.get('image_path')
            classroom_id = img.get('classroom_id')
            
            if not image_path or not classroom_id:
                results.append({
                    'success': False,
                    'error': 'Missing image_path or classroom_id',
                    'classroom_id': classroom_id
                })
                continue
            
            try:
                result = ai_system.analyze_classroom(image_path, classroom_id)
                
                results.append({
                    'success': True,
                    'scores': result['scores'],
                    'total_score': result['total_score'],
                    'rating': result['rating'],
                    'classroom_id': classroom_id
                })
            except Exception as e:
                results.append({
                    'success': False,
                    'error': str(e),
                    'classroom_id': classroom_id
                })
        
        return jsonify({
            'success': True,
            'results': results,
            'total': len(results),
            'successful': sum(1 for r in results if r['success'])
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/detect-faces', methods=['POST'])
def detect_faces():
    """
    Detect and blur faces in an uploaded image
    
    Request body:
    {
        "image_id": 123,
        "image_path": "/full/path/to/image.jpg",
        "relative_path": "Grade-7/Section-A/2026-01-19/original_12-31-44.jpg"
    }
    """
    try:
        if not face_blurrer:
            return jsonify({
                'success': False,
                'error': 'Face blurrer not initialized'
            }), 503
        
        data = request.json
        image_id = data.get('image_id')
        image_path = data.get('image_path')
        relative_path = data.get('relative_path')
        
        if not image_id or not image_path or not relative_path:
            return jsonify({
                'success': False,
                'error': 'image_id, image_path, and relative_path are required'
            }), 400
        
        # Check if file exists
        if not os.path.exists(image_path):
            return jsonify({
                'success': False,
                'error': f'Image file not found: {image_path}'
            }), 404
        
        print(f"🔍 Detecting faces in image {image_id}...")
        
        # Generate blurred image path
        path_parts = relative_path.split('/')
        filename = path_parts[-1]
        blurred_filename = filename.replace('original_', 'blurred_')
        blurred_relative_path = '/'.join(path_parts[:-1] + [blurred_filename])
        
        # Full path for blurred image
        blurred_full_path = os.path.join(
            os.path.dirname(image_path),
            blurred_filename
        )
        
        # Process face detection and blurring
        success, face_count, output_path, face_locations = face_blurrer.process_image_file(
            image_path,
            blurred_full_path,
            draw_boxes=False
        )
        
        if not success:
            return jsonify({
                'success': False,
                'error': 'Failed to process image'
            }), 500
        
        # Update database
        import mysql.connector
        db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'user': os.getenv('DB_USER', 'root'),
            'password': os.getenv('DB_PASSWORD', ''),
            'database': os.getenv('DB_NAME', 'classroom_cleanliness')
        }
        
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        if face_count > 0:
            import json
            cursor.execute("""
                UPDATE captured_images 
                SET blurred_image_path = %s,
                    faces_detected = %s,
                    face_locations = %s
                WHERE id = %s
            """, (blurred_relative_path, face_count, json.dumps(face_locations), image_id))
        else:
            cursor.execute("""
                UPDATE captured_images 
                SET faces_detected = 0,
                    face_locations = NULL
                WHERE id = %s
            """, (image_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✅ Face detection complete: {face_count} face(s) detected")
        
        return jsonify({
            'success': True,
            'faces_detected': face_count,
            'blurred_image_path': blurred_relative_path if face_count > 0 else None,
            'face_locations': face_locations
        })
        
    except Exception as e:
        print(f"Error in face detection: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/camera/stream/<int:camera_id>', methods=['GET'])
def stream_camera(camera_id):
    """
    Stream RTSP camera as MJPEG
    This endpoint continuously streams frames from the RTSP camera
    """
    try:
        # Import here to avoid issues if not installed
        import cv2
        from flask import Response
        import mysql.connector
        import os
        
        # Get database credentials from environment or use defaults
        db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'user': os.getenv('DB_USER', 'root'),
            'password': os.getenv('DB_PASSWORD', ''),
            'database': os.getenv('DB_NAME', 'classroom_cleanliness')
        }
        
        # Get camera details from database
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT c.*, cl.name as classroom_name
            FROM cameras c
            LEFT JOIN classrooms cl ON c.classroom_id = cl.id
            WHERE c.id = %s
        """, (camera_id,))
        
        camera = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not camera:
            return jsonify({
                'success': False,
                'error': 'Camera not found'
            }), 404
        
        # Build RTSP URL
        rtsp_path = camera.get('rtsp_path') or '/cam/realmonitor?channel=1&subtype=0'
        username = camera.get('username', 'admin')
        password = camera.get('password', 'admin')
        ip_address = camera['ip_address']
        port = camera['port']
        
        rtsp_url = f"rtsp://{username}:{password}@{ip_address}:{port}{rtsp_path}"
        
        print(f"Streaming from: rtsp://{username}:***@{ip_address}:{port}{rtsp_path}")
        
        def generate_frames():
            cap = cv2.VideoCapture(rtsp_url)
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Reduce latency
            
            if not cap.isOpened():
                print(f"Failed to open RTSP stream: {rtsp_url}")
                return
            
            try:
                while True:
                    success, frame = cap.read()
                    if not success:
                        print("Failed to read frame from stream")
                        break
                    
                    # Resize frame for better performance (optional)
                    frame = cv2.resize(frame, (1280, 720))
                    
                    # Encode frame as JPEG
                    ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
                    if not ret:
                        continue
                    
                    frame_bytes = buffer.tobytes()
                    
                    # Yield frame in multipart format
                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            
            except Exception as e:
                print(f"Error in frame generation: {e}")
            finally:
                cap.release()
                print("Stream closed")
        
        return Response(
            generate_frames(),
            mimetype='multipart/x-mixed-replace; boundary=frame'
        )
    
    except Exception as e:
        print(f"Stream error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("Python AI API Server")
    print("="*60)
    print("Starting server on http://localhost:5000")
    print("Endpoints:")
    print("  GET  /api/health")
    print("  POST /api/analyze")
    print("  POST /api/batch-analyze")
    print("  POST /detect-faces")
    print("  GET  /api/camera/stream/<camera_id>")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
