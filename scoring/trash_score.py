import cv2
import numpy as np

class TrashScorer:
    """Calculates trash bin condition score"""
    
    def calculate_score(self, image, detections):
        """
        Calculate trash bin condition score (0-10)
        
        Metrics:
        - Trash bin visible
        - Trash inside the bin only
        - No overflowing trash
        """
        score = 10.0
        
        # Find trash bins
        bins = [d for d in detections if 'bin' in d['class'].lower() or 
                'trash' in d['class'].lower() or 'garbage' in d['class'].lower()]
        
        # 1. Check if trash bin is present
        if not bins:
            score -= 3  # Penalty for no visible bin
            return max(0, score)
        
        # 2. Check for trash outside bins
        trash_outside = self._check_trash_outside_bins(detections, bins)
        score -= trash_outside * 2  # Max 4 points penalty
        
        # 3. Check for overflow
        overflow_penalty = self._check_overflow(image, bins)
        score -= overflow_penalty  # Max 3 points penalty
        
        return max(0, min(10, score))
    
    def _check_trash_outside_bins(self, detections, bins):
        """Check for trash items outside bins"""
        trash_classes = ['bottle', 'cup', 'paper', 'plastic', 'bag']
        
        trash_outside = 0
        
        for det in detections:
            if any(trash_class in det['class'].lower() for trash_class in trash_classes):
                # Check if trash is NOT near any bin
                is_near_bin = False
                
                for bin_det in bins:
                    if self._is_near(det['center'], bin_det['bbox'], threshold=80):
                        is_near_bin = True
                        break
                
                if not is_near_bin:
                    trash_outside += 1
        
        return min(2, trash_outside)  # Cap at 2 items
    
    def _is_near(self, point, bbox, threshold=80):
        """Check if point is near bounding box"""
        x1, y1, x2, y2 = bbox
        px, py = point
        
        # Expand bbox by threshold
        if (x1 - threshold <= px <= x2 + threshold and 
            y1 - threshold <= py <= y2 + threshold):
            return True
        
        return False
    
    def _check_overflow(self, image, bins):
        """Check if bins are overflowing"""
        if not bins:
            return 0
        
        overflow_count = 0
        
        for bin_det in bins:
            x1, y1, x2, y2 = map(int, bin_det['bbox'])
            
            # Extract bin region
            bin_region = image[max(0, y1):min(image.shape[0], y2), 
                              max(0, x1):min(image.shape[1], x2)]
            
            if bin_region.size == 0:
                continue
            
            # Check region above bin for overflow
            above_y = max(0, y1 - 50)
            above_region = image[above_y:y1, x1:x2]
            
            if above_region.size > 0:
                # Analyze color variance (high variance = potential overflow)
                variance = np.var(above_region)
                
                if variance > 1000:  # Threshold for overflow detection
                    overflow_count += 1
        
        penalty = min(3, overflow_count * 1.5)
        return penalty
    
    def get_details(self, image, detections):
        """Get detailed trash bin analysis"""
        bins = [d for d in detections if 'bin' in d['class'].lower() or 
                'trash' in d['class'].lower() or 'garbage' in d['class'].lower()]
        
        trash_outside = self._check_trash_outside_bins(detections, bins)
        
        return {
            'bins_detected': len(bins),
            'trash_outside_bins': trash_outside,
            'bin_present': len(bins) > 0
        }
