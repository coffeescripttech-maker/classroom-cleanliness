# 🔄 Restart Python API to Apply Changes

## Issue
The Python API is still using old code that saves annotated images to the root `uploads/` folder instead of the organized structure.

## Solution
Restart the Python API to load the updated code.

---

## Steps to Restart

### Option 1: If Running in Terminal

1. **Find the terminal** where Python API is running
2. **Stop it:** Press `Ctrl+C`
3. **Start it again:**
   ```bash
   cd web-portal/python-api
   python app.py
   ```

### Option 2: If Running as Background Process

**Windows (PowerShell):**
```powershell
# Find Python process
Get-Process python | Where-Object {$_.Path -like "*python-api*"}

# Kill it
Stop-Process -Name python -Force

# Start again
cd web-portal/python-api
python app.py
```

**Windows (CMD):**
```cmd
# Find and kill
taskkill /F /IM python.exe

# Start again
cd web-portal\python-api
python app.py
```

---

## Verify It's Working

### 1. Check Health Endpoint
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "healthy",
  "ai_system_ready": true,
  "owlvit_enabled": true
}
```

### 2. Check Console Output
When you restart, you should see:
```
============================================================
Python AI API Server
============================================================
Starting server on http://localhost:5000
Endpoints:
  GET  /api/health
  POST /api/analyze
  POST /api/batch-analyze
============================================================
```

### 3. Test Upload & Analysis

**Upload an image:**
```bash
# Go to http://localhost:3000/dashboard/images
# Upload a new image
```

**Trigger analysis and check console:**
You should see:
```
DEBUG: Organized path: Grade-7/Section-A/2026-01-13/annotated_09-30-00.jpg
✓ Saved annotated image: Grade-7/Section-A/2026-01-13/annotated_09-30-00.jpg
```

**NOT:**
```
✓ Saved annotated image: original_09-31-57_annotated_20260113_093205.jpg
```

---

## What Changed in app.py

### Old Code (Before)
```python
annotated_filename = f"{name_without_ext}_annotated_{timestamp}.jpg"
web_portal_path = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'public', 'uploads', annotated_filename
)
annotated_image_path = annotated_filename
```

### New Code (After)
```python
# Parse Grade/Section from original path
path_parts = image_path.replace('\\', '/').split('/')
for i, part in enumerate(path_parts):
    if part.startswith('Grade-'):
        grade_folder = part
        if i + 1 < len(path_parts) and path_parts[i + 1].startswith('Section-'):
            section_folder = path_parts[i + 1]
        break

# Create organized path with date folder
date_folder = datetime.now().strftime('%Y-%m-%d')
time_str = datetime.now().strftime('%H-%M-%S')
annotated_filename = f"annotated_{time_str}.jpg"
relative_path = os.path.join(grade_folder, section_folder, date_folder, annotated_filename)

# Save to organized location
web_portal_path = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'public', 'uploads', relative_path
)
annotated_image_path = relative_path.replace('\\', '/')
```

---

## Expected Result After Restart

### Database Entry
```sql
annotated_image_path: "Grade-7/Section-A/2026-01-13/annotated_09-35-00.jpg"
```

### File System
```
web-portal/public/uploads/
└── Grade-7/
    └── Section-A/
        └── 2026-01-13/
            ├── original_09-31-57.jpg
            └── annotated_09-35-00.jpg  ✅ Organized!
```

### Web Access
```
http://localhost:3000/uploads/Grade-7/Section-A/2026-01-13/annotated_09-35-00.jpg
```

---

## Troubleshooting

### Issue: Still saving to root uploads/
**Cause:** Python API not restarted  
**Fix:** Make sure you stopped and restarted the Python process

### Issue: Can't find Python process
**Cause:** Running in a terminal you closed  
**Fix:** Just start it fresh:
```bash
cd web-portal/python-api
python app.py
```

### Issue: Port 5000 already in use
**Cause:** Old process still running  
**Fix:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /F /PID <PID_NUMBER>

# Then start again
python app.py
```

---

## Quick Test Command

After restarting, run this to verify:

```bash
# 1. Upload a test image via UI
# 2. Trigger analysis
# 3. Check the database

# Query to see the path
mysql -u root -p classroom_cleanliness -e "SELECT id, annotated_image_path FROM cleanliness_scores ORDER BY id DESC LIMIT 1;"
```

**Expected:**
```
+----+--------------------------------------------------------+
| id | annotated_image_path                                   |
+----+--------------------------------------------------------+
| 22 | Grade-7/Section-A/2026-01-13/annotated_09-35-00.jpg   |
+----+--------------------------------------------------------+
```

**NOT:**
```
+----+--------------------------------------------------------+
| id | annotated_image_path                                   |
+----+--------------------------------------------------------+
| 21 | original_09-31-57_annotated_20260113_093205.jpg       |
+----+--------------------------------------------------------+
```

---

## Summary

1. ✅ Code is updated in `app.py`
2. ⚠️ Python API needs restart to load new code
3. 🔄 Stop the Python process (Ctrl+C)
4. ▶️ Start it again: `python app.py`
5. ✅ Test with new upload and analysis
6. 🎉 Enjoy organized images!

---

**Status:** Waiting for Python API restart  
**Action Required:** Restart Python API process
