-- Add email marketing consent fields to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS email_marketing_consent BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ DEFAULT NULL;