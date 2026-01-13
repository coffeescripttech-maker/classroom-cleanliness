-- Check if annotated_image_path column exists and is nullable
DESCRIBE cleanliness_scores;

-- If the column doesn't exist or is NOT NULL, run this:
-- ALTER TABLE cleanliness_scores 
-- ADD COLUMN annotated_image_path VARCHAR(255) NULL AFTER detected_objects;

-- Or if it exists but is NOT NULL:
-- ALTER TABLE cleanliness_scores 
-- MODIFY COLUMN annotated_image_path VARCHAR(255) NULL;

-- Check recent scores to see if annotated_image_path is being stored
SELECT 
  id, 
  image_id, 
  total_score, 
  rating,
  annotated_image_path,
  analyzed_at
FROM cleanliness_scores
ORDER BY analyzed_at DESC
LIMIT 5;
