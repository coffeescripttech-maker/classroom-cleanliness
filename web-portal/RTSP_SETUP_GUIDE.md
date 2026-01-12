# RTSP Camera Setup Guide

Quick guide to set up RTSP camera testing with OpenCV.

## Prerequisites

1. Python 3.8 or higher installed
2. pip package manager

## Installation

### Install OpenCV for RTSP Testing

```bash
cd web-portal/python-api
pip install -r requirements_rtsp.txt
```

Or install manually:

```bash
pip install opencv-python numpy
```

### For Headless Systems (Linux servers without GUI)

```bash
pip install opencv-python-headless numpy
```

## Testing the Installation

### Test Python Script Directly

```bash
# From project root (CLEANLENESS folder)
python web-portal/python-api/rtsp_capture.py test "rtsp://admin:password@192.168.1.100:554/cam/realmonitor?channel=1&subtype=0"
```

Expected output:
```json
{
  "success": true,
  "message": "RTSP connection successful",
  "data": {
    "resolution": "1920x1080",
    "fps": 25,
    "frame_captured": true
  }
}
```

### Test from Web Portal

1. Start Next.js server:
   ```bash
   cd web-portal
   npm run dev
   ```

2. Navigate to: http://localhost:3000/dashboard/cameras

3. Click "Stream" button on any camera card

4. If successful, you'll see:
   - Resolution (e.g., 1920x1080)
   - FPS (frames per second)
   - Confirmation that frame was captured

## Common Issues

### Issue 1: Python Not Found

**Error:** `'python' is not recognized as an internal or external command`

**Solution:**
- Install Python from https://www.python.org/downloads/
- Make sure to check "Add Python to PATH" during installation
- Restart your terminal/command prompt

### Issue 2: OpenCV Not Installed

**Error:** `No module named 'cv2'`

**Solution:**
```bash
pip install opencv-python
```

### Issue 3: RTSP Connection Timeout

**Error:** `Failed to open RTSP stream`

**Possible causes:**
1. Camera is offline or unreachable
2. Wrong IP address or port
3. Firewall blocking connection
4. Wrong RTSP path for your camera model

**Solutions:**
- Ping the camera: `ping 192.168.1.100`
- Check camera is powered on
- Verify IP address in camera settings
- Try accessing camera web interface: `http://192.168.1.100`
- Check firewall settings

### Issue 4: Authentication Failed

**Error:** `Connected to camera but failed to read frame`

**Possible causes:**
1. Wrong username or password
2. Camera requires different authentication method

**Solutions:**
- Verify credentials in camera web interface
- Try default Dahua credentials: admin/admin
- Check if camera requires digest authentication

### Issue 5: Wrong RTSP Path

**Error:** `Connected to camera but failed to read frame`

**Dahua CCTV Common Paths:**
- Main stream: `/cam/realmonitor?channel=1&subtype=0`
- Sub stream: `/cam/realmonitor?channel=1&subtype=1`
- Alternative: `/live/ch00_0`

**Try different paths:**
```bash
# Main stream (high quality)
rtsp://admin:password@192.168.1.100:554/cam/realmonitor?channel=1&subtype=0

# Sub stream (lower quality)
rtsp://admin:password@192.168.1.100:554/cam/realmonitor?channel=1&subtype=1
```

## Manual Testing Commands

### Test Connection Only
```bash
python web-portal/python-api/rtsp_capture.py test "rtsp://admin:password@192.168.1.100:554/cam/realmonitor?channel=1&subtype=0"
```

### Capture Single Frame
```bash
python web-portal/python-api/rtsp_capture.py capture "rtsp://admin:password@192.168.1.100:554/cam/realmonitor?channel=1&subtype=0" "test_frame.jpg"
```

### Capture Multiple Frames
```bash
# Capture 5 frames with 2 second interval
python web-portal/python-api/rtsp_capture.py capture_multiple "rtsp://admin:password@192.168.1.100:554/cam/realmonitor?channel=1&subtype=0" "output_folder" 5 2
```

## Dahua Camera Configuration

### Access Camera Web Interface

1. Open browser: `http://192.168.1.100`
2. Login with credentials (default: admin/admin)
3. Go to Setup → Network → RTSP
4. Verify RTSP is enabled
5. Note the port (default: 554)

### Enable RTSP (if disabled)

1. Login to camera web interface
2. Setup → Network → RTSP
3. Check "Enable RTSP"
4. Set port to 554
5. Save settings

### Find Camera IP Address

**Method 1: Use Dahua Config Tool**
- Download from Dahua website
- Scan network for cameras
- Shows all Dahua devices with IP addresses

**Method 2: Check Router**
- Login to your router admin panel
- Look for connected devices
- Find device with "Dahua" or camera MAC address

**Method 3: Use IP Scanner**
- Use tools like Advanced IP Scanner
- Scan your network range (e.g., 192.168.1.1-254)
- Look for devices on port 80 or 554

## Network Configuration

### Same Network Requirement

Camera and server must be on same network:
- Camera: 192.168.1.100
- Server: 192.168.1.x (same subnet)

### Port Forwarding (Optional)

If camera is on different network:
1. Configure port forwarding on router
2. Forward external port to camera IP:554
3. Use external IP in RTSP URL

### Firewall Rules

Allow outgoing connections on port 554:
```bash
# Windows Firewall
netsh advfirewall firewall add rule name="RTSP" dir=out action=allow protocol=TCP localport=554

# Linux iptables
sudo iptables -A OUTPUT -p tcp --dport 554 -j ACCEPT
```

## Performance Tips

### Use Sub Stream for Monitoring

Main stream (subtype=0) is high quality but uses more bandwidth.
Sub stream (subtype=1) is lower quality but faster.

```
# Main stream - for AI analysis
rtsp://admin:password@ip:554/cam/realmonitor?channel=1&subtype=0

# Sub stream - for live preview
rtsp://admin:password@ip:554/cam/realmonitor?channel=1&subtype=1
```

### Reduce Timeout for Faster Testing

Edit `rtsp_capture.py` and change timeout:
```python
def test_rtsp_connection(rtsp_url, timeout=5):  # Reduced from 10 to 5
```

### Buffer Size

For real-time streaming, reduce buffer:
```python
cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Minimal buffering
```

## Integration with AI Analysis

### Automated Capture and Analysis

Create a scheduled task to:
1. Capture frame from camera
2. Save to uploads folder
3. Trigger AI analysis
4. Store results in database

Example workflow:
```python
# Capture frame
result = capture_frame(rtsp_url, "uploads/classroom_101.jpg")

# Analyze with AI
response = requests.post("http://localhost:5000/analyze", 
                        files={"image": open("uploads/classroom_101.jpg", "rb")})

# Save to database
scores = response.json()["scores"]
# INSERT INTO cleanliness_scores...
```

## Next Steps

1. ✅ Install OpenCV: `pip install opencv-python`
2. ✅ Test Python script directly
3. ✅ Add cameras in web portal
4. ✅ Test camera connections
5. ✅ Test RTSP streams
6. 🔄 Set up automated capture (coming soon)
7. 🔄 Schedule periodic analysis (coming soon)

## Support

If you encounter issues:
1. Check camera is accessible: `ping <camera-ip>`
2. Test camera web interface: `http://<camera-ip>`
3. Verify RTSP port is open: `telnet <camera-ip> 554`
4. Check Python and OpenCV installation
5. Review error messages in browser console
6. Check Next.js server logs

## References

- OpenCV Documentation: https://docs.opencv.org/
- Dahua RTSP URLs: Check camera manual
- RTSP Protocol: RFC 2326
