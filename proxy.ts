import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api") || pathname.startsWith("/auth/callback")) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  if (
    pathname !== "/wartung" &&
    pathname !== "/login" &&
    pathname !== "/auth/callback" &&
    !pathname.startsWith("/api")
  ) {
    try {
      const { data: maintenanceData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "maintenance_mode")
        .maybeSingle()

      const isMaintenanceMode = maintenanceData?.value === "true"

      if (isMaintenanceMode) {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          const { data: userProfile } = await supabase
            .from("users")
            .select("role")
            .eq("id", session.user.id)
            .maybeSingle()

          // Allow admins to bypass maintenance mode
          if (userProfile?.role === "admin") {
            return response
          }
        }

        // Redirect all other users to maintenance page
        return NextResponse.redirect(new URL("/wartung", request.url))
      }
    } catch (error) {
      console.error("[v0] Maintenance check error:", error)
      // On error, allow access (don't lock everyone out)
    }
  }

  const protectedRoutes = ["/dashboard", "/admin"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      // If auth check fails, redirect to login (safer default)
      if (sessionError || !session) {
        return NextResponse.redirect(new URL("/login", request.url))
      }

      if (pathname.startsWith("/admin")) {
        const { data: userProfile, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle()

        // If user lookup fails or user is not admin, redirect home
        if (userError || userProfile?.role !== "admin") {
          return NextResponse.redirect(new URL("/", request.url))
        }
      }
    } catch (error) {
      console.error("[v0] Auth check error:", error)
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return response
}

export const middleware = proxy

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
