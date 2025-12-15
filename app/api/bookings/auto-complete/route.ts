import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    })

    const now = new Date()

    const { data: expiredBookings, error: fetchError } = await supabase
      .from("bookings")
      .select("id, dropoff_date, status")
      .eq("status", "confirmed")
      .lt("dropoff_date", now.toISOString().split("T")[0])

    if (fetchError) {
      console.error("[v0] Error fetching expired bookings:", fetchError)
      return NextResponse.json({ error: "Fehler beim Abrufen abgelaufener Buchungen" }, { status: 500 })
    }

    if (!expiredBookings || expiredBookings.length === 0) {
      return NextResponse.json({
        message: "Keine abgelaufenen Buchungen gefunden",
        updated: 0,
      })
    }

    const { data: updatedBookings, error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .in(
        "id",
        expiredBookings.map((b) => b.id),
      )
      .select()

    if (updateError) {
      console.error("[v0] Error updating bookings:", updateError)
      return NextResponse.json({ error: "Fehler beim Aktualisieren der Buchungen" }, { status: 500 })
    }

    console.log(`[v0] Auto-completed ${updatedBookings?.length || 0} bookings`)

    return NextResponse.json({
      message: "Buchungen erfolgreich abgeschlossen",
      updated: updatedBookings?.length || 0,
      bookings: updatedBookings,
    })
  } catch (error) {
    console.error("[v0] Auto-complete bookings error:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
