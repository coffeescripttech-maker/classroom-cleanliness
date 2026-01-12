import numpy as np
import cv2

class FurnitureScorer:
    """Calculates chair and desk orderliness score"""
    
    def calculate_score(self, image, detections):
        """
        Calculate furniture orderliness score (0-10)
        
        Metrics:
        - Chairs aligned under desks
        - Desks placed in rows
        - Absence of clutter on desk surfaces
        """
        score = 10.0
        
        # Filter furniture detections
        chairs = [d for d in detections if 'chair' in d['class'].lower()]
        tables = [d for d in detections if any(x in d['class'].lower() 
                  for x in ['table', 'desk', 'dining table'])]
        
        # 1. Check chair-desk alignment
        if chairs and tables:
            alignment_score = self._check_alignment(chairs, tables)
            score -= (1 - alignment_score) * 4  # Max 4 points penalty
        
        # 2. Check furniture arrangement (rows/columns)
        if len(chairs) > 2 or len(tables) > 2:
            arrangement_score = self._check_arrangement(chairs + tables)
            score -= (1 - arrangement_score) * 3  # Max 3 points penalty
        
        # 3. Check for clutter on furniture surfaces
        clutter_penalty = self._check_surface_clutter(detections, tables)
        score -= clutter_penalty  # Max 3 points penalty
        
        return max(0, min(10, score))
    
    def _check_alignment(self, chairs, tables):
        """Check if chairs are aligned with tables"""
        aligned_count = 0
        
        for chair in chairs:
            chair_center = chair['center']
            
            # Check if chair is near any table
            for table in tables:
                table_bbox = table['bbox']
                
                # Check if chair is within reasonable distance of table
                if self._is_near(chair_center, table_bbox, threshold=100):
                    aligned_count += 1
                    break
        
        # Calculate alignment ratio
        alignment_ratio = aligned_count / len(chairs) if chairs else 1.0
        
        return alignment_ratio
    
    def _is_near(self, point, bbox, threshold=100):
        """Check if point is near bounding box"""
        x1, y1, x2, y2 = bbox
        px, py = point
        
        # Expand bbox by threshold
        if (x1 - threshold <= px <= x2 + threshold and 
            y1 - threshold <= py <= y2 + threshold):
            return True
        
        return False
    
    def _check_arrangement(self, furniture):
        """Check if furniture is arranged in orderly rows/columns"""
        if len(furniture) < 3:
            return 1.0
        
        # Get y-coordinates of furniture centers
        y_coords = [f['center'][1] for f in furniture]
        x_coords = [f['center'][0] for f in furniture]
        
        # Calculate variance (lower = more aligned)
        y_variance = np.var(y_coords)
        x_variance = np.var(x_coords)
        
        # Check if arranged in rows (similar y) or columns (similar x)
        min_variance = min(y_variance, x_variance)
        
        # Normalize score (lower variance = better arrangement)
        arrangement_score = max(0, 1 - (min_variance / 10000))
        
        return arrangement_score
    
    def _check_surface_clutter(self, detections, tables):
        """Check for clutter on table surfaces"""
        if not tables:
            return 0
        
        clutter_classes = ['bottle', 'cup', 'book', 'cell phone', 'backpack', 
                          'handbag', 'paper']
        
        clutter_on_tables = 0
        
        for det in detections:
            if det['class'] in clutter_classes:
                # Check if clutter is on any table surface
                for table in tables:
                    if self._is_on_surface(det['center'], table['bbox']):
                        clutter_on_tables += 1
                        break
        
        # Penalty based on clutter count
        penalty = min(3, clutter_on_tables * 0.5)
        
        return penalty
    
    def _is_on_surface(self, point, bbox):
        """Check if point is on table surface"""
        x1, y1, x2, y2 = bbox
        px, py = point
        
        # Check if point is within table bounds
        if x1 <= px <= x2 and y1 <= py <= y2:
            return True
        
        return False
    
    def get_details(self, image, detections):
        """Get detailed furniture analysis"""
        chairs = [d for d in detections if 'chair' in d['class'].lower()]
        tables = [d for d in detections if any(x in d['class'].lower() 
                  for x in ['table', 'desk', 'dining table'])]
        
        alignment = self._check_alignment(chairs, tables) if chairs and tables else 0
        arrangement = self._check_arrangement(chairs + tables) if len(chairs + tables) > 2 else 0
        
        return {
            'chairs_detected': len(chairs),
            'tables_detected': len(tables),
            'alignment_score': round(alignment, 2),
            'arrangement_score': round(arrangement, 2)
        }
