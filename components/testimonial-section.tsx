"use client"

import { Star } from "lucide-react"

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
  error?: string
  errorMessage?: string
  isNewBusiness?: boolean
  displayName?: string
  useFallback?: boolean
  fallbackReason?: string
}

const staticReviews = [
  {
    author: "Michael Schmidt",
    rating: 5,
    text: "Hervorragender Service! Das Auto war in perfektem Zustand und die Übergabe war sehr professionell. Ich werde definitiv wieder bei Rentigo mieten.",
    time: Date.now() / 1000,
  },
  {
    author: "Sarah Müller",
    rating: 5,
    text: "Sehr zufrieden mit der Autovermietung. Faire Preise, saubere Fahrzeuge und freundliches Personal. Absolut empfehlenswert!",
    time: Date.now() / 1000 - 86400 * 7,
  },
  {
    author: "Thomas Weber",
    rating: 5,
    text: "Top Erfahrung! Die Buchung war einfach, das Auto war genau wie beschrieben. Rentigo macht alles richtig.",
    time: Date.now() / 1000 - 86400 * 14,
  },
]

export default function TestimonialSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Kundenbewertungen</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Was unsere Kunden über Rentigo Rentals sagen
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {staticReviews.map((review, index) => (
            <div key={index} className="p-6 bg-card rounded-lg border border-border hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold text-lg">{review.author.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{review.author}</p>
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} size={16} className="text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground mb-3 line-clamp-4">"{review.text}"</p>

              <p className="text-xs text-muted-foreground">
                {new Date(review.time * 1000).toLocaleDateString("de-CH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
