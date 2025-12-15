import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
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

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { data: user, error } = await supabase.from("users").select("*").eq("id", session.user.id).maybeSingle() // Use maybeSingle() instead of single() to avoid 406 error when no rows

    if (error) {
      console.error("[v0] Error fetching user profile:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!user) {
      console.warn("[v0] User profile not found for auth user:", session.user.id)
      return NextResponse.json({
        user: {
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || null,
          phone: session.user.user_metadata?.phone || null,
        },
        authUser: session.user,
        warning: "User profile not found in database",
      })
    }

    return NextResponse.json({ user, authUser: session.user })
  } catch (error) {
    console.error("[v0] User API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
