import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: carId } = await context.params
    const body = await request.json()

    console.log("[v0] Updating car:", carId, body)

    const updateData: any = { updated_at: new Date().toISOString() }

    if (body.name !== undefined) updateData.name = body.name
    if (body.model !== undefined) updateData.model = body.model
    if (body.transmission !== undefined) updateData.transmission = body.transmission
    if (body.seats !== undefined) {
      const seatsNum = Number.parseInt(body.seats)
      if (isNaN(seatsNum) || seatsNum < 2 || seatsNum > 9) {
        return NextResponse.json({ error: "Ungültige Sitzanzahl (2-9)" }, { status: 400 })
      }
      updateData.seats = seatsNum
    }
    if (body.price_per_day !== undefined) {
      const priceNum = Number.parseFloat(body.price_per_day)
      if (isNaN(priceNum) || priceNum <= 0) {
        return NextResponse.json({ error: "Ungültiger Preis" }, { status: 400 })
      }
      updateData.price_per_day = priceNum
    }
    if (body.image_url !== undefined) updateData.image_url = body.image_url || null
    if (body.available !== undefined) updateData.available = body.available

    if (body.mileage !== undefined) {
      const mileageNum = Number.parseInt(body.mileage)
      if (isNaN(mileageNum) || mileageNum < 0) {
        return NextResponse.json({ error: "Ungültiger Kilometerstand" }, { status: 400 })
      }
      updateData.mileage = mileageNum
    }
    if (body.year !== undefined) {
      const yearNum = Number.parseInt(body.year)
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
        return NextResponse.json({ error: "Ungültiges Baujahr" }, { status: 400 })
      }
      updateData.year = yearNum
    }
    if (body.fuel_type !== undefined) updateData.fuel_type = body.fuel_type

    const { data: updatedCar, error } = await supabaseAdmin
      .from("cars")
      .update(updateData)
      .eq("id", carId)
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase error updating car:", error)
      return NextResponse.json({ error: `Datenbankfehler: ${error.message}` }, { status: 500 })
    }

    console.log("[v0] Car updated successfully:", carId)
    return NextResponse.json({ car: updatedCar })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: carId } = await context.params

    console.log("[v0] Deleting car:", carId)

    // The foreign key constraint is now SET NULL, so this should work
    const { error } = await supabaseAdmin.from("cars").delete().eq("id", carId)

    if (error) {
      console.error("[v0] Error deleting car:", error)
      return NextResponse.json({ error: `Fehler beim Löschen: ${error.message}` }, { status: 500 })
    }

    console.log("[v0] Car deleted successfully")
    return NextResponse.json({ message: "Fahrzeug erfolgreich gelöscht" })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
