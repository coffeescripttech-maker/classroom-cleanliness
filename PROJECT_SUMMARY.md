# 🎓 Classroom Cleanliness Monitoring System - Project Summary

## 🎯 What This System Does

Automatically analyzes classroom images and assigns cleanliness scores (0-50 points) across 5 key metrics, then ranks classrooms on a competitive leaderboard.

## 📦 Complete Package Includes

### Core Files
- ✅ `main.py` - Main application
- ✅ `config.py` - Configuration settings
- ✅ `requirements.txt` - Dependencies

### Detection Module
- ✅ `models/detector.py` - YOLOv8 object detection

### Scoring Modules (5 metrics)
- ✅ `scoring/floor_score.py` - Floor cleanliness (10 pts)
- ✅ `scoring/furniture_score.py` - Furniture orderliness (10 pts)
- ✅ `scoring/trash_score.py` - Trash bin condition (10 pts)
- ✅ `scoring/wall_score.py` - Wall/board cleanliness (10 pts)
- ✅ `scoring/clutter_score.py` - Clutter detection (10 pts)

### Utilities
- ✅ `utils/image_processor.py` - Image preprocessing
- ✅ `utils/leaderboard.py` - Score tracking & ranking

### Documentation
- ✅ `README.md` - Project overview
- ✅ `QUICKSTART.md` - Quick start guide
- ✅ `STEP_BY_STEP_GUIDE.md` - Detailed walkthrough
- ✅ `ARCHITECTURE.md` - System architecture

### Testing & Examples
- ✅ `test_system.py` - Verify installation
- ✅ `example_usage.py` - Usage examples

## 🚀 Quick Start (3 Commands)

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Test the system
python test_system.py

# 3. Analyze a classroom
python main.py --image data/images/classroom.jpg --classroom "Room 101"
```

## 📊 Scoring System

```
┌─────────────────────────────────────────────────┐
│  CLASSROOM CLEANLINESS SCORE (0-50 points)      │
├─────────────────────────────────────────────────┤
│  Floor Cleanliness          [████████░░] 8/10   │
│  Furniture Orderliness      [███████░░░] 7/10   │
│  Trash Bin Condition        [█████████░] 9/10   │
│  Wall/Board Cleanliness     [████████░░] 8/10   │
│  Clutter Detection          [██████░░░░] 6/10   │
├─────────────────────────────────────────────────┤
│  TOTAL SCORE: 38/50                             │
│  RATING: Good ⭐⭐⭐⭐                            │
└─────────────────────────────────────────────────┘
```

### Rating Levels
- **45-50**: Excellent ⭐⭐⭐⭐⭐
- **35-44**: Good ⭐⭐⭐⭐
- **25-34**: Fair ⭐⭐⭐
- **0-24**: Poor ⭐⭐

## 🏆 Leaderboard Example

```
======================================================================
              CLASSROOM CLEANLINESS LEADERBOARD
