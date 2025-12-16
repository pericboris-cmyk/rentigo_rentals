import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    console.log("[v0] Reset password request received", { hasToken: !!token, hasPassword: !!password })

    if (!token || !password) {
      return NextResponse.json({ error: "Token und Passwort sind erforderlich" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Passwort muss mindestens 6 Zeichen lang sein" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Verify token in our custom table
    const { data: resetToken, error: tokenError } = await supabase
      .from("password_reset_tokens")
      .select("*")
      .eq("token", token)
      .single()

    console.log("[v0] Token verification", { found: !!resetToken, error: tokenError?.message })

    if (tokenError || !resetToken) {
      return NextResponse.json({ error: "Ungültiger Token" }, { status: 400 })
    }

    // Check if token is expired
    const expiresAt = new Date(resetToken.expires_at)
    if (expiresAt < new Date()) {
      console.log("[v0] Token expired", { expiresAt, now: new Date() })
      return NextResponse.json({ error: "Token ist abgelaufen" }, { status: 400 })
    }

    // Check if token was already used
    if (resetToken.used) {
      console.log("[v0] Token already used")
      return NextResponse.json({ error: "Token wurde bereits verwendet" }, { status: 400 })
    }

    // Get user email from users table
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("email")
      .eq("id", resetToken.user_id)
      .single()

    console.log("[v0] User lookup", { found: !!user, error: userError?.message })

    if (userError || !user) {
      return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 })
    }

    // Update password using Supabase Auth Admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(resetToken.user_id, {
      password: password,
    })

    console.log("[v0] Password update", { success: !updateError, error: updateError?.message })

    if (updateError) {
      console.error("[v0] Error updating password:", updateError)
      return NextResponse.json({ error: "Fehler beim Aktualisieren des Passworts" }, { status: 500 })
    }

    // Mark token as used
    await supabase.from("password_reset_tokens").update({ used: true }).eq("token", token)

    console.log("[v0] Password reset successful")

    return NextResponse.json({ success: true, message: "Passwort erfolgreich zurückgesetzt" })
  } catch (error) {
    console.error("[v0] Reset password error:", error)
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut." }, { status: 500 })
  }
}
