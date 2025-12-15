import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      let errorMessage = "Login fehlgeschlagen"

      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "E-Mail oder Passwort ist falsch. Bitte überprüfen Sie Ihre Eingaben."
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse."
      } else if (error.message.includes("User not found")) {
        errorMessage = "Es existiert kein Konto mit dieser E-Mail-Adresse."
      }

      console.log("[v0] Login failed:", error.message)
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const { data: userProfile } = await supabase.from("users").select("role").eq("id", data.user.id).maybeSingle()

    const { data: maintenanceData } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .maybeSingle()

    const isMaintenanceMode = maintenanceData?.value === "true"

    if (isMaintenanceMode && userProfile?.role !== "admin") {
      await supabase.auth.signOut()
      console.log("[v0] Non-admin user attempted to log in during maintenance:", email)
      return NextResponse.json(
        { error: "Zugriff verweigert: Nur Administratoren können sich während des Wartungsmodus anmelden." },
        { status: 403 },
      )
    }

    console.log("[v0] User logged in successfully:", email)
    return NextResponse.json({
      message: "Signed in successfully",
      session: data.session,
      user: data.user,
    })
  } catch (error) {
    console.error("[v0] Sign in error:", error)
    return NextResponse.json({ error: "Ein interner Fehler ist aufgetreten" }, { status: 500 })
  }
}
