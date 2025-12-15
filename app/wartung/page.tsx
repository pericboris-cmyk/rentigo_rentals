"use client"

import { Construction, Clock, Mail, Phone, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function MaintenancePage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    const checkMaintenanceStatus = async () => {
      if (isChecking) return

      setIsChecking(true)
      try {
        const response = await fetch("/api/admin/maintenance", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        })

        if (!response.ok) {
          console.error("[v0] Maintenance API returned status:", response.status)
          setIsChecking(false)
          return
        }

        // Check if response is actually JSON
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          console.error("[v0] Non-JSON response received (possibly rate limited)")
          setIsChecking(false)
          return
        }

        const data = await response.json()

        if (data.maintenanceMode === false) {
          window.location.href = "/"
        }
      } catch (error) {
        console.error("[v0] Error checking maintenance status:", error)
      } finally {
        setIsChecking(false)
      }
    }

    checkMaintenanceStatus()

    const interval = setInterval(checkMaintenanceStatus, 30000)

    return () => clearInterval(interval)
  }, [isChecking])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-lg">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Construction className="text-primary" size={40} />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Website wird gewartet</h1>

          <p className="text-lg text-muted-foreground mb-8">
            Wir führen gerade wichtige Wartungsarbeiten durch, um Ihnen ein noch besseres Erlebnis zu bieten. Die
            Website wird in Kürze wieder verfügbar sein.
          </p>

          <div className="bg-secondary/20 border border-border rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
              <Clock size={20} />
              <span className="font-semibold">Voraussichtliche Dauer</span>
            </div>
            <p className="text-foreground">Die Wartungsarbeiten sollten in wenigen Stunden abgeschlossen sein.</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground mb-4">Dringende Anfragen?</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-secondary/10 border border-border rounded-lg p-4">
                <Mail className="text-primary mx-auto mb-2" size={24} />
                <p className="text-sm text-muted-foreground mb-1">E-Mail</p>
                <a href="mailto:rentigorentals@gmail.com" className="text-primary font-semibold hover:underline">
                  rentigorentals@gmail.com
                </a>
              </div>

              <div className="bg-secondary/10 border border-border rounded-lg p-4">
                <Phone className="text-primary mx-auto mb-2" size={24} />
                <p className="text-sm text-muted-foreground mb-1">Telefon</p>
                <a href="tel:+41789714241" className="text-primary font-semibold hover:underline">
                  +41 78 971 42 41
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Vielen Dank für Ihre Geduld und Ihr Verständnis.
              <br />
              <span className="font-semibold text-foreground">— Das Rentigo Rentals Team</span>
            </p>
          </div>

          <div className="mt-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ShieldCheck size={16} />
              Sind Sie Admin?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
