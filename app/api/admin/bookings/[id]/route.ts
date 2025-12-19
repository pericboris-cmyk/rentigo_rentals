import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    console.log("[v0] Booking update request received for:", id)

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      console.error("[v0] No session found")
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle()

    if (userError) {
      console.error("[v0] Error fetching user:", userError)
      return NextResponse.json({ error: "Fehler beim Abrufen der Benutzerinformationen" }, { status: 500 })
    }

    if (!user || user.role !== "admin") {
      console.error("[v0] User is not admin:", user)
      return NextResponse.json({ error: "Keine Admin-Berechtigung" }, { status: 403 })
    }

    const body = await req.json()
    const oldStatus = body.oldStatus
    const newStatus = body.status

    console.log("[v0] Updating booking status from", oldStatus, "to", newStatus)

    const { data: bookingBefore, error: fetchError } = await supabaseAdmin
      .from("bookings")
      .select(
        `
        *,
        car:cars(name, model)
      `,
      )
      .eq("id", id)
      .single()

    if (fetchError || !bookingBefore) {
      console.error("[v0] Error fetching booking:", fetchError)
      return NextResponse.json({ error: "Buchung nicht gefunden" }, { status: 404 })
    }

    console.log("[v0] Booking data fetched:", bookingBefore.id)

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("[v0] Error updating booking:", error)
      return NextResponse.json({ error: `Fehler beim Aktualisieren: ${error.message}` }, { status: 400 })
    }

    console.log("[v0] Booking status updated successfully")

    return NextResponse.json({ booking: data[0], message: "Buchung erfolgreich aktualisiert" })
  } catch (error) {
    console.error("[v0] Admin booking update error:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    console.log("[v0] Booking delete request received for:", id)

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      console.error("[v0] No session found")
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle()

    if (userError) {
      console.error("[v0] Error fetching user:", userError)
      return NextResponse.json({ error: "Fehler beim Abrufen der Benutzerinformationen" }, { status: 500 })
    }

    if (!user || user.role !== "admin") {
      console.error("[v0] User is not admin:", user)
      return NextResponse.json({ error: "Keine Admin-Berechtigung" }, { status: 403 })
    }

    const { error: reviewsError } = await supabaseAdmin.from("reviews").delete().eq("booking_id", id)

    if (reviewsError) {
      console.error("[v0] Error deleting reviews:", reviewsError)
      // Continue even if no reviews exist
    }

    const { error: deleteError } = await supabaseAdmin.from("bookings").delete().eq("id", id)

    if (deleteError) {
      console.error("[v0] Error deleting booking:", deleteError)
      return NextResponse.json({ error: `Fehler beim Löschen: ${deleteError.message}` }, { status: 500 })
    }

    console.log("[v0] Booking deleted successfully")
    return NextResponse.json({ message: "Buchung erfolgreich gelöscht" })
  } catch (error) {
    console.error("[v0] Admin booking delete error:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
