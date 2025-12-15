"use client"

import { useAuth } from "@/hooks/useAuth"
import { redirect } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import UserProfile from "@/components/user-profile"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Calendar, MapPin, Car } from "lucide-react"

interface Booking {
  id: string
  status: string
  pickup_date: string
  dropoff_date: string
  total_price: number
}

export default function DashboardPage() {
  const { user, authUser, loading } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loadingBookings, setLoadingBookings] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return

      console.log("[v0] Fetching bookings for user:", user.id)

      try {
        const response = await fetch(`/api/bookings/user/${user.id}`)
        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Bookings fetched:", data)
          setBookings(data)
        } else {
          console.error("[v0] Failed to fetch bookings:", response.status)
        }
      } catch (error) {
        console.error("[v0] Error fetching bookings:", error)
      } finally {
        setLoadingBookings(false)
      }
    }

    fetchBookings()
  }, [user])

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

  const now = new Date()
  const activeBookings = bookings.filter((b) => b.status === "confirmed" && new Date(b.dropoff_date) >= now).length
  const pastBookings = bookings.filter((b) => b.status === "completed" || new Date(b.dropoff_date) < now).length
  const totalSpent = bookings.reduce((sum, b) => sum + b.total_price, 0)

  const allBookings = [...bookings]
    .sort((a, b) => new Date(b.pickup_date).getTime() - new Date(a.pickup_date).getTime())
    .slice(0, 3)

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Willkommen zurück, {user.full_name || "Benutzer"}!
          </h1>
          <p className="text-muted-foreground mb-8">Verwalten Sie Ihre Buchungen und Ihr Profil</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Car className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Alle Buchungen</h3>
              <p className="text-2xl font-bold text-primary">{loadingBookings ? "..." : bookings.length}</p>
              <Link href="/dashboard/bookings" className="text-sm text-primary hover:underline mt-2 inline-block">
                Alle ansehen
              </Link>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Vergangene Buchungen</h3>
              <p className="text-2xl font-bold text-primary">{loadingBookings ? "..." : pastBookings}</p>
              <Link href="/dashboard/bookings" className="text-sm text-primary hover:underline mt-2 inline-block">
                Alle ansehen
              </Link>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Gesamtausgaben</h3>
              <p className="text-2xl font-bold text-primary">
                {loadingBookings ? "..." : `CHF ${totalSpent.toFixed(2)}`}
              </p>
              <Link href="/dashboard/bookings" className="text-sm text-primary hover:underline mt-2 inline-block">
                Verwalten
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Alle Buchungen</h2>
                  <Link href="/dashboard/bookings" className="text-sm text-primary hover:underline">
                    Alle anzeigen →
                  </Link>
                </div>

                {loadingBookings ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">Wird geladen...</p>
                  </div>
                ) : allBookings.length > 0 ? (
                  <div className="space-y-3">
                    {allBookings.map((booking) => (
                      <Link
                        key={booking.id}
                        href="/dashboard/bookings"
                        className="block p-4 bg-muted/50 rounded-lg hover:bg-muted transition"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">
                              Buchung #{booking.id.slice(0, 8).toUpperCase()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(booking.pickup_date).toLocaleDateString("de-DE")} -{" "}
                              {new Date(booking.dropoff_date).toLocaleDateString("de-DE")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary">CHF {booking.total_price.toFixed(2)}</p>
                            <span
                              className={`text-xs font-medium ${
                                booking.status === "confirmed"
                                  ? "text-green-600"
                                  : booking.status === "completed"
                                    ? "text-gray-600"
                                    : "text-red-600"
                              }`}
                            >
                              {booking.status === "confirmed"
                                ? "Bestätigt"
                                : booking.status === "completed"
                                  ? "Abgeschlossen"
                                  : "Storniert"}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Keine Buchungen vorhanden</p>
                    <Link
                      href="/#booking"
                      className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold"
                    >
                      Jetzt buchen
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <UserProfile />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
