"use client"

import type React from "react"

import { useState } from "react"
import { Mail, Loader2, ArrowLeft, CheckCircle, Info } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      toast.error("Bitte geben Sie eine gültige E-Mail-Adresse ein")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Fehler beim Versenden der E-Mail")
        setLoading(false)
        return
      }

      setSuccess(true)
      toast.success("Anfrage wurde verarbeitet!")
    } catch (error) {
      console.error("[v0] Forgot password error:", error)
      toast.error("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Passwort vergessen?</h1>
            <p className="text-muted-foreground">
              Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
            </p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">E-Mail-Adresse</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-muted-foreground" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mail@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={20} className="animate-spin" />}
                {loading ? "Wird versendet..." : "Link zum Zurücksetzen senden"}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3 text-green-600">
                  <CheckCircle size={24} />
                  <h3 className="font-semibold text-lg">Anfrage verarbeitet</h3>
                </div>
                <p className="text-sm text-foreground">
                  Falls ein Konto mit der E-Mail-Adresse <strong className="text-primary">{email}</strong> existiert,
                  haben wir einen Reset-Link versendet.
                </p>
                <p className="text-sm text-muted-foreground">
                  Bitte überprüfen Sie Ihr Postfach und folgen Sie den Anweisungen. Der Link ist 1 Stunde gültig.
                </p>
                <p className="text-xs text-muted-foreground">
                  Falls Sie keine E-Mail erhalten, überprüfen Sie bitte Ihren Spam-Ordner.
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-blue-600">Hinweis zur Sicherheit</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Aus Sicherheitsgründen bestätigen wir nicht, ob diese E-Mail-Adresse bei uns registriert ist. Dies
                      schützt die Privatsphäre unserer Kunden.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center">
            <Link href="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-2">
              <ArrowLeft size={16} />
              Zurück zur Anmeldung
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
