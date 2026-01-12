# 📝 Commands Cheat Sheet

## Installation

```bash
# Install all dependencies
pip install -r requirements.txt

# Upgrade if already installed
pip install --upgrade -r requirements.txt
```

## Testing

```bash
# Test the system (no images needed)
python test_system.py

# Expected: All scorers tested successfully
```

## Basic Usage

```bash
# Analyze single classroom
python main.py --image data/images/classroom_a.jpg --classroom "Classroom A"

# Analyze and show leaderboard
python main.py --image data/images/classroom_a.jpg --classroom "Classroom A" --show-leaderboard

# Analyze and save annotated image
python main.py --image data/images/classroom_a.jpg --classroom "Classroom A" --save-output output.jpg

# All options combined
python main.py --image data/images/classroom_a.jpg --classroom "Classroom A" --show-leaderboard --save-output output.jpg
```

## Batch Processing

```bash
# Analyze multiple classrooms (Windows CMD)
python main.py --image data/images/classroom_a.jpg --classroom "Classroom A" & python main.py --image data/images/classroom_b.jpg --classroom "Classroom B" & python main.py --image data/images/classroom_c.jpg --classroom "Classroom C"

# Show final leaderboard
python main.py --image data/images/classroom_d.jpg --classroom "Classroom D" --show-leaderboard
```

## Python API Usage

```python
# Import the system
from main import ClassroomCleanliness

# Initialize
system = ClassroomCleanliness()

# Analyze classroom
result = system.analyze_classroom(
    image_path='data/images/classroom_a.jpg',
    classroom_id='Classroom A'
)

# Access results
print(result['total_score'])    # e.g., 42.5
print(result['rating'])         # e.g., "Good"
print(result['scores'])         # Individual scores dict

# Display leaderboard
system.leaderboard.display_leaderboard()

# Get classroom history
history = system.leaderboard.get_classroom_history('Classroom A')
for entry in history:
    print(f"{entry['timestamp']}: {entry['total_score']}")
```

## File Management

```bash
# Create image directory
mkdir data/images

# View scores file
type data\scores.json

# Clear scores (start fresh)
del data\scores.json
```

## Configuration

```python
# Edit config.py to customize

# Adjust scoring weights
FLOOR_WEIGHT = 10
FURNITURE_WEIGHT = 10
TRASH_WEIGHT = 10
WALL_WEIGHT = 10
CLUTTER_WEIGHT = 10

# Adjust detection sensitivity
CONFIDENCE_THRESHOLD = 0.5  # 0.3 = more sensitive, 0.7 = more strict

# Adjust rating thresholds
RATING_EXCELLENT = 45
RATING_GOOD = 35
RATING_FAIR = 25
```

## Troubleshooting Commands

```bash
# Check Python version (need 3.8+)
python --version

# Check installed packages
pip list

# Reinstall specific package
pip install --force-reinstall opencv-python

# Check if ultralytics is installed
python -c "import ultralytics; print(ultralytics.__version__)"

# Test OpenCV
python -c "import cv2; print(cv2.__version__)"
```

## Quick Examples

### Example 1: Single Analysis
```bash
python main.py --image data/images/room101.jpg --classroom "Room 101"
```

### Example 2: With Leaderboard
```bash
python main.py --image data/images/room101.jpg --classroom "Room 101" --show-leaderboard
```

### Example 3: Save Annotated
```bash
python main.py --image data/images/room101.jpg --classroom "Room 101" --save-output annotated_room101.jpg
```

### Example 4: Batch Analysis Script
Create `analyze_all.bat`:
```batch
@echo off
python main.py --image data/images/classroom_a.jpg --classroom "Classroom A"
python main.py --image data/images/classroom_b.jpg --classroom "Classroom B"
python main.py --image data/images/classroom_c.jpg --classroom "Classroom C"
python main.py --image data/images/classroom_d.jpg --classroom "Classroom D" --show-leaderboard
pause
```

Run it:
```bash
analyze_all.bat
```

## Advanced Python Usage

### Custom Analysis
```python
from models.detector import ObjectDetector
from scoring.floor_score import FloorScorer
import cv2

# Load image
image = cv2.imread('classroom.jpg')

# Detect objects
detector = ObjectDetector()
detections = detector.detect_objects(image)

# Score floor only
scorer = FloorScorer()
floor_region = image[384:640, :]  # Bottom 40%
score = scorer.calculate_score(floor_region, detections)
details = scorer.get_details(floor_region, detections)

print(f"Floor Score: {score}/10")
print(f"Details: {details}")
```

### Access Leaderboard Data
```python
from utils.leaderboard import Leaderboard
import json

# Load leaderboard
lb = Leaderboard()

# Get latest scores
scores = lb.get_latest_scores()
for entry in scores:
    print(f"{entry['classroom_id']}: {entry['total_score']}")

# Get specific classroom history
history = lb.get_classroom_history('Classroom A')
print(f"Total entries: {len(history)}")

# Read raw data
with open('data/scores.json', 'r') as f:
    data = json.load(f)
    print(f"Total records: {len(data)}")
```

## Common Workflows

### Daily Monitoring
```bash
# 1. Take photos of all classrooms
# 2. Run analysis
python main.py --image data/images/room101.jpg --classroom "Room 101"
python main.py --image data/images/room102.jpg --classroom "Room 102"
# ... repeat for all rooms

# 3. View leaderboard
python main.py --image data/images/room103.jpg --classroom "Room 103" --show-leaderboard
```

### Weekly Review
```python
from utils.leaderboard import Leaderboard
import pandas as pd

lb = Leaderboard()

# Get all scores
with open('data/scores.json', 'r') as f:
    data = json.load(f)

df = pd.DataFrame(data)
df['timestamp'] = pd.to_datetime(df['timestamp'])

# Filter last 7 days
last_week = df[df['timestamp'] > pd.Timestamp.now() - pd.Timedelta(days=7)]

# Average score by classroom
avg_scores = last_week.groupby('classroom_id')['total_score'].mean()
print(avg_scores.sort_values(ascending=False))
```

## Quick Reference

| Task | Command |
|------|---------|
| Install | `pip install -r requirements.txt` |
| Test | `python test_system.py` |
| Analyze | `python main.py --image IMAGE --classroom NAME` |
| Leaderboard | Add `--show-leaderboard` flag |
| Save Output | Add `--save-output FILE` flag |
| View Scores | `type data\scores.json` |
| Clear Data | `del data\scores.json` |

## Help

```bash
# Show all available options
python main.py --help
```
