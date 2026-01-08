"use client"

import { useEffect, useState } from "react"
import { X, Calendar, MapPin, Car, User, Phone, Mail, DollarSign, AlertCircle, CheckCircle } from "lucide-react"

interface BookingDetail {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  pickup_date: string
  dropoff_date: string
  pickup_address: string
  dropoff_address: string
  pickup_time?: string
  dropoff_time?: string
  total_price: number
  status: string
  created_at: string
  car: {
    name: string
    year: number
    image_url: string
    transmission: string
    seats: number
    fuel_type: string
  }
}

interface BookingDetailModalProps {
  bookingId: string
  onClose: () => void
}

export default function BookingDetailModal({ bookingId, onClose }: BookingDetailModalProps) {
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showCancelSuccess, setShowCancelSuccess] = useState(false)

  useEffect(() => {
    const fetchBookingDetail = async () => {
      try {
        console.log("[v0] Fetching booking detail for ID:", bookingId)
        const response = await fetch(`/api/bookings/${bookingId}`)
        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Booking detail fetched successfully:", data.id)
          setBooking(data)
        } else {
          const errorData = await response.json()
          console.error("[v0] Failed to fetch booking detail:", errorData)
        }
      } catch (error) {
        console.error("[v0] Error fetching booking detail:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookingDetail()
  }, [bookingId])

  const handleCancelBooking = async () => {
    if (!booking) return

    setCancelling(true)
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setBooking({ ...booking, status: "cancelled" })
        setShowCancelConfirm(false)
        setShowCancelSuccess(true)
      } else if (response.status === 404) {
        alert("Fehler: Cancel-Endpoint nicht gefunden. Bitte aktualisieren Sie die Seite und versuchen Sie es erneut.")
      } else {
        const data = await response.json()
        alert(`Fehler bei der Stornierung: ${data.error}`)
      }
    } catch (error) {
      console.error("[v0] Error cancelling booking:", error)
      alert("Fehler bei der Stornierung. Bitte versuchen Sie es später erneut.")
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-background rounded-lg p-6 sm:p-8">
          <p className="text-muted-foreground">Wird geladen...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-background rounded-lg p-6 sm:p-8">
          <p className="text-destructive">Buchung nicht gefunden</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            Schließen
          </button>
        </div>
      </div>
    )
  }

  const pickupDate = new Date(booking.pickup_date)
  const dropoffDate = new Date(booking.dropoff_date)
  const days = Math.ceil((dropoffDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24))

  const statusColors = {
    confirmed: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
  }

  const statusLabels = {
    confirmed: "Bestätigt",
    completed: "Abgeschlossen",
    cancelled: "Storniert",
  }

  const canCancel = booking.status === "confirmed"

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border flex-shrink-0">
          <div className="min-w-0 pr-4">
            <h2 className="text-lg sm:text-2xl font-bold text-foreground truncate">Buchungsdetails</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">#{booking.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition flex-shrink-0"
            aria-label="Schließen"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Status & Date */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${statusColors[booking.status as keyof typeof statusColors]}`}
            >
              {statusLabels[booking.status as keyof typeof statusLabels]}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Gebucht am{" "}
              {new Date(booking.created_at).toLocaleDateString("de-CH", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Car Details */}
          <div className="bg-muted/50 rounded-lg p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Car className="text-primary flex-shrink-0" size={20} />
              <h3 className="font-semibold text-foreground text-sm sm:text-base">Fahrzeug</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              {booking.car.image_url && (
                <img
                  src={booking.car.image_url || "/placeholder.svg"}
                  alt={`${booking.car.name} ${booking.car.year}`}
                  className="w-full sm:w-48 h-40 sm:h-32 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-lg sm:text-xl font-bold text-foreground mb-2 truncate">
                  {booking.car.name} {booking.car.year}
                </h4>
                <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-muted-foreground">Getriebe:</span>
                    <span className="ml-2 text-foreground">{booking.car.transmission}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Kraftstoff:</span>
                    <span className="ml-2 text-foreground">{booking.car.fuel_type}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sitze:</span>
                    <span className="ml-2 text-foreground">{booking.car.seats}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Jahr:</span>
                    <span className="ml-2 text-foreground">{booking.car.year}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rental Period */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="text-primary flex-shrink-0" size={20} />
                <h3 className="font-semibold text-foreground text-sm sm:text-base">Abholung</h3>
              </div>
              <p className="text-sm sm:text-base text-foreground font-medium mb-1">
                {pickupDate.toLocaleDateString("de-CH", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              {booking.pickup_time && (
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Uhrzeit: {booking.pickup_time}</p>
              )}
              <div className="flex items-start gap-2 mt-3">
                <MapPin className="text-primary flex-shrink-0 mt-0.5" size={16} />
                <p className="text-xs sm:text-sm text-foreground break-words">{booking.pickup_address}</p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="text-primary flex-shrink-0" size={20} />
                <h3 className="font-semibold text-foreground text-sm sm:text-base">Rückgabe</h3>
              </div>
              <p className="text-sm sm:text-base text-foreground font-medium mb-1">
                {dropoffDate.toLocaleDateString("de-CH", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              {booking.dropoff_time && (
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Uhrzeit: {booking.dropoff_time}</p>
              )}
              <div className="flex items-start gap-2 mt-3">
                <MapPin className="text-primary flex-shrink-0 mt-0.5" size={16} />
                <p className="text-xs sm:text-sm text-foreground break-words">{booking.dropoff_address}</p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-muted/50 rounded-lg p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="text-primary flex-shrink-0" size={20} />
              <h3 className="font-semibold text-foreground text-sm sm:text-base">Kontaktdaten</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <User size={16} className="text-muted-foreground flex-shrink-0" />
                <span className="text-foreground truncate">
                  {booking.first_name} {booking.last_name}
                </span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Mail size={16} className="text-muted-foreground flex-shrink-0" />
                <span className="text-foreground truncate">{booking.email}</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Phone size={16} className="text-muted-foreground flex-shrink-0" />
                <span className="text-foreground truncate">{booking.phone}</span>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-primary/10 rounded-lg p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="text-primary flex-shrink-0" size={20} />
              <h3 className="font-semibold text-foreground text-sm sm:text-base">Preisübersicht</h3>
            </div>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mietdauer:</span>
                <span className="text-foreground font-medium">
                  {days} {days === 1 ? "Tag" : "Tage"}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-semibold text-foreground">Gesamtpreis:</span>
                <span className="text-lg sm:text-xl font-bold text-primary">CHF {booking.total_price.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {showCancelSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={24} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-green-900 mb-2 text-sm sm:text-base">
                    Buchung erfolgreich storniert
                  </h4>
                  <p className="text-xs sm:text-sm text-green-700 mb-4">
                    Ihre Buchung wurde erfolgreich storniert. Sie erhalten in Kürze eine Bestätigungs-E-Mail mit allen
                    Details zur Rückerstattung.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-xs sm:text-sm"
                  >
                    Verstanden
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cancellation Warning */}
          {showCancelConfirm && !showCancelSuccess && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-destructive mt-0.5 flex-shrink-0" size={20} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Buchung stornieren?</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                    Sind Sie sicher, dass Sie diese Buchung stornieren möchten? Diese Aktion kann nicht rückgängig
                    gemacht werden. Sie erhalten eine Rückerstattung gemäß unseren Stornierungsbedingungen.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleCancelBooking}
                      disabled={cancelling}
                      className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition font-medium disabled:opacity-50 text-xs sm:text-sm whitespace-nowrap"
                    >
                      {cancelling ? "Wird storniert..." : "Ja, stornieren"}
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      disabled={cancelling}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition font-medium text-xs sm:text-sm"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6 border-t border-border flex-shrink-0">
          {canCancel && !showCancelConfirm && !showCancelSuccess && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="w-full py-2 sm:py-3 px-4 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition font-medium text-xs sm:text-sm"
            >
              Buchung stornieren
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-2 sm:py-3 px-4 border border-border rounded-lg hover:bg-muted transition font-medium text-xs sm:text-sm"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  )
}
