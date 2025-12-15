interface RentalContractData {
  bookingId: string
  contractDate: string
  // Vermieter (Rentigo)
  lessorName: string
  lessorAddress: string
  lessorCity: string
  lessorPhone: string
  lessorEmail: string
  // Mieter (Customer)
  lesseeFirstName: string
  lesseeLastName: string
  lesseeAddress: string
  lesseeCity: string
  lesseePhone: string
  lesseeEmail: string
  lesseeBirthDate: string
  lesseeLicenseNumber: string
  lesseeLicenseIssueDate: string
  // Fahrzeug
  carMake: string
  carModel: string
  carYear: number
  carPlate: string
  carVin: string
  carColor: string
  // Mietdetails
  pickupDate: string
  pickupTime: string
  pickupLocation: string
  dropoffDate: string
  dropoffTime: string
  dropoffLocation: string
  rentalDays: number
  // Kilometerstand
  startMileage: number
  endMileage?: number
  includedKm: number
  extraKmPrice: number
  // Preise
  dailyRate: number
  totalRentalPrice: number
  deposit: number
  extras: Array<{ name: string; price: number }>
  totalPrice: number
  // Zusätzlicher Fahrer
  additionalDriver?: {
    firstName: string
    lastName: string
    birthDate: string
    licenseNumber: string
    licenseIssueDate: string
  }
}

