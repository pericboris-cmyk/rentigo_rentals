import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { sendPaymentConfirmationEmail } from "@/lib/email-service"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log("[v0] Sending payment confirmation for booking:", id)

    const supabase = await createServerClient()

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      console.error("[v0] Auth error:", sessionError)
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 })
    }

    const { data: adminUser, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (userError || !adminUser || adminUser.role !== "admin") {
      console.error("[v0] Not admin:", userError)
      return NextResponse.json({ error: "Nur Administratoren können diese Aktion ausführen" }, { status: 403 })
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(
        `
        *,
        car:cars(name, model)
      `,
      )
      .eq("id", id)
      .single()

    if (bookingError || !booking) {
      console.error("[v0] Booking not found:", bookingError)
      return NextResponse.json({ error: "Buchung nicht gefunden" }, { status: 404 })
    }

    if (!booking.car || !booking.pickup_address || !booking.dropoff_address) {
      console.error("[v0] Missing booking data:", {
        hasCar: !!booking.car,
        hasPickupAddress: !!booking.pickup_address,
        hasDropoffAddress: !!booking.dropoff_address,
      })
      return NextResponse.json(
        {
          error: "Buchungsdaten unvollständig. Bitte überprüfen Sie, ob alle Fahrzeug- und Adressdaten vorhanden sind.",
        },
        { status: 400 },
      )
    }

    const emailResult = await sendPaymentConfirmationEmail({
      customerName: `${booking.first_name} ${booking.last_name}`,
      customerEmail: booking.email,
      bookingId: booking.id.slice(0, 8).toUpperCase(),
      carName: `${booking.car.name} ${booking.car.model}`,
      pickupDate: booking.pickup_date,
      dropoffDate: booking.dropoff_date,
      pickupLocation: booking.pickup_address,
      dropoffLocation: booking.dropoff_address,
      totalPrice: Number(booking.total_price),
    })

    if (!emailResult.success) {
      console.error("[v0] Failed to send payment confirmation email:", emailResult.error)
      return NextResponse.json({ error: "Fehler beim Senden der E-Mail" }, { status: 500 })
    }

    console.log("[v0] Payment confirmation email sent successfully")
    return NextResponse.json({
      success: true,
      message: "Bezahlbestätigung erfolgreich an Kunde gesendet",
    })
  } catch (error) {
    console.error("[v0] Error sending payment confirmation:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
