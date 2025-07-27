-- Create web_search_cache table for Google Custom Search API result caching
-- This reduces API costs and improves response times for web search queries

CREATE TABLE IF NOT EXISTS web_search_cache (
  id BIGSERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  search_type TEXT NOT NULL, -- 'trends', 'pricing', 'regulatory', 'equipment', 'marketing', 'general'
  results TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Create composite index for fast lookups
  CONSTRAINT unique_query_search_type UNIQUE (query, search_type)
);

-- Create index for efficient querying by query, search_type, and created_at
CREATE INDEX IF NOT EXISTS idx_web_search_cache_query_type_created 
ON web_search_cache (query, search_type, created_at DESC);

-- Create index for cleanup queries (finding old entries)
CREATE INDEX IF NOT EXISTS idx_web_search_cache_created_at 
ON web_search_cache (created_at);

-- Create index for search_type filtering
CREATE INDEX IF NOT EXISTS idx_web_search_cache_search_type 
ON web_search_cache (search_type);

-- Add RLS policies if needed (optional - for production security)
-- ALTER TABLE web_search_cache ENABLE ROW LEVEL SECURITY;

-- Optional: Create function to auto-cleanup old cache entries (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_web_search_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM web_search_cache 
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled cleanup job (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-web-search-cache', '0 3 * * *', 'SELECT cleanup_old_web_search_cache();');

COMMENT ON TABLE web_search_cache IS 'Caches Google Custom Search API results to reduce costs and improve response times';
COMMENT ON COLUMN web_search_cache.query IS 'The search query used for Google Custom Search API';
COMMENT ON COLUMN web_search_cache.search_type IS 'Type of search: trends, pricing, regulatory, equipment, marketing, general';
COMMENT ON COLUMN web_search_cache.results IS 'Formatted search results from Google Custom Search API';
COMMENT ON COLUMN web_search_cache.created_at IS 'When this cache entry was created';