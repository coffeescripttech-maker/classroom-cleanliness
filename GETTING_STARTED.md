# 🎓 Getting Started - Classroom Cleanliness Monitoring System

Complete guide to get the system up and running in minutes.

## 📋 What You Need

Before starting, make sure you have:

- ✅ **Python 3.8+** - [Download](https://www.python.org/downloads/)
- ✅ **Node.js 18+** - [Download](https://nodejs.org/)
- ✅ **MySQL 8.0+** - [Download](https://dev.mysql.com/downloads/)
- ✅ **Git** (optional) - [Download](https://git-scm.com/)

## 🚀 5-Minute Setup

### Step 1: Install Dependencies (First Time Only)

**Python packages:**
```cmd
cd web-portal\python-api
pip install -r requirements.txt
pip install -r requirements_rtsp.txt
```

**Node.js packages:**
```cmd
cd ..
npm install
```

### Step 2: Setup Database (First Time Only)

**Create database:**
```cmd
mysql -u root -p
```

In MySQL:
```sql
CREATE DATABASE classroom_cleanliness;
EXIT;
```

**Import schema:**
```cmd
mysql -u root -p classroom_cleanliness < database\schema.sql
mysql -u root -p classroom_cleanliness < database\seed-data.sql
```

### Step 3: Configure Environment (First Time Only)

```cmd
cd web-portal
copy .env.example .env.local
```

**Edit `.env.local`** with your settings:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=classroom_cleanliness

PYTHON_AI_URL=http://localhost:5000
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### Step 4: Start Servers

**From project root:**
```cmd
start-servers.bat
```

**Or using PowerShell:**
```powershell
.\start-servers.ps1
```

### Step 5: Access Dashboard

Open browser: **http://localhost:3000/dashboard**

## 🎉 You're Ready!

The system is now running. You can:

1. ✅ **Add Classrooms** - Create classroom entries
2. ✅ **Upload Images** - Upload classroom photos
3. ✅ **Analyze with AI** - Get cleanliness scores
4. ✅ **View Leaderboard** - See rankings
5. ✅ **Add Cameras** - Configure CCTV cameras
6. ✅ **Manage Settings** - Configure grades and sections

## 📚 Next Steps

### Learn the System

1. **Dashboard** - Overview of all statistics
   - http://localhost:3000/dashboard

2. **Classrooms** - Manage classroom locations
   - http://localhost:3000/dashboard/classrooms

3. **Images** - Upload and analyze photos
   - http://localhost:3000/dashboard/images

4. **Leaderboard** - View competitive rankings
   - http://localhost:3000/dashboard/leaderboard

5. **Cameras** - Configure CCTV cameras
   - http://localhost:3000/dashboard/cameras

6. **Settings** - Manage grades and sections
   - http://localhost:3000/dashboard/settings

### Try These Tasks

**Task 1: Add Your First Classroom**
1. Go to Classrooms
2. Click "Add Classroom"
3. Fill in details (name, grade, section)
4. Click "Create"

**Task 2: Upload and Analyze an Image**
1. Go to Images
2. Click "Upload Image"
3. Select classroom and image file
4. Click "Upload"
5. Click "Analyze with AI"
6. View detailed scores

**Task 3: Check the Leaderboard**
1. Go to Leaderboard
2. See top 3 classrooms
3. Try different time filters
4. Filter by grade level

**Task 4: Add a Camera (Optional)**
1. Go to Cameras
2. Click "Add Camera"
3. Enter camera details (IP, credentials, RTSP path)
4. Click "Test Stream" to verify connection

## 🔧 Daily Usage

### Starting the System

Every time you want to use the system:

```cmd
start-servers.bat
```

Wait for both servers to start (about 10-30 seconds), then open:
http://localhost:3000/dashboard

### Stopping the System

When you're done:

```cmd
stop-servers.bat
```

Or press `Ctrl+C` in each server window.

### Checking Status

To see if servers are running:

```cmd
check-status.bat
```

## 🎯 Common Workflows

### Workflow 1: Manual Image Analysis

1. Take photo of classroom
2. Go to Images → Upload Image
3. Select classroom and upload
4. Click "Analyze with AI"
5. Review scores and detected objects
6. Check leaderboard for updated rankings

### Workflow 2: Camera-Based Monitoring

1. Add camera in Cameras section
2. Test RTSP connection
3. Capture frame from camera (using Python script)
4. Upload captured frame
5. Analyze with AI
6. Review results

### Workflow 3: Competitive Tracking

1. Set up all classrooms
2. Analyze images regularly (daily/weekly)
3. Display leaderboard publicly
4. Track improvement trends
5. Celebrate top performers

## 📊 Understanding Scores

### Scoring Breakdown (50 points total)

| Metric | Points | What It Measures |
|--------|--------|------------------|
| **Floor Cleanliness** | 0-10 | Papers, trash on floor |
| **Furniture Orderliness** | 0-10 | Chair/desk arrangement |
| **Trash Bin Condition** | 0-10 | Proper waste disposal |
| **Wall/Board Cleanliness** | 0-10 | Writing, marks on walls |
| **Clutter Detection** | 0-10 | Scattered items |

### Rating System

- **Excellent** (45-50): 🏆 Outstanding cleanliness
- **Good** (35-44): ✅ Well-maintained
- **Fair** (25-34): ⚠️ Needs improvement
- **Poor** (<25): ❌ Requires attention

### How AI Detects Objects

The system uses two AI models:

1. **YOLOv8**: Detects common objects (chairs, desks, trash bins)
2. **OWL-ViT**: Detects custom objects (papers, jackets, ballpens)

Detected objects are used to calculate scores for each metric.

## 🚨 Troubleshooting

### Problem: Servers won't start

**Check:**
- Python installed? Run: `python --version`
- Node.js installed? Run: `node --version`
- MySQL running? Run: `check-status.bat`

**Solution:**
1. Install missing software
2. Restart terminal
3. Try again

### Problem: Database connection failed

**Check:**
- MySQL running?
- Correct password in `.env.local`?
- Database created?

**Solution:**
```cmd
# Check MySQL
mysql -u root -p

# Verify database exists
SHOW DATABASES;

# Should see: classroom_cleanliness
```

### Problem: Can't access dashboard

**Check:**
- Servers running? Run: `check-status.bat`
- Correct URL? Use: http://localhost:3000/dashboard
- Firewall blocking?

**Solution:**
1. Stop servers: `stop-servers.bat`
2. Start fresh: `start-servers.bat`
3. Wait 30 seconds
4. Try again

### Problem: AI analysis fails

**Check:**
- Python API running on port 5000?
- Visit: http://localhost:5000
- Should see: "Classroom Cleanliness AI API is running"

**Solution:**
```cmd
# Restart Python API
cd web-portal\python-api
python app.py
```

### Problem: Camera connection fails

**Check:**
- Camera IP correct?
- Camera on same network?
- RTSP path correct?
- OpenCV installed?

**Solution:**
```cmd
# Test OpenCV
python web-portal\python-api\test_opencv.py

# Test camera manually
python web-portal\python-api\rtsp_capture.py test "rtsp://..."
```

See [RTSP_SETUP_GUIDE.md](web-portal/RTSP_SETUP_GUIDE.md) for detailed camera troubleshooting.

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Project overview |
| [STARTUP_GUIDE.md](STARTUP_GUIDE.md) | Detailed startup instructions |
| [SCRIPTS_REFERENCE.md](SCRIPTS_REFERENCE.md) | All scripts explained |
| [web-portal/PROJECT_STATUS.md](web-portal/PROJECT_STATUS.md) | Feature status (75% complete) |
| [web-portal/CAMERA_SETUP_COMPLETE.md](web-portal/CAMERA_SETUP_COMPLETE.md) | Camera management guide |
| [web-portal/RTSP_SETUP_GUIDE.md](web-portal/RTSP_SETUP_GUIDE.md) | RTSP configuration |

## 💡 Tips for Success

### For Administrators

1. **Regular Analysis**: Analyze classrooms at same time daily
2. **Public Display**: Show leaderboard on screens
3. **Fair Competition**: Use grade-level filters
4. **Celebrate Success**: Recognize top performers
5. **Track Trends**: Monitor improvement over time

### For Teachers

1. **Student Involvement**: Let students see their progress
2. **Set Goals**: Target specific improvements
3. **Use Data**: Show before/after comparisons
4. **Motivate**: Use leaderboard for friendly competition

### For Students

1. **Check Rankings**: See where your classroom stands
2. **Improve Together**: Work as a team
3. **Maintain Daily**: Small efforts add up
4. **Celebrate Wins**: Enjoy being on top!

## 🎓 Training Resources

### Video Tutorials (Coming Soon)

1. System Overview
2. Adding Classrooms
3. Uploading Images
4. Understanding Scores
5. Using Leaderboard
6. Camera Setup

### Sample Data

The system includes sample data:
- 3 grade levels
- 6 sections
- 10 classrooms
- Sample images

Use this to explore features before adding real data.

## 🔐 Security Notes

### Development Mode

Current setup is for development:
- No authentication required
- Suitable for local network only
- Default ports (3000, 5000)

### Production Deployment

For production use:
- Implement user authentication
- Use HTTPS (SSL certificates)
- Change default ports
- Enable firewall rules
- Use environment variables for secrets
- Regular backups

## 📞 Getting Help

### Quick Help

1. Check [STARTUP_GUIDE.md](STARTUP_GUIDE.md)
2. Run `check-status.bat`
3. Review server logs in windows
4. Check browser console for errors

### Documentation

- All features documented in `web-portal/` folder
- Each feature has its own guide
- Step-by-step instructions included

### Common Issues

Most issues are solved by:
1. Stopping servers: `stop-servers.bat`
2. Checking status: `check-status.bat`
3. Starting fresh: `start-servers.bat`

## ✅ Setup Checklist

- [ ] Python 3.8+ installed
- [ ] Node.js 18+ installed
- [ ] MySQL 8.0+ installed
- [ ] Python dependencies installed
- [ ] Node.js dependencies installed
- [ ] Database created and configured
- [ ] `.env.local` file configured
- [ ] Servers start successfully
- [ ] Dashboard accessible
- [ ] Sample data loaded

## 🎉 Success!

If you can:
- ✅ Start servers with `start-servers.bat`
- ✅ Access dashboard at http://localhost:3000/dashboard
- ✅ See sample classrooms and data
- ✅ Upload and analyze an image
- ✅ View leaderboard

**You're all set!** The system is ready for use.

---

**Next:** Explore features, add your classrooms, and start monitoring cleanliness!

**Questions?** Check the documentation files or review troubleshooting section above.
