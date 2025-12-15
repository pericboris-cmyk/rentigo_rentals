import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "E-Mail-Adresse ist erforderlich" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, full_name")
      .eq("email", email)
      .single()

    if (userError || !user) {
      // For security, don't reveal if email exists
      return NextResponse.json({
        success: true,
        message: "Falls diese E-Mail registriert ist, wurde ein Reset-Link versendet.",
      })
    }

    // Generate password reset token
    const resetToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Store reset token in database
    const { error: tokenError } = await supabase.from("password_reset_tokens").insert({
      user_id: user.id,
      token: resetToken,
      expires_at: expiresAt.toISOString(),
    })

    if (tokenError) {
      console.error("[v0] Error creating reset token:", tokenError)
      return NextResponse.json({ error: "Fehler beim Erstellen des Reset-Links" }, { status: 500 })
    }

    // Send password reset email
    const { sendPasswordResetEmail } = await import("@/lib/email-service")
    const resetLink = `https://rentigorentals.ch/passwort-zuruecksetzen?token=${resetToken}`

    await sendPasswordResetEmail({
      email: user.email,
      name: user.full_name,
      resetLink,
    })

    return NextResponse.json({
      success: true,
      message: "Falls diese E-Mail registriert ist, wurde ein Reset-Link versendet.",
    })
  } catch (error) {
    console.error("[v0] Forgot password error:", error)
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 })
  }
}
