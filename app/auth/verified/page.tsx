"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"

function EmailVerifiedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    const timer = setTimeout(() => {
      router.push("/")
    }, 5000)

    return () => {
      clearTimeout(timer)
      clearInterval(countdownInterval)
    }
  }, [router])

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl shadow-lg border border-border p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-lg">R</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Email bestätigt</h1>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 dark:bg-green-950 p-4">
                <CheckCircle className="text-green-600 dark:text-green-400" size={48} />
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">Erfolgreich bestätigt!</h2>
              <p className="text-muted-foreground">Ihre E-Mail-Adresse wurde erfolgreich bestätigt.</p>
              {email && <p className="text-sm text-muted-foreground mt-2">{email}</p>}
            </div>

            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-green-900 dark:text-green-100 text-center">
                Sie können jetzt alle Funktionen von Rentigo Rentals nutzen.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/"
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold flex items-center justify-center gap-2"
              >
                Zur Startseite
                <ArrowRight size={20} />
              </Link>

              <p className="text-center text-sm text-muted-foreground">
                Automatische Weiterleitung in {countdown} Sekunde{countdown !== 1 ? "n" : ""}...
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function EmailVerifiedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <EmailVerifiedContent />
    </Suspense>
  )
}
