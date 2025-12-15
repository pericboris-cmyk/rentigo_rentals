"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect")
  const type = searchParams.get("type") // email verification type

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()

      console.log("[v0] Auth callback - type:", type)

      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession()

      if (type === "signup" || window.location.hash.includes("type=signup")) {
        console.log("[v0] Email verification callback detected")

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("[v0] Session error:", sessionError)
          window.location.href = "/login?error=verification_failed"
          return
        }

        if (session) {
          console.log("[v0] Email verified successfully for:", session.user.email)

          try {
            const { data: existingUser } = await supabase.from("users").select("id").eq("id", session.user.id).single()

            if (!existingUser) {
              const fullName = session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User"

              await supabase.from("users").insert({
                id: session.user.id,
                email: session.user.email!,
                full_name: fullName,
                role: "customer",
              })
            }
          } catch (error) {
            console.error("[v0] Error checking/creating user:", error)
          }

          if (currentSession && currentSession.user.id === session.user.id) {
            console.log("[v0] User was already logged in, reloading page")
            window.location.href = "/?verified=true"
            return
          }

          if (redirectUrl) {
            window.location.href = redirectUrl
          } else {
            window.location.href = "/auth/verified?email=" + encodeURIComponent(session.user.email!)
          }
          return
        }
      }

      console.log("[v0] OAuth callback - exchanging code for session")

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.exchangeCodeForSession(window.location.href)

      if (sessionError) {
        console.error("[v0] OAuth callback error:", sessionError)
        window.location.href = "/login?error=oauth_failed"
        return
      }

      if (!session) {
        console.log("[v0] No session found, redirecting to login")
        window.location.href = "/login"
        return
      }

      console.log("[v0] Session found, user:", session.user.email)

      try {
        const { data: existingUser } = await supabase.from("users").select("id").eq("id", session.user.id).single()

        if (!existingUser) {
          console.log("[v0] Creating new user in database")

          const fullName =
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "User"

          const { error: insertError } = await supabase.from("users").insert({
            id: session.user.id,
            email: session.user.email!,
            full_name: fullName,
            role: "customer",
          })

          if (insertError) {
            console.error("[v0] Error creating user:", insertError)
          } else {
            console.log("[v0] User created successfully")
          }
        } else {
          console.log("[v0] User already exists in database")
        }
      } catch (error) {
        console.error("[v0] Error checking/creating user:", error)
      }

      console.log("[v0] Redirecting with full reload")
      if (redirectUrl) {
        console.log("[v0] Redirecting to:", redirectUrl)
        window.location.href = redirectUrl
      } else {
        window.location.href = "/"
      }
    }

    handleCallback()
  }, [router, redirectUrl, type])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Authentifizierung läuft...</p>
      </div>
    </div>
  )
}
