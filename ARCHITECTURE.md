# System Architecture

## Project Structure

```
classroom-cleanliness/
├── main.py                      # Main application entry point
├── config.py                    # Configuration settings
├── requirements.txt             # Python dependencies
├── test_system.py              # Test script
├── example_usage.py            # Usage examples
├── README.md                   # Project documentation
├── QUICKSTART.md               # Quick start guide
├── ARCHITECTURE.md             # This file
│
├── models/                     # Object detection models
│   ├── __init__.py
│   └── detector.py            # YOLO object detector
│
├── scoring/                    # Scoring modules
│   ├── __init__.py
│   ├── floor_score.py         # Floor cleanliness (10 pts)
│   ├── furniture_score.py     # Furniture orderliness (10 pts)
│   ├── trash_score.py         # Trash bin condition (10 pts)
│   ├── wall_score.py          # Wall/board cleanliness (10 pts)
│   └── clutter_score.py       # Clutter detection (10 pts)
│
├── utils/                      # Utility modules
│   ├── __init__.py
│   ├── image_processor.py     # Image preprocessing
│   └── leaderboard.py         # Score tracking & ranking
│
└── data/                       # Data storage
    ├── images/                # Classroom images
    └── scores.json            # Historical scores
```

## Data Flow

```
1. IMAGE INPUT
   └─> Load classroom image
       └─> Preprocess & resize (640x640)
           └─> Extract regions (floor, wall, furniture)

2. OBJECT DETECTION
   └─> YOLOv8 model
       └─> Detect: chairs, desks, trash, clutter
           └─> Return bounding boxes & classes

3. SCORING MODULES (Parallel Processing)
   ├─> Floor Scorer
   │   ├─> Count floor clutter
   │   ├─> Analyze debris
   │   └─> Calculate uniformity
   │
   ├─> Furniture Scorer
   │   ├─> Check chair-desk alignment
   │   ├─> Verify arrangement
   │   └─> Detect surface clutter
   │
   ├─> Trash Scorer
   │   ├─> Verify bin presence
   │   ├─> Check overflow
   │   └─> Detect trash outside bins
   │
   ├─> Wall Scorer
   │   ├─> Detect marks/vandalism
   │   ├─> Check board cleanliness
   │   └─> Find loose items
   │
   └─> Clutter Scorer
       └─> Count clutter objects

4. AGGREGATION
   └─> Sum all scores (0-50)
       └─> Assign rating (Excellent/Good/Fair/Poor)
           └─> Save to leaderboard

5. OUTPUT
   ├─> Display scores
   ├─> Show leaderboard ranking
   └─> Save annotated image (optional)
```

## Scoring Algorithm

### Floor Cleanliness (0-10 points)
```
Base Score: 10
- Clutter on floor: -1.5 per item (max -5)
- Debris particles: -3 based on count
- Low uniformity: -2 based on variance
```

### Furniture Orderliness (0-10 points)
```
Base Score: 10
- Poor chair-desk alignment: -4
- Disorganized arrangement: -3
- Surface clutter: -0.5 per item (max -3)
```

### Trash Bin Condition (0-10 points)
```
Base Score: 10
- No bin visible: -3
- Trash outside bins: -2 per item (max -4)
- Overflow detected: -1.5 per bin (max -3)
```

### Wall/Board Cleanliness (0-10 points)
```
Base Score: 10
- Marks/vandalism: -4 based on edge density
- Dirty board: -3 based on variance
- Loose items: -1.5 per item (max -3)
```

### Clutter Detection (0-10 points)
```
Base Score: 10
- Clutter objects: -1.5 per item (max -10)
```

## Key Technologies

1. **YOLOv8** (Ultralytics)
   - Real-time object detection
   - Pre-trained on COCO dataset
   - Detects 80+ object classes

2. **OpenCV**
   - Image preprocessing
   - Edge detection
   - Color analysis

3. **NumPy**
   - Numerical computations
   - Array operations
   - Statistical analysis

4. **Pandas**
   - Data management
   - Leaderboard tracking
   - Historical analysis

## Extensibility

### Adding New Metrics
1. Create new scorer in `scoring/`
2. Implement `calculate_score()` method
3. Add to `main.py` aggregation
4. Update config weights

### Custom Object Detection
1. Train custom YOLO model
2. Replace model in `detector.py`
3. Update class names in config

### Database Integration
1. Replace JSON storage in `leaderboard.py`
2. Add database connector
3. Implement CRUD operations
