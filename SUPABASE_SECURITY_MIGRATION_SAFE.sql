-- SAFE VERSION: Fix Supabase security linting issues
-- This version checks if tables exist before applying RLS

-- 1. Enable RLS on tables that exist
DO $$
BEGIN
    -- Enable RLS on places_cache if it exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'places_cache') THEN
        ALTER TABLE places_cache ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Enable RLS on global_conversations if it exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'global_conversations') THEN
        ALTER TABLE global_conversations ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Enable RLS on proven_strategies if it exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'proven_strategies') THEN
        ALTER TABLE proven_strategies ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Enable RLS on web_search_cache if it exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'web_search_cache') THEN
        ALTER TABLE web_search_cache ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Enable RLS on landscaping_knowledge if it exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'landscaping_knowledge') THEN
        ALTER TABLE landscaping_knowledge ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Enable RLS on user_knowledge if it exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_knowledge') THEN
        ALTER TABLE user_knowledge ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 2. Create RLS policies only for existing tables

-- places_cache policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'places_cache') THEN
        -- Drop existing policies first
        DROP POLICY IF EXISTS "Allow authenticated users to read places cache" ON places_cache;
        DROP POLICY IF EXISTS "Service role can manage places cache" ON places_cache;
        
        -- Create new policies
        CREATE POLICY "Allow authenticated users to read places cache" ON places_cache
          FOR SELECT TO authenticated
          USING (true);

        CREATE POLICY "Service role can manage places cache" ON places_cache
          FOR ALL TO service_role
          USING (true)
          WITH CHECK (true);
    END IF;
END $$;

-- global_conversations policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'global_conversations') THEN
        -- Drop existing policies first
        DROP POLICY IF EXISTS "Allow authenticated users to read global conversations" ON global_conversations;
        DROP POLICY IF EXISTS "Service role can insert global conversations" ON global_conversations;
        
        -- Create new policies
        CREATE POLICY "Allow authenticated users to read global conversations" ON global_conversations
          FOR SELECT TO authenticated
          USING (true);

        CREATE POLICY "Service role can insert global conversations" ON global_conversations
          FOR INSERT TO service_role
          WITH CHECK (true);
    END IF;
END $$;

-- proven_strategies policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'proven_strategies') THEN
        -- Drop existing policies first
        DROP POLICY IF EXISTS "Allow authenticated users to read proven strategies" ON proven_strategies;
        DROP POLICY IF EXISTS "Service role can manage proven strategies" ON proven_strategies;
        
        -- Create new policies
        CREATE POLICY "Allow authenticated users to read proven strategies" ON proven_strategies
          FOR SELECT TO authenticated
          USING (true);

        CREATE POLICY "Service role can manage proven strategies" ON proven_strategies
          FOR ALL TO service_role
          USING (true)
          WITH CHECK (true);
    END IF;
END $$;

-- web_search_cache policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'web_search_cache') THEN
        -- Drop existing policies first
        DROP POLICY IF EXISTS "Allow authenticated users to read web search cache" ON web_search_cache;
        DROP POLICY IF EXISTS "Service role can manage web search cache" ON web_search_cache;
        
        -- Create new policies
        CREATE POLICY "Allow authenticated users to read web search cache" ON web_search_cache
          FOR SELECT TO authenticated
          USING (true);

        CREATE POLICY "Service role can manage web search cache" ON web_search_cache
          FOR ALL TO service_role
          USING (true)
          WITH CHECK (true);
    END IF;
END $$;

-- landscaping_knowledge policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'landscaping_knowledge') THEN
        -- Drop existing policies first
        DROP POLICY IF EXISTS "Allow authenticated users to read landscaping knowledge" ON landscaping_knowledge;
        DROP POLICY IF EXISTS "Service role can manage landscaping knowledge" ON landscaping_knowledge;
        
        -- Create new policies
        CREATE POLICY "Allow authenticated users to read landscaping knowledge" ON landscaping_knowledge
          FOR SELECT TO authenticated
          USING (true);

        CREATE POLICY "Service role can manage landscaping knowledge" ON landscaping_knowledge
          FOR ALL TO service_role
          USING (true)
          WITH CHECK (true);
    END IF;
END $$;

-- user_knowledge policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_knowledge') THEN
        -- Drop existing policies first
        DROP POLICY IF EXISTS "Users can view own knowledge" ON user_knowledge;
        DROP POLICY IF EXISTS "Users can insert own knowledge" ON user_knowledge;
        DROP POLICY IF EXISTS "Users can update own knowledge" ON user_knowledge;
        DROP POLICY IF EXISTS "Service role can manage all user knowledge" ON user_knowledge;
        
        -- Create new policies
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
    END IF;
END $$;

-- 3. Fix SECURITY DEFINER views (these should exist)
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

-- Grant appropriate permissions
GRANT SELECT ON admin_cost_summary TO service_role;
GRANT SELECT ON admin_user_analytics TO service_role;