-- Add password setup token fields to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS password_setup_token TEXT NULL,
ADD COLUMN IF NOT EXISTS password_setup_token_expires TIMESTAMPTZ NULL;

-- Create index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_password_setup_token 
ON user_profiles(password_setup_token) 
WHERE password_setup_token IS NOT NULL;

-- Add comment
COMMENT ON COLUMN user_profiles.password_setup_token IS 'Secure token for OAuth users to set up email/password authentication';
COMMENT ON COLUMN user_profiles.password_setup_token_expires IS 'Expiration timestamp for password setup token (24 hours)';