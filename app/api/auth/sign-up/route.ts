import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/auth"

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, phone } = await req.json()

    console.log("[v0] Starting registration for:", email)

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

    const redirectUrl = "https://rentigorentals.ch/auth/callback?type=signup"

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    })

    if (authError) {
      console.error("[v0] Auth error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      console.error("[v0] No user returned from signUp")
      return NextResponse.json({ error: "User creation failed" }, { status: 400 })
    }

    console.log("[v0] Auth user created with ID:", authData.user.id)

    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .maybeSingle()

    let userProfile

    if (existingUser) {
      console.log("[v0] User profile already created by trigger, updating with additional info")
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from("users")
        .update({
          full_name: fullName,
          phone,
        })
        .eq("id", authData.user.id)
        .select()
        .single()

      if (updateError) {
        console.error("[v0] Profile update error:", updateError)
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        return NextResponse.json({ error: `Failed to update user profile: ${updateError.message}` }, { status: 400 })
      }

      userProfile = updatedUser
    } else {
      console.log("[v0] Creating user profile manually")
      const { data: insertedUser, error: profileError } = await supabaseAdmin
        .from("users")
        .insert({
          id: authData.user.id,
          email,
          full_name: fullName,
          phone,
        })
        .select()
        .single()

      if (profileError) {
        console.error("[v0] Profile creation error:", profileError)
        console.error("[v0] Profile error details:", JSON.stringify(profileError, null, 2))

        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)

        return NextResponse.json({ error: `Failed to create user profile: ${profileError.message}` }, { status: 400 })
      }

      userProfile = insertedUser
    }

    console.log("[v0] User profile ready:", userProfile)

    return NextResponse.json(
      {
        message: "User created successfully",
        userId: authData.user.id,
        user: userProfile,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Sign up error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
