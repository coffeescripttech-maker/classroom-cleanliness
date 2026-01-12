"""
Example usage of the Classroom Cleanliness System
"""

from main import ClassroomCleanliness
import cv2

# Initialize the system
system = ClassroomCleanliness()

# Example 1: Analyze a single classroom
print("Example 1: Analyzing Classroom A")
result = system.analyze_classroom(
    image_path='data/images/classroom_a.jpg',
    classroom_id='Classroom A'
)

# Example 2: Analyze multiple classrooms
classrooms = [
    ('data/images/classroom_a.jpg', 'Classroom A'),
    ('data/images/classroom_b.jpg', 'Classroom B'),
    ('data/images/classroom_c.jpg', 'Classroom C')
]

print("\n\nExample 2: Analyzing Multiple Classrooms")
for image_path, classroom_id in classrooms:
    system.analyze_classroom(image_path, classroom_id)

# Example 3: Display leaderboard
print("\n\nExample 3: Displaying Leaderboard")
system.leaderboard.display_leaderboard()

# Example 4: Get classroom history
print("\n\nExample 4: Classroom History")
history = system.leaderboard.get_classroom_history('Classroom A')
for entry in history[:5]:  # Show last 5 entries
    print(f"Date: {entry['timestamp'][:10]} - Score: {entry['total_score']:.1f}")
