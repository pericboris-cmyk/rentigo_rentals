import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data: promotions, error } = await supabase
      .from("promotions")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching promotions:", error)
      return NextResponse.json({ error: "Fehler beim Laden der Aktionen" }, { status: 500 })
    }

    return NextResponse.json({ promotions })
  } catch (error) {
    console.error("[v0] Error in promotions GET:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const { promotionId, active } = await request.json()

    // Check if user is admin
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { data: user } = await supabase.from("users").select("role").eq("id", authUser.id).single()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 })
    }

    // If activating a promotion, deactivate all others first
    if (active) {
      await supabase.from("promotions").update({ active: false }).neq("id", promotionId)
    }

    // Update the promotion
    const { data: promotion, error } = await supabase
      .from("promotions")
      .update({ active, updated_at: new Date().toISOString() })
      .eq("id", promotionId)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating promotion:", error)
      return NextResponse.json({ error: "Fehler beim Aktualisieren der Aktion" }, { status: 500 })
    }

    return NextResponse.json({ promotion })
  } catch (error) {
    console.error("[v0] Error in promotions POST:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
