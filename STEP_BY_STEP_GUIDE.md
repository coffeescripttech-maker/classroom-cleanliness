# Step-by-Step Implementation Guide

## ✅ What We've Built

A complete Python system that:
- Analyzes classroom images using AI
- Scores cleanliness across 5 metrics (0-50 scale)
- Ranks classrooms on a leaderboard
- Provides detailed analysis reports

## 📋 Phase 1: Setup (5 minutes)

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

**What gets installed:**
- `opencv-python` - Image processing
- `ultralytics` - YOLOv8 object detection
- `numpy` - Numerical operations
- `pandas` - Data management
- `matplotlib` - Visualization

### 2. Verify Installation

```bash
python test_system.py
```

**Expected output:**
```
Testing Classroom Cleanliness System
==================================================

1. Testing Floor Scorer...
   Floor Score: 7.50/10
   Details: {...}

2. Testing Furniture Scorer...
   Furniture Score: 8.20/10
   ...

TOTAL SCORE: 38.50/50
RATING: Good
==================================================

✓ All scorers tested successfully!
```

## 📸 Phase 2: Prepare Images (10 minutes)

### 1. Create Image Directory

```bash
mkdir data/images
```

### 2. Add Classroom Photos

Place your classroom images in `data/images/`:
- `classroom_a.jpg`
- `classroom_b.jpg`
- `classroom_c.jpg`

**Photo Tips:**
- Take from classroom entrance
- Capture full room view
- Good lighting
- Clear, not blurry
- Include floor, furniture, walls

## 🚀 Phase 3: Run Analysis (2 minutes)

### Analyze Single Classroom

```bash
python main.py --image data/images/classroom_a.jpg --classroom "Classroom A"
```

**Output:**
```
Analyzing classroom: Classroom A
--------------------------------------------------
Detecting objects...
Found 15 objects

Calculating scores...

==================================================
RESULTS FOR: Classroom A
==================================================
Floor Cleanliness:      8.5/10
Furniture Orderliness:  7.2/10
Trash Bin Condition:    9.0/10
Wall/Board Cleanliness: 8.8/10
Clutter Detection:      6.5/10
--------------------------------------------------
TOTAL SCORE:            40.0/50
RATING:                 Good
==================================================
```

### Analyze Multiple Classrooms

```bash
python main.py --image data/images/classroom_a.jpg --classroom "Classroom A"
python main.py --image data/images/classroom_b.jpg --classroom "Classroom B"
python main.py --image data/images/classroom_c.jpg --classroom "Classroom C"
```

### View Leaderboard

```bash
python main.py --image data/images/classroom_d.jpg --classroom "Classroom D" --show-leaderboard
```

**Output:**
```
======================================================================
              CLASSROOM CLEANLINESS LEADERBOARD
======================================================================
Rank   Classroom       Score      Rating       Date
----------------------------------------------------------------------
1      Classroom C     47.5       Excellent    2026-01-09
2      Classroom A     40.0       Good         2026-01-09
3      Classroom B     38.2       Good         2026-01-09
4      Classroom D     32.1       Fair         2026-01-09
======================================================================
```

## 🎯 Phase 4: Understanding Scores

### Score Breakdown

Each metric contributes 0-10 points:

**1. Floor Cleanliness (10 pts)**
- ✓ No trash on floor
- ✓ Clean surface
- ✓ No debris particles

**2. Furniture Orderliness (10 pts)**
- ✓ Chairs under desks
- ✓ Desks in rows
- ✓ No clutter on surfaces

**3. Trash Bin Condition (10 pts)**
- ✓ Bin visible
- ✓ No overflow
- ✓ Trash contained

**4. Wall/Board Cleanliness (10 pts)**
- ✓ No marks/vandalism
- ✓ Board erased
- ✓ Posters secure

**5. Clutter Detection (10 pts)**
- ✓ No bags on floor
- ✓ No bottles left out
- ✓ No papers scattered

### Rating Scale

| Score | Rating | Description |
|-------|--------|-------------|
| 45-50 | Excellent ⭐⭐⭐⭐⭐ | Spotless classroom |
| 35-44 | Good ⭐⭐⭐⭐ | Minor issues |
| 25-34 | Fair ⭐⭐⭐ | Needs attention |
| 0-24  | Poor ⭐⭐ | Requires cleaning |

## 🔧 Phase 5: Customization

### Adjust Scoring Weights

Edit `config.py`:

```python
# Change weights (default: 10 each)
FLOOR_WEIGHT = 15      # Prioritize floor
FURNITURE_WEIGHT = 10
TRASH_WEIGHT = 10
WALL_WEIGHT = 5        # Less important
CLUTTER_WEIGHT = 10
```

### Adjust Detection Sensitivity

Edit `config.py`:

```python
# Lower = more detections, Higher = fewer false positives
CONFIDENCE_THRESHOLD = 0.5  # Default
CONFIDENCE_THRESHOLD = 0.3  # More sensitive
CONFIDENCE_THRESHOLD = 0.7  # More strict
```

### Add Custom Clutter Objects

Edit `config.py`:

```python
CLUTTER_OBJECTS = [
    'backpack', 'handbag', 'bottle', 'book', 
    'cell phone', 'umbrella', 'sports ball'  # Add more
]
```

## 📊 Phase 6: Advanced Usage

### Save Annotated Images

```bash
python main.py --image data/images/classroom_a.jpg --classroom "Classroom A" --save-output annotated_a.jpg
```

This saves an image with detected objects highlighted.

### Use Python API

```python
from main import ClassroomCleanliness

# Initialize
system = ClassroomCleanliness()

# Analyze
result = system.analyze_classroom(
    image_path='data/images/classroom_a.jpg',
    classroom_id='Classroom A'
)

# Access results
print(f"Total Score: {result['total_score']}")
print(f"Rating: {result['rating']}")
print(f"Individual Scores: {result['scores']}")

# View leaderboard
system.leaderboard.display_leaderboard()

# Get classroom history
history = system.leaderboard.get_classroom_history('Classroom A')
```

## 🎓 Next Steps

### 1. Collect Training Data
- Take photos of clean vs dirty classrooms
- Label specific issues
- Fine-tune detection model

### 2. Add Web Interface
- Use Flask/FastAPI
- Upload images via browser
- Display real-time leaderboard

### 3. Automate Monitoring
- Schedule daily captures
- Send alerts for low scores
- Track trends over time

### 4. Expand Metrics
- Add noise level detection
- Monitor air quality
- Check lighting conditions

## ❓ Troubleshooting

### Issue: "No module named 'ultralytics'"
**Solution:** 
```bash
pip install ultralytics
```

### Issue: "Model download failed"
**Solution:** Check internet connection. YOLOv8 downloads on first run.

### Issue: "No objects detected"
**Solution:** 
- Check image quality
- Ensure good lighting
- Lower confidence threshold in config.py

### Issue: "Low scores for clean classroom"
**Solution:**
- Adjust scoring weights in config.py
- Check camera angle (should capture full room)
- Verify object detection is working

## 📞 Support

For issues or questions:
1. Check ARCHITECTURE.md for system details
2. Review example_usage.py for code examples
3. Run test_system.py to verify setup
