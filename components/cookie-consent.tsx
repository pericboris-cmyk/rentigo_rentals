"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Settings, Cookie } from "lucide-react"
import Link from "next/link"

type CookieConsent = {
  necessary: boolean
  functional: boolean
  analytics: boolean
  marketing: boolean
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [consent, setConsent] = useState<CookieConsent>({
    necessary: true, // Always true
    functional: false,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    // Check if user has already made a choice
    const storedConsent = localStorage.getItem("cookie-consent")
    if (!storedConsent) {
      setShowBanner(true)
    } else {
      setConsent(JSON.parse(storedConsent))
    }
  }, [])

  const saveConsent = (newConsent: CookieConsent) => {
    localStorage.setItem("cookie-consent", JSON.stringify(newConsent))
    // Dispatch event for Google Analytics to listen to
    window.dispatchEvent(new CustomEvent("cookie-consent-updated", { detail: newConsent }))
    setShowBanner(false)
    setShowSettings(false)
  }

  const acceptAll = () => {
    const allConsent = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    }
    setConsent(allConsent)
    saveConsent(allConsent)
  }

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    }
    setConsent(necessaryOnly)
    saveConsent(necessaryOnly)
  }

  const saveCustomConsent = () => {
    saveConsent(consent)
  }

  if (!showBanner) return null

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Cookie className="text-primary flex-shrink-0" size={32} />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Wir verwenden Cookies</h3>
              <p className="text-sm text-muted-foreground">
                Wir verwenden Cookies und ähnliche Technologien, um Ihr Browsing-Erlebnis zu verbessern, personalisierte
                Inhalte und Werbung anzuzeigen, den Website-Verkehr zu analysieren und zu verstehen, woher unsere
                Besucher kommen. Weitere Informationen finden Sie in unserer{" "}
                <Link href="/datenschutz" className="text-primary hover:underline">
                  Datenschutzerklärung
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => setShowSettings(true)} className="w-full sm:w-auto">
                <Settings className="mr-2" size={16} />
                Einstellungen
              </Button>
              <Button variant="outline" onClick={acceptNecessary} className="w-full sm:w-auto bg-transparent">
                Nur Notwendige
              </Button>
              <Button onClick={acceptAll} className="w-full sm:w-auto">
                Alle akzeptieren
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Cookie-Einstellungen</h2>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-muted rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Necessary Cookies */}
                <div className="border-b pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Notwendige Cookies</h3>
                    <div className="bg-muted px-3 py-1 rounded text-sm">Immer aktiv</div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Diese Cookies sind für den Betrieb der Website erforderlich und können nicht deaktiviert werden. Sie
                    werden normalerweise nur als Reaktion auf Ihre Aktionen gesetzt, wie z.B. das Setzen Ihrer
                    Datenschutzeinstellungen, das Anmelden oder das Ausfüllen von Formularen.
                  </p>
                </div>

                {/* Functional Cookies */}
                <div className="border-b pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Funktionale Cookies</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consent.functional}
                        onChange={(e) => setConsent({ ...consent, functional: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Diese Cookies ermöglichen erweiterte Funktionen und Personalisierung. Sie können von uns oder von
                    Drittanbietern gesetzt werden, deren Dienste wir auf unseren Seiten verwenden.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="border-b pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Analyse-Cookies</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consent.analytics}
                        onChange={(e) => setConsent({ ...consent, analytics: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren, indem sie
                    Informationen anonym sammeln und melden. Wir verwenden Google Analytics, um die Nutzung unserer
                    Website zu analysieren.
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Marketing-Cookies</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consent.marketing}
                        onChange={(e) => setConsent({ ...consent, marketing: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Diese Cookies können über unsere Website von unseren Werbepartnern gesetzt werden. Sie können
                    verwendet werden, um ein Profil Ihrer Interessen zu erstellen und relevante Werbung auf anderen
                    Websites anzuzeigen.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button variant="outline" onClick={acceptNecessary} className="w-full sm:w-auto bg-transparent">
                  Nur Notwendige
                </Button>
                <Button onClick={saveCustomConsent} className="flex-1">
                  Auswahl speichern
                </Button>
                <Button onClick={acceptAll} className="flex-1">
                  Alle akzeptieren
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
