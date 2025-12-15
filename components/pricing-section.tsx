"use client"

import { Check } from "lucide-react"
import { useState } from "react"
import BookingModal from "./booking-modal"
import { useAuth } from "./auth-context"
import RegistrationPromptDialog from "./registration-prompt-dialog"

export default function PricingSection() {
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

  const plans = [
    {
      name: "Basis",
      price: "Ab CHF 29",
      description: "Perfekt für kurze Reisen",
      features: [
        "Versicherungsschutz",
        "Tankstelle Auffüllung",
        "24/7 Roadside Assistance",
        "Kostenlose Stornierung",
        "Flughafenabholung",
      ],
    },
    {
      name: "Komfort",
      price: "Ab CHF 49",
      description: "Ideal für Geschäftsreisen",
      highlight: true,
      features: [
        "Alles aus Basis",
        "Premium Fahrzeuge",
        "Kostenloses WiFi",
        "Express-Service",
        "Gratis Zusatzfahrer",
        "Priorität Support",
      ],
    },
    {
      name: "Premium",
      price: "Ab CHF 99",
      description: "Für anspruchsvolle Reisen",
      features: [
        "Alles aus Komfort",
        "Luxuswagen",
        "Concierge Service",
        "Gratis Versicherung",
        "Hotelabholung",
        "Dedizierter Kundenservice",
      ],
    },
  ]

  return (
    <>
      null

      <RegistrationPromptDialog
        isOpen={isRegistrationPromptOpen}
        onClose={() => setIsRegistrationPromptOpen(false)}
        onRegister={handleRegister}
      />

      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
