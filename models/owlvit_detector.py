"""
OWL-ViT Detector - Open-vocabulary object detection
Detects objects by text description (unlimited objects!)
"""

import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Suppress TensorFlow warnings
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

from transformers import OwlViTProcessor, OwlViTForObjectDetection
import torch
from PIL import Image
import cv2
import numpy as np

class OWLViTDetector:
    """Open-vocabulary object detector using OWL-ViT"""
    
    def __init__(self, model_name="google/owlvit-base-patch32"):
        """Initialize OWL-ViT model"""
        print(f"Loading OWL-ViT model: {model_name}")
        print("This may take a minute on first run...")
        
        try:
            self.processor = OwlViTProcessor.from_pretrained(model_name)
            self.model = OwlViTForObjectDetection.from_pretrained(model_name)
            self.model.eval()
            print("✓ OWL-ViT model loaded successfully!")
        except Exception as e:
            print(f"Error loading OWL-ViT: {e}")
            self.processor = None
            self.model = None
    
    def detect_objects(self, image, text_queries, confidence=0.1):
        """
        Detect objects by text description
        
        Args:
            image: numpy array (BGR format from OpenCV)
            text_queries: list of object names to detect
                Example: ["papers on floor", "trash bin", "whiteboard"]
            confidence: detection threshold (0.0-1.0)
        
        Returns:
            list of detections with format:
            {
                'class': object name,
                'confidence': confidence score,
                'bbox': [x1, y1, x2, y2],
                'center': [cx, cy]
            }
        """
        if self.model is None:
            print("OWL-ViT model not loaded!")
            return []
        
        # Convert BGR to RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        pil_image = Image.fromarray(image_rgb)
        
        # Prepare text queries
        texts = [text_queries]
        
        # Process inputs
        inputs = self.processor(text=texts, images=pil_image, return_tensors="pt")
        
        # Get predictions
        with torch.no_grad():
            outputs = self.model(**inputs)
        
        # Post-process results
        target_sizes = torch.Tensor([pil_image.size[::-1]])
        results = self.processor.post_process_object_detection(
            outputs=outputs,
            threshold=confidence,
            target_sizes=target_sizes
        )[0]
        
        # Format detections
        detections = []
        for score, label, box in zip(results["scores"], results["labels"], results["boxes"]):
            box = box.cpu().numpy()
            x1, y1, x2, y2 = box
            
            detection = {
                'class': text_queries[label],
                'confidence': float(score),
                'bbox': [float(x1), float(y1), float(x2), float(y2)],
                'center': [float((x1 + x2) / 2), float((y1 + y2) / 2)]
            }
            detections.append(detection)
        
        return detections
    
    def draw_detections(self, image, detections):
        """Draw bounding boxes on image"""
        img_copy = image.copy()
        
        # Color map for different object types
        color_map = {
            'papers': (0, 0, 255),      # Red
            'plastic': (0, 0, 255),     # Red
            'trash bin': (0, 255, 0),   # Green
            'whiteboard': (255, 0, 0),  # Blue
            'jacket': (255, 0, 255),    # Magenta
            'ballpen': (0, 255, 255),   # Yellow
        }
        
        for det in detections:
            x1, y1, x2, y2 = map(int, det['bbox'])
            label = f"{det['class']}: {det['confidence']:.2f}"
            
            # Get color based on object class
            color = (0, 255, 0)  # Default green
            for key in color_map:
                if key in det['class'].lower():
                    color = color_map[key]
                    break
            
            # Draw box
            cv2.rectangle(img_copy, (x1, y1), (x2, y2), color, 3)
            
            # Draw label background
            label_size, _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
            cv2.rectangle(img_copy, (x1, y1-label_size[1]-10),
                         (x1+label_size[0], y1), color, -1)
            
            # Draw label text
            cv2.putText(img_copy, label, (x1, y1-5),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        return img_copy
