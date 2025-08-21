-- Create email campaigns tracking table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  email_type TEXT NOT NULL, -- 'welcome', 'trial-day-1', 'trial-day-2', etc.
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'sent', -- 'sent', 'failed', 'bounced'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS email_campaigns_user_email_idx ON email_campaigns(user_email);
CREATE INDEX IF NOT EXISTS email_campaigns_email_type_idx ON email_campaigns(email_type);
CREATE INDEX IF NOT EXISTS email_campaigns_sent_at_idx ON email_campaigns(sent_at);

-- Add RLS (Row Level Security)
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own email campaigns
CREATE POLICY "Users can view own email campaigns" ON email_campaigns
  FOR SELECT USING (user_email = auth.email());

-- RLS Policy: Service role can manage all email campaigns
CREATE POLICY "Service role can manage all email campaigns" ON email_campaigns
  FOR ALL USING (auth.role() = 'service_role');