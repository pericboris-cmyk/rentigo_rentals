interface BookingConfirmationData {
  customerName: string
  customerEmail: string
  bookingId: string
  carName: string
  carYear: number
  pickupDate: string
  dropoffDate: string
  pickupLocation: string
  dropoffLocation: string
  rentalDays: number
  pricePerDay: number
  subtotal: number
  extras: Array<{ name: string; price: number }>
  totalPrice: number
  driverInfo?: {
    firstName: string
    lastName: string
    birthDate: string
    licenseNumber: string
    licenseIssueDate: string
  }
  additionalDriver?: {
    firstName: string
    lastName: string
    birthDate: string
    licenseNumber: string
    licenseIssueDate: string
  }
}

interface PaymentConfirmationData {
  customerName: string
  customerEmail: string
  bookingId: string
  carName: string
  pickupDate: string
  dropoffDate: string
  pickupLocation: string
  dropoffLocation: string
  totalPrice: number
}

interface AccountDeletionData {
  customerName: string
  customerEmail: string
  deletionDate: string
}

interface CancellationConfirmationData {
  customerName: string
  customerEmail: string
  bookingId: string
  carName: string
  carYear: number
  pickupDate: string
  dropoffDate: string
  pickupLocation: string
  dropoffLocation: string
  totalPrice: number
  cancellationDate: string
}

interface AdminBookingNotificationData {
  bookingId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  carName: string
  carYear: number
  pickupDate: string
  dropoffDate: string
  pickupLocation: string
  dropoffLocation: string
  totalPrice: number
  rentalDays: number
}

interface PasswordResetData {
  email: string
  name: string
  resetLink: string
}

export async function sendBookingConfirmationEmail(data: BookingConfirmationData) {
  console.log("[v0] Preparing to send confirmation email with invoice to:", data.customerEmail)

  const { generateInvoicePDF } = await import("./invoice-generator")
  const invoiceHtmlBase64 = await generateInvoicePDF({
    bookingId: data.bookingId,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    customerPhone: "", // Will be added from booking data
    carName: data.carName,
    carYear: data.carYear,
    pickupDate: data.pickupDate,
    dropoffDate: data.dropoffDate,
    pickupLocation: data.pickupLocation,
    dropoffLocation: data.dropoffLocation,
    rentalDays: data.rentalDays,
    pricePerDay: data.pricePerDay,
    subtotal: data.subtotal,
    extras: data.extras,
    totalPrice: data.totalPrice,
    driverInfo: data.driverInfo,
    additionalDriver: data.additionalDriver,
  })

  const emailSubject = "Buchungsbestätigung & Rechnung - Rentigo Rentals"
  const emailBody = `
Sehr geehrte/r ${data.customerName},

Ihre Buchung wurde erfolgreich bestätigt!

Buchungsdetails:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Buchungs-ID: ${data.bookingId}
Fahrzeug: ${data.carName} ${data.carYear}

Abholdatum: ${new Date(data.pickupDate).toLocaleDateString("de-CH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}
Rückgabedatum: ${new Date(data.dropoffDate).toLocaleDateString("de-CH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}

Abholort: ${data.pickupLocation}
Rückgabeort: ${data.dropoffLocation}

Gesamtpreis: CHF ${data.totalPrice.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RECHNUNG & ZAHLUNG:
Die detaillierte Rechnung mit QR-Code für die Zahlung finden Sie im Anhang.
Sie können den QR-Code mit Ihrer Banking-App scannen, um die Zahlung einfach durchzuführen.

Bitte bringen Sie folgende Dokumente zur Abholung mit:
• Gültiger Führerschein
• Personalausweis oder Reisepass
• Kreditkarte für die Kaution

Bei Fragen stehen wir Ihnen gerne zur Verfügung:
E-Mail: rentigorentals@gmail.com
Telefon: +41 78 971 42 41

Mit freundlichen Grüssen
Ihr Rentigo Rentals Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese E-Mail.
`

  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("[v0] RESEND_API_KEY not found in environment variables")
      return { success: false, error: "Email service not configured" }
    }

    console.log("[v0] Sending email with invoice PDF via Resend API...")

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Rentigo Rentals <noreply@rentigorentals.ch>",
        to: data.customerEmail,
        subject: emailSubject,
        text: emailBody,
        attachments: [
          {
            filename: `Rechnung_${data.bookingId.substring(0, 8)}.html`,
            content: invoiceHtmlBase64,
            content_type: "text/html",
          },
        ],
      }),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error("[v0] Resend API error:", responseData)
      return { success: false, error: responseData.message || "Failed to send email" }
    }

    console.log("[v0] Email with invoice sent successfully via Resend:", responseData)
    return { success: true, message: "Confirmation email with invoice sent successfully", emailId: responseData.id }
  } catch (error) {
    console.error("[v0] Error sending confirmation email with invoice:", error)
    return { success: false, error: "Failed to send email" }
  }
}

