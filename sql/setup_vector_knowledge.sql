-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create knowledge base table for landscaping expertise
CREATE TABLE IF NOT EXISTS landscaping_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small dimensions
  
  -- Content Classification
  domain VARCHAR(50) NOT NULL, -- 'pricing', 'seo', 'upselling', 'operations', etc.
  topic VARCHAR(100) NOT NULL, -- 'regional-pricing', 'google-maps', 'crew-scaling', etc.
  content_type VARCHAR(30) NOT NULL, -- 'strategy', 'tactic', 'data', 'process'
  
  -- Contextual Metadata for Smart Retrieval
  region VARCHAR(20) DEFAULT 'general', -- 'texas', 'general', 'northeast', etc.
  season VARCHAR(20) DEFAULT 'year-round', -- 'spring', 'summer', 'fall', 'winter', 'year-round'
  business_stage VARCHAR(20) DEFAULT 'all', -- 'startup', 'scaling', 'established', 'all'
  
  -- Source Tracking (for management, not user-facing)
  source_document VARCHAR(100),
  section_reference VARCHAR(50),
  chunk_index INTEGER,
  
  -- Search Optimization
  keywords TEXT[] DEFAULT '{}', -- Extracted key terms for filtering
  priority_score INTEGER DEFAULT 5, -- 1-10 relevance scoring
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create vector similarity search index using ivfflat
CREATE INDEX IF NOT EXISTS landscaping_knowledge_embedding_idx 
ON landscaping_knowledge USING ivfflat (embedding vector_cosine_ops);

-- Create metadata indexes for efficient filtering
CREATE INDEX IF NOT EXISTS landscaping_knowledge_domain_idx ON landscaping_knowledge (domain);
CREATE INDEX IF NOT EXISTS landscaping_knowledge_topic_idx ON landscaping_knowledge (topic);
CREATE INDEX IF NOT EXISTS landscaping_knowledge_region_idx ON landscaping_knowledge (region);
CREATE INDEX IF NOT EXISTS landscaping_knowledge_stage_idx ON landscaping_knowledge (business_stage);
CREATE INDEX IF NOT EXISTS landscaping_knowledge_composite_idx ON landscaping_knowledge (domain, region, business_stage);

-- Function to search similar knowledge chunks
CREATE OR REPLACE FUNCTION search_landscaping_knowledge(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.78,
  match_count INT DEFAULT 3,
  filter_domain TEXT DEFAULT NULL,
  filter_region TEXT DEFAULT NULL,
  filter_stage TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  domain VARCHAR(50),
  topic VARCHAR(100),
  region VARCHAR(20),
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lk.id,
    lk.content,
    lk.domain,
    lk.topic,
    lk.region,
    1 - (lk.embedding <=> query_embedding) AS similarity
  FROM landscaping_knowledge lk
  WHERE 
    (filter_domain IS NULL OR lk.domain = filter_domain)
    AND (filter_region IS NULL OR lk.region = filter_region OR lk.region = 'general')
    AND (filter_stage IS NULL OR lk.business_stage = filter_stage OR lk.business_stage = 'all')
    AND 1 - (lk.embedding <=> query_embedding) > match_threshold
  ORDER BY lk.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Insert sample knowledge chunk for testing
INSERT INTO landscaping_knowledge (
  content,
  domain,
  topic,
  content_type,
  region,
  business_stage,
  source_document,
  section_reference,
  keywords,
  priority_score
) VALUES (
  'Most landscaping businesses achieve 15-20% net profit margins on projects. Industry averages range from 5-20%, with top operators maintaining higher margins through efficient operations and proper pricing. For new businesses, 10% margins may be acceptable initially, but strive upward as operations stabilize. Always include a buffer in pricing to handle unexpected costs without impacting profitability.',
  'pricing',
  'profit-margins',
  'data',
  'general',
  'all',
  'landscaping_playbook_gpt',
  'section-2',
  ARRAY['profit', 'margins', 'pricing', 'industry-average'],
  8
);

-- Comment for usage
COMMENT ON TABLE landscaping_knowledge IS 'Vector database for landscaping business expertise - enhances AI responses with specialized knowledge';
COMMENT ON FUNCTION search_landscaping_knowledge IS 'Searches for similar knowledge chunks using vector similarity';