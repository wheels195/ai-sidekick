-- Migration to ensure all user_profiles fields exist
-- Run this in Supabase SQL editor to add any missing fields

-- Check if zip_code column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='zip_code') THEN
        ALTER TABLE user_profiles ADD COLUMN zip_code TEXT;
    END IF;
END $$;

-- Ensure services column exists and is of correct type
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='services') THEN
        ALTER TABLE user_profiles ADD COLUMN services TEXT[];
    END IF;
END $$;

-- Ensure main_challenges column exists and is of correct type
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='main_challenges') THEN
        ALTER TABLE user_profiles ADD COLUMN main_challenges TEXT[];
    END IF;
END $$;

-- Ensure target_customers column exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='target_customers') THEN
        ALTER TABLE user_profiles ADD COLUMN target_customers TEXT;
    END IF;
END $$;

-- Ensure team_size column exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='team_size') THEN
        ALTER TABLE user_profiles ADD COLUMN team_size TEXT;
    END IF;
END $$;

-- Ensure years_in_business column exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='years_in_business') THEN
        ALTER TABLE user_profiles ADD COLUMN years_in_business TEXT;
    END IF;
END $$;

-- Update any existing user profiles to have empty arrays for services and main_challenges if they are null
UPDATE user_profiles 
SET services = '{}' 
WHERE services IS NULL;

UPDATE user_profiles 
SET main_challenges = '{}' 
WHERE main_challenges IS NULL;

-- Add comments to document the schema
COMMENT ON COLUMN user_profiles.services IS 'Array of services offered by the business (multi-select)';
COMMENT ON COLUMN user_profiles.main_challenges IS 'Array of main business challenges/goals (multi-select)';
COMMENT ON COLUMN user_profiles.target_customers IS 'Primary target customer type (single select)';
COMMENT ON COLUMN user_profiles.team_size IS 'Business team size category (single select)';
COMMENT ON COLUMN user_profiles.years_in_business IS 'Years in business category (single select)';
COMMENT ON COLUMN user_profiles.zip_code IS 'Business ZIP code for local context';

-- Show current table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;