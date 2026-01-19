-- Migration: Add Face Blurring Support
-- Date: 2026-01-19
-- Description: Adds columns for face detection and blurred image storage

USE classroom_cleanliness;

-- Add blurred image path to captured_images table
ALTER TABLE captured_images 
ADD COLUMN blurred_image_path VARCHAR(500) NULL AFTER image_path,
ADD COLUMN faces_detected INT DEFAULT 0 AFTER blurred_image_path,
ADD COLUMN face_locations JSON NULL AFTER faces_detected;

-- Add face blur info to cleanliness_scores table
ALTER TABLE cleanliness_scores
ADD COLUMN faces_blurred BOOLEAN DEFAULT FALSE AFTER annotated_image_path;

-- Add index for quick filtering
ALTER TABLE captured_images
ADD INDEX idx_faces_detected (faces_detected);

-- Update existing records to indicate no faces detected yet
UPDATE captured_images SET faces_detected = 0 WHERE faces_detected IS NULL;

-- Log migration
INSERT INTO activity_logs (action, entity_type, details, created_at)
VALUES ('migration', 'database', '{"migration": "add_face_blur_columns", "status": "completed"}', NOW());

SELECT 'Face blur columns added successfully!' as status;
