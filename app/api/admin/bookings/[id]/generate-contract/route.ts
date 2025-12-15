import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { generateRentalContractPDF } from "@/lib/rental-contract-generator"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: bookingId } = await params
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

    // Verify admin auth
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    if (!authUser) {
      return Response.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("role").eq("id", authUser.id).single()

    if (!userData || userData.role !== "admin") {
      return Response.json({ error: "Keine Berechtigung" }, { status: 403 })
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(
        `
        *,
        cars (name, model, year, license_plate, color, mileage),
        pickup_location:locations!bookings_pickup_location_id_fkey (name, address, city),
        dropoff_location:locations!bookings_dropoff_location_id_fkey (name, address, city)
      `,
      )
      .eq("id", bookingId)
      .single()

    if (bookingError || !booking) {
      return Response.json({ error: "Buchung nicht gefunden" }, { status: 404 })
    }

    // Parse request body for additional contract data
    const body = await request.json()
    const {
      startMileage,
      endMileage,
      pickupTime = "10:00",
      dropoffTime = "10:00",
      lesseeAddress,
      lesseeCity,
      deposit = 1000,
      includedKm = 200,
      extraKmPrice = 0.5,
    } = body

    // Calculate rental days
    const pickupDate = new Date(booking.pickup_date)
    const dropoffDate = new Date(booking.dropoff_date)
    const rentalDays = Math.ceil((dropoffDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24))

    // Parse extras from booking
    const extras = booking.extras ? JSON.parse(booking.extras) : []

    const contractData = {
      bookingId: booking.id,
      contractDate: new Date().toISOString(),
      // Vermieter
      lessorName: "Rentigo Rentals AG",
      lessorAddress: "Musterstrasse 123",
      lessorCity: "8001 Zürich",
      lessorPhone: "+41 78 971 42 41",
      lessorEmail: "rentigorentals@gmail.com",
      // Mieter
      lesseeFirstName: booking.first_name,
      lesseeLastName: booking.last_name,
      lesseeAddress: lesseeAddress || "",
      lesseeCity: lesseeCity || "",
      lesseePhone: booking.phone,
      lesseeEmail: booking.email,
      lesseeBirthDate: booking.driver_birth_date || new Date(2000, 0, 1).toISOString(),
      lesseeLicenseNumber: booking.driver_license_number || "CH-123456",
      lesseeLicenseIssueDate: booking.driver_license_issue_date || new Date(2020, 0, 1).toISOString(),
      // Fahrzeug - automatically loaded from database
      carMake: booking.cars.name.split(" ")[0] || "",
      carModel: booking.cars.model || booking.cars.name,
      carYear: booking.cars.year,
      carPlate: booking.cars.license_plate || "ZH-123456",
      carVin: "WDB" + booking.cars.year + Math.random().toString(36).substring(2, 15).toUpperCase(), // Generate VIN from year
      carColor: booking.cars.color || "Schwarz",
      // Mietdetails
      pickupDate: booking.pickup_date,
      pickupTime,
      pickupLocation: booking.pickup_location.name + ", " + booking.pickup_location.city,
      dropoffDate: booking.dropoff_date,
      dropoffTime,
      dropoffLocation: booking.dropoff_location.name + ", " + booking.dropoff_location.city,
      rentalDays,
      // Kilometerstand
      startMileage: startMileage || booking.cars.mileage || 0,
      endMileage,
      includedKm: includedKm * rentalDays,
      extraKmPrice,
      // Preise
      dailyRate: booking.total_price / rentalDays,
      totalRentalPrice: booking.total_price,
      deposit,
      extras: extras.map((e: any) => ({
        name: e.name,
        price: e.price * rentalDays,
      })),
      totalPrice: booking.total_price,
      // Zusätzlicher Fahrer
      additionalDriver: booking.additional_driver_first_name
        ? {
            firstName: booking.additional_driver_first_name,
            lastName: booking.additional_driver_last_name,
            birthDate: booking.additional_driver_birth_date,
            licenseNumber: booking.additional_driver_license_number,
            licenseIssueDate: booking.additional_driver_license_issue_date,
          }
        : undefined,
    }

    const contractHtml = await generateRentalContractPDF(contractData)

    return Response.json({
      success: true,
      contract: contractHtml,
      filename: `Mietvertrag_${bookingId.substring(0, 8)}.html`,
    })
  } catch (error) {
    console.error("[v0] Error generating contract:", error)
    return Response.json({ error: "Fehler beim Erstellen des Mietvertrags" }, { status: 500 })
  }
}
