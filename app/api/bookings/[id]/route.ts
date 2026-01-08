import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Add logging for debugging
    console.log("[v0] Fetching booking with ID:", id)

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Fetch booking with car details
    const { data: booking, error } = await supabase
      .from("bookings")
      .select(`
        *,
        car:cars!bookings_car_id_fkey (
          name,
          model,
          image_url,
          transmission,
          seats,
          fuel_type
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("[v0] Error fetching booking:", error)
      return NextResponse.json({ error: "Booking not found", details: error.message }, { status: 404 })
    }

    if (!booking) {
      console.error("[v0] No booking data returned")
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    console.log("[v0] Booking fetched successfully:", booking.id)
    return NextResponse.json(booking)
  } catch (error) {
    console.error("[v0] Error in booking detail API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
