# 📹 Live RTSP Streaming Setup Guide

## Overview

The system now supports **live RTSP streaming** directly in the browser! Click the "Stream" button on any camera to view real-time video.

---

## 🔧 Setup Requirements

### 1. Install Python Dependencies

```bash
cd web-portal/python-api
pip install -r requirements_streaming.txt
```

**Packages installed:**
- `opencv-python` - For RTSP stream processing
- `mysql-connector-python` - For database access
- `flask` - Web server
- `flask-cors` - CORS support

### 2. Configure Database Connection

The Python API needs database credentials to fetch camera details.

**Option A: Environment Variables** (Recommended)
```bash
# Windows PowerShell
$env:DB_HOST="localhost"
$env:DB_USER="root"
$env:DB_PASSWORD="your_password"
$env:DB_NAME="classroom_cleanliness"

# Windows CMD
set DB_HOST=localhost
set DB_USER=root
set DB_PASSWORD=your_password
set DB_NAME=classroom_cleanliness
```

**Option B: Defaults**
If no environment variables are set, it uses:
- Host: `localhost`
- User: `root`
- Password: `` (empty)
- Database: `classroom_cleanliness`

### 3. Restart Python API

```bash
cd web-portal/python-api
python app.py
```

You should see:
```
============================================================
Python AI API Server
============================================================
Starting server on http://localhost:5000
```

---

## 🎥 How to Use

### 1. Navigate to Cameras Page
```
http://localhost:3000/dashboard/cameras
```

### 2. Click "Stream" Button
- Click the green "Stream" button on any camera card
- A modal will open showing the live feed

### 3. View Live Stream
- The stream shows real-time video from your RTSP camera
- Camera info is displayed below the video
- Click "Close" to stop streaming

---

## 🔄 How It Works

### Architecture

```
Browser (Next.js)
    ↓ Click "Stream"
    ↓
Next.js API (/api/cameras/[id]/stream)
    ↓ Get stream URL
    ↓
Python Flask API (/api/camera/stream/<id>)
    ↓ Query database for camera details
    ↓ Build RTSP URL
    ↓ Connect to camera
    ↓ Convert RTSP → MJPEG
    ↓
Browser displays MJPEG stream in <img> tag
```

### Technical Details

**RTSP to MJPEG Conversion:**
1. Python connects to RTSP stream using OpenCV
2. Reads frames continuously
3. Encodes each frame as JPEG
4. Streams as multipart/x-mixed-replace
5. Browser displays as live video

**Performance Optimizations:**
- Buffer size reduced to 1 frame (low latency)
- Frames resized to 1280x720 (faster encoding)
- JPEG quality set to 80% (balance quality/speed)

---

## 📊 Stream Information

### Default Settings
- **Resolution:** 1280x720 (resized from camera)
- **JPEG Quality:** 80%
- **Buffer Size:** 1 frame (minimal latency)
- **Format:** MJPEG (Motion JPEG)

### Bandwidth Usage
- **Approximate:** 1-3 Mbps per stream
- **Depends on:** Scene complexity, motion, quality

---

## 🐛 Troubleshooting

### Issue: "Stream Unavailable" Error

**Possible Causes:**
1. Python API not running
2. Camera offline or unreachable
3. Wrong RTSP credentials
4. Network firewall blocking RTSP port

**Solutions:**
```bash
# 1. Check Python API is running
curl http://localhost:5000/api/health

# 2. Test camera connection first
# Click "Config" button to validate camera

# 3. Check camera credentials in database
# Verify username/password are correct

# 4. Test RTSP URL directly
ffplay "rtsp://username:password@ip:port/path"
```

### Issue: Stream is Slow/Laggy

**Solutions:**
1. **Reduce resolution** in `app.py`:
   ```python
   frame = cv2.resize(frame, (640, 480))  # Lower resolution
   ```

2. **Lower JPEG quality**:
   ```python
   cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 60])
   ```

