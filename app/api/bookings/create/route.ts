import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import {
  validateBirthDate,
  validateName,
  validatePhoneNumber,
  validateEmail,
  validateLicenseIssueDate,
  validateBookingDates,
  validateLocationAddress,
  areDriversIdentical,
  checkRateLimit,
  type ValidationError,
} from "@/lib/booking-validation"

export async function POST(req: NextRequest) {
  try {
    console.log("[v0] Create booking API called")

    const identifier = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const rateLimitCheck = checkRateLimit(identifier)

    if (!rateLimitCheck.allowed) {
      return NextResponse.json({ error: rateLimitCheck.message }, { status: 429 })
    }

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

    const body = await req.json()
    console.log("[v0] Booking data received:", body)

    const validationErrors: ValidationError[] = []

    const dateError = validateBookingDates(body.pickupDate, body.pickupTime, body.dropoffDate, body.dropoffTime)
    if (dateError) validationErrors.push(dateError)

    // Validate contact info
    const firstNameError = validateName(body.firstName, "Vorname")
    if (firstNameError) validationErrors.push(firstNameError)

    const lastNameError = validateName(body.lastName, "Nachname")
    if (lastNameError) validationErrors.push(lastNameError)

    const emailError = validateEmail(body.email)
    if (emailError) validationErrors.push(emailError)

    const phoneError = validatePhoneNumber(body.phone)
    if (phoneError) validationErrors.push(phoneError)

    // Validate drivers if present
    if (body.extras?.drivers?.mainDriver) {
      const driver1 = body.extras.drivers.mainDriver

      const d1FirstNameError = validateName(driver1.firstName, "Fahrer Vorname")
      if (d1FirstNameError) validationErrors.push(d1FirstNameError)

      const d1LastNameError = validateName(driver1.lastName, "Fahrer Nachname")
      if (d1LastNameError) validationErrors.push(d1LastNameError)

      const d1BirthDateError = validateBirthDate(driver1.birthDate)
      if (d1BirthDateError) validationErrors.push(d1BirthDateError)

      const d1LicenseIssueError = validateLicenseIssueDate(driver1.licenseIssueDate, driver1.birthDate)
      if (d1LicenseIssueError) validationErrors.push(d1LicenseIssueError)

      // Validate additional driver if present
      if (body.extras?.drivers?.additionalDriver) {
        const driver2 = body.extras.drivers.additionalDriver

        const d2FirstNameError = validateName(driver2.firstName, "Zusatzfahrer Vorname")
        if (d2FirstNameError) validationErrors.push(d2FirstNameError)

        const d2LastNameError = validateName(driver2.lastName, "Zusatzfahrer Nachname")
        if (d2LastNameError) validationErrors.push(d2LastNameError)

        const d2BirthDateError = validateBirthDate(driver2.birthDate, "Zusatzfahrer Geburtsdatum")
        if (d2BirthDateError) validationErrors.push(d2BirthDateError)

        const d2LicenseIssueError = validateLicenseIssueDate(
          driver2.licenseIssueDate,
          driver2.birthDate,
          "Zusatzfahrer Führerschein-Ausstellungsdatum",
        )
        if (d2LicenseIssueError) validationErrors.push(d2LicenseIssueError)

        // Check if drivers are identical
        if (areDriversIdentical(driver1, driver2)) {
          validationErrors.push({
            field: "Zusatzfahrer",
            message: "Hauptfahrer und Zusatzfahrer dürfen nicht identisch sein",
          })
        }
      }
    }

    const pickupAddressError = validateLocationAddress(body.pickupAddress, "Abholstandort")
    if (pickupAddressError) validationErrors.push(pickupAddressError)

    const dropoffAddressError = validateLocationAddress(body.dropoffAddress, "Rückgabestandort")
    if (dropoffAddressError) validationErrors.push(dropoffAddressError)

    if (validationErrors.length > 0) {
      console.log("[v0] Validation errors:", validationErrors)
      return NextResponse.json(
        {
          error: "Validierungsfehler",
          validationErrors,
        },
        { status: 400 },
      )
    }

    const { data: conflictingBookings } = await supabase
      .from("bookings")
      .select("id")
      .eq("car_id", body.carId)
      .in("status", ["confirmed"])
      .or(`and(pickup_date.lte.${body.dropoffDate},dropoff_date.gte.${body.pickupDate})`)

    if (conflictingBookings && conflictingBookings.length > 0) {
      console.log("[v0] Car not available for selected dates")
      return NextResponse.json(
        { error: "Dieses Fahrzeug ist für den gewählten Zeitraum nicht verfügbar. Bitte wählen Sie andere Daten." },
        { status: 409 },
      )
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        user_id: session?.user?.id || null,
        car_id: body.carId,
        pickup_address: body.pickupAddress,
        dropoff_address: body.dropoffAddress,
        pickup_date: body.pickupDate,
        pickup_time: body.pickupTime,
        dropoff_date: body.dropoffDate,
        dropoff_time: body.dropoffTime,
        first_name: body.firstName,
        last_name: body.lastName,
        email: body.email,
        phone: body.phone,
        total_price: body.totalPrice,
        status: "confirmed",
        extras: body.extras || {},
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Booking insert error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log("[v0] Booking created successfully:", data)

    const { data: carData } = await supabase
      .from("cars")
      .select("name, year, price_per_day")
      .eq("id", body.carId)
      .single()

    if (carData) {
      const { sendBookingConfirmationEmail, sendAdminNewBookingNotification } = await import("@/lib/email-service")

      const rentalDays = Math.ceil(
        (new Date(body.dropoffDate).getTime() - new Date(body.pickupDate).getTime()) / (1000 * 60 * 60 * 24),
      )
      const subtotal = rentalDays * carData.price_per_day

      await sendBookingConfirmationEmail({
        customerName: `${body.firstName} ${body.lastName}`,
        customerEmail: body.email,
        bookingId: data.id,
        carName: carData.name,
        carYear: carData.year,
        pickupDate: body.pickupDate,
        pickupTime: body.pickupTime,
        dropoffDate: body.dropoffDate,
        dropoffTime: body.dropoffTime,
        pickupLocation: body.pickupAddress,
        dropoffLocation: body.dropoffAddress,
        rentalDays,
        pricePerDay: carData.price_per_day,
        subtotal,
        extras: body.extras?.services || [],
        totalPrice: body.totalPrice,
        driverInfo: body.extras?.driverInfo,
        additionalDriver: body.extras?.additionalDriver,
      })

      await sendAdminNewBookingNotification({
        bookingId: data.id,
        customerName: `${body.firstName} ${body.lastName}`,
        customerEmail: body.email,
        customerPhone: body.phone,
        carName: carData.name,
        carYear: carData.year,
        pickupDate: body.pickupDate,
        pickupTime: body.pickupTime,
        dropoffDate: body.dropoffDate,
        dropoffTime: body.dropoffTime,
        pickupLocation: body.pickupAddress,
        dropoffLocation: body.dropoffAddress,
        totalPrice: body.totalPrice,
        rentalDays,
      })
    }

    return NextResponse.json({ booking: data, message: "Booking created successfully" }, { status: 201 })
  } catch (error) {
    console.error("[v0] Create booking API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
