-- Add user_role column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS user_role text DEFAULT 'user';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_role ON user_profiles(user_role);

-- Update any existing admin account
UPDATE user_profiles 
SET user_role = 'admin' 
WHERE email = 'admin@ai-sidekick.io';