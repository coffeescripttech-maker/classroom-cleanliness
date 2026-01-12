import cv2
import numpy as np

class WallScorer:
    """Calculates wall and board cleanliness score"""
    
    def calculate_score(self, wall_region, detections):
        """
        Calculate wall/board cleanliness score (0-10)
        
        Metrics:
        - No visible vandalism
        - Board is erased (uniform color)
        - No unnecessary posters falling off
        """
        score = 10.0
        
        # 1. Check for marks/vandalism
        marks_penalty = self._detect_marks(wall_region)
        score -= marks_penalty  # Max 4 points penalty
        
        # 2. Check board cleanliness (uniformity)
        board_score = self._check_board_cleanliness(wall_region)
        score -= (1 - board_score) * 3  # Max 3 points penalty
        
        # 3. Check for loose items on walls
        loose_items = self._detect_loose_items(wall_region)
        score -= loose_items * 1.5  # Max 3 points penalty
        
        return max(0, min(10, score))
    
    def _detect_marks(self, wall_region):
        """Detect marks or vandalism on walls"""
        gray = cv2.cvtColor(wall_region, cv2.COLOR_BGR2GRAY)
        
        # Apply edge detection
        edges = cv2.Canny(gray, 50, 150)
        
        # Count edge pixels (more edges = more marks)
        edge_density = np.sum(edges > 0) / edges.size
        
        # Calculate penalty
        penalty = min(4, edge_density * 40)
        
        return penalty
    
    def _check_board_cleanliness(self, wall_region):
        """Check if board area is clean (erased)"""
        # Convert to HSV
        hsv = cv2.cvtColor(wall_region, cv2.COLOR_BGR2HSV)
        
        # Calculate color variance (lower = cleaner/more erased)
        variance = np.var(hsv[:, :, 2])  # V channel variance
        
        # Normalize score
        cleanliness = max(0, 1 - (variance / 1000))
        
        return cleanliness
    
    def _detect_loose_items(self, wall_region):
        """Detect loose or falling items on walls"""
        # Use color segmentation to find irregular patches
        hsv = cv2.cvtColor(wall_region, cv2.COLOR_BGR2HSV)
        
        # Detect non-uniform color patches
        _, thresh = cv2.threshold(hsv[:, :, 1], 30, 255, cv2.THRESH_BINARY)
        
        # Find contours
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Count medium-sized irregular patches
        loose_count = sum(1 for c in contours if 500 < cv2.contourArea(c) < 5000)
        
        return min(2, loose_count)
    
    def get_details(self, wall_region, detections):
        """Get detailed wall analysis"""
        marks_penalty = self._detect_marks(wall_region)
        board_score = self._check_board_cleanliness(wall_region)
        loose_items = self._detect_loose_items(wall_region)
        
        return {
            'marks_penalty': round(marks_penalty, 2),
            'board_cleanliness': round(board_score, 2),
            'loose_items_count': loose_items
        }
