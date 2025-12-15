"use client"

import { useAuth } from "@/hooks/useAuth"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Calendar, Users, DollarSign, CheckCircle, Construction, Power, Receipt, Sparkles } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Stats {
  totalBookings: number
  confirmedBookings: number
  totalUsers: number
  totalRevenue: string
}

export default function AdminDashboardPage() {
  const { user, authUser, loading } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [loadingMaintenance, setLoadingMaintenance] = useState(false)
  const [sendingTestPayment, setSendingTestPayment] = useState(false)
  const [christmasPromoActive, setChristmasPromoActive] = useState(false)
  const [loadingPromo, setLoadingPromo] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoadingStats(false)
      }
    }

    const fetchMaintenanceMode = async () => {
      try {
        const response = await fetch("/api/admin/maintenance")
        if (response.ok) {
          const data = await response.json()
          setMaintenanceMode(data.maintenanceMode)
        }
      } catch (error) {
        console.error("Error fetching maintenance mode:", error)
      }
    }

    const fetchPromotionStatus = async () => {
      try {
        const response = await fetch("/api/promotions/active")
        if (response.ok) {
          const data = await response.json()
          setChristmasPromoActive(!!data.promotion)
        }
      } catch (error) {
        console.error("Error fetching promotion status:", error)
      }
    }

    if (user) {
      fetchStats()
      fetchMaintenanceMode()
      fetchPromotionStatus()
    }
  }, [user])

  const toggleMaintenanceMode = async () => {
    setLoadingMaintenance(true)
    try {
      const response = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled: !maintenanceMode }),
      })

      if (response.ok) {
        const data = await response.json()
        setMaintenanceMode(data.maintenanceMode)
        toast.success(
          data.maintenanceMode ? "Wartungsmodus aktiviert - Website ist jetzt offline" : "Wartungsmodus deaktiviert",
        )
      } else {
        const errorData = await response.json()
        console.error("[v0] Maintenance toggle error:", errorData)
        toast.error(errorData.error || "Fehler beim Ändern des Wartungsmodus")
      }
    } catch (error) {
      console.error("Error toggling maintenance mode:", error)
      toast.error("Fehler beim Ändern des Wartungsmodus")
    } finally {
      setLoadingMaintenance(false)
    }
  }

  const sendTestPayment = async () => {
    setSendingTestPayment(true)
    try {
      const response = await fetch("/api/admin/test-payment", {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Testrechnung wurde erfolgreich an den Admin verschickt!")
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Fehler beim Versenden der Testrechnung")
      }
    } catch (error) {
      console.error("Error sending test payment:", error)
      toast.error("Fehler beim Versenden der Testrechnung")
    } finally {
      setSendingTestPayment(false)
    }
  }

  const toggleChristmasPromo = async () => {
    setLoadingPromo(true)
    try {
      const getResponse = await fetch("/api/admin/promotions")
      if (!getResponse.ok) {
        throw new Error("Failed to fetch promotions")
      }

      const { promotions } = await getResponse.json()
      const christmasPromo = promotions.find((p: any) => p.type === "christmas")

      if (!christmasPromo) {
        toast.error("Weihnachtsaktion nicht gefunden")
        return
      }

      const response = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promotionId: christmasPromo.id,
          active: !christmasPromoActive,
        }),
      })

      if (response.ok) {
        setChristmasPromoActive(!christmasPromoActive)
        toast.success(!christmasPromoActive ? "Weihnachtsaktion aktiviert! 🎄" : "Weihnachtsaktion deaktiviert")
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Fehler beim Ändern der Aktion")
      }
    } catch (error) {
      console.error("Error toggling Christmas promo:", error)
      toast.error("Fehler beim Ändern der Aktion")
    } finally {
      setLoadingPromo(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Wird geladen...</p>
        </div>
      </main>
    )
  }

  if (!authUser || !user) {
    redirect("/login")
  }

  if (user.role !== "admin") {
    redirect("/")
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Verwalten Sie Buchungen, Benutzer und Einstellungen</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={toggleChristmasPromo}
                disabled={loadingPromo}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                  christmasPromoActive
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Sparkles size={20} />
                {christmasPromoActive ? "Aktion beenden" : "Aktion starten"}
              </button>

              <button
                onClick={sendTestPayment}
                disabled={sendingTestPayment}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Receipt size={20} />
                Testrechnung (CHF 1.00)
              </button>

              <button
                onClick={toggleMaintenanceMode}
                disabled={loadingMaintenance}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                  maintenanceMode
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-yellow-600 hover:bg-yellow-700 text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {maintenanceMode ? (
                  <>
                    <Power size={20} />
                    Website aktivieren
                  </>
                ) : (
                  <>
                    <Construction size={20} />
                    In Wartung setzen
                  </>
                )}
              </button>
            </div>
          </div>

          {christmasPromoActive && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Sparkles size={20} />
                <p className="font-semibold">Weihnachtsaktion ist aktiv - Wird auf der Homepage angezeigt 🎄</p>
              </div>
            </div>
          )}

          {maintenanceMode && (
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                <Construction size={20} />
                <p className="font-semibold">Wartungsmodus ist aktiv - Die Website ist für normale Benutzer offline</p>
              </div>
            </div>
          )}

          {loadingStats ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Statistiken werden geladen...</p>
            </div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Calendar className="text-primary" size={24} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Alle Buchungen</h3>
                  <p className="text-2xl font-bold text-primary">{stats.totalBookings}</p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Bestätigt</h3>
                  <p className="text-2xl font-bold text-green-600">{stats.confirmedBookings}</p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                    <Users className="text-blue-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Benutzer</h3>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <DollarSign className="text-primary" size={24} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Umsatz</h3>
                  <p className="text-2xl font-bold text-primary">CHF {stats.totalRevenue}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link
                  href="/admin/bookings"
                  className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition"
                >
                  <h2 className="text-xl font-bold text-foreground mb-2">Buchungen verwalten</h2>
                  <p className="text-muted-foreground mb-4">
                    Alle Kundenbuchungen anzeigen, bearbeiten und Status ändern
                  </p>
                  <span className="text-primary font-semibold">Zur Buchungsverwaltung →</span>
                </Link>

                <Link
                  href="/admin/cars"
                  className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition"
                >
                  <h2 className="text-xl font-bold text-foreground mb-2">Fahrzeuge verwalten</h2>
                  <p className="text-muted-foreground mb-4">Fahrzeugkatalog bearbeiten und Verfügbarkeit verwalten</p>
                  <span className="text-primary font-semibold">Zur Fahrzeugverwaltung →</span>
                </Link>

                <Link
                  href="/admin/extras"
                  className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition"
                >
                  <h2 className="text-xl font-bold text-foreground mb-2">Zusatzleistungen verwalten</h2>
                  <p className="text-muted-foreground mb-4">
                    Buchbare Zusatzleistungen bearbeiten, hinzufügen und löschen
                  </p>
                  <span className="text-primary font-semibold">Zur Zusatzleistungsverwaltung →</span>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Fehler beim Laden der Statistiken</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
