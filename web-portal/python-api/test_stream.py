"""
Test RTSP streaming endpoint
"""
import cv2
import mysql.connector
import os

# Database config
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',  # Update if you have a password
    'database': 'classroom_cleanliness'
}

camera_id = 14

try:
    # Connect to database
    print("Connecting to database...")
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)
    
    # Get camera details
    print(f"Fetching camera {camera_id}...")
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
        print(f"❌ Camera {camera_id} not found in database")
        exit(1)
    
    print(f"✓ Camera found: {camera['name']}")
    print(f"  Classroom: {camera['classroom_name']}")
    print(f"  IP: {camera['ip_address']}:{camera['port']}")
    
    # Build RTSP URL
    rtsp_path = camera.get('rtsp_path') or '/cam/realmonitor?channel=1&subtype=0'
    username = camera.get('username', 'admin')
    password = camera.get('password', 'admin')
    ip_address = camera['ip_address']
    port = camera['port']
    
    rtsp_url = f"rtsp://{username}:{password}@{ip_address}:{port}{rtsp_path}"
    
    print(f"\n📹 RTSP URL: rtsp://{username}:***@{ip_address}:{port}{rtsp_path}")
    print(f"\nAttempting to connect to stream...")
    
    # Try to open stream
    cap = cv2.VideoCapture(rtsp_url)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    
    if not cap.isOpened():
        print("❌ Failed to open RTSP stream")
        print("\nPossible issues:")
        print("1. Camera is offline or unreachable")
        print("2. Wrong credentials (username/password)")
        print("3. Wrong RTSP path")
        print("4. Network/firewall blocking connection")
        print("5. Camera doesn't support RTSP")
        exit(1)
    
    print("✓ Stream opened successfully!")
    
    # Try to read a frame
    print("\nReading test frame...")
    success, frame = cap.read()
    
    if not success:
        print("❌ Failed to read frame from stream")
        cap.release()
        exit(1)
    
    print(f"✓ Frame captured successfully!")
    print(f"  Resolution: {frame.shape[1]}x{frame.shape[0]}")
    print(f"  Channels: {frame.shape[2]}")
    
    # Try to encode as JPEG
    print("\nEncoding frame as JPEG...")
    ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
    
    if not ret:
        print("❌ Failed to encode frame as JPEG")
        cap.release()
        exit(1)
    
    print(f"✓ Frame encoded successfully!")
    print(f"  JPEG size: {len(buffer.tobytes())} bytes")
    
    cap.release()
    
    print("\n" + "="*60)
    print("✅ ALL TESTS PASSED!")
    print("="*60)
    print("\nThe streaming endpoint should work.")
    print("Make sure Python API is running:")
    print("  cd web-portal/python-api")
    print("  python app.py")
    
except mysql.connector.Error as e:
    print(f"❌ Database error: {e}")
    print("\nCheck:")
    print("1. MySQL is running")
    print("2. Database credentials are correct")
    print("3. Database 'classroom_cleanliness' exists")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
