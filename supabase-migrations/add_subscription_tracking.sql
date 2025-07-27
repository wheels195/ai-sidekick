-- Add subscription tracking columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS user_role text DEFAULT 'user',
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'trial', -- trial, active, cancelled, expired
ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT NULL, -- NULL (trial), 'advanced'
ADD COLUMN IF NOT EXISTS subscription_started_at timestamp DEFAULT NULL,
ADD COLUMN IF NOT EXISTS converted_from_trial boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS conversion_date timestamp DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cancelled_at timestamp DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stripe_customer_id text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS lifetime_value decimal(10,2) DEFAULT 0.00;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_role ON user_profiles(user_role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status ON user_profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_converted_from_trial ON user_profiles(converted_from_trial);

-- Update the admin account
UPDATE user_profiles 
SET 
  user_role = 'admin',
  subscription_status = 'active',
  subscription_plan = 'advanced'
WHERE email = 'admin@ai-sidekick.io';

-- Add comments for clarity
COMMENT ON COLUMN user_profiles.subscription_status IS 'Current subscription state: trial, active, cancelled, expired';
COMMENT ON COLUMN user_profiles.subscription_plan IS 'NULL for trial users, "advanced" for paid subscribers';
COMMENT ON COLUMN user_profiles.converted_from_trial IS 'Track free-to-paid conversions for analytics';
COMMENT ON COLUMN user_profiles.conversion_date IS 'When user converted from trial to paid';
COMMENT ON COLUMN user_profiles.cancelled_at IS 'When user cancelled their subscription';