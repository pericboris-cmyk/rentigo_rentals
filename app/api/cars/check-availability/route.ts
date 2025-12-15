import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: NextRequest) {
  try {
    const { carId, pickupDate, dropoffDate } = await request.json()

    if (!carId || !pickupDate || !dropoffDate) {
      return NextResponse.json({ error: "Fehlende Parameter" }, { status: 400 })
    }

    const { data: conflictingBookings, error } = await supabaseAdmin
      .from("bookings")
      .select("id, pickup_date, dropoff_date, status")
      .eq("car_id", carId)
      .eq("status", "confirmed")
      .or(`and(pickup_date.lte.${dropoffDate},dropoff_date.gte.${pickupDate})`)

    if (error) {
      console.error("[v0] Error checking availability:", error)
      return NextResponse.json({ error: "Fehler bei der Verfügbarkeitsprüfung" }, { status: 500 })
    }

    const isAvailable = !conflictingBookings || conflictingBookings.length === 0

    return NextResponse.json({
      available: isAvailable,
      conflicts: conflictingBookings || [],
    })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
