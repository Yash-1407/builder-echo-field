-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  monthly_target DECIMAL(10,2) DEFAULT 4.5,
  goals JSONB DEFAULT '{
    "carbon_reduction": 30,
    "transport_reduction": 25,
    "renewable_energy": 80
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('transport', 'energy', 'food', 'shopping')),
  description TEXT NOT NULL,
  impact DECIMAL(10,2) NOT NULL CHECK (impact >= 0),
  unit TEXT DEFAULT 'kg CO₂',
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  category TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sessions table for authentication
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Activities policies
CREATE POLICY "Users can view own activities" ON activities
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own activities" ON activities
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own activities" ON activities
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own activities" ON activities
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Sessions policies
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own sessions" ON user_sessions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own sessions" ON user_sessions
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_activities_updated_at ON activities;
CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert demo user
INSERT INTO users (id, name, email, monthly_target, goals, created_at, updated_at, last_login)
VALUES (
  'demo-user-123',
  'Demo User',
  'demo@carbonmeter.com',
  4.5,
  '{
    "carbon_reduction": 30,
    "transport_reduction": 25,
    "renewable_energy": 80
  }'::jsonb,
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert demo activities
INSERT INTO activities (user_id, type, description, impact, unit, date, category, details, created_at, updated_at)
VALUES 
  ('demo-user-123', 'transport', '15 miles by Car', 6.0, 'kg CO₂', NOW() - INTERVAL '2 hours', 'Car', '{"vehicle_type": "Car", "distance": 15}'::jsonb, NOW(), NOW()),
  ('demo-user-123', 'energy', '25 kWh from Grid Electricity', 12.5, 'kg CO₂', NOW() - INTERVAL '4 hours', 'Grid Electricity', '{"energy_source": "Grid Electricity", "energy_amount": 25}'::jsonb, NOW(), NOW()),
  ('demo-user-123', 'food', 'Beef Lunch', 6.0, 'kg CO₂', NOW() - INTERVAL '6 hours', 'Beef', '{"meal_type": "Lunch", "food_type": "Beef"}'::jsonb, NOW(), NOW()),
  ('demo-user-123', 'transport', '8 miles by Bus', 0.8, 'kg CO₂', NOW() - INTERVAL '1 day', 'Bus', '{"vehicle_type": "Bus", "distance": 8}'::jsonb, NOW(), NOW()),
  ('demo-user-123', 'shopping', '2 Electronics items', 10.0, 'kg CO₂', NOW() - INTERVAL '2 days', 'Electronics', '{"item_type": "Electronics", "quantity": 2}'::jsonb, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create demo session
INSERT INTO user_sessions (user_id, session_token, expires_at, created_at)
VALUES (
  'demo-user-123',
  'demo-session-token',
  NOW() + INTERVAL '30 days',
  NOW()
) ON CONFLICT (session_token) DO NOTHING;
