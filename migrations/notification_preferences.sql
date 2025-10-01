-- Migration: Add email notification preferences table
-- Created: 2025-09-30
-- Description: Allow users to opt-in to weekly email digests of new internships

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_digest_enabled BOOLEAN NOT NULL DEFAULT false,
  digest_frequency VARCHAR(20) NOT NULL DEFAULT 'weekly', -- 'weekly', 'daily', 'never'
  preferred_categories TEXT[] DEFAULT NULL, -- Array of categories to filter
  preferred_locations TEXT[] DEFAULT NULL, -- Array of locations to filter
  requires_citizenship BOOLEAN DEFAULT NULL, -- Filter preference
  no_sponsorship BOOLEAN DEFAULT NULL, -- Filter preference
  freshman_friendly_only BOOLEAN DEFAULT false,
  last_digest_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_notification_prefs_user_id ON user_notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_prefs_enabled ON user_notification_preferences(email_digest_enabled) WHERE email_digest_enabled = true;

-- Add RLS policies
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own preferences
CREATE POLICY "Users can view their own notification preferences"
  ON user_notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON user_notification_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON user_notification_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notification preferences"
  ON user_notification_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for automatic updated_at
CREATE TRIGGER trigger_update_notification_preferences_updated_at
  BEFORE UPDATE ON user_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Comments for documentation
COMMENT ON TABLE user_notification_preferences IS 'Stores user preferences for email notifications about new internships';
COMMENT ON COLUMN user_notification_preferences.email_digest_enabled IS 'Whether user has opted in to email digests';
COMMENT ON COLUMN user_notification_preferences.digest_frequency IS 'How often to send digest: weekly, daily, or never';
COMMENT ON COLUMN user_notification_preferences.preferred_categories IS 'Array of internship categories user is interested in';
COMMENT ON COLUMN user_notification_preferences.preferred_locations IS 'Array of locations user is interested in';
COMMENT ON COLUMN user_notification_preferences.last_digest_sent_at IS 'Timestamp of last digest email sent to prevent duplicates';
