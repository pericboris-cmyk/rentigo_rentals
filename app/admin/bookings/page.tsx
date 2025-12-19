"use client"

import { useAuth } from "@/hooks/useAuth"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Calendar, User, Car, MapPin, Loader2, Trash2, Mail } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

interface Booking {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  pickup_date: string
  dropoff_date: string
  pickup_address: string
  dropoff_address: string
  total_price: number
  status: string
  created_at: string
  car: { name: string; year: number } | null
  user: { full_name: string; email: string } | null
}

export default function AdminBookingsPage() {
  const { user, authUser, loading } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null)
  const [sendingPaymentConfirmation, setSendingPaymentConfirmation] = useState<string | null>(null)

  const fetchBookings = async () => {
    setLoadingBookings(true)
    try {
      const response = await fetch("/api/admin/bookings")
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings)
      } else {
        const error = await response.json()
        toast.error(error.error || "Fehler beim Laden der Buchungen")
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast.error("Fehler beim Laden der Buchungen")
    } finally {
      setLoadingBookings(false)
    }
  }

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchBookings()
    }
  }, [user])

  const handleStatusChange = async (bookingId: string, oldStatus: string, newStatus: string) => {
    console.log("[v0] Attempting to change status:", { bookingId, oldStatus, newStatus })
    setUpdatingId(bookingId)
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, oldStatus }),
      })

      console.log("[v0] Status update response:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Status updated successfully:", data)
        await fetchBookings()
        toast.success("Buchungsstatus aktualisiert")
      } else {
        const errorData = await response.json()
        console.error("[v0] Status update failed:", errorData)
        toast.error(errorData.error || "Fehler beim Aktualisieren des Status")
      }
    } catch (error) {
      console.error("[v0] Error updating status:", error)
      toast.error("Fehler beim Aktualisieren des Status")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (bookingId: string) => {
    console.log("[v0] Attempting to delete booking:", bookingId)
    setDeletingId(bookingId)
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "DELETE",
      })

      console.log("[v0] Delete response:", response.status)

      if (response.ok) {
        console.log("[v0] Booking deleted successfully")
        await fetchBookings()
        toast.success("Buchung erfolgreich gelöscht")
      } else {
        const errorData = await response.json()
        console.error("[v0] Delete failed:", errorData)
        toast.error(errorData.error || "Fehler beim Löschen der Buchung")
      }
    } catch (error) {
      console.error("[v0] Error deleting booking:", error)
      toast.error("Fehler beim Löschen der Buchung")
    } finally {
      setDeletingId(null)
    }
  }

  const handleSendPaymentConfirmation = async (bookingId: string) => {
    console.log("[v0] Sending payment confirmation for booking:", bookingId)
    setSendingPaymentConfirmation(bookingId)
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/send-payment-confirmation`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Payment confirmation sent:", data)
        toast.success("Bezahlbestätigung erfolgreich an Kunde gesendet")
      } else {
        const errorData = await response.json()
        console.error("[v0] Failed to send payment confirmation:", errorData)
        toast.error(errorData.error || "Fehler beim Senden der Bezahlbestätigung")
      }
    } catch (error) {
      console.error("[v0] Error sending payment confirmation:", error)
      toast.error("Fehler beim Senden der Bezahlbestätigung")
    } finally {
      setSendingPaymentConfirmation(null)
    }
  }

  const openDeleteDialog = (bookingId: string) => {
    setBookingToDelete(bookingId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (bookingToDelete) {
      handleDelete(bookingToDelete)
    }
    setDeleteDialogOpen(false)
    setBookingToDelete(null)
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
          <div className="mb-8">
            <Link href="/admin" className="text-primary hover:underline mb-6 inline-block">
              ← Zurück zum Admin Dashboard
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Buchungsverwaltung</h1>
            <p className="text-muted-foreground">Alle Kundenbuchungen verwalten</p>
          </div>

          {loadingBookings ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground">Keine Buchungen vorhanden</p>
            </div>
          ) : (
            <div className="max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">
                          {booking.first_name} {booking.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">Buchung #{booking.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">
                          Erstellt: {new Date(booking.created_at).toLocaleDateString("de-DE")}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking.id, booking.status, e.target.value)}
                          disabled={updatingId === booking.id || deletingId === booking.id}
                          className="px-3 py-2 bg-input border border-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary min-w-[120px]"
                        >
                          <option value="confirmed">Bestätigt</option>
                          <option value="completed">Abgeschlossen</option>
                          <option value="cancelled">Storniert</option>
                        </select>
                        {updatingId === booking.id && <Loader2 className="animate-spin text-primary" size={20} />}
                        <button
                          onClick={() => handleSendPaymentConfirmation(booking.id)}
                          disabled={
                            sendingPaymentConfirmation === booking.id ||
                            updatingId === booking.id ||
                            deletingId === booking.id
                          }
                          className="p-2 sm:p-3 bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded-lg transition-colors disabled:opacity-50 min-w-[40px] min-h-[40px] flex items-center justify-center"
                          title="Bezahlbestätigung senden"
                        >
                          {sendingPaymentConfirmation === booking.id ? (
                            <Loader2 className="animate-spin" size={20} />
                          ) : (
                            <Mail size={20} />
                          )}
                        </button>
                        <button
                          onClick={() => openDeleteDialog(booking.id)}
                          disabled={updatingId === booking.id || deletingId === booking.id}
                          className="p-2 sm:p-3 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-colors disabled:opacity-50 min-w-[40px] min-h-[40px] flex items-center justify-center"
                          title="Buchung löschen"
                        >
                          {deletingId === booking.id ? (
                            <Loader2 className="animate-spin" size={20} />
                          ) : (
                            <Trash2 size={20} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-start gap-2">
                        <User size={18} className="text-primary mt-1" />
                        <div className="text-sm">
                          <p className="text-muted-foreground">Kontakt</p>
                          <p className="text-foreground">{booking.email}</p>
                          <p className="text-foreground">{booking.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Car size={18} className="text-primary mt-1" />
                        <div className="text-sm">
                          <p className="text-muted-foreground">Fahrzeug</p>
                          <p className="text-foreground font-medium">{booking.car?.name || "Nicht verfügbar"}</p>
                          <p className="text-foreground">{booking.car?.year || "-"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin size={18} className="text-primary mt-1" />
                        <div className="text-sm">
                          <p className="text-muted-foreground">Standorte</p>
                          <p className="text-foreground">Abholung: {booking.pickup_address || "Nicht verfügbar"}</p>
                          <p className="text-foreground">Rückgabe: {booking.dropoff_address || "Nicht verfügbar"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Calendar size={18} className="text-primary mt-1" />
                        <div className="text-sm">
                          <p className="text-muted-foreground">Zeitraum</p>
                          <p className="text-foreground">{new Date(booking.pickup_date).toLocaleDateString("de-DE")}</p>
                          <p className="text-foreground">
                            {new Date(booking.dropoff_date).toLocaleDateString("de-DE")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <p className="text-lg font-semibold text-primary">
                        Gesamtpreis: CHF {booking.total_price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Buchung löschen?"
        description="Sind Sie sicher, dass Sie diese Buchung löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
        confirmText="Buchung löschen"
      />

      <Footer />
    </main>
  )
}
