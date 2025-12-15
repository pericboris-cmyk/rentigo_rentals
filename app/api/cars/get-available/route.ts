import { supabaseAdmin } from "@/lib/supabase/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const pickupDate = searchParams.get("pickupDate")
    const dropoffDate = searchParams.get("dropoffDate")

    if (!pickupDate || !dropoffDate) {
      return NextResponse.json({ error: "Fehlende Datumsangaben" }, { status: 400 })
    }

    console.log("[v0] Fetching available cars for:", { pickupDate, dropoffDate })

    // Get all available cars
    const { data: allCars, error: carsError } = await supabaseAdmin
      .from("cars")
      .select("*")
      .eq("available", true)
      .order("price_per_day", { ascending: true })

    if (carsError) {
      console.error("[v0] Error fetching cars:", carsError)
      return NextResponse.json({ error: carsError.message }, { status: 400 })
    }

    // Check each car for availability
    const availableCars = []
    for (const car of allCars || []) {
      const { data: conflicts, error: conflictError } = await supabaseAdmin
        .from("bookings")
        .select("id")
        .eq("car_id", car.id)
        .eq("status", "confirmed")
        .or(`and(pickup_date.lte.${dropoffDate},dropoff_date.gte.${pickupDate})`)

      if (conflictError) {
        console.error("[v0] Error checking conflicts for car:", car.id, conflictError)
        continue
      }

      // If no conflicts, car is available
      if (!conflicts || conflicts.length === 0) {
        availableCars.push(car)
      }
    }

    console.log("[v0] Found", availableCars.length, "available cars")
    return NextResponse.json(availableCars)
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
