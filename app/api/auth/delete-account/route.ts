import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase/auth"
import { sendAccountDeletionEmail } from "@/lib/email-service"

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.delete(name)
          },
        },
      },
    )

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] Delete account - No authenticated user")
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    console.log("[v0] Starting account deletion for user:", user.id)

    const { data: userProfile } = await supabaseAdmin
      .from("users")
      .select("first_name, last_name, email")
      .eq("id", user.id)
      .single()

    if (userProfile) {
      const deletionDate = new Date().toLocaleDateString("de-DE", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })

      await sendAccountDeletionEmail({
        customerName: `${userProfile.first_name} ${userProfile.last_name}`,
        customerEmail: userProfile.email,
        deletionDate,
      })
    }

    await supabase.auth.signOut()

    // 1. Delete reviews associated with user's bookings
    const { data: userBookings } = await supabaseAdmin.from("bookings").select("id").eq("user_id", user.id)

    if (userBookings && userBookings.length > 0) {
      const bookingIds = userBookings.map((b) => b.id)
      const { error: reviewsError } = await supabaseAdmin.from("reviews").delete().in("booking_id", bookingIds)

      if (reviewsError) {
        console.error("[v0] Error deleting reviews:", reviewsError)
      } else {
        console.log("[v0] Deleted reviews for", bookingIds.length, "bookings")
      }
    }

    // 2. Delete user's bookings
    const { error: bookingsError } = await supabaseAdmin.from("bookings").delete().eq("user_id", user.id)

    if (bookingsError) {
      console.error("[v0] Error deleting bookings:", bookingsError)
    } else {
      console.log("[v0] Deleted user bookings")
    }

    // 3. Delete user preferences
    const { error: preferencesError } = await supabaseAdmin.from("user_preferences").delete().eq("user_id", user.id)

    if (preferencesError) {
      console.error("[v0] Error deleting user preferences:", preferencesError)
    } else {
      console.log("[v0] Deleted user preferences")
    }

    // 4. Delete user profile from users table
    const { error: profileError } = await supabaseAdmin.from("users").delete().eq("id", user.id)

    if (profileError) {
      console.error("[v0] Error deleting user profile:", profileError)
      return NextResponse.json({ error: "Fehler beim Löschen des Profils" }, { status: 500 })
    }

    console.log("[v0] Deleted user profile")

    // 5. Delete auth user (this must be last)
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id,
      false, // shouldSoftDelete = false ensures permanent deletion
    )

    if (deleteAuthError) {
      console.error("[v0] Error deleting auth user:", deleteAuthError)
      return NextResponse.json({ error: "Fehler beim Löschen des Accounts" }, { status: 500 })
    }

    console.log("[v0] Account successfully deleted for user:", user.id)

    return NextResponse.json({ message: "Account erfolgreich gelöscht" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Delete account error:", error)
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 })
  }
}
