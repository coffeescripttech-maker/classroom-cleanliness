"""
Schedule Checker Service
Runs every minute to check for scheduled captures and execute them automatically.
"""

import mysql.connector
import os
import sys
from datetime import datetime, time
import time as time_module
from pathlib import Path
import requests
import json

# Add parent directory to path to import rtsp_capture
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from rtsp_capture import capture_frame_from_rtsp

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'classroom_cleanliness')
}

# Upload directory
UPLOAD_DIR = Path(__file__).parent.parent / 'public' / 'uploads'
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# API endpoints
NEXT_API_BASE = os.getenv('NEXT_API_BASE', 'http://localhost:3000')
PYTHON_API_BASE = os.getenv('PYTHON_API_BASE', 'http://localhost:5000')


def get_db_connection():
    """Create database connection"""
    return mysql.connector.connect(**DB_CONFIG)


def log_message(message, level='INFO'):
    """Log message with timestamp"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{timestamp}] [{level}] {message}")


def get_active_schedules():
    """Get all active schedules that should run now"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get current time and day of week
        now = datetime.now()
        current_time = now.strftime('%H:%M:00')
        current_day = str(now.isoweekday())  # 1=Monday, 7=Sunday
        
        # Calculate time for pre-capture alarm (subtract pre_capture_delay from capture_time)
        # We need to check schedules that should trigger alarm now
        query = """
            SELECT 
                s.id,
                s.camera_id,
                s.name,
                s.capture_time,
                s.days_of_week,
                s.alarm_enabled,
                s.alarm_duration_seconds,
                s.pre_capture_delay_seconds,
                c.id as camera_id,
                c.name as camera_name,
                c.ip_address,
                c.port,
                c.username,
                c.password,
                c.rtsp_path,
                cl.id as classroom_id,
                cl.name as classroom_name,
                gl.name as grade_level,
                sec.name as section_name,
                TIME_FORMAT(
                    SUBTIME(
                        s.capture_time, 
                        SEC_TO_TIME(s.pre_capture_delay_seconds + s.alarm_duration_seconds)
                    ),
                    '%H:%i:00'
                ) as alarm_time
            FROM capture_schedules s
            JOIN cameras c ON s.camera_id = c.id
            JOIN classrooms cl ON c.classroom_id = cl.id
            JOIN sections sec ON cl.section_id = sec.id
            JOIN grade_levels gl ON sec.grade_level_id = gl.id
            WHERE s.active = TRUE
            AND c.status = 'active'
            HAVING alarm_time = %s
        """
        
        cursor.execute(query, (current_time,))
        schedules = cursor.fetchall()
        
        # Filter by day of week
        matching_schedules = []
        for schedule in schedules:
            days = schedule['days_of_week'].split(',')
            if current_day in days:
                matching_schedules.append(schedule)
        
        return matching_schedules
        
    finally:
        cursor.close()
        conn.close()


def play_alarm(duration_seconds):
    """Play custom alarm sound from WAV file"""
    log_message(f"🔔 Playing alarm for {duration_seconds} seconds")
    
    # Path to alarm sound file
    alarm_file = Path(__file__).parent.parent / 'public' / 'alarm1.wav'
    
    try:
        # Try pygame first (best for audio)
        try:
            import pygame
            pygame.mixer.init()
            pygame.mixer.music.load(str(alarm_file))
            
            # Calculate how many times to loop
            # Get duration of the sound file (approximate)
            sound = pygame.mixer.Sound(str(alarm_file))
            sound_duration = sound.get_length()
            loops = int(duration_seconds / sound_duration)
            
            log_message(f"🔊 Playing {alarm_file.name} ({loops} times)")
            
            # Play the sound repeatedly
            for i in range(loops):
                pygame.mixer.music.play()
                while pygame.mixer.music.get_busy():
                    time_module.sleep(0.1)
            
            pygame.mixer.quit()
            return
            
        except ImportError:
            log_message("⚠️  pygame not installed, trying winsound...", 'WARNING')
        
        # Fallback to winsound (Windows beep)
        import winsound
        if alarm_file.exists():
            # Play WAV file with winsound
            log_message(f"🔊 Playing {alarm_file.name} with winsound")
            winsound.PlaySound(str(alarm_file), winsound.SND_FILENAME)
        else:
            # File not found, use system beep
            log_message(f"⚠️  Alarm file not found: {alarm_file}", 'WARNING')
            log_message("🔔 Using system beep instead")
            beeps = duration_seconds * 2
            for i in range(beeps):
                winsound.Beep(1000, 500)
                if i < beeps - 1:
                    time_module.sleep(0.5)
                    
    except Exception as e:
        log_message(f"⚠️  Could not play alarm sound: {e}", 'WARNING')
        # Fallback to silent wait
        time_module.sleep(duration_seconds)


