import { supabaseAdmin } from "@/lib/supabase/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("cars")
      .select("*")
      .eq("available", true)
      .order("price_per_day", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
