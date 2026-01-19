"""
RTSP Camera Capture Script for Dahua CCTV Cameras
This script captures frames from RTSP streams and can be used for:
1. Testing camera connections
2. Automated frame capture for AI analysis
3. Scheduled captures for classroom monitoring
"""

import cv2
import sys
import json
from datetime import datetime
import os

def test_rtsp_connection(rtsp_url, timeout=10):
    """
    Test RTSP connection and capture a single frame
    
    Args:
        rtsp_url: Full RTSP URL (rtsp://username:password@ip:port/path)
        timeout: Connection timeout in seconds
    
    Returns:
        dict: Result with success status and message
    """
    try:
        # Open video capture
        cap = cv2.VideoCapture(rtsp_url)
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        
        # Set timeout (in milliseconds)
        cap.set(cv2.CAP_PROP_OPEN_TIMEOUT_MSEC, timeout * 1000)
        
        if not cap.isOpened():
            return {
                'success': False,
                'error': 'Failed to open RTSP stream. Check IP, port, credentials, and network connectivity.'
            }
        
        # Try to read a frame
        ret, frame = cap.read()
        
        if not ret or frame is None:
            cap.release()
            return {
                'success': False,
                'error': 'Connected to camera but failed to read frame. Check RTSP path and camera settings.'
            }
        
        # Get stream properties
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        
        cap.release()
        
        return {
            'success': True,
            'message': 'RTSP connection successful',
            'data': {
                'resolution': f'{width}x{height}',
                'fps': fps if fps > 0 else 'Unknown',
                'frame_captured': True
            }
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'Exception during RTSP test: {str(e)}'
        }

def capture_frame_from_rtsp(rtsp_url, output_path, timeout=10):
    """
    Capture a single frame from RTSP stream and save to file
    Simple wrapper for schedule_checker compatibility
    
    Args:
        rtsp_url: Full RTSP URL
        output_path: Path to save the captured image
        timeout: Connection timeout in seconds
    
    Returns:
        bool: True if successful, False otherwise
    """
    result = capture_frame(rtsp_url, output_path, timeout)
    return result['success']


def capture_frame(rtsp_url, output_path, timeout=10):
    """
    Capture a single frame from RTSP stream and save to file
    
    Args:
        rtsp_url: Full RTSP URL
        output_path: Path to save the captured image
        timeout: Connection timeout in seconds
    
    Returns:
        dict: Result with success status and file path
    """
    try:
        cap = cv2.VideoCapture(rtsp_url)
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        cap.set(cv2.CAP_PROP_OPEN_TIMEOUT_MSEC, timeout * 1000)
        
        if not cap.isOpened():
            return {
                'success': False,
                'error': 'Failed to open RTSP stream'
            }
        
        # Read frame
        ret, frame = cap.read()
        cap.release()
        
        if not ret or frame is None:
            return {
                'success': False,
                'error': 'Failed to capture frame'
            }
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Save frame
        cv2.imwrite(output_path, frame)
        
        return {
            'success': True,
            'message': 'Frame captured successfully',
            'data': {
                'file_path': output_path,
                'timestamp': datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'Exception during frame capture: {str(e)}'
        }

def capture_multiple_frames(rtsp_url, output_dir, count=5, interval=1, timeout=10):
    """
    Capture multiple frames from RTSP stream
    
    Args:
        rtsp_url: Full RTSP URL
        output_dir: Directory to save captured images
        count: Number of frames to capture
        interval: Seconds between captures
        timeout: Connection timeout in seconds
    
    Returns:
        dict: Result with list of captured files
    """
    try:
        cap = cv2.VideoCapture(rtsp_url)
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        cap.set(cv2.CAP_PROP_OPEN_TIMEOUT_MSEC, timeout * 1000)
        
        if not cap.isOpened():
            return {
                'success': False,
                'error': 'Failed to open RTSP stream'
            }
        
        os.makedirs(output_dir, exist_ok=True)
        captured_files = []
        
        for i in range(count):
            ret, frame = cap.read()
            
            if not ret or frame is None:
                continue
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f'capture_{timestamp}_{i+1}.jpg'
            filepath = os.path.join(output_dir, filename)
            
            cv2.imwrite(filepath, frame)
            captured_files.append(filepath)
            
            # Wait for interval (skip for last frame)
            if i < count - 1:
                import time
                time.sleep(interval)
        
        cap.release()
        
        return {
            'success': True,
            'message': f'Captured {len(captured_files)} frames',
            'data': {
                'files': captured_files,
                'count': len(captured_files)
            }
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'Exception during multiple frame capture: {str(e)}'
        }

if __name__ == '__main__':
    # Command line usage
    if len(sys.argv) < 3:
        print(json.dumps({
            'success': False,
            'error': 'Usage: python rtsp_capture.py <command> <rtsp_url> [options]',
            'commands': {
                'test': 'Test RTSP connection',
                'capture': 'Capture single frame (requires output_path)',
                'capture_multiple': 'Capture multiple frames (requires output_dir, count, interval)'
            }
        }))
        sys.exit(1)
    
    command = sys.argv[1]
    rtsp_url = sys.argv[2]
    
    if command == 'test':
        result = test_rtsp_connection(rtsp_url)
        print(json.dumps(result))
    
    elif command == 'capture':
        if len(sys.argv) < 4:
            print(json.dumps({
                'success': False,
                'error': 'Output path required for capture command'
            }))
            sys.exit(1)
        
        output_path = sys.argv[3]
        result = capture_frame(rtsp_url, output_path)
        print(json.dumps(result))
    
    elif command == 'capture_multiple':
        if len(sys.argv) < 6:
            print(json.dumps({
                'success': False,
                'error': 'Usage: python rtsp_capture.py capture_multiple <rtsp_url> <output_dir> <count> <interval>'
            }))
            sys.exit(1)
        
        output_dir = sys.argv[3]
        count = int(sys.argv[4])
        interval = int(sys.argv[5])
        result = capture_multiple_frames(rtsp_url, output_dir, count, interval)
        print(json.dumps(result))
    
    else:
        print(json.dumps({
            'success': False,
            'error': f'Unknown command: {command}'
        }))
        sys.exit(1)