def capture_from_camera(schedule):
    """Capture image from camera via RTSP"""
    try:
        # Build RTSP URL
        rtsp_url = f"rtsp://{schedule['username']}:{schedule['password']}@{schedule['ip_address']}:{schedule['port']}{schedule['rtsp_path']}"
        
        # Generate filename
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
        
        # Use hyphenated folder names (no spaces)
        grade_folder = schedule['grade_level'].replace(' ', '-')
        section_folder = schedule['section_name'].replace(' ', '-')
        date_folder = datetime.now().strftime('%Y-%m-%d')
        
        folder_path = UPLOAD_DIR / grade_folder / section_folder / date_folder
        folder_path.mkdir(parents=True, exist_ok=True)
        
        filename = f"original_{datetime.now().strftime('%H-%M-%S')}.jpg"
        image_path = folder_path / filename
        
        log_message(f"📸 Capturing from camera: {schedule['camera_name']}")
        
        # Capture frame
        success = capture_frame_from_rtsp(rtsp_url, str(image_path))
        
        if success:
            # Return path relative to uploads directory (for database storage)
            relative_path = f"{grade_folder}/{section_folder}/{date_folder}/{filename}"
            log_message(f"✅ Image captured: {image_path}")
            return relative_path
        else:
            log_message(f"❌ Failed to capture from camera: {schedule['camera_name']}", 'ERROR')
            return None
            
    except Exception as e:
        log_message(f"❌ Error capturing from camera: {str(e)}", 'ERROR')
        return None


def save_image_to_database(schedule, image_path):
    """Save captured image to database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        query = """
            INSERT INTO captured_images 
            (classroom_id, schedule_id, image_path, captured_at)
            VALUES (%s, %s, %s, NOW())
        """
        
        cursor.execute(query, (
            schedule['classroom_id'],
            schedule['id'],
            image_path
        ))
        
        conn.commit()
        image_id = cursor.lastrowid
        
        log_message(f"💾 Image saved to database (ID: {image_id})")
        return image_id
        
    except Exception as e:
        log_message(f"❌ Error saving to database: {str(e)}", 'ERROR')
        conn.rollback()
        return None
    finally:
        cursor.close()
        conn.close()


def trigger_ai_analysis(image_id):
    """Trigger AI analysis for the captured image"""
    try:
        log_message(f"🤖 Triggering AI analysis for image {image_id}")
        
        # Call the Next.js API endpoint
        response = requests.post(
            f"{NEXT_API_BASE}/api/images/analyze",
            json={'image_id': image_id},
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            log_message(f"✅ AI analysis completed: Score {result.get('total_score', 'N/A')}")
            return True
        else:
            log_message(f"❌ AI analysis failed: {response.status_code}", 'ERROR')
            return False
            
    except Exception as e:
        log_message(f"❌ Error triggering AI analysis: {str(e)}", 'ERROR')
        return False


def update_camera_last_capture(camera_id):
    """Update camera's last capture timestamp"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        query = "UPDATE cameras SET last_capture = NOW() WHERE id = %s"
        cursor.execute(query, (camera_id,))
        conn.commit()
    except Exception as e:
        log_message(f"❌ Error updating camera timestamp: {str(e)}", 'ERROR')
    finally:
        cursor.close()
        conn.close()


def execute_schedule(schedule):
    """Execute a single schedule"""
    log_message(f"\n{'='*60}")
    log_message(f"🎯 Executing schedule: {schedule['name']}")
    log_message(f"   Camera: {schedule['camera_name']}")
    log_message(f"   Classroom: {schedule['classroom_name']}")
    log_message(f"   Capture Time: {schedule['capture_time']}")
    log_message(f"{'='*60}")
    
    try:
        # Step 1: Play alarm if enabled
        if schedule['alarm_enabled']:
            log_message(f"🔔 Playing alarm for {schedule['alarm_duration_seconds']}s")
            play_alarm(schedule['alarm_duration_seconds'])
        
        # Step 2: Wait for pre-capture delay (students clean up)
        if schedule['pre_capture_delay_seconds'] > 0:
            minutes = schedule['pre_capture_delay_seconds'] // 60
            log_message(f"⏳ Waiting {schedule['pre_capture_delay_seconds']}s ({minutes} min) for cleanup...")
            time_module.sleep(schedule['pre_capture_delay_seconds'])
        
        log_message(f"📸 Capture time reached: {schedule['capture_time']}")
        
        # Step 3: Capture image
        image_path = capture_from_camera(schedule)
        if not image_path:
            log_message(f"❌ Schedule execution failed: Could not capture image", 'ERROR')
            return False
        
        # Step 4: Save to database
        image_id = save_image_to_database(schedule, image_path)
        if not image_id:
            log_message(f"❌ Schedule execution failed: Could not save to database", 'ERROR')
            return False
        
        # Step 5: Update camera timestamp
        update_camera_last_capture(schedule['camera_id'])
        
        # Step 6: Trigger AI analysis
        trigger_ai_analysis(image_id)
        
        log_message(f"✅ Schedule executed successfully!")
        return True
        
    except Exception as e:
        log_message(f"❌ Schedule execution failed: {str(e)}", 'ERROR')
        return False


def check_schedules():
    """Main function to check and execute schedules"""
    log_message("🔍 Checking for scheduled captures...")
    
    schedules = get_active_schedules()
    
    if not schedules:
        log_message("   No schedules to execute at this time")
        return
    
    log_message(f"   Found {len(schedules)} schedule(s) to execute")
    
    for schedule in schedules:
        execute_schedule(schedule)


def main():
    """Main loop - runs every minute"""
    log_message("🚀 Schedule Checker Service Started")
    log_message(f"   Database: {DB_CONFIG['database']}@{DB_CONFIG['host']}")
    log_message(f"   Upload Directory: {UPLOAD_DIR}")
    log_message(f"   Checking every 60 seconds...")
    
    while True:
        try:
            check_schedules()
        except Exception as e:
            log_message(f"❌ Error in main loop: {str(e)}", 'ERROR')
        
        # Wait 60 seconds before next check
        time_module.sleep(60)


if __name__ == '__main__':
    main()
