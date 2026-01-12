# Camera Management - Quick Reference

## 🎯 Quick Actions

### Add Camera
1. Go to: `/dashboard/cameras`
2. Click "Add Camera"
3. Fill form with camera details
4. Click "Create Camera"

### Test Camera
- **Config Button** (Blue): Validates configuration only
- **Stream Button** (Green): Tests actual RTSP connection

### Edit Camera
1. Click pencil icon on camera card
2. Update settings
3. Click "Save Changes"

### Delete Camera
1. Click trash icon on camera card
2. Confirm deletion

## 📝 Default Settings

### Dahua CCTV Defaults
```
Port: 554
RTSP Path: /cam/realmonitor?channel=1&subtype=0
Username: admin
Password: (varies by installation)
```

### RTSP URL Format
```
rtsp://username:password@ip_address:port/rtsp_path
```

Example:
```
rtsp://admin:password123@192.168.1.100:554/cam/realmonitor?channel=1&subtype=0
```

## 🔧 Common RTSP Paths

### Dahua Cameras
```
Main Stream:  /cam/realmonitor?channel=1&subtype=0
Sub Stream:   /cam/realmonitor?channel=1&subtype=1
Alternative:  /live/ch00_0
```

### Other Brands (for reference)
```
Hikvision:    /Streaming/Channels/101
Axis:         /axis-media/media.amp
Foscam:       /videoMain
```

## 🚨 Troubleshooting

### Connection Failed
1. Ping camera: `ping 192.168.1.100`
2. Check camera web UI: `http://192.168.1.100`
3. Verify credentials
4. Check firewall (port 554)

### Authentication Failed
1. Try default: admin/admin
2. Check camera settings
3. Verify username/password

### Wrong RTSP Path
1. Try alternative paths (see above)
2. Check camera manual
3. Test with VLC player

## 💡 Tips

### Test with VLC Media Player
1. Open VLC
2. Media → Open Network Stream
3. Enter RTSP URL
4. If it works in VLC, it should work in the system

### Find Camera IP
1. Use Dahua Config Tool
2. Check router admin panel
3. Use IP scanner tool

### Network Requirements
- Camera and server must be on same network
- Port 554 must be accessible
- Firewall must allow RTSP traffic

## 📊 Status Indicators

- 🟢 **Active**: Camera configured and working
- ⚫ **Inactive**: Camera disabled
- 🔴 **Error**: Connection or configuration failed

## 🎬 Command Line Testing

### Test Connection
```bash
python web-portal/python-api/rtsp_capture.py test "rtsp://admin:password@192.168.1.100:554/cam/realmonitor?channel=1&subtype=0"
```

### Capture Frame
```bash
python web-portal/python-api/rtsp_capture.py capture "rtsp://..." "output.jpg"
```

### Capture Multiple
```bash
python web-portal/python-api/rtsp_capture.py capture_multiple "rtsp://..." "output/" 5 2
```

## 📞 Need Help?

See detailed guides:
- `RTSP_SETUP_GUIDE.md` - Complete setup instructions
- `CAMERA_MANAGEMENT_FEATURE.md` - Feature documentation
- `CAMERA_SETUP_COMPLETE.md` - What we built
