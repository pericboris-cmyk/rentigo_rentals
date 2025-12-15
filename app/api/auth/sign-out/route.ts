import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("[v0] Sign-out API called")
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("[v0] Supabase sign-out error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Sign-out successful")
    return NextResponse.json({ message: "Signed out successfully" })
  } catch (error) {
    console.error("[v0] Sign-out exception:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
