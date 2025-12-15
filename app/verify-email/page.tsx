"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, Mail, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get("email")
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState(false)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    // Check if already verified
    const checkVerification = async () => {
      if (!email) return

      try {
        const response = await fetch(`/api/auth/check-verification?email=${email}`)
        if (response.ok) {
          const data = await response.json()
          if (data.verified) {
            setVerified(true)
            setTimeout(() => {
              router.push("/login")
            }, 3000)
          }
        }
      } catch (err) {
        console.error("[v0] Verification check error:", err)
      }
    }

    const interval = setInterval(checkVerification, 3000)
    return () => clearInterval(interval)
  }, [email, router])

  const handleResendEmail = async () => {
    if (!email) return
    setResending(true)

    try {
      const response = await fetch("/api/auth/resend-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        alert("Bestätigungsemail erneut gesendet!")
      } else {
        setError(true)
      }
    } catch (err) {
      console.error("[v0] Resend error:", err)
      setError(true)
    } finally {
      setResending(false)
    }
  }

  if (verified) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-xl shadow-lg border border-border p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 dark:bg-green-950 p-3">
                <CheckCircle className="text-green-600 dark:text-green-400" size={32} />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Email bestätigt!</h1>
            <p className="text-muted-foreground mb-6">
              Ihre Email wurde erfolgreich bestätigt. Sie werden angemeldet...
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl shadow-lg border border-border p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-lg">R</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Email bestätigen</h1>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-blue-100 dark:bg-blue-950 p-4">
                <Mail className="text-blue-600 dark:text-blue-400" size={40} />
              </div>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground mb-2">Wir haben eine Bestätigungsemail an gesendet:</p>
              <p className="font-semibold text-foreground">{email}</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                Bitte klicken Sie auf den Link in der Email, um Ihre Email-Adresse zu bestätigen. Diese Seite wird
                automatisch aktualisiert.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-2">
                <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
                <p className="text-sm text-red-900 dark:text-red-100">Fehler beim erneuten Versenden der Email</p>
              </div>
            )}

            <button
              onClick={handleResendEmail}
              disabled={resending}
              className="w-full py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition font-semibold disabled:opacity-50"
            >
              {resending ? "Wird gesendet..." : "Email erneut senden"}
            </button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Zurück zur{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Anmeldung
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