export async function generateRentalContractPDF(data: RentalContractData): Promise<string> {
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
      font-size: 11px;
    }
    .header { 
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #1e40af;
    }
    .header h1 { 
      color: #1e40af; 
      font-size: 24px;
      margin-bottom: 10px;
    }
    .header p { 
      color: #64748b; 
      font-size: 11px;
    }
    .contract-meta {
      text-align: right;
      margin-bottom: 20px;
      font-size: 10px;
    }
    .section { 
      margin-bottom: 25px;
    }
    .section h2 { 
      color: #1e40af;
      font-size: 14px;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 2px solid #e2e8f0;
    }
    .party-box {
      background: #f8fafc;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 15px;
    }
    .party-box h3 {
      color: #1e40af;
      font-size: 12px;
      margin-bottom: 8px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      font-size: 10px;
    }
    .info-item {
      display: flex;
    }
    .info-label {
      font-weight: 600;
      color: #64748b;
      min-width: 120px;
    }
    .info-value {
      color: #1e293b;
    }
    .clause {
      margin-bottom: 15px;
    }
    .clause-title {
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 5px;
      font-size: 11px;
    }
    .clause-text {
      text-align: justify;
      line-height: 1.5;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 10px;
    }
    th {
      background: #1e40af;
      color: white;
      padding: 8px;
      text-align: left;
      font-size: 10px;
    }
    td {
      padding: 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    .text-right {
      text-align: right;
    }
    .total-row {
      font-weight: 700;
      background: #f8fafc;
    }
    .signature-section {
      margin-top: 40px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
    }
    .signature-box {
      border-top: 2px solid #1e293b;
      padding-top: 10px;
    }
    .signature-label {
      font-size: 10px;
      color: #64748b;
    }
    .signature-name {
      font-weight: 700;
      margin-top: 5px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 9px;
      color: #64748b;
    }
    .important-box {
      background: #fef3c7;
      border: 2px solid #f59e0b;
      padding: 15px;
      border-radius: 6px;
      margin: 15px 0;
    }
    .important-box strong {
      color: #92400e;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>FAHRZEUGMIETVERTRAG</h1>
    <p>Rentigo Rentals AG | Musterstrasse 123 | 8001 Zürich | Schweiz</p>
    <p>Tel: +41 78 971 42 41 | rentigorentals@gmail.com</p>
  </div>

  <div class="contract-meta">
    <p><strong>Vertrags-Nr:</strong> ${data.bookingId}</p>
    <p><strong>Vertragsdatum:</strong> ${new Date(data.contractDate).toLocaleDateString("de-CH")}</p>
  </div>

  <div class="section">
    <h2>Vertragsparteien</h2>
    
    <div class="party-box">
      <h3>Vermieter</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Firma:</span>
          <span class="info-value">${data.lessorName}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Telefon:</span>
          <span class="info-value">${data.lessorPhone}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Adresse:</span>
          <span class="info-value">${data.lessorAddress}</span>
        </div>
        <div class="info-item">
          <span class="info-label">E-Mail:</span>
          <span class="info-value">${data.lessorEmail}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Stadt:</span>
          <span class="info-value">${data.lessorCity}</span>
        </div>
      </div>
    </div>

    <div class="party-box">
      <h3>Mieter (Hauptfahrer)</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Name:</span>
          <span class="info-value">${data.lesseeFirstName} ${data.lesseeLastName}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Geburtsdatum:</span>
          <span class="info-value">${new Date(data.lesseeBirthDate).toLocaleDateString("de-CH")}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Adresse:</span>
          <span class="info-value">${data.lesseeAddress}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Telefon:</span>
          <span class="info-value">${data.lesseePhone}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Stadt:</span>
          <span class="info-value">${data.lesseeCity}</span>
        </div>
        <div class="info-item">
          <span class="info-label">E-Mail:</span>
          <span class="info-value">${data.lesseeEmail}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Führerschein-Nr:</span>
          <span class="info-value">${data.lesseeLicenseNumber}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Ausgestellt:</span>
          <span class="info-value">${new Date(data.lesseeLicenseIssueDate).toLocaleDateString("de-CH")}</span>
        </div>
      </div>
    </div>

    ${
      data.additionalDriver
        ? `
    <div class="party-box">
      <h3>Zusätzlicher Fahrer</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Name:</span>
          <span class="info-value">${data.additionalDriver.firstName} ${data.additionalDriver.lastName}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Geburtsdatum:</span>
          <span class="info-value">${new Date(data.additionalDriver.birthDate).toLocaleDateString("de-CH")}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Führerschein-Nr:</span>
          <span class="info-value">${data.additionalDriver.licenseNumber}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Ausgestellt:</span>
          <span class="info-value">${new Date(data.additionalDriver.licenseIssueDate).toLocaleDateString("de-CH")}</span>
        </div>
      </div>
    </div>
    `
        : ""
    }
  </div>

  <div class="section">
    <h2>Mietfahrzeug</h2>
    <div class="party-box">
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Marke/Modell:</span>
          <span class="info-value">${data.carMake} ${data.carModel}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Baujahr:</span>
          <span class="info-value">${data.carYear}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Kennzeichen:</span>
          <span class="info-value">${data.carPlate}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Farbe:</span>
          <span class="info-value">${data.carColor}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Fahrgestellnummer:</span>
          <span class="info-value">${data.carVin}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Kilometerstand bei Übergabe:</span>
          <span class="info-value">${data.startMileage.toLocaleString("de-CH")} km</span>
        </div>
        ${
          data.endMileage
            ? `
        <div class="info-item">
          <span class="info-label">Kilometerstand bei Rückgabe:</span>
          <span class="info-value">${data.endMileage.toLocaleString("de-CH")} km</span>
        </div>
        `
            : ""
        }
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Mietdauer und Übergabe</h2>
    <div class="party-box">
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Abholung:</span>
          <span class="info-value">${new Date(data.pickupDate).toLocaleDateString("de-CH")} um ${data.pickupTime}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Abholort:</span>
          <span class="info-value">${data.pickupLocation}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Rückgabe:</span>
          <span class="info-value">${new Date(data.dropoffDate).toLocaleDateString("de-CH")} um ${data.dropoffTime}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Rückgabeort:</span>
          <span class="info-value">${data.dropoffLocation}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Mietdauer:</span>
          <span class="info-value">${data.rentalDays} Tag(e)</span>
        </div>
        <div class="info-item">
          <span class="info-label">Inkl. Kilometer:</span>
          <span class="info-value">${data.includedKm.toLocaleString("de-CH")} km</span>
        </div>
        <div class="info-item">
          <span class="info-label">Preis pro Extra-km:</span>
          <span class="info-value">CHF ${data.extraKmPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Mietpreis und Kosten</h2>
    <table>
      <thead>
        <tr>
          <th>Position</th>
          <th class="text-right">Anzahl/Tage</th>
          <th class="text-right">Preis</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Tagesmiete ${data.carMake} ${data.carModel}</td>
          <td class="text-right">${data.rentalDays}</td>
          <td class="text-right">CHF ${data.dailyRate.toFixed(2)}</td>
          <td class="text-right">CHF ${data.totalRentalPrice.toFixed(2)}</td>
        </tr>
        ${data.extras
          .map(
            (extra) => `
          <tr>
            <td>${extra.name}</td>
            <td class="text-right">${data.rentalDays}</td>
            <td class="text-right">CHF ${(extra.price / data.rentalDays).toFixed(2)}</td>
            <td class="text-right">CHF ${extra.price.toFixed(2)}</td>
          </tr>
        `,
          )
          .join("")}
        <tr class="total-row">
          <td colspan="3">Gesamtbetrag (inkl. 7.7% MwSt.)</td>
          <td class="text-right">CHF ${data.totalPrice.toFixed(2)}</td>
        </tr>
        <tr class="total-row">
          <td colspan="3">Kaution (wird bei Rückgabe zurückerstattet)</td>
          <td class="text-right">CHF ${data.deposit.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Vertragsbedingungen</h2>
    
    <div class="clause">
      <div class="clause-title">§ 1 Mietgegenstand</div>
      <div class="clause-text">
        Der Vermieter überlässt dem Mieter das oben beschriebene Fahrzeug zur vorübergehenden Nutzung. Das Fahrzeug wird in technisch einwandfreiem und sauberem Zustand übergeben. Der Mieter ist verpflichtet, das Fahrzeug in demselben Zustand zurückzugeben.
      </div>
    </div>

    <div class="clause">
      <div class="clause-title">§ 2 Nutzung des Fahrzeugs</div>
      <div class="clause-text">
        Das Fahrzeug darf nur vom Mieter und von den im Vertrag aufgeführten zusätzlichen Fahrern genutzt werden. Die Fahrer müssen mindestens 21 Jahre alt sein und einen gültigen Führerschein besitzen (mindestens 1 Jahr). Das Fahrzeug darf nicht für gewerbliche Zwecke, Rennen, Fahrschulung oder illegale Aktivitäten verwendet werden.
      </div>
    </div>

    <div class="clause">
      <div class="clause-title">§ 3 Versicherung und Haftung</div>
      <div class="clause-text">
        Das Fahrzeug ist vollkaskoversichert mit einer Selbstbeteiligung von CHF 1'000.–. Der Mieter haftet für alle Schäden bis zur Höhe der Selbstbeteiligung. Bei grober Fahrlässigkeit oder Verstoss gegen die Vertragsbedingungen entfällt der Versicherungsschutz vollständig.
      </div>
    </div>

    <div class="clause">
      <div class="clause-title">§ 4 Tankregelung</div>
      <div class="clause-text">
        Das Fahrzeug wird mit vollem Tank übergeben und ist mit vollem Tank zurückzugeben. Erfolgt die Rückgabe nicht vollgetankt, wird eine Tankpauschale von CHF 50.– zuzüglich der Tankkosten berechnet.
      </div>
    </div>

    <div class="clause">
      <div class="clause-title">§ 5 Kilometerregelung</div>
      <div class="clause-text">
        Im Mietpreis sind ${data.includedKm.toLocaleString("de-CH")} km inkludiert. Für jeden zusätzlich gefahrenen Kilometer werden CHF ${data.extraKmPrice.toFixed(2)} berechnet.
      </div>
    </div>

    <div class="clause">
      <div class="clause-title">§ 6 Pflichten des Mieters</div>
      <div class="clause-text">
        Der Mieter verpflichtet sich, das Fahrzeug pfleglich zu behandeln, alle Verkehrsregeln einzuhalten und regelmässige Kontrollen (Öl, Wasser, Reifendruck) durchzuführen. Bei Pannen oder Unfällen ist unverzüglich der Vermieter zu informieren. Rauchen im Fahrzeug ist untersagt (Reinigungsgebühr CHF 200.–).
      </div>
    </div>

    <div class="clause">
      <div class="clause-title">§ 7 Kaution</div>
      <div class="clause-text">
        Die Kaution dient zur Sicherung aller Ansprüche des Vermieters. Sie wird bei ordnungsgemässer Rückgabe des Fahrzeugs innerhalb von 7 Werktagen zurückerstattet, abzüglich allfälliger Schäden, Bussen oder zusätzlicher Kosten.
      </div>
    </div>

    <div class="clause">
      <div class="clause-title">§ 8 Vorzeitige Beendigung</div>
      <div class="clause-text">
        Bei vorzeitiger Rückgabe des Fahrzeugs erfolgt keine Rückerstattung des Mietpreises. Bei verspäteter Rückgabe ohne Zustimmung des Vermieters wird pro angefangener Stunde der doppelte Tagessatz berechnet.
      </div>
    </div>

    <div class="clause">
      <div class="clause-title">§ 9 Gerichtsstand</div>
      <div class="clause-text">
        Es gilt Schweizer Recht. Gerichtsstand ist Zürich.
      </div>
    </div>
  </div>

  <div class="important-box">
    <strong>Wichtiger Hinweis:</strong> Der Mieter bestätigt, dass er das Fahrzeug in einwandfreiem Zustand erhalten hat und mit allen Bedingungen dieses Vertrags einverstanden ist. Eine Kopie des Führerscheins und eines gültigen Ausweisdokuments wurde überprüft.
  </div>

  <div class="signature-section">
    <div class="signature-box">
      <div class="signature-label">Ort, Datum und Unterschrift Vermieter</div>
      <div class="signature-name">Rentigo Rentals AG</div>
      <div style="margin-top: 50px;"></div>
      <div>_________________________________</div>
    </div>
    <div class="signature-box">
      <div class="signature-label">Ort, Datum und Unterschrift Mieter</div>
      <div class="signature-name">${data.lesseeFirstName} ${data.lesseeLastName}</div>
      <div style="margin-top: 50px;"></div>
      <div>_________________________________</div>
    </div>
  </div>

  <div class="footer">
    <p><strong>Rentigo Rentals AG</strong> | Musterstrasse 123, 8001 Zürich | Tel: +41 78 971 42 41 | rentigorentals@gmail.com</p>
    <p>UID: CHE-123.456.789 | Handelsregister: CH-020.3.123.456-7</p>
  </div>
</body>
</html>
  `

  return Buffer.from(html).toString("base64")
}
