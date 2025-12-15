import { supabaseAdmin } from "@/lib/supabase/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email")
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.auth.admin.getUserByEmail(email)

    if (error || !data.user) {
      console.log("[v0] User not found or error:", error)
      return NextResponse.json({ verified: false })
    }

    const isVerified = data.user.email_confirmed_at !== null
    console.log("[v0] Email verification status for", email, ":", isVerified)

    return NextResponse.json({ verified: isVerified })
  } catch (error) {
    console.error("[v0] Verification check error:", error)
    return NextResponse.json({ verified: false })
  }
}
