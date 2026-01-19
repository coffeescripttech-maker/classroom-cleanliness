-- Test Face Blur UI by adding fake face detection data
USE classroom_cleanliness;

-- Update image 29 with test face detection data
UPDATE captured_images 
SET 
  blurred_image_path = 'Grade-7/Section-A/2026-01-19/blurred_12-31-44.jpg',
  faces_detected = 3,
  face_locations = '[{"x": 100, "y": 150, "width": 80, "height": 80}, {"x": 300, "y": 200, "width": 75, "height": 75}, {"x": 500, "y": 180, "width": 85, "height": 85}]'
WHERE id = 29;

-- Verify the update
SELECT id, image_path, blurred_image_path, faces_detected 
FROM captured_images 
WHERE id = 29;
