# 🚀 Startup Guide - Classroom Cleanliness Monitoring System

Quick guide to start and stop the system servers.

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Python 3.8+ installed
- ✅ Node.js 18+ installed
- ✅ MySQL server running
- ✅ Database created and configured
- ✅ Dependencies installed (`npm install` in web-portal folder)
- ✅ Environment variables configured (`.env.local` file)

## 🎯 Quick Start (Recommended)

### Option 1: Using Batch Script (Windows)

**Double-click:** `start-servers.bat`

Or run from command prompt:
```cmd
start-servers.bat
```

This will:
1. Check if Python and Node.js are installed
2. Open Python API server in new window (Port 5000)
3. Open Next.js frontend in new window (Port 3000)
4. Display server URLs

### Option 2: Using PowerShell Script (Windows)

**Right-click** `start-servers.ps1` → **Run with PowerShell**

Or run from PowerShell:
```powershell
.\start-servers.ps1
```

This will:
1. Check if Python and Node.js are installed
2. Open Python API server in new PowerShell window
3. Open Next.js frontend in new PowerShell window
4. Wait 5 seconds and open browser to dashboard
5. Display server URLs

## 🛑 Stopping Servers

### Option 1: Using Stop Script

**Batch:**
```cmd
stop-servers.bat
```

**PowerShell:**
```powershell
.\stop-servers.ps1
```

### Option 2: Manual Stop

1. Go to each server window
2. Press `Ctrl + C`
3. Close the windows

### Option 3: Task Manager

1. Open Task Manager (`Ctrl + Shift + Esc`)
2. Find `python.exe` and `node.exe` processes
3. End tasks

## 📝 Manual Start (Alternative)

If you prefer to start servers manually:

### Terminal 1 - Python API
```cmd
cd web-portal\python-api
python app.py
```

### Terminal 2 - Next.js Frontend
```cmd
cd web-portal
npm run dev
```

## 🌐 Access URLs

After starting servers:

| Service | URL | Description |
|---------|-----|-------------|
| **Dashboard** | http://localhost:3000/dashboard | Main dashboard |
| **Classrooms** | http://localhost:3000/dashboard/classrooms | Manage classrooms |
| **Images** | http://localhost:3000/dashboard/images | Image gallery |
| **Leaderboard** | http://localhost:3000/dashboard/leaderboard | Rankings |
| **Cameras** | http://localhost:3000/dashboard/cameras | Camera management |
| **Settings** | http://localhost:3000/dashboard/settings | System settings |
| **Python API** | http://localhost:5000 | AI analysis API |

## 🔧 Troubleshooting

### Issue: "Port already in use"

**Python API (Port 5000):**
```cmd
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /F /PID <PID>
```

**Next.js (Port 3000):**
```cmd
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /F /PID <PID>
```

### Issue: "Python not found"

1. Install Python from https://www.python.org/downloads/
2. During installation, check "Add Python to PATH"
3. Restart terminal/command prompt
4. Verify: `python --version`

### Issue: "Node not found"

1. Install Node.js from https://nodejs.org/
2. Restart terminal/command prompt
3. Verify: `node --version`

### Issue: "Module not found" (Python)

```cmd
cd web-portal\python-api
pip install -r requirements.txt
pip install -r requirements_rtsp.txt
```

### Issue: "Module not found" (Node.js)

```cmd
cd web-portal
npm install
```

### Issue: "Database connection failed"

1. Check MySQL is running
2. Verify `.env.local` file exists in `web-portal` folder
3. Check database credentials in `.env.local`:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=classroom_cleanliness
   ```

### Issue: "Cannot connect to Python API"

1. Check Python server is running (Port 5000)
2. Visit http://localhost:5000 in browser
3. Should see: "Classroom Cleanliness AI API is running"
4. Check firewall settings

## 📊 Server Status Check

### Check if servers are running:

**PowerShell:**
```powershell
# Check Python API
Get-Process python -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*app.py*"}

# Check Next.js
Get-Process node -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*next*"}
```

**Command Prompt:**
```cmd
# Check Python API
netstat -ano | findstr :5000

# Check Next.js
netstat -ano | findstr :3000
```

## 🎓 First Time Setup

If this is your first time running the system:

### 1. Install Dependencies

**Python:**
```cmd
cd web-portal\python-api
pip install -r requirements.txt
pip install -r requirements_rtsp.txt
```

**Node.js:**
```cmd
cd web-portal
npm install
```

### 2. Setup Database

```cmd
mysql -u root -p classroom_cleanliness < web-portal\database\schema.sql
mysql -u root -p classroom_cleanliness < web-portal\database\seed-data.sql
```

### 3. Configure Environment

```cmd
cd web-portal
copy .env.example .env.local
```

Edit `.env.local` with your database credentials.

### 4. Start Servers

```cmd
start-servers.bat
```

### 5. Access Dashboard

Open browser: http://localhost:3000/dashboard

## 💡 Tips

### Keep Servers Running

The server windows must stay open for the system to work. Minimize them instead of closing.

### Auto-start on Boot (Optional)

**Windows Task Scheduler:**
1. Open Task Scheduler
2. Create Basic Task
3. Trigger: At startup
4. Action: Start a program
5. Program: `C:\path\to\start-servers.bat`

### Development Mode

The scripts start servers in development mode with:
- Hot reload enabled
- Debug logging
- Error messages displayed

### Production Mode

For production deployment:
```cmd
cd web-portal
npm run build
npm start
```

## 📱 Mobile Access

To access from mobile devices on same network:

1. Find your computer's IP address:
   ```cmd
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., 192.168.1.100)

2. On mobile browser, visit:
   ```
   http://192.168.1.100:3000/dashboard
   ```

3. Ensure firewall allows incoming connections on port 3000

## 🔐 Security Notes

### Development Environment
- Default ports (3000, 5000) are for development
- No authentication required
- Suitable for local network only

### Production Environment
- Use HTTPS (port 443)
- Implement authentication
- Use environment variables for secrets
- Enable firewall rules
- Use reverse proxy (nginx/Apache)

## 📚 Related Documentation

- `README.md` - Project overview
- `web-portal/QUICK_START.md` - Quick start guide
- `web-portal/PROJECT_STATUS.md` - Feature status
- `web-portal/CAMERA_SETUP_COMPLETE.md` - Camera setup
- `web-portal/RTSP_SETUP_GUIDE.md` - RTSP configuration

## ✅ Startup Checklist

Before starting servers, verify:

- [ ] MySQL server is running
- [ ] Database is created and configured
- [ ] `.env.local` file exists with correct credentials
- [ ] Python dependencies installed
- [ ] Node.js dependencies installed
- [ ] Ports 3000 and 5000 are available
- [ ] No firewall blocking connections

## 🎉 Success!

When both servers are running, you should see:

**Python API Window:**
```
 * Running on http://127.0.0.1:5000
 * Running on http://192.168.1.100:5000
```

**Next.js Window:**
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled client and server successfully
```

**Browser:**
- Dashboard loads at http://localhost:3000/dashboard
- All features are accessible
- No error messages in console

---

**Need Help?** Check the troubleshooting section above or review the documentation files.
