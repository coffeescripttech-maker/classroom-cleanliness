from ultralytics import YOLO
import cv2
import numpy as np
from config import CONFIDENCE_THRESHOLD, CLUTTER_OBJECTS, FURNITURE_OBJECTS

class ObjectDetector:
    """Handles object detection using YOLO"""
    
    def __init__(self, model_name='yolov8n.pt'):
        """Initialize YOLO model"""
        try:
            self.model = YOLO(model_name)
            print(f"Loaded model: {model_name}")
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model = None
    
    def detect_objects(self, image, confidence=CONFIDENCE_THRESHOLD):
        """Detect objects in image"""
        if self.model is None:
            return []
        
        results = self.model(image, conf=confidence, verbose=False)
        
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                detection = {
                    'class': result.names[int(box.cls[0])],
                    'confidence': float(box.conf[0]),
                    'bbox': box.xyxy[0].cpu().numpy().tolist(),
                    'center': self._get_center(box.xyxy[0].cpu().numpy())
                }
                detections.append(detection)
        
        return detections
    
    def _get_center(self, bbox):
        """Calculate center point of bounding box"""
        x1, y1, x2, y2 = bbox
        return [(x1 + x2) / 2, (y1 + y2) / 2]
    
    def filter_by_class(self, detections, class_list):
        """Filter detections by class names"""
        return [d for d in detections if d['class'] in class_list]
    
    def count_objects(self, detections, class_name):
        """Count objects of a specific class"""
        return sum(1 for d in detections if d['class'] == class_name)
    
    def draw_detections(self, image, detections):
        """Draw bounding boxes on image with color coding"""
        img_copy = image.copy()
        
        # Color coding for different object types
        color_map = {
            'chair': (0, 255, 0),      # Green
            'couch': (0, 255, 0),      # Green
            'dining table': (0, 200, 255),  # Orange
            'bottle': (0, 0, 255),     # Red
            'cup': (0, 0, 255),        # Red
            'backpack': (255, 0, 0),   # Blue
            'handbag': (255, 0, 0),    # Blue
            'book': (255, 255, 0),     # Cyan
            'cell phone': (255, 0, 255),  # Magenta
        }
        
        for det in detections:
            x1, y1, x2, y2 = map(int, det['bbox'])
            label = f"{det['class']}: {det['confidence']:.2f}"
            
            # Get color based on object class
            color = color_map.get(det['class'], (0, 255, 0))  # Default green
            
            # Draw box with thicker line
            cv2.rectangle(img_copy, (x1, y1), (x2, y2), color, 3)
            
            # Draw label background
            label_size, _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
            cv2.rectangle(img_copy, (x1, y1-label_size[1]-10), 
                         (x1+label_size[0], y1), color, -1)
            
            # Draw label text
            cv2.putText(img_copy, label, (x1, y1-5), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        # Add legend
        legend_y = 30
        cv2.putText(img_copy, "Detected Objects:", (10, legend_y), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        return img_copy
