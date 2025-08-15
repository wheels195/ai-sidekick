-- Fix Supabase security warnings
-- This migration addresses security linter warnings for production readiness

-- 1. Fix function search_path_mutable warnings by setting SECURITY DEFINER and search_path

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix cleanup_old_places_cache function
CREATE OR REPLACE FUNCTION cleanup_old_places_cache()
RETURNS INTEGER 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM places_cache 
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Fix cleanup_old_web_search_cache function
CREATE OR REPLACE FUNCTION cleanup_old_web_search_cache()
RETURNS INTEGER 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM web_search_cache 
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 2. Move vector extension from public to extensions schema (if not already moved)
-- Note: This may require superuser privileges and is often handled by Supabase automatically
-- CREATE SCHEMA IF NOT EXISTS extensions;
-- ALTER EXTENSION vector SET SCHEMA extensions;

-- 3. Note: OTP expiry and leaked password protection are configuration settings
-- that need to be changed in the Supabase dashboard under Authentication settings:
-- - Set OTP expiry to less than 1 hour (recommended: 10-15 minutes)
-- - Enable leaked password protection in Auth settings

COMMENT ON FUNCTION update_updated_at_column() IS 'Updates updated_at timestamp with secure search_path';
COMMENT ON FUNCTION cleanup_old_places_cache() IS 'Cleans up old places cache entries with secure search_path';
COMMENT ON FUNCTION cleanup_old_web_search_cache() IS 'Cleans up old web search cache entries with secure search_path';