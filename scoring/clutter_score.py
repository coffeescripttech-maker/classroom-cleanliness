class ClutterScorer:
    """Calculates object clutter detection score"""
    
    def calculate_score(self, detections):
        """
        Calculate clutter score (0-10)
        
        Metrics:
        - Bags, bottles, papers left on floor or desks
        - Number of detected clutter objects
        """
        score = 10.0
        
        clutter_classes = ['backpack', 'handbag', 'bottle', 'book', 
                          'cell phone', 'cup', 'paper', 'bag', 'umbrella']
        
        # Count clutter objects
        clutter_count = sum(1 for d in detections if d['class'] in clutter_classes)
        
        # Penalty based on clutter count
        penalty = min(10, clutter_count * 1.5)
        score -= penalty
        
        return max(0, min(10, score))
    
    def get_details(self, detections):
        """Get detailed clutter analysis"""
        clutter_classes = ['backpack', 'handbag', 'bottle', 'book', 
                          'cell phone', 'cup', 'paper', 'bag', 'umbrella']
        
        clutter_items = [d for d in detections if d['class'] in clutter_classes]
        
        # Count by type
        clutter_by_type = {}
        for item in clutter_items:
            class_name = item['class']
            clutter_by_type[class_name] = clutter_by_type.get(class_name, 0) + 1
        
        return {
            'total_clutter': len(clutter_items),
            'clutter_by_type': clutter_by_type
        }
