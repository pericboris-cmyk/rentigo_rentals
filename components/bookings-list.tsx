"use client"

import { useEffect, useState } from "react"
import { Calendar, DollarSign, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import BookingDetailModal from "./booking-detail-modal"

interface Booking {
  id: string
  car_id: string
  pickup_location_id: string
  dropoff_location_id: string
  pickup_date: string
  dropoff_date: string
  total_price: number
  status: string
  created_at: string
}

export default function BookingsList() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)

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
        setLoading(false)
      }
    }

    fetchBookings()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground mb-4">Keine Buchungen vorhanden</p>
        <a href="/#booking" className="text-primary hover:underline font-medium">
          Jetzt buchen
        </a>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            onClick={() => setSelectedBookingId(booking.id)}
            className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">Buchung #{booking.id.slice(0, 8).toUpperCase()}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(booking.created_at).toLocaleDateString("de-DE")}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  booking.status === "confirmed"
                    ? "bg-green-100 text-green-800"
                    : booking.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                }`}
              >
                {booking.status === "confirmed"
                  ? "Bestätigt"
                  : booking.status === "cancelled"
                    ? "Storniert"
                    : "Abgeschlossen"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                <div className="text-sm">
                  <p className="text-muted-foreground">Zeitraum</p>
                  <p className="text-foreground font-medium">
                    {new Date(booking.pickup_date).toLocaleDateString("de-DE")} -{" "}
                    {new Date(booking.dropoff_date).toLocaleDateString("de-DE")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign size={18} className="text-primary" />
                <div className="text-sm">
                  <p className="text-muted-foreground">Gesamtpreis</p>
                  <p className="text-foreground font-medium">CHF {booking.total_price.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <span className="text-sm text-primary font-medium">Details anzeigen →</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedBookingId && (
        <BookingDetailModal bookingId={selectedBookingId} onClose={() => setSelectedBookingId(null)} />
      )}
    </>
  )
}
