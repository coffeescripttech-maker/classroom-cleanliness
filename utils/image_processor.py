import cv2
import numpy as np
from PIL import Image

class ImageProcessor:
    """Handles image loading and preprocessing"""
    
    def __init__(self, target_size=(640, 640)):
        self.target_size = target_size
    
    def load_image(self, image_path):
        """Load image from file path"""
        try:
            # Normalize path for Windows compatibility
            import os
            normalized_path = os.path.normpath(image_path)
            
            # Check if file exists
            if not os.path.exists(normalized_path):
                raise ValueError(f"Image file not found: {normalized_path}")
            
            # Use cv2.imdecode with numpy for better path handling
            import numpy as np
            with open(normalized_path, 'rb') as f:
                file_bytes = np.asarray(bytearray(f.read()), dtype=np.uint8)
                image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
            
            if image is None:
                raise ValueError(f"Could not decode image from {normalized_path}")
            return image
        except Exception as e:
            print(f"Error loading image: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def preprocess(self, image):
        """Preprocess image for analysis"""
        # Resize image
        resized = cv2.resize(image, self.target_size)
        
        # Normalize
        normalized = resized / 255.0
        
        return resized, normalized
    
    def extract_regions(self, image):
        """Extract different regions of the classroom"""
        height, width = image.shape[:2]
        
        regions = {
            'floor': image[int(height*0.6):height, :],  # Bottom 40%
            'furniture': image[int(height*0.3):int(height*0.8), :],  # Middle section
            'wall': image[0:int(height*0.4), :],  # Top 40%
            'full': image
        }
        
        return regions
    
    def detect_edges(self, image):
        """Detect edges in image"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        return edges
    
    def calculate_cleanliness_metric(self, region):
        """Calculate basic cleanliness metric based on color variance"""
        # Convert to HSV
        hsv = cv2.cvtColor(region, cv2.COLOR_BGR2HSV)
        
        # Calculate standard deviation (lower = more uniform = cleaner)
        std_dev = np.std(hsv)
        
        # Normalize to 0-1 scale (inverse relationship)
        cleanliness = max(0, 1 - (std_dev / 100))
        
        return cleanliness
