import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: bookingId } = params

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
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select(
        `
        id,
        first_name,
        last_name,
        email,
        status,
        pickup_date,
        dropoff_date,
        pickup_address,
        dropoff_address,
        total_price,
        user_id,
        cars (
          name,
          year
        )
      `,
      )
      .eq("id", bookingId)
      .single()

    if (fetchError || !booking) {
      console.error("[v0] Booking fetch error:", fetchError)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (booking.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if booking can be cancelled
    if (booking.status === "cancelled") {
      return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 })
    }

    if (booking.status === "completed") {
      return NextResponse.json({ error: "Cannot cancel completed bookings" }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", bookingId)

    if (updateError) {
      console.error("[v0] Error updating booking status:", updateError)
      return NextResponse.json({ error: "Failed to update booking status" }, { status: 500 })
    }

    // Send cancellation confirmation email
    const { sendCancellationConfirmationEmail } = await import("@/lib/email-service")
    await sendCancellationConfirmationEmail({
      customerName: `${booking.first_name} ${booking.last_name}`,
      customerEmail: booking.email,
      bookingId: booking.id,
      carName: booking.cars.name,
      carYear: booking.cars.year,
      pickupDate: booking.pickup_date,
      dropoffDate: booking.dropoff_date,
      pickupLocation: booking.pickup_address,
      dropoffLocation: booking.dropoff_address,
      totalPrice: Number.parseFloat(booking.total_price),
      cancellationDate: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
    })
  } catch (error) {
    console.error("[v0] Error cancelling booking:", error)
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 })
  }
}
