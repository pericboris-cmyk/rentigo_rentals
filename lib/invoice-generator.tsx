import QRCode from "qrcode"

interface InvoiceData {
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

export async function generateInvoicePDF(data: InvoiceData): Promise<string> {
  const extrasTotal = data.extras.reduce((sum, e) => sum + e.price, 0)
  const subtotalWithExtras = data.subtotal + extrasTotal
  const vatRate = 0.077 // 7.7% Swiss VAT
  const netAmount = subtotalWithExtras / (1 + vatRate)
  const vatAmount = subtotalWithExtras - netAmount

  // Generate Swiss QR-Bill QR code
  const qrData = await generateSwissQRCode(data)

  // Create HTML for PDF
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      padding: 40px;
      color: #1e293b;
      line-height: 1.6;
    }
    .header { 
      display: flex; 
      justify-content: space-between; 
      align-items: start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #1e40af;
    }
    .company-info h1 { 
      color: #1e40af; 
      font-size: 28px;
      margin-bottom: 8px;
    }
    .company-info p { 
      color: #64748b; 
      font-size: 12px;
    }
    .invoice-meta { 
      text-align: right;
    }
    .invoice-meta h2 { 
      color: #1e40af; 
      font-size: 24px;
      margin-bottom: 10px;
    }
    .invoice-meta p { 
      font-size: 12px;
      margin: 4px 0;
    }
    .customer-info { 
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .customer-info h3 { 
      color: #1e40af;
      margin-bottom: 12px;
      font-size: 16px;
    }
    .customer-info p { 
      font-size: 13px;
      margin: 6px 0;
    }
    .booking-details { 
      margin-bottom: 30px;
    }
    .booking-details h3 { 
      color: #1e40af;
      margin-bottom: 15px;
      font-size: 16px;
    }
    .detail-grid { 
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      font-size: 13px;
    }
    .detail-item { 
      display: flex;
      justify-content: space-between;
      padding: 8px 12px;
      background: #f8fafc;
      border-radius: 4px;
    }
    .detail-label { 
      color: #64748b;
      font-weight: 500;
    }
    .detail-value { 
      color: #1e293b;
      font-weight: 600;
    }
    table { 
      width: 100%; 
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th { 
      background: #1e40af;
      color: white;
      padding: 12px;
      text-align: left;
      font-size: 13px;
      font-weight: 600;
    }
    td { 
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 13px;
    }
    tr:hover { 
      background: #f8fafc;
    }
    .text-right { 
      text-align: right;
    }
    .total-section { 
      margin-top: 20px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
    }
    .total-row { 
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }
    .total-final { 
      display: flex;
      justify-content: space-between;
      padding: 16px 0;
      margin-top: 12px;
      border-top: 2px solid #1e40af;
      font-size: 20px;
      font-weight: bold;
      color: #1e40af;
    }
    .qr-section { 
      margin-top: 40px;
      padding: 30px;
      background: white;
      border: 2px solid #1e40af;
      border-radius: 8px;
      text-align: center;
    }
    .qr-section h3 { 
      color: #1e40af;
      margin-bottom: 20px;
      font-size: 18px;
    }
    .qr-section img { 
      display: block;
      margin: 0 auto 20px;
      width: 250px;
      height: 250px;
    }
    .payment-info { 
      background: #f8fafc;
      padding: 15px;
      border-radius: 6px;
      font-size: 12px;
      line-height: 1.8;
      text-align: left;
      margin-top: 20px;
    }
    .payment-info strong { 
      color: #1e40af;
    }
    .footer { 
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 11px;
      color: #64748b;
    }
    .driver-section {
      margin-top: 30px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
    }
    .driver-section h3 {
      color: #1e40af;
      margin-bottom: 15px;
      font-size: 16px;
    }
    .driver-info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <h1>Rentigo Rentals</h1>
      <p>Premium Mietwagen Service</p>
      <p>Musterstrasse 123, 8001 Zürich, Schweiz</p>
      <p>Tel: +41 78 971 42 41 | rentigorentals@gmail.com</p>
    </div>
    <div class="invoice-meta">
      <h2>RECHNUNG</h2>
      <p><strong>Rechnungs-Nr:</strong> ${data.bookingId}</p>
      <p><strong>Datum:</strong> ${new Date().toLocaleDateString("de-CH")}</p>
    </div>
  </div>

  <div class="customer-info">
    <h3>Rechnungsempfänger</h3>
    <p><strong>${data.customerName}</strong></p>
    <p>${data.customerEmail}</p>
    <p>${data.customerPhone}</p>
  </div>

  <div class="booking-details">
    <h3>Buchungsdetails</h3>
    <div class="detail-grid">
      <div class="detail-item">
        <span class="detail-label">Fahrzeug:</span>
        <span class="detail-value">${data.carName} ${data.carYear}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Buchungs-ID:</span>
        <span class="detail-value">${data.bookingId.substring(0, 8)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Abholung:</span>
        <span class="detail-value">${new Date(data.pickupDate).toLocaleDateString("de-CH")}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Rückgabe:</span>
        <span class="detail-value">${new Date(data.dropoffDate).toLocaleDateString("de-CH")}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Abholort:</span>
        <span class="detail-value">${data.pickupLocation}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Rückgabeort:</span>
        <span class="detail-value">${data.dropoffLocation}</span>
      </div>
    </div>
  </div>

  ${
    data.driverInfo
      ? `
  <div class="driver-section">
    <h3>Hauptfahrer</h3>
    <div class="driver-info-grid">
      <p><strong>Name:</strong> ${data.driverInfo.firstName} ${data.driverInfo.lastName}</p>
      <p><strong>Geburtsdatum:</strong> ${new Date(data.driverInfo.birthDate).toLocaleDateString("de-CH")}</p>
      <p><strong>Führerschein-Nr:</strong> ${data.driverInfo.licenseNumber}</p>
      <p><strong>Ausgestellt:</strong> ${new Date(data.driverInfo.licenseIssueDate).toLocaleDateString("de-CH")}</p>
    </div>
  </div>
  `
      : ""
  }

  ${
    data.additionalDriver
      ? `
  <div class="driver-section">
    <h3>Zusätzlicher Fahrer</h3>
    <div class="driver-info-grid">
      <p><strong>Name:</strong> ${data.additionalDriver.firstName} ${data.additionalDriver.lastName}</p>
      <p><strong>Geburtsdatum:</strong> ${new Date(data.additionalDriver.birthDate).toLocaleDateString("de-CH")}</p>
      <p><strong>Führerschein-Nr:</strong> ${data.additionalDriver.licenseNumber}</p>
      <p><strong>Ausgestellt:</strong> ${new Date(data.additionalDriver.licenseIssueDate).toLocaleDateString("de-CH")}</p>
    </div>
  </div>
  `
      : ""
  }

  <table>
    <thead>
      <tr>
        <th>Beschreibung</th>
        <th class="text-right">Menge</th>
        <th class="text-right">Preis</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${data.carName} ${data.carYear} Miete</td>
        <td class="text-right">${data.rentalDays} Tage</td>
        <td class="text-right">CHF ${data.pricePerDay.toFixed(2)}</td>
        <td class="text-right">CHF ${data.subtotal.toFixed(2)}</td>
      </tr>
      ${data.extras
        .map(
          (extra) => `
        <tr>
          <td>${extra.name}</td>
          <td class="text-right">${data.rentalDays} Tage</td>
          <td class="text-right">CHF ${(extra.price / data.rentalDays).toFixed(2)}</td>
          <td class="text-right">CHF ${extra.price.toFixed(2)}</td>
        </tr>
      `,
        )
        .join("")}
    </tbody>
  </table>

  <div class="total-section">
    <div class="total-row">
      <span>Zwischensumme:</span>
      <span>CHF ${subtotalWithExtras.toFixed(2)}</span>
    </div>
    <div class="total-row">
      <span>inkl. MwSt. (7.7%):</span>
      <span>CHF ${vatAmount.toFixed(2)}</span>
    </div>
    <div class="total-final">
      <span>Gesamtbetrag:</span>
      <span>CHF ${data.totalPrice.toFixed(2)}</span>
    </div>
  </div>

  <div class="qr-section">
    <h3>Zahlung per QR-Rechnung</h3>
    <img src="${qrData}" alt="Swiss QR Code" />
    <div class="payment-info">
      <p><strong>Zahlbar an:</strong></p>
      <p>Rentigo Rentals AG</p>
      <p>Musterstrasse 123</p>
      <p>8001 Zürich</p>
      <p style="margin-top: 10px;"><strong>IBAN:</strong> CH09 0079 0042 5975 2485 7</p>
      <p><strong>Referenz:</strong> ${data.bookingId.replace(/-/g, "").substring(0, 27)}</p>
      <p><strong>Betrag:</strong> CHF ${data.totalPrice.toFixed(2)}</p>
      <p style="margin-top: 15px; color: #1e40af;">
        <strong>Scannen Sie den QR-Code mit Ihrer Banking-App für eine schnelle Zahlung.</strong>
      </p>
    </div>
  </div>

  <div class="footer">
    <p>Vielen Dank für Ihr Vertrauen in Rentigo Rentals!</p>
    <p>Bei Fragen kontaktieren Sie uns unter rentigorentals@gmail.com oder +41 78 971 42 41</p>
    <p style="margin-top: 10px;">
      UID: CHE-123.456.789 | Handelsregister: CH-020.3.123.456-7
    </p>
  </div>
</body>
</html>
  `

  // Convert HTML to Base64 for embedding
  return Buffer.from(html).toString("base64")
}

async function generateSwissQRCode(data: InvoiceData): Promise<string> {
  // Swiss QR-Bill format
  const qrContent = [
    "SPC", // QR Type
    "0200", // Version
    "1", // Coding Type
    "CH0900790042597524857", // IBAN (without spaces)
    "S", // Creditor Address Type (Structured)
    "Rentigo Rentals", // Creditor Name
    "Bruggweg", // Creditor Street
    "19", // Creditor Building Number
    "4703", // Creditor Postal Code
    "Kestenholz", // Creditor City
    "CH", // Creditor Country
    "", // Ultimate Creditor Address Type
    "", // Ultimate Creditor Name
    "", // Ultimate Creditor Street
    "", // Ultimate Creditor Building Number
    "", // Ultimate Creditor Postal Code
    "", // Ultimate Creditor City
    "", // Ultimate Creditor Country
    data.totalPrice.toFixed(2), // Amount
    "CHF", // Currency
    "S", // Debtor Address Type (Structured)
    data.customerName, // Debtor Name
    "", // Debtor Street
    "", // Debtor Building Number
    "", // Debtor Postal Code
    "", // Debtor City
    "CH", // Debtor Country
    "QRR", // Reference Type
    data.bookingId
      .replace(/-/g, "")
      .substring(0, 27)
      .padEnd(27, "0"), // Reference
    `Rechnung ${data.bookingId}`, // Additional Information
    "EPD", // Trailer
  ].join("\n")

  // Generate QR code as data URL
  try {
    const qrDataUrl = await QRCode.toDataURL(qrContent, {
      width: 250,
      margin: 1,
      errorCorrectionLevel: "M",
    })
    return qrDataUrl
  } catch (error) {
    console.error("[v0] Error generating QR code:", error)
    return ""
  }
}
