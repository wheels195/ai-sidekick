-- Add latitude and longitude columns to user_profiles for dynamic location bias
-- This enables proper Google Places API location targeting without hardcoded coordinates

ALTER TABLE user_profiles 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Add index for location-based queries
CREATE INDEX idx_user_profiles_location ON user_profiles(latitude, longitude);

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.latitude IS 'User location latitude for Google Places API location bias';
COMMENT ON COLUMN user_profiles.longitude IS 'User location longitude for Google Places API location bias';