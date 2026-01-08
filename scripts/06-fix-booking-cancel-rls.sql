-- Add RLS policy for customers to cancel their own bookings
CREATE POLICY "Users can cancel own bookings" 
ON bookings 
FOR UPDATE 
USING (auth.uid() = user_id AND status = 'confirmed')
WITH CHECK (auth.uid() = user_id);

-- Add RLS policy for selecting own bookings
CREATE POLICY "Users can view own bookings for cancellation" 
ON bookings 
FOR SELECT 
USING (auth.uid() = user_id);
