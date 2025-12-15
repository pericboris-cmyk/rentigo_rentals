"use client"

import { useState } from "react"
import BookingModal from "./booking-modal"
import { useAuth } from "./auth-context"
import RegistrationPromptDialog from "./registration-prompt-dialog"

export default function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRegistrationPromptOpen, setIsRegistrationPromptOpen] = useState(false)
  const { user, loading: authLoading } = useAuth()

  const handleBooking = () => {
    if (!authLoading && !user) {
      setIsRegistrationPromptOpen(true)
      return
    }
    setIsModalOpen(true)
  }

  const handleRegister = () => {
    setIsRegistrationPromptOpen(false)
    window.location.href = "/register"
  }

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary/30 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-6">

              {/* Badge / Eyebrow */}
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 text-sm font-semibold text-foreground shadow-sm backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Ihre Buchungen benutzerfreundlich verwalten
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Fahren Sie <span className="text-primary">mit Vertrauen</span>
              </h1>

              {/* Description */}
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                Buchen Sie Ihren nächsten Mietwagen einfach und sicher. Mit unserem Team machen wir Ihre Reise perfekt.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={handleBooking}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold text-center"
                >
                  Jetzt buchen
                </button>

                <button
                  className="px-8 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/10 transition font-semibold text-center"
                >
                  Mehr erfahren
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative h-96 md:h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl" />
              <img
                src="/luxury-car-rental-service-modern-vehicle.jpg"
                alt="Premium Mietwagen"
                className="relative w-full h-full object-cover rounded-2xl shadow-xl"
              />
            </div>

          </div>
        </div>
      </section>

      <RegistrationPromptDialog
        isOpen={isRegistrationPromptOpen}
        onClose={() => setIsRegistrationPromptOpen(false)}
        onRegister={handleRegister}
      />

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
