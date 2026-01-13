-- Migration: Add annotated_image_path to cleanliness_scores table
-- Date: 2025-01-12
-- Description: Adds column to store path of OpenCV-rendered annotated images

-- Add annotated_image_path column (nullable)
ALTER TABLE cleanliness_scores 
ADD COLUMN annotated_image_path VARCHAR(255) NULL AFTER detected_objects;

-- Verify the change
DESCRIBE cleanliness_scores;

-- Note: Existing records will have NULL for annotated_image_path
-- New analyses will automatically populate this field when available
