import argparse
import cv2
from models.detector import ObjectDetector
from utils.image_processor import ImageProcessor
from utils.leaderboard import Leaderboard
from scoring.floor_score import FloorScorer
from scoring.furniture_score import FurnitureScorer
from scoring.trash_score import TrashScorer
from scoring.wall_score import WallScorer
from scoring.clutter_score import ClutterScorer
import config

# Try to import OWL-ViT (optional)
try:
    from models.owlvit_detector import OWLViTDetector
    OWLVIT_AVAILABLE = True
except ImportError:
    OWLVIT_AVAILABLE = False
    print("⚠️  OWL-ViT not available. Install with: pip install transformers torch")

class ClassroomCleanliness:
    """Main class for classroom cleanliness assessment"""
    
    def __init__(self, use_owlvit=False):
        self.detector = ObjectDetector()
        self.processor = ImageProcessor()
        self.leaderboard = Leaderboard()
        
        # Initialize OWL-ViT if requested and available
        self.use_owlvit = use_owlvit and OWLVIT_AVAILABLE
        if self.use_owlvit:
            print("\n🦉 Initializing OWL-ViT detector...")
            self.owlvit_detector = OWLViTDetector()
        else:
            self.owlvit_detector = None
        
        # Initialize scorers
        self.floor_scorer = FloorScorer()
        self.furniture_scorer = FurnitureScorer()
        self.trash_scorer = TrashScorer()
        self.wall_scorer = WallScorer()
        self.clutter_scorer = ClutterScorer()
    
    def analyze_classroom(self, image_path, classroom_id):
        """Analyze classroom image and calculate scores"""
        print(f"\nAnalyzing classroom: {classroom_id}")
        print("-" * 50)
        
        # Load image
        image = self.processor.load_image(image_path)
        if image is None:
            print("Failed to load image")
            return None
        
        # Preprocess
        resized, normalized = self.processor.preprocess(image)
        
        # Extract regions
        regions = self.processor.extract_regions(resized)
        
        # Detect objects with YOLO
        print("Detecting objects with YOLOv8...")
        yolo_detections = self.detector.detect_objects(resized)
        print(f"YOLOv8 found {len(yolo_detections)} objects")
        
        # Detect classroom-specific objects with OWL-ViT if enabled
        owlvit_detections = []
        if self.use_owlvit and self.owlvit_detector:
            print("\n🦉 Detecting classroom-specific objects with OWL-ViT...")
            owlvit_detections = self.owlvit_detector.detect_objects(
                resized, 
                config.CLASSROOM_OBJECTS,
                confidence=config.OWLVIT_CONFIDENCE
            )
            print(f"OWL-ViT found {len(owlvit_detections)} additional objects")
        
        # Combine detections
        detections = yolo_detections + owlvit_detections
        print(f"\nTotal objects detected: {len(detections)}")
        
        # Calculate individual scores
        print("\nCalculating scores...")
        
        floor_score = self.floor_scorer.calculate_score(regions['floor'], detections)
        furniture_score = self.furniture_scorer.calculate_score(resized, detections)
        trash_score = self.trash_scorer.calculate_score(resized, detections)
        wall_score = self.wall_scorer.calculate_score(regions['wall'], detections)
        clutter_score = self.clutter_scorer.calculate_score(detections)
        
        # Calculate total score
        total_score = (floor_score + furniture_score + trash_score + 
                      wall_score + clutter_score)
        
        # Determine rating
        rating = self._get_rating(total_score)
        
        # Prepare results
        scores = {
            'floor': round(floor_score, 2),
            'furniture': round(furniture_score, 2),
            'trash': round(trash_score, 2),
            'wall': round(wall_score, 2),
            'clutter': round(clutter_score, 2)
        }
        
        # Display results
        self._display_results(classroom_id, scores, total_score, rating)
        
        # Save to leaderboard
        self.leaderboard.add_score(classroom_id, scores, total_score, rating)
        
        # Draw detections
        annotated = self.detector.draw_detections(resized, yolo_detections)
        
        # Draw OWL-ViT detections if available
        if owlvit_detections and self.owlvit_detector:
            annotated = self.owlvit_detector.draw_detections(annotated, owlvit_detections)
        
        # Print detection summary
        print("\n📋 Detected Objects:")
        object_counts = {}
        for det in detections:
            obj_class = det['class']
            object_counts[obj_class] = object_counts.get(obj_class, 0) + 1
        
        for obj_class, count in sorted(object_counts.items()):
            print(f"   • {obj_class}: {count}")
        
        return {
            'scores': scores,
            'total_score': total_score,
            'rating': rating,
            'annotated_image': annotated,
            'detections': detections
        }
    
    def _get_rating(self, total_score):
        """Determine rating based on total score"""
        if total_score >= config.RATING_EXCELLENT:
            return "Excellent"
        elif total_score >= config.RATING_GOOD:
            return "Good"
        elif total_score >= config.RATING_FAIR:
            return "Fair"
        else:
            return "Poor"
    
    def _display_results(self, classroom_id, scores, total_score, rating):
        """Display analysis results"""
        print("\n" + "="*50)
        print(f"RESULTS FOR: {classroom_id}")
        print("="*50)
        print(f"Floor Cleanliness:      {scores['floor']}/10")
        print(f"Furniture Orderliness:  {scores['furniture']}/10")
        print(f"Trash Bin Condition:    {scores['trash']}/10")
        print(f"Wall/Board Cleanliness: {scores['wall']}/10")
        print(f"Clutter Detection:      {scores['clutter']}/10")
        print("-"*50)
        print(f"TOTAL SCORE:            {total_score:.1f}/50")
        print(f"RATING:                 {rating}")
        print("="*50 + "\n")

