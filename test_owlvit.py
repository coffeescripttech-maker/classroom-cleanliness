"""
Test script for OWL-ViT detector
"""

import cv2
import numpy as np
from models.owlvit_detector import OWLViTDetector

def test_owlvit():
    print("="*60)
    print("Testing OWL-ViT Detector")
    print("="*60)
    
    # Create test image
    print("\n1. Creating test image...")
    image = np.random.randint(0, 255, (640, 640, 3), dtype=np.uint8)
    print("✓ Test image created (640x640)")
    
    # Initialize detector
    print("\n2. Initializing OWL-ViT detector...")
    detector = OWLViTDetector()
    
    if detector.model is None:
        print("❌ Failed to load OWL-ViT model")
        print("\nPlease install requirements:")
        print("pip install transformers torch torchvision")
        return
    
    # Test detection
    print("\n3. Testing object detection...")
    test_objects = [
        "chair", "desk", "papers", "trash bin",
        "whiteboard", "backpack", "bottle"
    ]
    
    print(f"Looking for: {', '.join(test_objects)}")
    
    detections = detector.detect_objects(image, test_objects, confidence=0.1)
    
    print(f"\n✓ Detection completed!")
    print(f"Found {len(detections)} objects")
    
    if detections:
        print("\nDetected objects:")
        for det in detections:
            print(f"  • {det['class']}: {det['confidence']:.2%}")
    else:
        print("\nNo objects detected (this is normal for random test image)")
    
    print("\n" + "="*60)
    print("OWL-ViT Test Complete!")
    print("="*60)
    print("\n✅ OWL-ViT is ready to use!")
    print("\nNext steps:")
    print("1. Run: python main.py --image data/classroom2.png --classroom 'Test' --use-owlvit")
    print("2. Compare scores with and without --use-owlvit flag")
    print("3. Check OWLVIT_SETUP.md for more details")

if __name__ == "__main__":
    test_owlvit()
