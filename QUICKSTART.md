# Quick Start Guide

## Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- OpenCV for image processing
- YOLOv8 for object detection
- NumPy for numerical operations
- Pandas for data management
- Matplotlib for visualization

## Step 2: Test the System

Run the test script to verify everything works:

```bash
python test_system.py
```

This will test all scoring modules without requiring actual images.

## Step 3: Prepare Your Data

Create a folder for classroom images:

```bash
mkdir -p data/images
```

Add your classroom images to this folder.

## Step 4: Analyze a Classroom

Run the analysis on a classroom image:

```bash
python main.py --image data/images/classroom_a.jpg --classroom "Classroom A"
```

## Step 5: View the Leaderboard

After analyzing multiple classrooms, view the rankings:

```bash
python main.py --image data/images/classroom_b.jpg --classroom "Classroom B" --show-leaderboard
```

## Step 6: Save Annotated Images

Save the analysis with detected objects highlighted:

```bash
python main.py --image data/images/classroom_a.jpg --classroom "Classroom A" --save-output output.jpg
```

## Example Workflow

```python
from main import ClassroomCleanliness

# Initialize system
system = ClassroomCleanliness()

# Analyze classroom
result = system.analyze_classroom(
    image_path='data/images/classroom_a.jpg',
    classroom_id='Classroom A'
)

# View leaderboard
system.leaderboard.display_leaderboard()
```

## Understanding the Scores

Each metric is scored from 0-10:

1. **Floor Cleanliness** (10 points)
   - Detects trash and debris on floor
   - Analyzes floor uniformity
   - Counts clutter objects

2. **Furniture Orderliness** (10 points)
   - Checks chair-desk alignment
   - Verifies furniture arrangement
   - Detects clutter on surfaces

3. **Trash Bin Condition** (10 points)
   - Verifies bin presence
   - Checks for overflow
   - Detects trash outside bins

4. **Wall/Board Cleanliness** (10 points)
   - Detects marks and vandalism
   - Checks board erasure
   - Identifies loose items

5. **Clutter Detection** (10 points)
   - Counts bags, bottles, papers
   - Penalizes based on quantity

**Total: 50 points**

### Rating Levels
- 45-50: Excellent ⭐⭐⭐⭐⭐
- 35-44: Good ⭐⭐⭐⭐
- 25-34: Fair ⭐⭐⭐
- Below 25: Poor ⭐⭐

## Troubleshooting

### Model Download
On first run, YOLOv8 will automatically download the model (~6MB). This is normal.

### No Objects Detected
- Ensure image quality is good
- Check lighting conditions
- Try adjusting confidence threshold in config.py

### Import Errors
Make sure all dependencies are installed:
```bash
pip install --upgrade -r requirements.txt
```
