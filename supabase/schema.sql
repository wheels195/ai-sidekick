-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles and business context
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  business_name TEXT,
  location TEXT,
  services TEXT[], -- Array of services offered
  team_size INTEGER,
  price_range TEXT, -- e.g., "budget", "premium", "luxury"
  target_customers TEXT, -- e.g., "residential", "commercial", "both"
  years_in_business INTEGER,
  monthly_revenue_range TEXT,
  main_challenges TEXT[],
  marketing_budget INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File storage and analysis results
CREATE TABLE uploaded_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  analysis_results JSONB,
  analysis_status TEXT DEFAULT 'pending', -- pending, completed, failed
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation storage for personalization (including file uploads)
CREATE TABLE user_conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  session_id UUID DEFAULT uuid_generate_v4(),
  message_role TEXT NOT NULL, -- 'user' or 'assistant'
  message_content TEXT NOT NULL,
  context_used JSONB, -- Business context used for this response
  file_attachments UUID[] DEFAULT '{}', -- References to uploaded_files
  feedback_score INTEGER, -- 1-5 rating from user
  feedback_text TEXT,
  response_time_ms INTEGER,
  tokens_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Global learning and pattern recognition (anonymized data)
CREATE TABLE global_conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_type TEXT NOT NULL, -- 'landscaping', 'electrician', etc.
  message_category TEXT, -- 'seo', 'pricing', 'marketing', etc.
  user_message_hash TEXT, -- Hashed version for privacy
  response_pattern TEXT, -- Successful response pattern
  feedback_score INTEGER,
  effectiveness_rating DECIMAL(3,2), -- Calculated effectiveness
  context_factors JSONB, -- Anonymized context (location type, business size range, etc.)
  file_type TEXT, -- Type of file if involved
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User-specific learning and preferences
CREATE TABLE user_learning (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  learned_preference TEXT NOT NULL,
  preference_category TEXT, -- 'communication_style', 'response_length', 'focus_area'
  context JSONB,
  confidence_score DECIMAL(3,2) DEFAULT 0.5,
  last_reinforced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proven strategies and knowledge base
CREATE TABLE proven_strategies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category TEXT NOT NULL, -- 'local_seo', 'pricing', 'upselling', etc.
  subcategory TEXT,
  strategy_title TEXT NOT NULL,
  strategy_content TEXT NOT NULL,
  success_rate DECIMAL(3,2),
  business_contexts JSONB, -- When this strategy works best
  average_rating DECIMAL(3,2),
  usage_count INTEGER DEFAULT 0,
  created_by TEXT DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions for tracking engagement
CREATE TABLE user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  messages_count INTEGER DEFAULT 0,
  files_uploaded INTEGER DEFAULT 0,
  feedback_given INTEGER DEFAULT 0,
  session_rating INTEGER, -- Overall session rating
  device_type TEXT,
  user_agent TEXT
);

-- Indexes for performance
CREATE INDEX idx_user_conversations_user_id ON user_conversations(user_id);
CREATE INDEX idx_user_conversations_session_id ON user_conversations(session_id);
CREATE INDEX idx_user_conversations_created_at ON user_conversations(created_at);
CREATE INDEX idx_global_conversations_business_type ON global_conversations(business_type);
CREATE INDEX idx_global_conversations_category ON global_conversations(message_category);
CREATE INDEX idx_uploaded_files_user_id ON uploaded_files(user_id);
CREATE INDEX idx_user_learning_user_id ON user_learning(user_id);
CREATE INDEX idx_proven_strategies_category ON proven_strategies(category);

-- Row Level Security (RLS) Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies for user_conversations
CREATE POLICY "Users can view own conversations" ON user_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON user_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON user_conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for uploaded_files
CREATE POLICY "Users can view own files" ON uploaded_files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own files" ON uploaded_files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own files" ON uploaded_files
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for user_learning
CREATE POLICY "Users can view own learning data" ON user_learning
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning data" ON user_learning
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning data" ON user_learning
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for user_sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proven_strategies_updated_at 
  BEFORE UPDATE ON proven_strategies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();