3. **Check network bandwidth**
4. **Ensure camera is on same network**

### Issue: "mysql.connector not found"

**Solution:**
```bash
pip install mysql-connector-python
```

### Issue: Stream works but image doesn't load

**Cause:** CORS or browser security

**Solution:**
- Ensure Python API has `flask-cors` installed
- Check browser console for errors
- Try different browser

---

## 🔐 Security Considerations

### 1. Password Exposure
- RTSP URLs contain passwords
- Passwords are masked in UI (`***`)
- Never log full RTSP URLs in production

### 2. Network Security
- RTSP streams are unencrypted
- Use VPN or secure network
- Consider RTSP over TLS (RTSPS)

### 3. Access Control
- Add authentication to streaming endpoint
- Limit who can view streams
- Implement session management

---

## 🚀 Advanced Configuration

### Custom Stream Settings

Edit `web-portal/python-api/app.py`:

```python
# Change resolution
frame = cv2.resize(frame, (1920, 1080))  # Full HD

# Change JPEG quality (0-100)
cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 95])

# Change buffer size (frames)
cap.set(cv2.CAP_PROP_BUFFERSIZE, 3)  # More buffering
```

### Multiple Simultaneous Streams

The system supports multiple users viewing different cameras simultaneously. Each stream is independent.

**Limitations:**
- Server CPU/bandwidth
- Camera concurrent connection limit
- Network capacity

---

## 📝 API Endpoints

### Get Stream URL
```
GET /api/cameras/[id]/stream
```

**Response:**
```json
{
  "success": true,
  "data": {
    "streamUrl": "http://localhost:5000/api/camera/stream/1",
    "camera": {
      "id": 1,
      "name": "Main Camera",
      "classroom": "Room 101"
    }
  }
}
```

### Stream Video (Python)
```
GET /api/camera/stream/<camera_id>
```

**Response:** MJPEG stream (multipart/x-mixed-replace)

---

## 🎯 Use Cases

### 1. Live Monitoring
- Watch classrooms in real-time
- Verify camera positioning
- Check lighting conditions

### 2. Testing
- Test camera before scheduling captures
- Verify RTSP connection
- Check video quality

### 3. Troubleshooting
- Debug camera issues
- Verify network connectivity
- Check camera angle/focus

---

## 📦 Files Modified/Created

### Created:
1. `web-portal/app/api/cameras/[id]/stream/route.ts` - Next.js API
2. `web-portal/python-api/requirements_streaming.txt` - Dependencies
3. `web-portal/LIVE_STREAMING_SETUP.md` - This guide

### Modified:
1. `web-portal/app/dashboard/cameras/page.tsx` - Added streaming modal
2. `web-portal/python-api/app.py` - Added streaming endpoint

---

## ✅ Verification Checklist

- [ ] Python dependencies installed
- [ ] Database credentials configured
- [ ] Python API running on port 5000
- [ ] Next.js running on port 3000
- [ ] Camera configured in database
- [ ] Camera reachable on network
- [ ] "Stream" button visible on camera card
- [ ] Modal opens when clicking "Stream"
- [ ] Live video displays in modal

---

## 🎉 Success!

Once everything is set up, you'll have:
- ✅ Live RTSP streaming in browser
- ✅ Real-time video from Dahua CCTV cameras
- ✅ Easy-to-use modal interface
- ✅ Multiple camera support
- ✅ Low-latency streaming

**Enjoy your live camera feeds!** 📹🎥

---

## 📞 Support

**Common Issues:**
1. Stream not loading → Check Python API logs
2. "Camera not found" → Verify camera ID in database
3. Black screen → Check RTSP credentials
4. Slow stream → Reduce resolution/quality

**Debug Mode:**
Check Python API console for detailed logs:
```
Streaming from: rtsp://admin:***@192.168.1.100:554/cam/realmonitor?channel=1&subtype=0
Stream closed
```
