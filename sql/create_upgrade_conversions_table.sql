-- Create upgrade_conversions table for tracking trial-to-paid conversions
CREATE TABLE IF NOT EXISTS upgrade_conversions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  from_plan TEXT NOT NULL,
  to_plan TEXT NOT NULL,
  trial_tokens_used INTEGER DEFAULT 0,
  trial_duration_days INTEGER DEFAULT 0,
  converted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_upgrade_conversions_user_id ON upgrade_conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_upgrade_conversions_converted_at ON upgrade_conversions(converted_at);
CREATE INDEX IF NOT EXISTS idx_upgrade_conversions_to_plan ON upgrade_conversions(to_plan);

-- Enable RLS (Row Level Security) for data protection
ALTER TABLE upgrade_conversions ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access (admin analytics)
CREATE POLICY IF NOT EXISTS "Enable read for service role" ON upgrade_conversions
FOR SELECT USING (auth.role() = 'service_role');

-- Create policy for authenticated users to insert their own conversion data
CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users" ON upgrade_conversions
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT ON upgrade_conversions TO authenticated;
GRANT ALL ON upgrade_conversions TO service_role;