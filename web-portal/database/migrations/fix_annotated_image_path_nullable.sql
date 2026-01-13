-- Migration: Fix annotated_image_path to allow NULL values
-- Date: 2025-01-12
-- Description: Modifies column to allow NULL since not all analyses will have annotated images

-- Modify column to allow NULL
ALTER TABLE cleanliness_scores 
MODIFY COLUMN annotated_image_path VARCHAR(255) NULL;

-- Verify the change
DESCRIBE cleanliness_scores;

-- This allows:
-- 1. Old analyses to have NULL (no annotated image)
-- 2. New analyses to have path when available
-- 3. Fallback to canvas drawing when NULL
