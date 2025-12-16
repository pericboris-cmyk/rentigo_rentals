"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, User, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import PhoneInput from "@/components/phone-input"
import { createClient } from "@/lib/supabase/client"

export default function RegisterForm({ redirectUrl }: { redirectUrl?: string }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, phone: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus")
      return
    }

    if (formData.password.length < 6) {
      toast.error("Passwort muss mindestens 6 Zeichen lang sein")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwörter stimmen nicht überein")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Registrierung fehlgeschlagen")
        console.error("[v0] Registration error:", data)
        return
      }

      setRegistrationSuccess(true)
      setRegisteredEmail(formData.email)
      toast.success("Registrierung erfolgreich! Bestätigungsemail wurde gesendet.")

      setTimeout(() => {
        if (redirectUrl) {
          router.push(
            `/verify-email?email=${encodeURIComponent(formData.email)}&redirect=${encodeURIComponent(redirectUrl)}`,
          )
        } else {
          router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`)
        }
      }, 2000)
    } catch (error) {
      console.error("[v0] Registration error:", error)
      toast.error("Ein Fehler ist aufgetreten")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
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
        toast.error("Google Registrierung fehlgeschlagen. Bitte versuchen Sie es später erneut.")
        setOauthLoading(false)
      }
    } catch (error) {
      console.error("[v0] Google OAuth error:", error)
      toast.error("Google Registrierung fehlgeschlagen")
      setOauthLoading(false)
    }
  }

  if (registrationSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Registrierung erfolgreich!</h2>
          <p className="text-muted-foreground">
            Wir haben eine Bestätigungsemail an <span className="font-semibold text-foreground">{registeredEmail}</span>{" "}
            gesendet.
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            Bitte überprüfen Sie Ihren Posteingang und klicken Sie auf den Bestätigungslink in der Email.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">Sie werden in Kürze weitergeleitet...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Vollständiger Name</label>
          <div className="relative">
            <User className="absolute left-3 top-3 text-muted-foreground" size={20} />
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Max Mustermann"
              required
              className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">E-Mail</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-muted-foreground" size={20} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="mail@example.com"
              required
              className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Telefon</label>
          <PhoneInput value={formData.phone} onChange={handlePhoneChange} name="phone" />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Passwort</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-muted-foreground" size={20} />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
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
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={6}
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
          {loading ? "Wird registriert..." : "Registrieren"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-muted-foreground">Oder registrieren mit</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignUp}
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

      <p className="text-center text-sm text-muted-foreground">
        Bereits registriert?{" "}
        <Link
          href={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : "/login"}
          className="text-primary hover:underline font-medium"
        >
          Anmelden
        </Link>
      </p>
    </div>
  )
}
