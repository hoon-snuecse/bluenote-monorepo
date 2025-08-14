-- Add file_type column to distinguish between images and documents
-- This migration adds the missing file_type column to all post_images tables

-- Research Posts
ALTER TABLE research_post_images 
ADD COLUMN IF NOT EXISTS file_type TEXT DEFAULT 'image';

-- Update existing records based on mime_type
UPDATE research_post_images 
SET file_type = CASE 
  WHEN mime_type LIKE 'image/%' THEN 'image'
  WHEN mime_type LIKE 'video/%' THEN 'document'
  WHEN mime_type LIKE 'audio/%' THEN 'document'
  WHEN mime_type LIKE 'application/%' THEN 'document'
  WHEN mime_type LIKE 'text/%' THEN 'document'
  ELSE 'document'
END
WHERE file_type IS NULL OR file_type = 'image';

-- Teaching Posts
ALTER TABLE teaching_post_images 
ADD COLUMN IF NOT EXISTS file_type TEXT DEFAULT 'image';

UPDATE teaching_post_images 
SET file_type = CASE 
  WHEN mime_type LIKE 'image/%' THEN 'image'
  WHEN mime_type LIKE 'video/%' THEN 'document'
  WHEN mime_type LIKE 'audio/%' THEN 'document'
  WHEN mime_type LIKE 'application/%' THEN 'document'
  WHEN mime_type LIKE 'text/%' THEN 'document'
  ELSE 'document'
END
WHERE file_type IS NULL OR file_type = 'image';

-- Analytics Posts
ALTER TABLE analytics_post_images 
ADD COLUMN IF NOT EXISTS file_type TEXT DEFAULT 'image';

UPDATE analytics_post_images 
SET file_type = CASE 
  WHEN mime_type LIKE 'image/%' THEN 'image'
  WHEN mime_type LIKE 'video/%' THEN 'document'
  WHEN mime_type LIKE 'audio/%' THEN 'document'
  WHEN mime_type LIKE 'application/%' THEN 'document'
  WHEN mime_type LIKE 'text/%' THEN 'document'
  ELSE 'document'
END
WHERE file_type IS NULL OR file_type = 'image';

-- Shed Posts
ALTER TABLE shed_post_images 
ADD COLUMN IF NOT EXISTS file_type TEXT DEFAULT 'image';

UPDATE shed_post_images 
SET file_type = CASE 
  WHEN mime_type LIKE 'image/%' THEN 'image'
  WHEN mime_type LIKE 'video/%' THEN 'document'
  WHEN mime_type LIKE 'audio/%' THEN 'document'
  WHEN mime_type LIKE 'application/%' THEN 'document'
  WHEN mime_type LIKE 'text/%' THEN 'document'
  ELSE 'document'
END
WHERE file_type IS NULL OR file_type = 'image';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_research_post_images_file_type ON research_post_images(file_type);
CREATE INDEX IF NOT EXISTS idx_teaching_post_images_file_type ON teaching_post_images(file_type);
CREATE INDEX IF NOT EXISTS idx_analytics_post_images_file_type ON analytics_post_images(file_type);
CREATE INDEX IF NOT EXISTS idx_shed_post_images_file_type ON shed_post_images(file_type);