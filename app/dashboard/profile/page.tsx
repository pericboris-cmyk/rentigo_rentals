"use client"

import type React from "react"

import { useAuth } from "@/hooks/useAuth"
import { redirect } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import PhoneInput from "@/components/phone-input"

export default function ProfilePage() {
  const { user, authUser, loading } = useAuth()
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    postalCode: "",
    city: "",
  })
  const [saving, setSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || "",
        phone: user.phone || "",
        address: user.address || "",
        postalCode: user.postal_code || "",
        city: user.city || "",
      })
    }
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, phone: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.fullName || !formData.email) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus")
      return
    }

    setSaving(true)

    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || "Fehler beim Aktualisieren des Profils")
        return
      }

      toast.success("Profil erfolgreich aktualisiert!")
      window.location.reload()
    } catch (error) {
      toast.error("Ein Fehler ist aufgetreten")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)

    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || "Fehler beim Löschen des Accounts")
        return
      }

      toast.success("Account erfolgreich gelöscht")
      window.location.href = "/"
    } catch (error) {
      toast.error("Ein Fehler ist aufgetreten")
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="py-12 md:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="text-primary hover:underline mb-6 inline-block">
            Zurück zum Dashboard
          </Link>

          <div className="bg-card border border-border rounded-lg p-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">Einstellungen</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">E-Mail</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">E-Mail kann nicht geändert werden</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Vollständiger Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Max Mustermann"
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Telefon</label>
                <PhoneInput value={formData.phone} onChange={handlePhoneChange} name="phone" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Adresse</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Bahnhofstrasse 123"
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">PLZ</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="8000"
                    maxLength={4}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Stadt</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Zürich"
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={20} className="animate-spin" />}
                {saving ? "Wird gespeichert..." : "Änderungen speichern"}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-border">
              <h2 className="text-xl font-bold text-foreground mb-4">Gefahrenzone</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Sobald Sie Ihren Account löschen, gibt es kein Zurück mehr. Bitte seien Sie sicher.
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteDialog(true)}
                className="px-6 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition font-semibold"
              >
                Account löschen
              </button>
            </div>
          </div>
        </div>
      </section>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteAccount}
        title="Account löschen?"
        description="Sind Sie sicher, dass Sie Ihren Account löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden. Alle Ihre Daten und Buchungen werden permanent gelöscht."
        confirmText={deleting ? "Wird gelöscht..." : "Endgültig löschen"}
        cancelText="Abbrechen"
      />

      <Footer />
    </main>
  )
}
