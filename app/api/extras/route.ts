import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Public endpoint for fetching active extras
export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data: extras, error } = await supabase
      .from("extras")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: true })

    if (error) throw error

    return NextResponse.json(extras)
  } catch (error: any) {
    console.error("[v0] Error fetching active extras:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
