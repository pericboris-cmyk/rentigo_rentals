import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

const headers = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store, no-cache, must-revalidate",
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .maybeSingle()

    if (error) {
      console.error("[v0] Error fetching maintenance mode:", error)
      return NextResponse.json({ maintenanceMode: false }, { status: 200, headers })
    }

    const isMaintenanceMode = data?.value === "true"

    return NextResponse.json({ maintenanceMode: isMaintenanceMode }, { headers })
  } catch (error: any) {
    console.error("[v0] Error in maintenance GET:", error)
    return NextResponse.json({ maintenanceMode: false, error: "Internal server error" }, { status: 200, headers })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { enabled } = await request.json()

    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[v0] Auth error:", authError)
      return NextResponse.json({ error: "Unauthorized - Please login" }, { status: 401, headers })
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    if (userError || !userData || userData.role !== "admin") {
      console.error("[v0] Not admin:", userError)
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403, headers })
    }

    // Update maintenance mode
    const { error: updateError } = await supabase
      .from("site_settings")
      .update({
        value: enabled ? "true" : "false",
        updated_at: new Date().toISOString(),
      })
      .eq("key", "maintenance_mode")

    if (updateError) {
      console.error("[v0] Error updating maintenance mode:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500, headers })
    }

    return NextResponse.json({ success: true, maintenanceMode: enabled }, { headers })
  } catch (error: any) {
    console.error("[v0] Error in maintenance POST:", error)
    return NextResponse.json({ error: error.message }, { status: 500, headers })
  }
}
