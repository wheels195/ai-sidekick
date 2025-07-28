-- Fix Supabase security linting issues
-- This migration addresses RLS and SECURITY DEFINER issues found in database linting

-- 1. Enable RLS on tables that are missing it
-- These tables should have RLS enabled since they're in the public schema

-- Enable RLS on places_cache (Google Places API cache)
ALTER TABLE places_cache ENABLE ROW LEVEL SECURITY;

-- Enable RLS on global_conversations (anonymized data)
ALTER TABLE global_conversations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on proven_strategies (public strategies data)
ALTER TABLE proven_strategies ENABLE ROW LEVEL SECURITY;

-- Enable RLS on web_search_cache (Google Custom Search cache)
ALTER TABLE web_search_cache ENABLE ROW LEVEL SECURITY;

-- Enable RLS on landscaping_knowledge (vector database knowledge)
ALTER TABLE landscaping_knowledge ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_knowledge (user-specific knowledge)
ALTER TABLE user_knowledge ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policies for these tables

-- places_cache: Allow all authenticated users to read (for performance)
-- Only service role can insert/update cache entries
CREATE POLICY "Allow authenticated users to read places cache" ON places_cache
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Service role can manage places cache" ON places_cache
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- global_conversations: Read-only for authenticated users
-- Only service role can insert anonymized data
CREATE POLICY "Allow authenticated users to read global conversations" ON global_conversations
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Service role can insert global conversations" ON global_conversations
  FOR INSERT TO service_role
  WITH CHECK (true);

-- proven_strategies: Read-only for authenticated users
CREATE POLICY "Allow authenticated users to read proven strategies" ON proven_strategies
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Service role can manage proven strategies" ON proven_strategies
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- web_search_cache: Allow all authenticated users to read
-- Only service role can insert/update cache entries
CREATE POLICY "Allow authenticated users to read web search cache" ON web_search_cache
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Service role can manage web search cache" ON web_search_cache
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- landscaping_knowledge: Read-only for authenticated users
CREATE POLICY "Allow authenticated users to read landscaping knowledge" ON landscaping_knowledge
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Service role can manage landscaping knowledge" ON landscaping_knowledge
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- user_knowledge: Users can only access their own knowledge
CREATE POLICY "Users can view own knowledge" ON user_knowledge
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own knowledge" ON user_knowledge
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own knowledge" ON user_knowledge
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all user knowledge" ON user_knowledge
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Fix SECURITY DEFINER views by recreating without that property
-- Note: This requires dropping and recreating the views

-- Drop existing views
DROP VIEW IF EXISTS admin_cost_summary;
DROP VIEW IF EXISTS admin_user_analytics;

-- Recreate admin_cost_summary without SECURITY DEFINER
CREATE VIEW admin_cost_summary AS
SELECT 
  DATE(created_at) as date,
  model_used,
  COUNT(*) as conversation_count,
  SUM(tokens_used) as total_tokens,
  SUM(CAST(cost_breakdown->>'openaiCostUsd' AS DECIMAL)) as openai_cost_usd,
  SUM(CAST(cost_breakdown->>'placesCostUsd' AS DECIMAL)) as places_cost_usd,
  SUM(CAST(cost_breakdown->>'filesCostUsd' AS DECIMAL)) as files_cost_usd,
  AVG(CAST(cost_breakdown->>'totalCostUsd' AS DECIMAL)) as avg_cost_per_conversation
FROM user_conversations 
WHERE cost_breakdown IS NOT NULL
GROUP BY DATE(created_at), model_used
ORDER BY date DESC, model_used;

-- Recreate admin_user_analytics without SECURITY DEFINER
CREATE VIEW admin_user_analytics AS
SELECT 
  up.id,
  up.first_name,
  up.last_name,
  up.business_name,
  up.created_at as signup_date,
  up.total_cost_trial,
  up.tokens_used_trial,
  up.last_activity_at,
  up.trade,
  up.team_size,
  up.target_customers,
  COUNT(uc.id) as total_conversations,
  SUM(uc.tokens_used) as total_tokens_used,
  SUM(CAST(uc.cost_breakdown->>'totalCostUsd' AS DECIMAL)) as total_cost_usd,
  AVG(CAST(uc.cost_breakdown->>'totalCostUsd' AS DECIMAL)) as avg_cost_per_conversation,
  MAX(uc.created_at) as last_conversation_at
FROM user_profiles up
LEFT JOIN user_conversations uc ON up.id = uc.user_id
GROUP BY up.id, up.first_name, up.last_name, up.business_name, up.created_at, 
         up.total_cost_trial, up.tokens_used_trial, up.last_activity_at, 
         up.trade, up.team_size, up.target_customers;

-- Add comments for documentation
COMMENT ON VIEW admin_cost_summary IS 'Daily cost and usage summary for admin analytics (without SECURITY DEFINER)';
COMMENT ON VIEW admin_user_analytics IS 'User analytics and usage metrics for admin dashboard (without SECURITY DEFINER)';

-- Grant appropriate permissions
GRANT SELECT ON admin_cost_summary TO service_role;
GRANT SELECT ON admin_user_analytics TO service_role;

-- These views should only be accessible to service role for admin purposes
-- Regular authenticated users should not have access to admin analytics