def main():
    parser = argparse.ArgumentParser(description='Classroom Cleanliness Assessment')
    parser.add_argument('--image', type=str, required=True, help='Path to classroom image')
    parser.add_argument('--classroom', type=str, required=True, help='Classroom ID')
    parser.add_argument('--show-leaderboard', action='store_true', help='Show leaderboard')
    parser.add_argument('--save-output', type=str, help='Save annotated image')
    parser.add_argument('--show-image', action='store_true', help='Display annotated image in window')
    parser.add_argument('--no-display', action='store_true', help='Do not display image (default shows image)')
    parser.add_argument('--show-all-detections', action='store_true', help='Show detailed list of all detected objects')
    parser.add_argument('--use-owlvit', action='store_true', help='Use OWL-ViT for detecting classroom-specific objects')
    
    args = parser.parse_args()
    
    # Initialize system
    system = ClassroomCleanliness(use_owlvit=args.use_owlvit)
    
    # Analyze classroom
    result = system.analyze_classroom(args.image, args.classroom)
    
    if result:
        # Show detailed detections if requested
        if args.show_all_detections:
            print("\n" + "="*50)
            print("DETAILED DETECTION LIST")
            print("="*50)
            for idx, det in enumerate(result['detections'], 1):
                print(f"{idx}. {det['class']}")
                print(f"   Confidence: {det['confidence']:.2%}")
                print(f"   Position: {det['center']}")
                print(f"   BBox: {[int(x) for x in det['bbox']]}")
                print()
        
        # Save annotated image if requested
        if args.save_output:
            cv2.imwrite(args.save_output, result['annotated_image'])
            print(f"\n✓ Saved annotated image to: {args.save_output}")
        
        # Display annotated image (default behavior unless --no-display is used)
        if not args.no_display or args.show_image:
            print("\n📸 Displaying annotated image... (Press any key to close)")
            cv2.imshow(f'Classroom Analysis - {args.classroom}', result['annotated_image'])
            cv2.waitKey(0)
            cv2.destroyAllWindows()
    
    # Show leaderboard
    if args.show_leaderboard:
        system.leaderboard.display_leaderboard()

if __name__ == "__main__":
    main()
