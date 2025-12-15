import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token und Passwort sind erforderlich" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Passwort muss mindestens 6 Zeichen lang sein" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Verify token
    const { data: resetToken, error: tokenError } = await supabase
      .from("password_reset_tokens")
      .select("*")
      .eq("token", token)
      .single()

    if (tokenError || !resetToken) {
      return NextResponse.json({ error: "Ungültiger Token" }, { status: 400 })
    }

    // Check if token is expired
    const expiresAt = new Date(resetToken.expires_at)
    if (expiresAt < new Date()) {
      return NextResponse.json({ error: "Token ist abgelaufen" }, { status: 400 })
    }

    // Check if token was already used
    if (resetToken.used) {
      return NextResponse.json({ error: "Token wurde bereits verwendet" }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user password
    const { error: updateError } = await supabase
      .from("users")
      .update({ password_hash: hashedPassword })
      .eq("id", resetToken.user_id)

    if (updateError) {
      console.error("[v0] Error updating password:", updateError)
      return NextResponse.json({ error: "Fehler beim Aktualisieren des Passworts" }, { status: 500 })
    }

    // Mark token as used
    await supabase.from("password_reset_tokens").update({ used: true }).eq("token", token)

    return NextResponse.json({ success: true, message: "Passwort erfolgreich zurückgesetzt" })
  } catch (error) {
    console.error("[v0] Reset password error:", error)
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 })
  }
}
