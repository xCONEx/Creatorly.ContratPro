
-- Add missing column to user_settings table if it doesn't exist
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS contract_reminders BOOLEAN DEFAULT true;

-- Update user_settings table structure to match the application
-- Remove any columns that don't exist in the schema
DO $$
BEGIN
    -- Check if contract_reminders column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_settings' 
                   AND column_name = 'contract_reminders') THEN
        ALTER TABLE user_settings ADD COLUMN contract_reminders BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Ensure RLS is properly configured for user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own settings" ON user_settings;

-- Create new policy for user_settings
CREATE POLICY "Users can manage their own settings" ON user_settings
    FOR ALL USING (auth.uid()::text = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Grant proper permissions
GRANT ALL ON user_settings TO authenticated;
GRANT ALL ON user_settings TO service_role;
