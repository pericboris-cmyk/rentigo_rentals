import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for browser-side auth
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Server-side admin client
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export type User = {
  id: string
  email: string
  full_name?: string
  phone?: string
  address?: string
  city?: string
  created_at: string
  updated_at: string
}

export type UserPreferences = {
  id: string
  user_id: string
  preferred_location_id?: string
  favorite_car_ids: string[]
  created_at: string
  updated_at: string
}