export async function sendPaymentConfirmationEmail(data: PaymentConfirmationData) {
  console.log("[v0] Preparing to send payment confirmation email to:", data.customerEmail)

  const emailSubject = "Zahlungsbestätigung - Rentigo Rentals"
  const emailBody = `
Sehr geehrte/r ${data.customerName},

Ihre Zahlung ist erfolgreich eingegangen!

Wir bestätigen hiermit den Eingang Ihrer Zahlung für die folgende Buchung. Die Buchung ist nun verbindlich bestätigt.

Buchungsdetails:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Buchungs-ID: ${data.bookingId}
Fahrzeug: ${data.carName}

Abholdatum: ${new Date(data.pickupDate).toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}
Rückgabedatum: ${new Date(data.dropoffDate).toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}

Abholort: ${data.pickupLocation}
Rückgabeort: ${data.dropoffLocation}

Bezahlter Betrag: CHF ${data.totalPrice.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Zahlung erfolgreich eingegangen
✓ Buchung verbindlich bestätigt
✓ Fahrzeug reserviert

Zur Abholung benötigen Sie:
• Gültiger Führerschein
• Personalausweis oder Reisepass
• Kreditkarte für die Kaution

Wir freuen uns darauf, Sie bei der Fahrzeugübernahme begrüßen zu dürfen!

Bei Fragen oder Problemen stehen wir Ihnen gerne zur Verfügung:
E-Mail: rentigorentals@gmail.com
Telefon: +41 78 971 42 41

Mit freundlichen Grüssen
Ihr Rentigo Rentals Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese E-Mail.
`

  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("[v0] RESEND_API_KEY not found in environment variables")
      return { success: false, error: "Email service not configured" }
    }

    console.log("[v0] Sending payment confirmation email via Resend API...")

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Rentigo Rentals <noreply@rentigorentals.ch>",
        to: data.customerEmail,
        subject: emailSubject,
        text: emailBody,
      }),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error("[v0] Resend API error:", responseData)
      return { success: false, error: responseData.message || "Failed to send email" }
    }

    console.log("[v0] Payment confirmation email sent successfully:", responseData)
    return { success: true, message: "Payment confirmation email sent successfully", emailId: responseData.id }
  } catch (error) {
    console.error("[v0] Error sending payment confirmation email:", error)
    return { success: false, error: "Failed to send email" }
  }
}

export async function sendAccountDeletionEmail(data: AccountDeletionData) {
  console.log("[v0] Preparing to send account deletion confirmation email to:", data.customerEmail)

  const emailSubject = "Kontolöschung bestätigt - Rentigo Rentals"
  const emailBody = `
Sehr geehrte/r ${data.customerName},

Ihr Konto bei Rentigo Rentals wurde erfolgreich gelöscht.

Löschungsdetails:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Datum der Löschung: ${data.deletionDate}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Folgende Daten wurden gelöscht:
• Ihr Benutzerprofil
• Alle persönlichen Informationen
• Ihre Buchungshistorie
• Ihre Bewertungen
• Ihre Präferenzen

Sie können sich jederzeit erneut registrieren, falls Sie unsere Dienste in Zukunft wieder nutzen möchten.

Wir bedauern, dass Sie uns verlassen, und hoffen, Sie in Zukunft wieder bei Rentigo Rentals begrüßen zu dürfen.

Bei Fragen stehen wir Ihnen gerne zur Verfügung:
E-Mail: rentigorentals@gmail.com
Telefon: +41 78 971 42 41

Mit freundlichen Grüssen
Ihr Rentigo Rentals Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese E-Mail.
`

  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("[v0] RESEND_API_KEY not found in environment variables")
      return { success: false, error: "Email service not configured" }
    }

    console.log("[v0] Sending account deletion confirmation email via Resend API...")

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Rentigo Rentals <noreply@rentigorentals.ch>",
        to: data.customerEmail,
        subject: emailSubject,
        text: emailBody,
      }),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error("[v0] Resend API error:", responseData)
      return { success: false, error: responseData.message || "Failed to send email" }
    }

    console.log("[v0] Account deletion confirmation email sent successfully:", responseData)
    return { success: true, message: "Account deletion confirmation email sent successfully", emailId: responseData.id }
  } catch (error) {
    console.error("[v0] Error sending account deletion confirmation email:", error)
    return { success: false, error: "Failed to send email" }
  }
}

