"""
Test script to verify the system works without actual images
"""

import numpy as np
import cv2
from models.detector import ObjectDetector
from scoring.floor_score import FloorScorer
from scoring.furniture_score import FurnitureScorer
from scoring.trash_score import TrashScorer
from scoring.wall_score import WallScorer
from scoring.clutter_score import ClutterScorer

def create_test_image():
    """Create a dummy test image"""
    # Create a 640x640 test image
    image = np.random.randint(0, 255, (640, 640, 3), dtype=np.uint8)
    return image

def create_mock_detections():
    """Create mock detection data"""
    detections = [
        {'class': 'chair', 'confidence': 0.9, 'bbox': [100, 300, 200, 400], 'center': [150, 350]},
        {'class': 'chair', 'confidence': 0.85, 'bbox': [250, 300, 350, 400], 'center': [300, 350]},
        {'class': 'dining table', 'confidence': 0.92, 'bbox': [120, 250, 320, 350], 'center': [220, 300]},
        {'class': 'bottle', 'confidence': 0.75, 'bbox': [400, 500, 420, 550], 'center': [410, 525]},
        {'class': 'backpack', 'confidence': 0.88, 'bbox': [500, 450, 580, 550], 'center': [540, 500]},
    ]
    return detections

def test_scorers():
    """Test all scoring modules"""
    print("Testing Classroom Cleanliness System")
    print("="*50)
    
    # Create test data
    image = create_test_image()
    detections = create_mock_detections()
    
    # Test Floor Scorer
    print("\n1. Testing Floor Scorer...")
    floor_scorer = FloorScorer()
    floor_region = image[384:640, :]  # Bottom 40%
    floor_score = floor_scorer.calculate_score(floor_region, detections)
    floor_details = floor_scorer.get_details(floor_region, detections)
    print(f"   Floor Score: {floor_score:.2f}/10")
    print(f"   Details: {floor_details}")
    
    # Test Furniture Scorer
    print("\n2. Testing Furniture Scorer...")
    furniture_scorer = FurnitureScorer()
    furniture_score = furniture_scorer.calculate_score(image, detections)
    furniture_details = furniture_scorer.get_details(image, detections)
    print(f"   Furniture Score: {furniture_score:.2f}/10")
    print(f"   Details: {furniture_details}")
    
    # Test Trash Scorer
    print("\n3. Testing Trash Scorer...")
    trash_scorer = TrashScorer()
    trash_score = trash_scorer.calculate_score(image, detections)
    trash_details = trash_scorer.get_details(image, detections)
    print(f"   Trash Score: {trash_score:.2f}/10")
    print(f"   Details: {trash_details}")
    
    # Test Wall Scorer
    print("\n4. Testing Wall Scorer...")
    wall_scorer = WallScorer()
    wall_region = image[0:256, :]  # Top 40%
    wall_score = wall_scorer.calculate_score(wall_region, detections)
    wall_details = wall_scorer.get_details(wall_region, detections)
    print(f"   Wall Score: {wall_score:.2f}/10")
    print(f"   Details: {wall_details}")
    
    # Test Clutter Scorer
    print("\n5. Testing Clutter Scorer...")
    clutter_scorer = ClutterScorer()
    clutter_score = clutter_scorer.calculate_score(detections)
    clutter_details = clutter_scorer.get_details(detections)
    print(f"   Clutter Score: {clutter_score:.2f}/10")
    print(f"   Details: {clutter_details}")
    
    # Calculate total
    total_score = floor_score + furniture_score + trash_score + wall_score + clutter_score
    
    print("\n" + "="*50)
    print(f"TOTAL SCORE: {total_score:.2f}/50")
    
    if total_score >= 45:
        rating = "Excellent"
    elif total_score >= 35:
        rating = "Good"
    elif total_score >= 25:
        rating = "Fair"
    else:
        rating = "Poor"
    
    print(f"RATING: {rating}")
    print("="*50)
    
    print("\n✓ All scorers tested successfully!")

if __name__ == "__main__":
    test_scorers()
