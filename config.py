# Configuration file for classroom cleanliness system

# Scoring weights (out of 10 each)
FLOOR_WEIGHT = 10
FURNITURE_WEIGHT = 10
TRASH_WEIGHT = 10
WALL_WEIGHT = 10
CLUTTER_WEIGHT = 10

# Rating thresholds
RATING_EXCELLENT = 45
RATING_GOOD = 35
RATING_FAIR = 25

# Object detection settings
CONFIDENCE_THRESHOLD = 0.5
IOU_THRESHOLD = 0.4

# Detected object classes
# Note: YOLO detects 80 COCO objects. Some classroom items map to similar objects:
# - Papers → detected as "book"
# - Jacket → detected as "handbag" or "tie"
# - Ballpen → detected as "scissors" (sometimes)

CLUTTER_OBJECTS = [
    'bags',
    'backpack', 'handbag', 'bottle', 'book', 'cell phone',
    'umbrella', 'tie', 'suitcase', 'scissors', 'cup',
    'laptop', 'keyboard', 'mouse', 'remote', 'sports ball', 'teddy bear'
]

FURNITURE_OBJECTS = ['chair', 'couch', 'dining table', 'bed', 'bench']

TRASH_OBJECTS = ['bottle', 'cup', 'bowl']  # Items that should be in trash

# Image processing
IMAGE_SIZE = (640, 640)

# OWL-ViT Configuration
USE_OWLVIT = False  # Set to True to use OWL-ViT detector
OWLVIT_CONFIDENCE = 0.1  # Lower threshold for OWL-ViT (more sensitive)

# Classroom-specific objects for OWL-ViT detection
CLASSROOM_OBJECTS = [
    # Floor cleanliness
    "papers on floor", "plastic wrapper on floor", "trash on floor",
    "dirt on floor", "debris on floor","bags on floor",
    
    # Furniture (backup for YOLO)
    "chair", "desk", "table",
    
    # Trash bin
    "trash bin", "garbage can", "waste basket",
    
    # Wall and board
    "whiteboard", "blackboard", "chalkboard",
    "poster on wall", "bulletin board",
    
    # Clutter items
    "backpack on floor", "bag on desk", "bottle on desk",
    "jacket on chair", "coat hanging", "ballpen on desk",
    "papers on desk", "notebook on desk", "folder on desk",
    "umbrella", "lunch box", "water bottle","bags on floor"
]
