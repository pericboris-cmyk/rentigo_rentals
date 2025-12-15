import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const placeId = process.env.GOOGLE_PLACE_ID
    const apiKey = process.env.GOOGLE_PLACES_API_KEY

    if (!placeId || !apiKey) {
      return NextResponse.json({
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        configured: false,
      })
    }

    const origin =
      request.headers.get("origin") ||
      request.headers.get("referer") ||
      process.env.NEXT_PUBLIC_VERCEL_URL ||
      "http://localhost:3000"
    const refererUrl = origin.startsWith("http") ? origin : `https://${origin}`

    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?fields=reviews,rating,userRatingCount,displayName&languageCode=de`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "reviews,rating,userRatingCount,displayName",
          Referer: refererUrl,
        },
        next: { revalidate: 3600 },
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Google Places API error:", response.status, errorText)

      let errorType = "API_ERROR"
      if (response.status === 403) {
        if (errorText.includes("API_KEY_HTTP_REFERRER_BLOCKED")) {
          errorType = "REFERRER_BLOCKED"
          console.error(
            "[v0] Fix: Remove HTTP referrer restrictions from your Google API key or add your domain to allowed referrers",
          )
        } else if (errorText.includes("SERVICE_DISABLED")) {
          errorType = "API_NOT_ENABLED"
          console.error("[v0] Fix: Enable Places API (New) in Google Cloud Console")
        }
      }

      return NextResponse.json({
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        configured: false,
        error: errorType,
      })
    }

    const data = await response.json()

    const reviews =
      data.reviews?.slice(0, 6).map((review: any) => ({
        author: review.authorAttribution?.displayName || "Anonymous",
        rating: review.rating || 0,
        text: review.text?.text || review.originalText?.text || "",
        time: review.publishTime ? new Date(review.publishTime).getTime() / 1000 : Date.now() / 1000,
        profilePhoto: review.authorAttribution?.photoUri || "",
      })) || []

    return NextResponse.json({
      reviews,
      averageRating: data.rating || 0,
      totalReviews: data.userRatingCount || 0,
      configured: true,
    })
  } catch (error) {
    console.error("[v0] Error fetching Google reviews:", error)
    return NextResponse.json({
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
      configured: false,
    })
  }
}