======================================================================
Rank   Classroom       Score      Rating       Date
----------------------------------------------------------------------
1      Room 301        48.5       Excellent    2026-01-09
2      Room 205        42.0       Good         2026-01-09
3      Room 101        38.5       Good         2026-01-09
4      Room 402        33.2       Fair         2026-01-09
5      Room 103        28.7       Fair         2026-01-09
======================================================================
```

## 🔍 How It Works

### Step 1: Image Input
- Load classroom photo
- Resize to 640x640
- Extract regions (floor, wall, furniture)

### Step 2: Object Detection (YOLOv8)
Detects:
- Chairs, desks, tables
- Trash bins
- Clutter (bags, bottles, papers)
- Other classroom objects

### Step 3: Scoring (5 Parallel Modules)

**Floor Scorer:**
- Counts clutter on floor
- Analyzes debris particles
- Measures surface uniformity

**Furniture Scorer:**
- Checks chair-desk alignment
- Verifies orderly arrangement
- Detects surface clutter

**Trash Scorer:**
- Verifies bin presence
- Checks for overflow
- Detects trash outside bins

**Wall Scorer:**
- Detects marks/vandalism
- Checks board cleanliness
- Finds loose items

**Clutter Scorer:**
- Counts misplaced objects
- Penalizes based on quantity

### Step 4: Aggregation
- Sum all scores (0-50)
- Assign rating
- Save to leaderboard

### Step 5: Output
- Display detailed scores
- Show leaderboard ranking
- Save annotated image (optional)

## 🛠️ Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Object Detection | YOLOv8 | Detect classroom objects |
| Image Processing | OpenCV | Analyze images |
| Numerical Computing | NumPy | Calculate scores |
| Data Management | Pandas | Track history |
| Visualization | Matplotlib | Display results |

## 📁 Project Structure

```
classroom-cleanliness/
├── 📄 main.py                  # Run this!
├── ⚙️ config.py                # Settings
├── 📦 requirements.txt         # Dependencies
│
├── 🤖 models/
│   └── detector.py            # AI detection
│
├── 📊 scoring/
│   ├── floor_score.py         # 10 points
│   ├── furniture_score.py     # 10 points
│   ├── trash_score.py         # 10 points
│   ├── wall_score.py          # 10 points
│   └── clutter_score.py       # 10 points
│
├── 🔧 utils/
│   ├── image_processor.py     # Preprocessing
│   └── leaderboard.py         # Rankings
│
├── 💾 data/
│   ├── images/                # Your photos
│   └── scores.json            # History
│
└── 📚 Documentation/
    ├── README.md
    ├── QUICKSTART.md
    ├── STEP_BY_STEP_GUIDE.md
    └── ARCHITECTURE.md
```

## ✨ Key Features

✅ **Automated Analysis** - No manual inspection needed
✅ **Objective Scoring** - Consistent, unbiased evaluation
✅ **Competitive Leaderboard** - Motivates cleanliness
✅ **Detailed Reports** - Know exactly what needs fixing
✅ **Historical Tracking** - Monitor trends over time
✅ **Easy to Use** - Single command operation
✅ **Customizable** - Adjust weights and thresholds
✅ **Extensible** - Add new metrics easily

## 🎯 Use Cases

1. **Schools** - Daily classroom monitoring
2. **Universities** - Lecture hall maintenance
3. **Training Centers** - Facility management
4. **Competitions** - Cleanliness contests
5. **Audits** - Automated inspections

## 🔮 Future Enhancements

- [ ] Web dashboard
- [ ] Mobile app
- [ ] Real-time alerts
- [ ] Trend analysis
- [ ] Custom training
- [ ] Multi-camera support
- [ ] Integration with school systems

## 📈 Expected Results

**Before Implementation:**
- Manual inspections (time-consuming)
- Subjective scoring (inconsistent)
- No tracking (no accountability)

**After Implementation:**
- Automated analysis (seconds)
- Objective scoring (fair)
- Leaderboard tracking (motivating)

## 💡 Tips for Best Results

1. **Photo Quality**
   - Good lighting
   - Full room view
   - Clear, not blurry

2. **Consistent Timing**
   - Same time each day
   - After classes end
   - Before cleaning crew

3. **Camera Position**
   - From entrance
   - Capture floor, walls, furniture
   - Same angle each time

4. **Regular Monitoring**
   - Daily analysis
   - Weekly reviews
   - Monthly trends

## 🎓 Learning Outcomes

By building this system, you've learned:
- Computer vision with OpenCV
- Object detection with YOLO
- Image processing techniques
- Scoring algorithm design
- Data management with Pandas
- Python project structure
- Modular code design

## 📞 Next Steps

1. **Test It**: Run `python test_system.py`
2. **Try It**: Analyze a classroom image
3. **Customize It**: Adjust config.py
4. **Extend It**: Add new features
5. **Deploy It**: Use in production

---

**Ready to start?** → Read `STEP_BY_STEP_GUIDE.md`

**Need help?** → Check `QUICKSTART.md`

**Want details?** → See `ARCHITECTURE.md`
