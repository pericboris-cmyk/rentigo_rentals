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

    // Check if user is admin
    const { data: user } = await supabase.from("users").select("role").eq("id", session.user.id).single()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 })
    }

    // Fetch all bookings with related data
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        car:cars(name, model),
        pickup_location:locations!bookings_pickup_location_id_fkey(name, city),
        dropoff_location:locations!bookings_dropoff_location_id_fkey(name, city),
        user:users(full_name, email)
      `,
      )
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching bookings:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("[v0] Admin bookings API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
