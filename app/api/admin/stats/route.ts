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

    // Fetch stats
    const { count: totalBookings } = await supabase.from("bookings").select("*", { count: "exact", head: true })

    const { count: confirmedBookings } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "confirmed")

    const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true })

    const { data: revenueData } = await supabase.from("bookings").select("total_price").eq("status", "confirmed")

    const totalRevenue = revenueData?.reduce((sum, booking) => sum + Number(booking.total_price), 0) || 0

    return NextResponse.json({
      stats: {
        totalBookings: totalBookings || 0,
        confirmedBookings: confirmedBookings || 0,
        totalUsers: totalUsers || 0,
        totalRevenue: totalRevenue.toFixed(2),
      },
    })
  } catch (error) {
    console.error("[v0] Admin stats API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
