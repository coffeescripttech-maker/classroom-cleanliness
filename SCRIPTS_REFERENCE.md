# 📜 Scripts Reference Guide

Quick reference for all startup and management scripts.

## 🚀 Startup Scripts

### start-servers.bat
**Purpose**: Start both Python API and Next.js servers

**Usage**:
```cmd
start-servers.bat
```

**What it does**:
1. Checks Python and Node.js installation
2. Opens Python API in new window (Port 5000)
3. Opens Next.js frontend in new window (Port 3000)
4. Displays server URLs

**When to use**: Every time you want to start the system

---

### start-servers.ps1
**Purpose**: Start both servers using PowerShell (with auto-browser)

**Usage**:
```powershell
.\start-servers.ps1
```

**What it does**:
1. Checks Python and Node.js installation
2. Opens Python API in new PowerShell window
3. Opens Next.js frontend in new PowerShell window
4. Waits 5 seconds
5. Opens browser to dashboard automatically

**When to use**: Preferred method for PowerShell users

---

## 🛑 Stop Scripts

### stop-servers.bat
**Purpose**: Stop all running servers

**Usage**:
```cmd
stop-servers.bat
```

**What it does**:
1. Kills Python API processes
2. Kills Next.js processes
3. Closes server windows

**When to use**: When you're done working and want to stop all servers

---

### stop-servers.ps1
**Purpose**: Stop all servers using PowerShell

**Usage**:
```powershell
.\stop-servers.ps1
```

**What it does**:
1. Finds and stops Python processes running app.py
2. Finds and stops Node.js processes running Next.js
3. Confirms servers are stopped

**When to use**: PowerShell alternative to stop servers

---

## 🔍 Status Scripts

### check-status.bat
**Purpose**: Check if servers are running

**Usage**:
```cmd
check-status.bat
```

**What it does**:
1. Checks if Python API is running (Port 5000)
2. Checks if Next.js is running (Port 3000)
3. Checks if MySQL is running (Port 3306)
4. Displays status for each service

**When to use**: 
- Before starting servers (to avoid port conflicts)
- To verify servers are running
- Troubleshooting connection issues

---

## 🧪 Test Scripts

### web-portal/python-api/test_opencv.py
**Purpose**: Test OpenCV installation

**Usage**:
```cmd
python web-portal\python-api\test_opencv.py
```

**What it does**:
1. Checks if OpenCV is installed
2. Verifies NumPy is working
3. Tests video capture capability
4. Displays version information

**When to use**: 
- After installing OpenCV
- Before using camera features
- Troubleshooting RTSP issues

---

### web-portal/python-api/rtsp_capture.py
**Purpose**: RTSP camera capture utilities

**Usage**:

**Test Connection**:
```cmd
python web-portal\python-api\rtsp_capture.py test "rtsp://admin:password@192.168.1.100:554/cam/realmonitor?channel=1&subtype=0"
```

**Capture Frame**:
```cmd
python web-portal\python-api\rtsp_capture.py capture "rtsp://..." "output.jpg"
```

**Capture Multiple**:
```cmd
python web-portal\python-api\rtsp_capture.py capture_multiple "rtsp://..." "output/" 5 2
```

**When to use**:
- Testing camera connections
- Capturing frames manually
- Troubleshooting RTSP issues

---

## 📊 Common Workflows

### Daily Startup
```cmd
1. check-status.bat          # Verify nothing is running
2. start-servers.bat         # Start both servers
3. Open http://localhost:3000/dashboard
```

### Daily Shutdown
```cmd
1. stop-servers.bat          # Stop all servers
```

### Troubleshooting
```cmd
1. check-status.bat          # Check what's running
2. stop-servers.bat          # Stop everything
3. start-servers.bat         # Start fresh
```

### Camera Setup
```cmd
1. python web-portal\python-api\test_opencv.py    # Test OpenCV
2. start-servers.bat                               # Start servers
3. Add camera in web portal
4. Test camera connection
```

---

## 🎯 Quick Commands

### Check if servers are running
```cmd
netstat -ano | findstr :5000    # Python API
netstat -ano | findstr :3000    # Next.js
netstat -ano | findstr :3306    # MySQL
```

### Kill specific port
```cmd
# Find process
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /F /PID <PID>
```

### Open in browser
```cmd
start http://localhost:3000/dashboard
```

---

## 📁 Script Locations

```
CLEANLENESS/
├── start-servers.bat          # Batch startup script
├── start-servers.ps1          # PowerShell startup script
├── stop-servers.bat           # Batch stop script
├── stop-servers.ps1           # PowerShell stop script
├── check-status.bat           # Status checker
└── web-portal/
    └── python-api/
        ├── test_opencv.py     # OpenCV test
        └── rtsp_capture.py    # RTSP utilities
```

---

## 🔧 Script Customization

### Change Ports

Edit scripts to use different ports:

**Python API** (default: 5000):
- Edit `web-portal/python-api/app.py`
- Change: `app.run(debug=True, port=5000)`

**Next.js** (default: 3000):
- Edit `web-portal/package.json`
- Change: `"dev": "next dev -p 3000"`

### Auto-start on Boot

**Windows Task Scheduler**:
1. Open Task Scheduler
2. Create Basic Task
3. Trigger: At startup
4. Action: Start program
5. Program: `C:\path\to\start-servers.bat`

---

## 💡 Tips

### Keep Windows Open
Server windows must stay open. Minimize instead of closing.

### Multiple Instances
Don't run multiple instances - ports will conflict.

### Development vs Production
These scripts are for development. Production needs different setup.

### Logs
Check server windows for error messages and logs.

---

## 🚨 Troubleshooting

### Script won't run
- Right-click → "Run as Administrator"
- Check file permissions
- Verify Python/Node.js in PATH

### Port already in use
```cmd
check-status.bat              # See what's running
stop-servers.bat              # Stop everything
start-servers.bat             # Start fresh
```

### Servers start but can't connect
- Check firewall settings
- Verify `.env.local` configuration
- Check MySQL is running
- Review server logs in windows

---

## 📚 Related Documentation

- [STARTUP_GUIDE.md](STARTUP_GUIDE.md) - Complete startup guide
- [README.md](README.md) - Project overview
- [web-portal/PROJECT_STATUS.md](web-portal/PROJECT_STATUS.md) - Project status
- [web-portal/RTSP_SETUP_GUIDE.md](web-portal/RTSP_SETUP_GUIDE.md) - Camera setup

---

## ✅ Quick Checklist

Before running scripts:
- [ ] Python installed and in PATH
- [ ] Node.js installed and in PATH
- [ ] MySQL server running
- [ ] Database created
- [ ] Dependencies installed
- [ ] `.env.local` configured
- [ ] Ports 3000 and 5000 available

---

**Need Help?** Check [STARTUP_GUIDE.md](STARTUP_GUIDE.md) for detailed instructions.
