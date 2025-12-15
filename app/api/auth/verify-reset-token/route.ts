import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ valid: false, error: "Token fehlt" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Check if token exists and is not expired
    const { data: resetToken, error } = await supabase
      .from("password_reset_tokens")
      .select("*")
      .eq("token", token)
      .single()

    if (error || !resetToken) {
      return NextResponse.json({ valid: false })
    }

    // Check if token is expired
    const expiresAt = new Date(resetToken.expires_at)
    if (expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: "Token abgelaufen" })
    }

    // Check if token was already used
    if (resetToken.used) {
      return NextResponse.json({ valid: false, error: "Token bereits verwendet" })
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error("[v0] Verify token error:", error)
    return NextResponse.json({ valid: false, error: "Fehler bei der Überprüfung" }, { status: 500 })
  }
}
