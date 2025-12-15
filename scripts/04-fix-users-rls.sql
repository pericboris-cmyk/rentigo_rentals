-- Drop existing policies
DROP POLICY IF EXISTS users_insert_own ON users;
DROP POLICY IF EXISTS users_view_own ON users;
DROP POLICY IF EXISTS users_update_own ON users;

-- RLS Policy: Users can view their own profile
CREATE POLICY users_view_own ON users
  FOR SELECT USING (auth.uid() = id);

-- RLS Policy: Users can update their own profile
CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policy: Allow INSERT for new users (this allows the admin client to insert)
CREATE POLICY users_insert_admin ON users
  FOR INSERT WITH CHECK (true);
