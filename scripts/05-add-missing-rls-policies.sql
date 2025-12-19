-- Add missing RLS policies for reviews and user_preferences

-- Reviews: Allow users to insert reviews for their own bookings
CREATE POLICY "Users can insert reviews for own bookings" ON reviews
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_id
      AND bookings.user_id = auth.uid()
    )
  );

-- Reviews: Allow admins to insert reviews
CREATE POLICY "Admins can insert reviews" ON reviews
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- User Preferences: Allow users to delete own preferences
CREATE POLICY "Users can delete own preferences" ON user_preferences
  FOR DELETE
  USING (user_id = auth.uid());

-- User Preferences: Allow admins to delete any preferences
CREATE POLICY "Admins can delete all preferences" ON user_preferences
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
