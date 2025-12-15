import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(req: NextRequest) {
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

    const body = await req.json()

    const { error } = await supabase
      .from("users")
      .update({
        full_name: body.fullName,
        phone: body.phone,
        address: body.address,
        postal_code: body.postalCode, // Added postal_code to update
        city: body.city,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const { data: user } = await supabase.from("users").select("*").eq("id", session.user.id).single()

    return NextResponse.json({ user, message: "Profile updated successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
