"use client"

import { useAuth } from "@/hooks/useAuth"
import { redirect } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import BookingsList from "@/components/bookings-list"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Calendar, DollarSign } from "lucide-react"

interface Booking {
  id: string
  status: string
  pickup_date: string
  dropoff_date: string
  total_price: number
}

export default function BookingsPage() {
  const { user, authUser, loading } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loadingBookings, setLoadingBookings] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return

      try {
        const response = await fetch(`/api/bookings/user/${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setBookings(data)
        }
      } catch (error) {
        console.error("Error fetching bookings:", error)
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

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link href="/dashboard" className="text-primary hover:underline mb-6 inline-block">
              Zurück zum Dashboard
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Meine Buchungen</h1>
            <p className="text-muted-foreground">Verwalten und überprüfen Sie alle Ihre Mietwagenbuchungen</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Aktive Buchungen</h3>
              <p className="text-2xl font-bold text-primary">{loadingBookings ? "..." : activeBookings}</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Vergangene Buchungen</h3>
              <p className="text-2xl font-bold text-primary">{loadingBookings ? "..." : pastBookings}</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Gesamt Ausgegeben</h3>
              <p className="text-2xl font-bold text-primary">
                {loadingBookings ? "..." : `CHF ${totalSpent.toFixed(2)}`}
              </p>
            </div>
          </div>

          <BookingsList />
        </div>
      </section>

      <Footer />
    </main>
  )
}
