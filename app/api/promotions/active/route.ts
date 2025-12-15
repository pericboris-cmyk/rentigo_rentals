import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data: promotion, error } = await supabase.from("promotions").select("*").eq("active", true).maybeSingle()

    if (error) {
      console.error("[v0] Error fetching active promotion:", error)
      return NextResponse.json({ error: "Fehler beim Laden der Aktion" }, { status: 500 })
    }

    return NextResponse.json({ promotion: promotion || null })
  } catch (error) {
    console.error("[v0] Error in active promotion GET:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