export async function sendCancellationConfirmationEmail(data: CancellationConfirmationData) {
  console.log("[v0] Preparing to send cancellation confirmation email to:", data.customerEmail)

  const emailSubject = "Stornierungsbestätigung - Rentigo Rentals"
  const emailBody = `
Sehr geehrte/r ${data.customerName},

Ihre Buchung wurde erfolgreich storniert.

Stornierungsdetails:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Buchungs-ID: ${data.bookingId}
Fahrzeug: ${data.carName} ${data.carYear}

Ursprüngliches Abholdatum: ${new Date(data.pickupDate).toLocaleDateString("de-CH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}
Ursprüngliches Rückgabedatum: ${new Date(data.dropoffDate).toLocaleDateString("de-CH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}

Abholort: ${data.pickupLocation}
Rückgabeort: ${data.dropoffLocation}

Stornierter Betrag: CHF ${data.totalPrice.toFixed(2)}
Stornierungsdatum: ${new Date(data.cancellationDate).toLocaleDateString("de-CH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Buchung wurde storniert
✓ Fahrzeug wurde freigegeben
✓ Rückerstattung wird bearbeitet

RÜCKERSTATTUNG:
Die Rückerstattung wird innerhalb von 5-10 Werktagen auf Ihr ursprüngliches Zahlungsmittel überwiesen.
Sie erhalten eine separate Benachrichtigung, sobald die Rückerstattung verarbeitet wurde.

Wir bedauern, dass Ihre Pläne sich geändert haben. Sie können jederzeit eine neue Buchung vornehmen, wenn Sie unsere Dienste wieder benötigen.

Bei Fragen zur Stornierung oder Rückerstattung stehen wir Ihnen gerne zur Verfügung:
E-Mail: rentigorentals@gmail.com
Telefon: +41 78 971 42 41

Mit freundlichen Grüssen
Ihr Rentigo Rentals Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese E-Mail.
`

  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("[v0] RESEND_API_KEY not found in environment variables")
      return { success: false, error: "Email service not configured" }
    }

    console.log("[v0] Sending cancellation confirmation email via Resend API...")

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Rentigo Rentals <noreply@rentigorentals.ch>",
        to: data.customerEmail,
        subject: emailSubject,
        text: emailBody,
      }),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error("[v0] Resend API error:", responseData)
      return { success: false, error: responseData.message || "Failed to send email" }
    }

    console.log("[v0] Cancellation confirmation email sent successfully:", responseData)
    return {
      success: true,
      message: "Cancellation confirmation email sent successfully",
      emailId: responseData.id,
    }
  } catch (error) {
    console.error("[v0] Error sending cancellation confirmation email:", error)
    return { success: false, error: "Failed to send email" }
  }
}

