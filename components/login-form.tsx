"use client"

import type React from "react"
import { useAuth } from "@/hooks/useAuth"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function LoginForm({
  isMaintenanceMode = false,
  redirectUrl,
}: {
  isMaintenanceMode?: boolean
  redirectUrl?: string
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server hat keine gültige JSON-Antwort zurückgegeben")
      }

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || "Login fehlgeschlagen"
        setError(errorMessage)
        toast.error(errorMessage)
        setLoading(false)
        return
      }

      toast.success("Erfolgreich angemeldet!")
      await refreshUser()

      if (redirectUrl) {
        router.push(redirectUrl)
      } else {
        router.push("/admin")
      }
      router.refresh()
    } catch (error) {
      console.error("[v0] Login error:", error)
      const errorMsg =
        error instanceof Error ? error.message : "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
      setError(errorMsg)
      toast.error(errorMsg)
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setOauthLoading(true)
    const supabase = createClient()

    try {
      const callbackUrl = redirectUrl
        ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`
        : `${window.location.origin}/auth/callback`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
        },
      })

      if (error) {
        console.error("[v0] Google OAuth error:", error)
        toast.error("Google Login fehlgeschlagen. Bitte versuchen Sie es später erneut.")
        setOauthLoading(false)
      }
    } catch (error) {
      console.error("[v0] Google OAuth error:", error)
      toast.error("Google Login fehlgeschlagen")
      setOauthLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-start gap-3">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">E-Mail</label>
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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Passwort</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-muted-foreground" size={20} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || oauthLoading}
          className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={20} className="animate-spin" />}
          {loading ? "Wird angemeldet..." : "Anmelden"}
        </button>
      </form>

      <div className="text-center">
        <Link href="/passwort-vergessen" className="text-sm text-primary hover:underline">
          Passwort vergessen?
        </Link>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-muted-foreground">Oder anmelden mit</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading || oauthLoading}
        className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-border rounded-lg hover:bg-accent transition disabled:opacity-50"
      >
        {oauthLoading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        <span className="text-sm font-medium">Google</span>
      </button>

      {!isMaintenanceMode && (
        <p className="text-center text-sm text-muted-foreground">
          Noch kein Konto?{" "}
          <Link
            href={redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : "/register"}
            className="text-primary hover:underline font-medium"
          >
            Registrieren
          </Link>
        </p>
      )}
    </div>
  )
}
