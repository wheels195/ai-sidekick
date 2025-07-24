-- OpenAI APIs Integration Schema Updates
-- Adds support for Files API, DALL-E, and Moderations API

-- 1. Update existing uploaded_files table for Files API integration
ALTER TABLE uploaded_files 
ADD COLUMN IF NOT EXISTS openai_file_id TEXT,
ADD COLUMN IF NOT EXISTS openai_file_purpose TEXT DEFAULT 'assistants',
ADD COLUMN IF NOT EXISTS file_storage_cost DECIMAL(10,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_persistent BOOLEAN DEFAULT FALSE;

-- Add index for OpenAI file ID lookup
CREATE INDEX IF NOT EXISTS uploaded_files_openai_file_id_idx ON uploaded_files (openai_file_id);

-- 2. Create OpenAI Files management table
CREATE TABLE IF NOT EXISTS openai_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  openai_file_id TEXT UNIQUE NOT NULL,
  original_filename TEXT NOT NULL,
  file_purpose TEXT DEFAULT 'assistants',
  file_size_bytes INTEGER NOT NULL,
  storage_cost_per_day DECIMAL(8,4) DEFAULT 0,
  upload_date TIMESTAMP DEFAULT NOW(),
  last_accessed TIMESTAMP DEFAULT NOW(),
  access_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- File metadata
  file_type TEXT,
  content_category TEXT, -- 'pricing', 'services', 'competitive_analysis', etc.
  business_context JSONB, -- Store relevant business context
  
  -- Cost tracking
  total_storage_cost DECIMAL(10,4) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS openai_files_user_id_idx ON openai_files (user_id);
CREATE INDEX IF NOT EXISTS openai_files_active_idx ON openai_files (user_id, is_active);
CREATE INDEX IF NOT EXISTS openai_files_category_idx ON openai_files (content_category);

-- 3. Create DALL-E generated images table
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  revised_prompt TEXT, -- DALL-E's optimized prompt
  
  -- Generation parameters
  model TEXT DEFAULT 'dall-e-3',
  size TEXT DEFAULT '1024x1024',
  quality TEXT DEFAULT 'standard',
  style TEXT DEFAULT 'natural', -- 'natural' or 'vivid'
  
  -- Cost and usage tracking
  generation_cost DECIMAL(6,4) NOT NULL,
  business_context JSONB, -- User profile context used
  
  -- Image metadata
  content_type TEXT DEFAULT 'image/png',
  file_size_bytes INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP -- OpenAI images expire after some time
);

-- Create indexes for image management
CREATE INDEX IF NOT EXISTS generated_images_user_id_idx ON generated_images (user_id);
CREATE INDEX IF NOT EXISTS generated_images_created_idx ON generated_images (user_id, created_at DESC);

-- 4. Create moderation logs table for content filtering
CREATE TABLE IF NOT EXISTS moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  session_id UUID, -- Optional session tracking
  
  -- Content being moderated
  content TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'message', 'file_content', 'dalle_prompt', 'file_upload'
  content_hash TEXT, -- Hash for duplicate detection
  
  -- Moderation results
  moderation_result JSONB NOT NULL, -- Full OpenAI moderation response
  is_flagged BOOLEAN DEFAULT FALSE,
  flagged_categories TEXT[], -- hate, harassment, self-harm, sexual, violence, etc.
  category_scores JSONB, -- Detailed scores for each category
  
  -- Actions taken
  action_taken TEXT NOT NULL, -- 'blocked', 'allowed', 'modified', 'logged'
  user_message TEXT, -- Message shown to user if blocked
  
  -- Request context
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for moderation monitoring
CREATE INDEX IF NOT EXISTS moderation_logs_user_id_idx ON moderation_logs (user_id);
CREATE INDEX IF NOT EXISTS moderation_logs_flagged_idx ON moderation_logs (is_flagged, created_at DESC);
CREATE INDEX IF NOT EXISTS moderation_logs_content_type_idx ON moderation_logs (content_type);
CREATE INDEX IF NOT EXISTS moderation_logs_hash_idx ON moderation_logs (content_hash);

-- 5. Create API usage tracking table
CREATE TABLE IF NOT EXISTS api_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  
  -- API details
  api_type TEXT NOT NULL, -- 'files', 'dall-e', 'moderation', 'chat', 'embeddings'
  endpoint TEXT, -- Specific endpoint called
  model_used TEXT, -- Model used (gpt-4o, dall-e-3, etc.)
  
  -- Usage metrics
  tokens_used INTEGER DEFAULT 0,
  images_generated INTEGER DEFAULT 0,
  files_uploaded INTEGER DEFAULT 0,
  storage_gb_days DECIMAL(10,6) DEFAULT 0,
  
  -- Cost tracking
  cost_usd DECIMAL(10,6) NOT NULL,
  cost_breakdown JSONB, -- Detailed cost components
  
  -- Request metadata
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  processing_time_ms INTEGER,
  
  -- Timestamps
  date_used DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for usage analytics
CREATE INDEX IF NOT EXISTS api_usage_user_date_idx ON api_usage_tracking (user_id, date_used);
CREATE INDEX IF NOT EXISTS api_usage_api_type_idx ON api_usage_tracking (api_type, date_used);
CREATE INDEX IF NOT EXISTS api_usage_cost_idx ON api_usage_tracking (user_id, cost_usd);

-- 6. Create helpful functions

-- Function to calculate file storage costs
CREATE OR REPLACE FUNCTION calculate_storage_cost(
  file_size_bytes INTEGER,
  days_stored INTEGER DEFAULT 1
) RETURNS DECIMAL(10,4)
LANGUAGE plpgsql
AS $$
BEGIN
  -- OpenAI charges $0.10 per GB per day
  RETURN (file_size_bytes::DECIMAL / 1024 / 1024 / 1024) * 0.10 * days_stored;
END;
$$;

-- Function to get user's daily storage costs
CREATE OR REPLACE FUNCTION get_user_daily_storage_cost(p_user_id UUID)
RETURNS DECIMAL(10,4)
LANGUAGE plpgsql
AS $$
DECLARE
  total_cost DECIMAL(10,4) := 0;
BEGIN
  SELECT COALESCE(SUM(storage_cost_per_day), 0)
  INTO total_cost
  FROM openai_files
  WHERE user_id = p_user_id AND is_active = TRUE;
  
  RETURN total_cost;
END;
$$;

-- Function to clean up expired images
CREATE OR REPLACE FUNCTION cleanup_expired_images()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  DELETE FROM generated_images
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Add comments for documentation
COMMENT ON TABLE openai_files IS 'Manages OpenAI Files API uploads for persistent document storage';
COMMENT ON TABLE generated_images IS 'Tracks DALL-E generated images with cost and usage metrics';
COMMENT ON TABLE moderation_logs IS 'Logs content moderation results for security monitoring';
COMMENT ON TABLE api_usage_tracking IS 'Comprehensive API usage and cost tracking across all OpenAI services';

COMMENT ON FUNCTION calculate_storage_cost IS 'Calculates OpenAI Files API storage costs at $0.10/GB/day';
COMMENT ON FUNCTION get_user_daily_storage_cost IS 'Returns total daily storage cost for a user';
COMMENT ON FUNCTION cleanup_expired_images IS 'Removes expired DALL-E generated images to save space';