export async function sendAdminNewBookingNotification(data: AdminBookingNotificationData) {
  console.log("[v0] Preparing to send new booking notification to all admins")

  const { createClient } = await import("@supabase/supabase-js")
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data: adminUsers, error: adminError } = await supabase
    .from("users")
    .select("email, full_name")
    .eq("role", "admin")

  if (adminError) {
    console.error("[v0] Error fetching admin users:", adminError)
    return { success: false, error: "Failed to fetch admin users" }
  }

  if (!adminUsers || adminUsers.length === 0) {
    console.log("[v0] No admin users found in database")
    return { success: false, error: "No admin users found" }
  }

  console.log(
    `[v0] Found ${adminUsers.length} admin user(s):`,
    adminUsers.map((u) => u.email),
  )

  const emailSubject = `🚗 Neue Buchung eingegangen - ${data.bookingId.substring(0, 8)}`
  const emailBody = `
Neue Buchung bei Rentigo Rentals!

Eine neue Buchung ist soeben eingegangen und erfordert Ihre Aufmerksamkeit.

BUCHUNGSDETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Buchungs-ID: ${data.bookingId}
Status: Ausstehend (Pending)

FAHRZEUG:
${data.carName} ${data.carYear}

MIETDAUER:
Von: ${new Date(data.pickupDate).toLocaleDateString("de-CH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}
Bis: ${new Date(data.dropoffDate).toLocaleDateString("de-CH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}
Dauer: ${data.rentalDays} Tag${data.rentalDays > 1 ? "e" : ""}

STANDORTE:
Abholort: ${data.pickupLocation}
Rückgabeort: ${data.dropoffLocation}

KUNDE:
Name: ${data.customerName}
E-Mail: ${data.customerEmail}
Telefon: ${data.customerPhone}

FINANZEN:
Gesamtpreis: CHF ${data.totalPrice.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NÄCHSTE SCHRITTE:
1. Buchung im Admin-Dashboard überprüfen
2. Zahlungseingang kontrollieren
3. Buchung bestätigen oder ablehnen
4. Fahrzeug für den Mietzeitraum vorbereiten

Zum Admin-Dashboard:
https://rentigorentals.ch/admin/bookings

Bei Fragen oder Problemen kontaktieren Sie bitte den Kunden direkt.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Diese E-Mail wurde automatisch vom Rentigo Rentals Buchungssystem generiert.
`

  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("[v0] RESEND_API_KEY not found in environment variables")
      return { success: false, error: "Email service not configured" }
    }

    console.log("[v0] Sending admin notification emails via Resend API...")

    const emailPromises = adminUsers.map(async (admin) => {
      console.log(`[v0] Sending notification to admin: ${admin.email}`)

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Rentigo Rentals <noreply@rentigorentals.ch>",
          to: admin.email,
          subject: emailSubject,
          text: emailBody,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error(`[v0] Resend API error for ${admin.email}:`, responseData)
        return { success: false, email: admin.email, error: responseData.message }
      }

      console.log(`[v0] Admin notification email sent successfully to ${admin.email}:`, responseData)
      return { success: true, email: admin.email, emailId: responseData.id }
    })

    const results = await Promise.all(emailPromises)
    const successCount = results.filter((r) => r.success).length
    const failureCount = results.filter((r) => !r.success).length

    console.log(`[v0] Admin notifications sent: ${successCount} successful, ${failureCount} failed`)

    return {
      success: successCount > 0,
      message: `Admin notification emails sent to ${successCount}/${adminUsers.length} admins`,
      results,
    }
  } catch (error) {
    console.error("[v0] Error sending admin notification emails:", error)
    return { success: false, error: "Failed to send emails" }
  }
}

export async function sendPasswordResetEmail(data: PasswordResetData) {
  console.log("[v0] Preparing to send password reset email to:", data.email)

  const emailSubject = "Passwort zurücksetzen - Rentigo Rentals"
  const emailBody = `
Hallo ${data.name},

Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts für Ihr Rentigo Rentals Konto gestellt.

Klicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen:

${data.resetLink}

Dieser Link ist 1 Stunde lang gültig.

Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren. 
Ihr Passwort bleibt unverändert.

Aus Sicherheitsgründen:
• Teilen Sie diesen Link mit niemandem
• Rentigo Rentals wird Sie niemals nach Ihrem Passwort fragen

Bei Fragen oder Problemen stehen wir Ihnen gerne zur Verfügung:
E-Mail: rentigorentals@gmail.com
Telefon: +41 78 971 42 41

Mit freundlichen Grüssen
Ihr Rentigo Rentals Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese E-Mail.
`

  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("[v0] RESEND_API_KEY not found in environment variables")
      return { success: false, error: "Email service not configured" }
    }

    console.log("[v0] Sending password reset email via Resend API...")

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Rentigo Rentals <noreply@rentigorentals.ch>",
        to: data.email,
        subject: emailSubject,
        text: emailBody,
      }),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error("[v0] Resend API error:", responseData)
      return { success: false, error: responseData.message || "Failed to send email" }
    }

    console.log("[v0] Password reset email sent successfully:", responseData)
    return { success: true, message: "Password reset email sent successfully", emailId: responseData.id }
  } catch (error) {
    console.error("[v0] Error sending password reset email:", error)
    return { success: false, error: "Failed to send email" }
  }
}
