import { NextResponse } from "next/server"

// This should be configured in vercel.json to run daily
export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Call the auto-complete API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"}/api/bookings/auto-complete`,
      {
        method: "POST",
      },
    )

    const data = await response.json()

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("[v0] Cron job error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
