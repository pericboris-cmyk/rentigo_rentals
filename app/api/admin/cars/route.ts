import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function GET(request: NextRequest) {
  try {
    const { data: cars, error } = await supabaseAdmin.from("cars").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching cars:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ cars })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, model, transmission, seats, price_per_day, image_url, available, mileage, year, fuel_type } = body

    console.log("[v0] Creating new car:", { name, model, transmission, seats, price_per_day, mileage, year, fuel_type })

    if (!name || !model || !transmission || !seats || !price_per_day || !year || !fuel_type) {
      console.error("[v0] Missing required fields")
      return NextResponse.json({ error: "Alle Pflichtfelder müssen ausgefüllt werden" }, { status: 400 })
    }

    const seatsNum = Number.parseInt(seats)
    const priceNum = Number.parseFloat(price_per_day)
    const mileageNum = mileage ? Number.parseInt(mileage) : 0
    const yearNum = Number.parseInt(year)

    if (isNaN(seatsNum) || seatsNum < 2 || seatsNum > 9) {
      return NextResponse.json({ error: "Ungültige Sitzanzahl (2-9)" }, { status: 400 })
    }

    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json({ error: "Ungültiger Preis" }, { status: 400 })
    }

    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
      return NextResponse.json({ error: "Ungültiges Baujahr" }, { status: 400 })
    }

    if (mileage && (isNaN(mileageNum) || mileageNum < 0)) {
      return NextResponse.json({ error: "Ungültiger Kilometerstand" }, { status: 400 })
    }

    const { data: newCar, error } = await supabaseAdmin
      .from("cars")
      .insert({
        name,
        model,
        transmission,
        seats: seatsNum,
        price_per_day: priceNum,
        image_url: image_url || null,
        available: available !== false,
        mileage: mileageNum,
        year: yearNum,
        fuel_type,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase error creating car:", error)
      return NextResponse.json({ error: `Datenbankfehler: ${error.message}` }, { status: 500 })
    }

    console.log("[v0] Car created successfully:", newCar.id)
    return NextResponse.json({ car: newCar }, { status: 201 })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
