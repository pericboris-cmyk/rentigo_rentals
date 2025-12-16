"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect")
  const type = searchParams.get("type")

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()

      console.log("[v0] Auth callback - type:", type)

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

          window.location.href = redirectUrl ? redirectUrl : "/?verified=true"
          return
        }
      }

      console.log("[v0] OAuth callback - exchanging code for session")

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("[v0] Session error:", sessionError)
          window.location.href = "/login?error=oauth_failed"
          return
        }

        if (!session) {
          console.log("[v0] No session found after callback")
          window.location.href = "/login?error=oauth_failed"
          return
        }

        console.log("[v0] Session found, user:", session.user.email)

        // Check if user already exists in database
        try {
          const { data: existingUser } = await supabase.from("users").select("id").eq("id", session.user.id).single()

          if (!existingUser) {
            console.log("[v0] Creating new user in database")

            const fullName =
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.email?.split("@")[0] ||
              "User"

            await supabase.from("users").insert({
              id: session.user.id,
              email: session.user.email!,
              full_name: fullName,
              role: "customer",
            })

            console.log("[v0] User created successfully")
          } else {
            console.log("[v0] User already exists in database")
          }
        } catch (dbError) {
          console.error("[v0] Error with user database:", dbError)
        }

        // Redirect
        console.log("[v0] Redirecting...")
        if (redirectUrl) {
          window.location.href = redirectUrl
        } else {
          window.location.href = "/"
        }
      } catch (error) {
        console.error("[v0] OAuth callback error:", error)
        window.location.href = "/login?error=oauth_failed"
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
