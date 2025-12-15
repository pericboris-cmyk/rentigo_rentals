import { supabaseAdmin } from "@/lib/supabase/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.auth.admin.getUserByEmail(email)

    if (error || !data.user) {
      console.error("[v0] User not found:", error)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Resend confirmation email
    const { error: resendError } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email: email,
    })

    if (resendError) {
      console.error("[v0] Failed to resend email:", resendError)
      return NextResponse.json({ error: "Failed to resend email" }, { status: 500 })
    }

    console.log("[v0] Verification email resent to:", email)
    return NextResponse.json({ message: "Bestätigungs-E-Mail wurde erneut gesendet" })
  } catch (error) {
    console.error("[v0] Resend email error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
