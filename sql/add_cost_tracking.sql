-- Add cost tracking fields to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS total_cost_trial DECIMAL(10,6) DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add cost breakdown and model tracking to user_conversations table  
ALTER TABLE user_conversations 
ADD COLUMN IF NOT EXISTS cost_breakdown JSONB,
ADD COLUMN IF NOT EXISTS model_used TEXT;

-- Create index for cost analytics queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_cost_trial ON user_profiles(total_cost_trial DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_activity ON user_profiles(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_conversations_cost_breakdown ON user_conversations USING GIN(cost_breakdown);
CREATE INDEX IF NOT EXISTS idx_user_conversations_model_used ON user_conversations(model_used);

-- Create admin analytics view for quick queries
CREATE OR REPLACE VIEW admin_user_analytics AS
SELECT 
  up.id,
  up.first_name,
  up.last_name,
  up.business_name,
  up.created_at,
  up.total_cost_trial,
  up.tokens_used_trial,
  up.last_activity_at,
  up.trade,
  up.team_size,
  up.target_customers,
  COUNT(uc.id) as conversation_count,
  AVG(CAST(uc.cost_breakdown->>'totalCostUsd' AS DECIMAL)) as avg_cost_per_conversation,
  MAX(uc.created_at) as last_conversation_at
FROM user_profiles up
LEFT JOIN user_conversations uc ON up.id = uc.user_id
GROUP BY up.id, up.first_name, up.last_name, up.business_name, up.created_at, 
         up.total_cost_trial, up.tokens_used_trial, up.last_activity_at, 
         up.trade, up.team_size, up.target_customers;

-- Create cost summary view
CREATE OR REPLACE VIEW admin_cost_summary AS
SELECT 
  DATE(created_at) as date,
  model_used,
  COUNT(*) as conversation_count,
  SUM(CAST(cost_breakdown->>'totalCostUsd' AS DECIMAL)) as total_cost_usd,
  SUM(CAST(cost_breakdown->>'gptCostUsd' AS DECIMAL)) as gpt_cost_usd,
  SUM(CAST(cost_breakdown->>'placesCostUsd' AS DECIMAL)) as places_cost_usd,
  SUM(CAST(cost_breakdown->>'filesCostUsd' AS DECIMAL)) as files_cost_usd,
  AVG(CAST(cost_breakdown->>'totalCostUsd' AS DECIMAL)) as avg_cost_per_conversation
FROM user_conversations 
WHERE cost_breakdown IS NOT NULL
GROUP BY DATE(created_at), model_used
ORDER BY date DESC, model_used;

-- Comments for documentation
COMMENT ON COLUMN user_profiles.total_cost_trial IS 'Cumulative USD cost for user during trial period';
COMMENT ON COLUMN user_profiles.last_activity_at IS 'Timestamp of users last activity (conversation, login, etc)';
COMMENT ON COLUMN user_conversations.cost_breakdown IS 'JSON object containing detailed cost breakdown by API and token usage';
COMMENT ON COLUMN user_conversations.model_used IS 'OpenAI model used for this conversation (gpt-4o, gpt-4o-mini)';