-- Add admin role to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update RLS policies to allow admins to see all bookings
DROP POLICY IF EXISTS "Admins can read all bookings" ON bookings;
CREATE POLICY "Admins can read all bookings" ON bookings
  FOR SELECT USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "Admins can update all bookings" ON bookings;
CREATE POLICY "Admins can update all bookings" ON bookings
  FOR UPDATE USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Create a sample admin user (replace with your actual user ID after registration)
-- UPDATE users SET role = 'admin' WHERE email = 'admin@rentigo.com';
