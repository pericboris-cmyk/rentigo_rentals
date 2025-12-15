"use client"

import { Star } from "lucide-react"
import { useEffect, useState } from "react"
import Image from "next/image"

interface GoogleReview {
  author: string
  rating: number
  text: string
  time: number
  profilePhoto: string
}

interface ReviewData {
  reviews: GoogleReview[]
  averageRating: number
  totalReviews: number
  configured?: boolean
}

export default function TestimonialSection() {
  const [googleReviews, setGoogleReviews] = useState<ReviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGoogleReviews() {
      try {
        const response = await fetch("/api/google-reviews")
        const data = await response.json()

        if (data.configured && data.reviews && data.reviews.length > 0) {
          setGoogleReviews(data)
        }
      } catch (error) {
        console.error("[v0] Error loading Google reviews:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchGoogleReviews()
  }, [])

  if (!loading && !googleReviews) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Image
                src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_74x24dp.png"
                alt="Google"
                width={100}
                height={33}
                className="opacity-90"
              />
              <span className="text-xl font-semibold text-muted-foreground">Bewertungen</span>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Google Rezensionen werden geladen oder sind noch nicht konfiguriert.
              <br />
              Bitte aktivieren Sie die Places API in der Google Cloud Console.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Image
              src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_74x24dp.png"
              alt="Google"
              width={100}
              height={33}
              className="opacity-90"
            />
            {googleReviews && (
              <div className="flex items-center gap-2">
                <span className="text-4xl md:text-5xl font-bold text-foreground">
                  {googleReviews.averageRating.toFixed(1)}
                </span>
                <div className="flex flex-col items-start">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={
                          i < Math.round(googleReviews.averageRating)
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300 fill-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">{googleReviews.totalReviews} Bewertungen</span>
                </div>
              </div>
            )}
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Echte Kundenbewertungen von Google</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 bg-card rounded-lg border border-border animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                </div>
              ))}
            </>
          ) : (
            googleReviews?.reviews.slice(0, 3).map((review, index) => (
              <div
                key={index}
                className="p-6 bg-card rounded-lg border border-border hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Image
                    src={review.profilePhoto || "/placeholder.svg"}
                    alt={review.author}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{review.author}</p>
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} size={16} className="text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground mb-3 italic line-clamp-4">"{review.text}"</p>

                <p className="text-xs text-muted-foreground">
                  {new Date(review.time * 1000).toLocaleDateString("de-CH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            ))
          )}
        </div>

        {googleReviews && (
          <div className="text-center mt-12">
            <a
              href={`https://search.google.com/local/reviews?placeid=${process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID || ""}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Alle {googleReviews.totalReviews} Bewertungen auf Google ansehen
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
