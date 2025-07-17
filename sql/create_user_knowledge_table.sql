-- Create user-specific knowledge table for file uploads
CREATE TABLE IF NOT EXISTS user_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small dimensions
  
  -- File metadata
  original_filename VARCHAR(255),
  file_type VARCHAR(50),
  file_size INTEGER,
  upload_date TIMESTAMP DEFAULT NOW(),
  
  -- Content classification
  content_category VARCHAR(50), -- 'pricing', 'services', 'clients', 'proposals', 'competitive_analysis'
  data_type VARCHAR(30), -- 'price_list', 'service_menu', 'client_list', 'proposal_template'
  
  -- Contextual tags for smart retrieval
  location_tags TEXT[] DEFAULT '{}',
  service_tags TEXT[] DEFAULT '{}',
  client_tags TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  
  -- Access control and status
  is_active BOOLEAN DEFAULT TRUE,
  priority_score INTEGER DEFAULT 5,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create vector similarity index for user knowledge
CREATE INDEX IF NOT EXISTS user_knowledge_embedding_idx 
ON user_knowledge USING ivfflat (embedding vector_cosine_ops);

-- Create indexes for efficient filtering
CREATE INDEX IF NOT EXISTS user_knowledge_user_id_idx ON user_knowledge (user_id);
CREATE INDEX IF NOT EXISTS user_knowledge_category_idx ON user_knowledge (content_category);
CREATE INDEX IF NOT EXISTS user_knowledge_active_idx ON user_knowledge (is_active);
CREATE INDEX IF NOT EXISTS user_knowledge_composite_idx ON user_knowledge (user_id, content_category, is_active);

-- Function to search user-specific knowledge
CREATE OR REPLACE FUNCTION search_user_knowledge(
  p_user_id UUID,
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.75,
  match_count INT DEFAULT 3,
  filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  content_category VARCHAR(50),
  data_type VARCHAR(30),
  original_filename VARCHAR(255),
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uk.id,
    uk.content,
    uk.content_category,
    uk.data_type,
    uk.original_filename,
    1 - (uk.embedding <=> query_embedding) AS similarity
  FROM user_knowledge uk
  WHERE 
    uk.user_id = p_user_id
    AND uk.is_active = TRUE
    AND (filter_category IS NULL OR uk.content_category = filter_category)
    AND 1 - (uk.embedding <=> query_embedding) > match_threshold
  ORDER BY uk.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Add helpful comments
COMMENT ON TABLE user_knowledge IS 'User-specific knowledge base for uploaded files and personal business data';
COMMENT ON FUNCTION search_user_knowledge IS 'Searches user-specific knowledge using vector similarity';