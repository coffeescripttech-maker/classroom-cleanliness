import cv2
import numpy as np

class FloorScorer:
    """Calculates floor cleanliness score"""
    
    def calculate_score(self, floor_region, detections):
        """
        Calculate floor cleanliness score (0-10)
        
        Metrics:
        - Percentage of visible trash on floor
        - Presence of debris particles
        - Floor area coverage free from debris
        """
        score = 10.0
        
        # 1. Check for clutter objects on floor (bottom region)
        floor_clutter = self._count_floor_clutter(detections, floor_region.shape)
        clutter_penalty = min(5, floor_clutter * 1.5)  # Max 5 points penalty
        score -= clutter_penalty
        
        # 2. Analyze floor texture for debris
        debris_score = self._analyze_debris(floor_region)
        score -= (1 - debris_score) * 3  # Max 3 points penalty
        
        # 3. Check floor uniformity (cleaner floors are more uniform)
        uniformity_score = self._calculate_uniformity(floor_region)
        score -= (1 - uniformity_score) * 2  # Max 2 points penalty
        
        return max(0, min(10, score))
    
    def _count_floor_clutter(self, detections, floor_shape):
        """Count clutter objects in floor region"""
        height = floor_shape[0]
        floor_y_start = height * 0.6  # Floor is bottom 40%
        
        clutter_classes = ['backpack', 'handbag', 'bottle', 'book', 'cell phone', 
                          'cup', 'paper', 'bag']
        
        floor_clutter = 0
        for det in detections:
            if det['class'] in clutter_classes:
                # Check if object center is in floor region
                if det['center'][1] > floor_y_start:
                    floor_clutter += 1
        
        return floor_clutter
    
    def _analyze_debris(self, floor_region):
        """Analyze floor for small debris particles"""
        # Convert to grayscale
        gray = cv2.cvtColor(floor_region, cv2.COLOR_BGR2GRAY)
        
        # Apply threshold to detect dark spots (potential debris)
        _, thresh = cv2.threshold(gray, 100, 255, cv2.THRESH_BINARY_INV)
        
        # Count small contours (debris)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        small_debris = sum(1 for c in contours if 10 < cv2.contourArea(c) < 500)
        
        # Normalize score (fewer debris = higher score)
        debris_score = max(0, 1 - (small_debris / 50))
        
        return debris_score
    
    def _calculate_uniformity(self, floor_region):
        """Calculate floor uniformity (cleaner = more uniform)"""
        # Convert to LAB color space
        lab = cv2.cvtColor(floor_region, cv2.COLOR_BGR2LAB)
        
        # Calculate standard deviation of L channel
        l_channel = lab[:, :, 0]
        std_dev = np.std(l_channel)
        
        # Normalize (lower std = more uniform = cleaner)
        uniformity = max(0, 1 - (std_dev / 50))
        
        return uniformity
    
    def get_details(self, floor_region, detections):
        """Get detailed floor analysis"""
        floor_clutter = self._count_floor_clutter(detections, floor_region.shape)
        debris_score = self._analyze_debris(floor_region)
        uniformity = self._calculate_uniformity(floor_region)
        
        return {
            'floor_clutter_count': floor_clutter,
            'debris_score': round(debris_score, 2),
            'uniformity_score': round(uniformity, 2)
        }
