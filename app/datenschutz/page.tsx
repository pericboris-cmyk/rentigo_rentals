import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Datenschutzerklärung - Rentigo Rentals",
  description: "Datenschutzerklärung von Rentigo Rentals gemäss DSG und DSGVO",
}

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Datenschutzerklärung</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">Stand: {new Date().toLocaleDateString("de-CH")}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Verantwortlicher</h2>
            <p>
              Verantwortlich für die Datenverarbeitung auf dieser Website ist:
              <br />
              <br />
              <strong>Rentigo Rentals</strong>
              <br />
              Solothurn, Schweiz
              <br />
              E-Mail: rentigorentals@gmail.com
              <br />
              Telefon: +41 78 971 42 41
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Allgemeines zur Datenverarbeitung</h2>
            <h3 className="text-xl font-semibold mb-3">2.1 Umfang der Verarbeitung personenbezogener Daten</h3>
            <p>
              Wir verarbeiten personenbezogene Daten unserer Nutzer grundsätzlich nur, soweit dies zur Bereitstellung
              einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist. Die Verarbeitung
              personenbezogener Daten unserer Nutzer erfolgt regelmässig nur nach Einwilligung des Nutzers.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Rechtsgrundlage</h3>
            <p>
              Die Datenverarbeitung erfolgt auf Grundlage der gesetzlichen Bestimmungen des Schweizer
              Datenschutzgesetzes (DSG) sowie der EU-Datenschutz-Grundverordnung (DSGVO).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Bereitstellung der Website und Erstellung von Logfiles</h2>
            <h3 className="text-xl font-semibold mb-3">3.1 Beschreibung und Umfang der Datenverarbeitung</h3>
            <p>
              Bei jedem Aufruf unserer Internetseite erfasst unser System automatisiert Daten und Informationen vom
              Computersystem des aufrufenden Rechners. Folgende Daten werden hierbei erhoben:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Informationen über den Browsertyp und die verwendete Version</li>
              <li>Das Betriebssystem des Nutzers</li>
              <li>Den Internet-Service-Provider des Nutzers</li>
              <li>Die IP-Adresse des Nutzers</li>
              <li>Datum und Uhrzeit des Zugriffs</li>
              <li>Websites, von denen das System des Nutzers auf unsere Internetseite gelangt</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">3.2 Zweck der Datenverarbeitung</h3>
            <p>
              Die vorübergehende Speicherung der IP-Adresse durch das System ist notwendig, um eine Auslieferung der
              Website an den Rechner des Nutzers zu ermöglichen. Hierfür muss die IP-Adresse des Nutzers für die Dauer
              der Sitzung gespeichert bleiben.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Verwendung von Cookies</h2>
            <h3 className="text-xl font-semibold mb-3">4.1 Was sind Cookies?</h3>
            <p>
              Unsere Website verwendet Cookies. Bei Cookies handelt es sich um Textdateien, die im Internetbrowser bzw.
              vom Internetbrowser auf dem Computersystem des Nutzers gespeichert werden.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Arten von Cookies</h3>

            <h4 className="text-lg font-semibold mb-2 mt-4">Notwendige Cookies</h4>
            <p>
              Diese Cookies sind für den Betrieb der Website zwingend erforderlich und können nicht deaktiviert werden.
              Sie speichern beispielsweise Ihre Cookie-Einstellungen und Session-Informationen.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Funktionale Cookies</h4>
            <p>
              Diese Cookies ermöglichen erweiterte Funktionen und Personalisierung. Sie werden verwendet, um Ihre
              Präferenzen zu speichern und ein verbessertes Benutzererlebnis zu bieten.
            </p>

            <h4 className="text-lg font-semibold mb-2 mt-4">Analyse-Cookies</h4>
            <p>
              Wir verwenden Google Analytics, um die Nutzung unserer Website zu analysieren. Dabei werden folgende Daten
              erfasst:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Besuchte Seiten und Verweildauer</li>
              <li>Herkunft der Besucher (Referrer)</li>
              <li>Gerät und Browser-Informationen</li>
              <li>Anonymisierte IP-Adressen</li>
            </ul>

            <h4 className="text-lg font-semibold mb-2 mt-4">Marketing-Cookies</h4>
            <p>
              Diese Cookies werden verwendet, um Ihnen relevante Werbung anzuzeigen. Sie können von unseren
              Werbepartnern gesetzt werden.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Registrierung und Nutzerkonto</h2>
            <p>Wenn Sie ein Nutzerkonto bei uns erstellen, verarbeiten wir folgende Daten:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Vorname und Nachname</li>
              <li>E-Mail-Adresse</li>
              <li>Telefonnummer</li>
              <li>Passwort (verschlüsselt gespeichert)</li>
              <li>Adressdaten (falls angegeben)</li>
            </ul>
            <p>
              Die Daten werden zur Vertragsdurchführung und zur Bearbeitung Ihrer Buchungen verwendet. Sie können Ihr
              Konto jederzeit in den Profileinstellungen löschen.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Buchungsdaten</h2>
            <p>Bei der Durchführung einer Buchung verarbeiten wir folgende Daten:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Buchungszeitraum und Fahrzeugdaten</li>
              <li>Abhol- und Rückgabeort</li>
              <li>Kontaktdaten</li>
              <li>Zahlungsinformationen (falls erforderlich)</li>
            </ul>
            <p>
              Die Daten werden zur Vertragsdurchführung und zur Erfüllung gesetzlicher Aufbewahrungspflichten
              gespeichert.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. E-Mail-Kommunikation</h2>
            <p>Wir verwenden Ihre E-Mail-Adresse für folgende Zwecke:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Versand von Buchungsbestätigungen</li>
              <li>Versand von Erinnerungen und wichtigen Informationen zu Ihrer Buchung</li>
              <li>Beantwortung von Anfragen</li>
              <li>Versand von Zahlungsbestätigungen</li>
            </ul>
            <p>Sie können Newsletter-E-Mails jederzeit abbestellen.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Weitergabe von Daten</h2>
            <p>
              Eine Übermittlung Ihrer persönlichen Daten an Dritte zu anderen als den im Folgenden aufgeführten Zwecken
              findet nicht statt. Wir geben Ihre persönlichen Daten nur an Dritte weiter, wenn:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Sie Ihre ausdrückliche Einwilligung dazu erteilt haben</li>
              <li>
                die Weitergabe zur Abwicklung eines Vertrages mit Ihnen erforderlich ist (z.B. Zahlungsdienstleister)
              </li>
              <li>eine gesetzliche Verpflichtung zur Weitergabe besteht</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Ihre Rechte</h2>
            <p>Sie haben das Recht auf:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>
                <strong>Auskunft:</strong> Sie können Auskunft über Ihre gespeicherten Daten verlangen
              </li>
              <li>
                <strong>Berichtigung:</strong> Sie können die Berichtigung unrichtiger Daten verlangen
              </li>
              <li>
                <strong>Löschung:</strong> Sie können die Löschung Ihrer Daten verlangen
              </li>
              <li>
                <strong>Einschränkung:</strong> Sie können die Einschränkung der Verarbeitung verlangen
              </li>
              <li>
                <strong>Datenübertragbarkeit:</strong> Sie können Ihre Daten in einem strukturierten Format erhalten
              </li>
              <li>
                <strong>Widerspruch:</strong> Sie können der Verarbeitung Ihrer Daten widersprechen
              </li>
              <li>
                <strong>Widerruf:</strong> Sie können eine erteilte Einwilligung jederzeit widerrufen
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Datensicherheit</h2>
            <p>
              Wir verwenden innerhalb des Website-Besuchs das verbreitete SSL-Verfahren (Secure Socket Layer) in
              Verbindung mit der jeweils höchsten Verschlüsselungsstufe, die von Ihrem Browser unterstützt wird. Alle
              Daten werden verschlüsselt übertragen und auf sicheren Servern gespeichert.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Aktualität und Änderung der Datenschutzerklärung</h2>
            <p>
              Diese Datenschutzerklärung ist aktuell gültig und hat den Stand {new Date().toLocaleDateString("de-CH")}.
              Durch die Weiterentwicklung unserer Website und Angebote darüber oder aufgrund geänderter gesetzlicher
              beziehungsweise behördlicher Vorgaben kann es notwendig werden, diese Datenschutzerklärung zu ändern.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Kontakt</h2>
            <p>
              Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte können Sie uns jederzeit kontaktieren:
              <br />
              <br />
              E-Mail: rentigorentals@gmail.com
              <br />
              Telefon: +41 78 971 42 41
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
