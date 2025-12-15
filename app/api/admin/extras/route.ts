import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("[v0] Admin extras API - GET request")
    const supabase = await createServerClient()

    const { data: extras, error } = await supabase.from("extras").select("*").order("created_at", { ascending: true })

    console.log("[v0] Supabase query result:", { extras, error })

    if (error) {
      console.error("[v0] Error fetching extras:", error)

      // If table doesn't exist, return empty array
      if (
        error.code === "PGRST204" ||
        error.code === "PGRST205" ||
        error.message.includes("Could not find the table")
      ) {
        console.log("[v0] Extras table does not exist, returning empty array")
        return NextResponse.json([])
      }

      throw error
    }

    console.log("[v0] Successfully fetched extras, count:", extras?.length || 0)
    return NextResponse.json(extras || [])
  } catch (error: any) {
    console.error("[v0] Error fetching extras:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const body = await request.json()

    const { data: extra, error } = await supabase
      .from("extras")
      .insert({
        name: body.name,
        description: body.description,
        price_per_day: body.price_per_day,
        icon_name: body.icon_name || "Package",
        active: body.active !== undefined ? body.active : true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(extra)
  } catch (error: any) {
    console.error("[v0] Error creating extra:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
