# Camera Management Feature

Complete camera management system for Dahua CCTV cameras with RTSP support.

## Features

### 1. Camera CRUD Operations
- **List View**: Grid display of all cameras with status indicators
- **Add Camera**: Form to configure new Dahua CCTV cameras
- **Edit Camera**: Update camera configuration
- **Delete Camera**: Remove cameras from system

### 2. RTSP Configuration
- **IP Address & Port**: Configure camera network settings (default RTSP port: 554)
- **RTSP Path**: Dahua default path `/cam/realmonitor?channel=1&subtype=0`
- **Authentication**: Username/password for camera access (required for Dahua)
- **RTSP URL Preview**: Real-time preview of constructed RTSP URL

### 3. Connection Testing
- **Config Test**: Validates camera configuration (IP, port, credentials, RTSP path)
- **Stream Test**: Tests actual RTSP stream connection using OpenCV
  - Captures test frame
  - Reports resolution and FPS
  - Updates camera status based on result

### 4. Status Management
- **Active**: Camera is configured and working
- **Inactive**: Camera is disabled
- **Error**: Camera configuration or connection failed
- **Last Capture**: Timestamp of last successful frame capture

### 5. Statistics Dashboard
- Total cameras count
- Active cameras count
- Inactive cameras count
- Error cameras count

## Database Schema

```sql
CREATE TABLE cameras (
  id INT PRIMARY KEY AUTO_INCREMENT,
  classroom_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  port INT DEFAULT 554,
  username VARCHAR(50),
  password VARCHAR(100),
  rtsp_path VARCHAR(255) DEFAULT '/cam/realmonitor?channel=1&subtype=0',
  status ENUM('active', 'inactive', 'error') DEFAULT 'active',
  last_capture DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE
);
```

## API Endpoints

### GET /api/cameras
List all cameras with classroom details

### POST /api/cameras
Create new camera
```json
{
  "classroom_id": 1,
  "name": "Camera 101",
  "ip_address": "192.168.1.100",
  "port": 554,
  "username": "admin",
  "password": "password123",
  "rtsp_path": "/cam/realmonitor?channel=1&subtype=0",
  "status": "active"
}
```

### GET /api/cameras/[id]
Get camera details

### PUT /api/cameras/[id]
Update camera configuration

### DELETE /api/cameras/[id]
Delete camera

### POST /api/cameras/[id]/test
Validate camera configuration (IP, port, credentials, RTSP path)

### POST /api/cameras/[id]/test-stream
Test actual RTSP stream connection using OpenCV

## Python RTSP Capture Script

Location: `web-portal/python-api/rtsp_capture.py`

### Features
1. **Test Connection**: Validate RTSP stream and capture test frame
2. **Capture Frame**: Save single frame from stream
3. **Capture Multiple**: Save multiple frames with interval

### Usage

#### Test RTSP Connection
```bash
python web-portal/python-api/rtsp_capture.py test "rtsp://admin:password@192.168.1.100:554/cam/realmonitor?channel=1&subtype=0"
```

#### Capture Single Frame
```bash
python web-portal/python-api/rtsp_capture.py capture "rtsp://..." "output/frame.jpg"
```

#### Capture Multiple Frames
```bash
python web-portal/python-api/rtsp_capture.py capture_multiple "rtsp://..." "output/" 5 2
# Captures 5 frames with 2 second interval
```

### Requirements
```bash
pip install opencv-python
```

For detailed setup instructions, see `RTSP_SETUP_GUIDE.md`

## Dahua CCTV Configuration

### Default Settings
- **Port**: 554 (RTSP standard)
- **RTSP Path**: `/cam/realmonitor?channel=1&subtype=0`
- **Username**: `admin` (default)
- **Password**: Varies by installation

### RTSP URL Format
```
rtsp://username:password@ip_address:port/cam/realmonitor?channel=1&subtype=0
```

### Channel Configuration
- `channel=1`: Main stream (high quality)
- `channel=2`: Sub stream (lower quality, for monitoring)
- `subtype=0`: Main stream
- `subtype=1`: Sub stream

### Common Issues

1. **Connection Timeout**
   - Check network connectivity
   - Verify IP address and port
   - Ensure camera is powered on

2. **Authentication Failed**
   - Verify username and password
   - Check if camera requires admin privileges

3. **Stream Not Available**
   - Verify RTSP path for your Dahua model
   - Check channel number (1-based indexing)
   - Ensure RTSP is enabled in camera settings

4. **OpenCV Not Installed**
   - Install: `pip install opencv-python`
   - For headless systems: `pip install opencv-python-headless`

## Future Enhancements

1. **Automated Capture**
   - Schedule periodic frame captures
   - Trigger AI analysis automatically
   - Store captured images in database

2. **Live Preview**
   - Real-time stream preview in web interface
   - WebRTC or HLS streaming

3. **Motion Detection**
   - Detect motion in stream
   - Trigger captures on motion events

4. **Multi-Camera View**
   - Display multiple camera feeds simultaneously
   - Grid view of all active cameras

5. **Recording**
   - Record video segments
   - Store recordings for review

## Files

### Frontend
- `web-portal/app/dashboard/cameras/page.tsx` - Camera list view
- `web-portal/app/dashboard/cameras/create/page.tsx` - Add camera form
- `web-portal/app/dashboard/cameras/[id]/edit/page.tsx` - Edit camera form

### API Routes
- `web-portal/app/api/cameras/route.ts` - List and create cameras
- `web-portal/app/api/cameras/[id]/route.ts` - Get, update, delete camera
- `web-portal/app/api/cameras/[id]/test/route.ts` - Validate configuration
- `web-portal/app/api/cameras/[id]/test-stream/route.ts` - Test RTSP stream

### Python Scripts
- `web-portal/python-api/rtsp_capture.py` - RTSP capture utilities

## Testing

1. **Add Camera**
   - Navigate to Cameras → Add Camera
   - Fill in Dahua camera details
   - Click "Create Camera"

2. **Test Configuration**
   - Click "Config" button on camera card
   - Validates IP, port, credentials, RTSP path
   - Updates status to active/error

3. **Test Stream**
   - Click "Stream" button on camera card
   - Tests actual RTSP connection with OpenCV
   - Captures test frame and reports resolution/FPS

4. **Edit Camera**
   - Click edit icon on camera card
   - Update configuration
   - Click "Save Changes"

5. **Delete Camera**
   - Click delete icon on camera card
   - Confirm deletion
