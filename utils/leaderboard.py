import json
import os
from datetime import datetime
import pandas as pd

class Leaderboard:
    """Manages classroom scores and rankings"""
    
    def __init__(self, data_file='data/scores.json'):
        self.data_file = data_file
        self.ensure_data_file()
    
    def ensure_data_file(self):
        """Create data file if it doesn't exist"""
        os.makedirs(os.path.dirname(self.data_file), exist_ok=True)
        if not os.path.exists(self.data_file):
            with open(self.data_file, 'w') as f:
                json.dump([], f)
    
    def add_score(self, classroom_id, scores, total_score, rating):
        """Add a new score entry"""
        entry = {
            'classroom_id': classroom_id,
            'timestamp': datetime.now().isoformat(),
            'scores': scores,
            'total_score': total_score,
            'rating': rating
        }
        
        # Load existing data
        with open(self.data_file, 'r') as f:
            data = json.load(f)
        
        # Add new entry
        data.append(entry)
        
        # Save updated data
        with open(self.data_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        return entry
    
    def get_latest_scores(self):
        """Get the most recent score for each classroom"""
        with open(self.data_file, 'r') as f:
            data = json.load(f)
        
        if not data:
            return []
        
        # Convert to DataFrame for easier processing
        df = pd.DataFrame(data)
        
        # Get latest score for each classroom
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        latest = df.sort_values('timestamp').groupby('classroom_id').last().reset_index()
        
        # Sort by total_score descending
        latest = latest.sort_values('total_score', ascending=False)
        
        return latest.to_dict('records')
    
    def display_leaderboard(self):
        """Display formatted leaderboard"""
        scores = self.get_latest_scores()
        
        if not scores:
            print("No scores available yet.")
            return
        
        print("\n" + "="*70)
        print("CLASSROOM CLEANLINESS LEADERBOARD".center(70))
        print("="*70)
        print(f"{'Rank':<6} {'Classroom':<15} {'Score':<10} {'Rating':<12} {'Date':<20}")
        print("-"*70)
        
        for idx, entry in enumerate(scores, 1):
            classroom = entry['classroom_id']
            score = entry['total_score']
            rating = entry['rating']
            date = entry['timestamp'][:10]
            
            print(f"{idx:<6} {classroom:<15} {score:<10.1f} {rating:<12} {date:<20}")
        
        print("="*70 + "\n")
    
    def get_classroom_history(self, classroom_id):
        """Get score history for a specific classroom"""
        with open(self.data_file, 'r') as f:
            data = json.load(f)
        
        history = [entry for entry in data if entry['classroom_id'] == classroom_id]
        return sorted(history, key=lambda x: x['timestamp'], reverse=True)
