"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"

interface Promotion {
  id: string
  name: string
  type: string
  car_name: string
  pricing: {
    daily: { price: number; description: string }
    weekly: { price: number; duration: number; description: string }
    monthly: { price: number; duration: number; description: string }
  }
  image_url: string
}

export default function ChristmasPromotion() {
  const [promotion, setPromotion] = useState<Promotion | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const fetchActivePromotion = async () => {
      try {
        const response = await fetch("/api/promotions/active")
        if (response.ok) {
          const data = await response.json()
          if (data.promotion) {
            setPromotion(data.promotion)
          }
        }
      } catch (error) {
        console.error("Error fetching promotion:", error)
      }
    }

    fetchActivePromotion()
  }, [])

  if (!mounted || !promotion || dismissed) {
    return null
  }

  return (
    <section className="relative py-12 bg-gradient-to-b from-green-900/20 to-red-900/20 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[url('/christmas-pattern.png')] opacity-5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-0 right-4 p-2 text-white/80 hover:text-white transition"
          aria-label="Schließen"
        >
          <X size={24} />
        </button>

        <div className="bg-gradient-to-br from-green-800/90 to-red-800/90 backdrop-blur-sm rounded-2xl overflow-hidden border-4 border-yellow-500/50 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Image Section */}
            <div className="relative h-[400px] md:h-[500px]">
              <Image
                src={promotion.image_url || "/placeholder.svg"}
                alt={promotion.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Content Section */}
            <div className="p-8 md:p-12 text-white">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-6xl animate-pulse">🎄</span>
                  <h2 className="text-4xl md:text-5xl font-bold text-yellow-300 drop-shadow-lg">Weihnachtsangebot!!</h2>
                </div>
                <p className="text-2xl md:text-3xl font-bold mb-2">Miete den {promotion.car_name} zu super Preisen!!</p>
              </div>

              <div className="space-y-6">
                {/* Daily Price */}
                <div className="bg-white/10 backdrop-blur rounded-lg p-6 border-2 border-yellow-400/50">
                  <p className="text-3xl md:text-4xl font-bold text-yellow-300">
                    CHF {promotion.pricing.daily.price}.-
                  </p>
                  <p className="text-lg md:text-xl text-white/90">{promotion.pricing.daily.description}</p>
                </div>

                {/* Weekly Price */}
                <div className="bg-white/10 backdrop-blur rounded-lg p-6 border-2 border-yellow-400/50">
                  <p className="text-3xl md:text-4xl font-bold text-yellow-300">
                    {promotion.pricing.weekly.duration} Tage CHF {promotion.pricing.weekly.price}.-
                  </p>
                  <p className="text-lg md:text-xl text-white/90">{promotion.pricing.weekly.description}</p>
                </div>

                {/* Monthly Price */}
                <div className="bg-white/10 backdrop-blur rounded-lg p-6 border-2 border-yellow-400/50">
                  <p className="text-3xl md:text-4xl font-bold text-yellow-300">
                    1 Monat CHF {promotion.pricing.monthly.price}.-
                  </p>
                  <p className="text-lg md:text-xl text-white/90">{promotion.pricing.monthly.description}</p>
                </div>
              </div>

              <div className="mt-8">
                <a
                  href="#booking"
                  className="inline-block bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold text-xl px-8 py-4 rounded-lg transition transform hover:scale-105 shadow-lg"
                >
                  Jetzt buchen! 🎅
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
