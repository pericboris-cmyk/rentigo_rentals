import { Resend } from "resend"
import { NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Alle Pflichtfelder müssen ausgefüllt sein" }, { status: 400 })
    }

    const recipients = ["rentigorentals@gmail.com", "peric.boris@hotmail.com"]

    const emailPromises = recipients.map(async (recipient) => {
      return resend.emails.send({
        from: "noreply@rentigorentals.ch",
        to: recipient,
        subject: `Neue Kontaktanfrage: ${subject}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .info-row { margin-bottom: 15px; padding: 12px; background: white; border-radius: 8px; border-left: 4px solid #3b82f6; }
                .label { font-weight: bold; color: #1e40af; margin-bottom: 5px; }
                .value { color: #4b5563; }
                .message-box { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-top: 15px; }
                .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0; font-size: 24px;">Neue Kontaktanfrage</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">Rentigo Rentals</p>
                </div>
                
                <div class="content">
                  <div class="info-row">
                    <div class="label">Name:</div>
                    <div class="value">${name}</div>
                  </div>
                  
                  <div class="info-row">
                    <div class="label">E-Mail:</div>
                    <div class="value"><a href="mailto:${email}" style="color: #3b82f6;">${email}</a></div>
                  </div>
                  
                  ${
                    phone
                      ? `
                  <div class="info-row">
                    <div class="label">Telefon:</div>
                    <div class="value"><a href="tel:${phone}" style="color: #3b82f6;">${phone}</a></div>
                  </div>
                  `
                      : ""
                  }
                  
                  <div class="info-row">
                    <div class="label">Betreff:</div>
                    <div class="value">${subject}</div>
                  </div>
                  
                  <div class="message-box">
                    <div class="label">Nachricht:</div>
                    <div class="value" style="white-space: pre-wrap;">${message}</div>
                  </div>
                  
                  <div class="footer">
                    <p>Diese Nachricht wurde über das Kontaktformular auf rentigorentals.ch gesendet</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
      })
    })

    const results = await Promise.allSettled(emailPromises)

    // Check if at least one email was sent successfully
    const successCount = results.filter((result) => result.status === "fulfilled").length

    if (successCount === 0) {
      console.error("[v0] All contact form emails failed:", results)
      return NextResponse.json({ error: "Fehler beim Senden der E-Mails" }, { status: 500 })
    }

    console.log(`[v0] Contact form: ${successCount}/${recipients.length} emails sent successfully`)

    return NextResponse.json({
      message: "Ihre Nachricht wurde erfolgreich gesendet",
      sent: successCount,
      total: recipients.length,
    })
  } catch (error) {
    console.error("[v0] Error in contact form:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
