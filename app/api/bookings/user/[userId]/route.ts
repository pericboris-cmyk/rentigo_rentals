import { supabaseAdmin } from "@/lib/supabase/auth"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params

    console.log("[v0] Fetching bookings for user:", userId)

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select(`
        *,
        cars (
          name,
          model,
          year,
          price_per_day,
          image_url
        ),
        pickup_location:locations!bookings_pickup_location_id_fkey (
          name,
          address,
          city
        ),
        dropoff_location:locations!bookings_dropoff_location_id_fkey (
          name,
          address,
          city
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching user bookings:", error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log("[v0] Successfully fetched", data?.length || 0, "bookings")
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error in user bookings API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
