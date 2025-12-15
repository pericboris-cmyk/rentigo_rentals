import { NextResponse } from "next/server"
import { sendBookingConfirmationEmail } from "@/lib/email-service"

export async function POST() {
  try {
    // Generate test invoice data
    const testInvoiceData = {
      bookingId: `TEST-${Date.now()}`,
      customerName: "Admin Test",
      customerEmail: "peric.boris@hotmail.com", // Must use verified email in Resend test mode
      customerPhone: "+41 78 971 42 41",
      carName: "Test Fahrzeug",
      carYear: 2024,
      pickupDate: new Date().toISOString(),
      dropoffDate: new Date(Date.now() + 86400000).toISOString(), // 1 day later
      pickupLocation: "Zürich Hauptbahnhof",
      dropoffLocation: "Zürich Hauptbahnhof",
      rentalDays: 1,
      pricePerDay: 1.0,
      subtotal: 1.0,
      extras: [],
      totalPrice: 1.0,
    }

    // Send test invoice email
    await sendBookingConfirmationEmail(testInvoiceData)

    return NextResponse.json({
      success: true,
      message: "Testrechnung wurde erfolgreich an peric.boris@hotmail.com verschickt",
    })
  } catch (error) {
    console.error("[v0] Test payment error:", error)
    return NextResponse.json({ error: "Fehler beim Versenden der Testrechnung" }, { status: 500 })
  }
}
