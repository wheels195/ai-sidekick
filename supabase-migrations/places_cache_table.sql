-- Create places_cache table for Google Places API result caching
-- This reduces API costs and improves response times

CREATE TABLE IF NOT EXISTS places_cache (
  id BIGSERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  zip TEXT NOT NULL,
  results TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Create composite index for fast lookups
  CONSTRAINT unique_query_zip UNIQUE (query, zip)
);

-- Create index for efficient querying by query, zip, and created_at
CREATE INDEX IF NOT EXISTS idx_places_cache_query_zip_created 
ON places_cache (query, zip, created_at DESC);

-- Create index for cleanup queries (finding old entries)
CREATE INDEX IF NOT EXISTS idx_places_cache_created_at 
ON places_cache (created_at);

-- Add RLS policies if needed (optional - for production security)
-- ALTER TABLE places_cache ENABLE ROW LEVEL SECURITY;

-- Optional: Create function to auto-cleanup old cache entries (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_places_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM places_cache 
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled cleanup job (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-places-cache', '0 2 * * *', 'SELECT cleanup_old_places_cache();');

COMMENT ON TABLE places_cache IS 'Caches Google Places API results to reduce costs and improve response times';
COMMENT ON COLUMN places_cache.query IS 'The search query used for Google Places API';
COMMENT ON COLUMN places_cache.zip IS 'ZIP code or location context for the search';
COMMENT ON COLUMN places_cache.results IS 'Formatted search results from Google Places API';
COMMENT ON COLUMN places_cache.created_at IS 'When this cache entry was created';