"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Lock, Loader2, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

function PasswordResetContent() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      return
    }

    // Verify token
    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/auth/verify-reset-token?token=${token}`)
        const data = await response.json()
        setTokenValid(data.valid)
      } catch (error) {
        console.error("[v0] Token verification error:", error)
        setTokenValid(false)
      }
    }

    verifyToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!password || !confirmPassword) {
      toast.error("Bitte füllen Sie alle Felder aus")
      return
    }

    if (password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein")
      toast.error("Das Passwort muss mindestens 6 Zeichen lang sein")
      return
    }

    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein")
      toast.error("Die Passwörter stimmen nicht überein")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Fehler beim Zurücksetzen des Passworts")
        toast.error(data.error || "Fehler beim Zurücksetzen des Passworts")
        setLoading(false)
        return
      }

      setSuccess(true)
      toast.success("Passwort erfolgreich zurückgesetzt!")

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error) {
      console.error("[v0] Password reset error:", error)
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.")
      toast.error("Ein Fehler ist aufgetreten")
    } finally {
      setLoading(false)
    }
  }

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Token wird überprüft...</p>
        </div>
      </div>
    )
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-xl p-8 space-y-6">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle size={24} />
                <h3 className="font-semibold text-lg">Ungültiger oder abgelaufener Link</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Dieser Link zum Zurücksetzen des Passworts ist ungültig, wurde bereits verwendet oder ist abgelaufen.
              </p>
              <p className="text-sm text-muted-foreground">
                Links sind nur 1 Stunde gültig und können nur einmal verwendet werden.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/passwort-vergessen"
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold flex items-center justify-center gap-2 block text-center"
              >
                Neuen Link anfordern
                <ArrowRight size={20} />
              </Link>
              <Link
                href="/login"
                className="w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground transition block"
              >
                Zurück zur Anmeldung
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Neues Passwort setzen</h1>
            <p className="text-muted-foreground">Geben Sie Ihr neues Passwort ein.</p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-start gap-3">
                  <AlertCircle className="shrink-0 mt-0.5" size={20} />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Neues Passwort</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-muted-foreground" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Mindestens 6 Zeichen</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Passwort bestätigen</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-muted-foreground" size={20} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
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
                {loading ? "Wird gespeichert..." : "Passwort zurücksetzen"}
              </button>
            </form>
          ) : (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3 text-green-600">
                <CheckCircle size={24} />
                <h3 className="font-semibold text-lg">Passwort erfolgreich zurückgesetzt!</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Ihr Passwort wurde erfolgreich geändert. Sie werden in Kürze zur Anmeldeseite weitergeleitet.
              </p>
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold flex items-center justify-center gap-2 block text-center"
                >
                  Zum Login
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          )}

          <div className="text-center">
            <Link href="/login" className="text-sm text-primary hover:underline">
              Zurück zur Anmeldung
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PasswordResetPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
          <Loader2 size={48} className="animate-spin text-primary" />
        </div>
      }
    >
      <PasswordResetContent />
    </Suspense>
  )
}
