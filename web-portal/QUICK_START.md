# 🚀 Quick Start Guide

## ✅ What's Fixed

The Python API now correctly imports from your main AI system!

## 🎯 Start the System (3 Steps)

### Step 1: Start Python AI API

```bash
cd web-portal/python-api
python app.py
```

Or on Windows, double-click:
```
start.bat
```

**Expected output:**
```
============================================
Python AI API Server
============================================
Initializing AI system...
✓ AI system ready!

Starting server on http://localhost:5000
Endpoints:
  GET  /api/health
  POST /api/analyze
  POST /api/batch-analyze
============================================

 * Running on http://0.0.0.0:5000
```

### Step 2: Test Python API

Open another terminal:
```bash
curl http://localhost:5000/api/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "message": "Python AI API is running",
  "ai_system_ready": true,
  "owlvit_enabled": true
}
```

### Step 3: Start Next.js Web Portal

```bash
cd web-portal
npm install
npm run dev
```

**Web portal runs on:** http://localhost:3000

## 🧪 Test the Full System

### Test 1: Health Check
```bash
curl http://localhost:5000/api/health
```

### Test 2: Analyze Image
```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d "{\"image_path\": \"../../data/classroom2.png\", \"classroom_id\": \"Room 101\"}"
```

### Test 3: Web Portal API
```bash
curl http://localhost:3000/api/classrooms
```

## 📁 Directory Structure

```
CLEANLENESS/
├── main.py                    ← Your AI system
├── models/
│   ├── detector.py
│   └── owlvit_detector.py
├── scoring/
├── data/
│   └── classroom2.png
│
└── web-portal/
    ├── python-api/
    │   ├── app.py            ← Flask API (connects to main.py)
    │   └── start.bat         ← Windows startup script
    │
    ├── app/
    │   └── api/              ← Next.js API routes
    │
    └── package.json
```

## 🔧 Troubleshooting

### Issue: "No module named 'main'"

**Solution:** The Python API now handles this automatically. It will:
1. Try to import from parent directory
2. Show warning if not found
3. Run in demo mode

### Issue: "AI system not initialized"

**Cause:** main.py not accessible

**Solution:** Make sure you're running from the correct directory:
```bash
# Should be in: CLEANLENESS/web-portal/python-api/
python app.py
```

### Issue: Port 5000 already in use

**Solution:** Kill the process or use different port:
```python
# In app.py, change:
app.run(host='0.0.0.0', port=5001, debug=True)
```

## ✅ Success Checklist

- [ ] Python API starts without errors
- [ ] Health check returns "healthy"
- [ ] Can analyze images
- [ ] Next.js server starts
- [ ] Can access http://localhost:3000

## 🎯 What's Next?

Once both servers are running:

1. **Test the APIs** - Make sure everything works
2. **Setup Database** - Run the MySQL schema
3. **Build Dashboard** - Create the admin UI
4. **Add Features** - Schedules, cameras, etc.

## 📝 Common Commands

```bash
# Start Python API
cd web-portal/python-api
python app.py

# Start Next.js (in another terminal)
cd web-portal
npm run dev

# Test health
curl http://localhost:5000/api/health

# Test analysis
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d "{\"image_path\": \"../../data/classroom2.png\", \"classroom_id\": \"Test\"}"
```

## 🎉 You're Ready!

Both servers should now be running:
- 🐍 Python AI API: http://localhost:5000
- ⚛️ Next.js Portal: http://localhost:3000

Ready to build the dashboard? Just ask! 🚀
