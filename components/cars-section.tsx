"use client"

import { Users, Fuel, Gauge } from "lucide-react"
import { useState, useEffect } from "react"
import BookingModal from "./booking-modal"
import { useAuth } from "./auth-context"
import RegistrationPromptDialog from "./registration-prompt-dialog"

interface Car {
  id: string
  name: string
  year: number
  transmission: string
  seats: number
  fuel_type: string
  price_per_day: string
  image_url: string
  available: boolean
}

export default function CarsSection() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCarId, setSelectedCarId] = useState<string>("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRegistrationPromptOpen, setIsRegistrationPromptOpen] = useState(false)
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    fetchCars()
  }, [])

  const fetchCars = async () => {
    try {
      const response = await fetch("/api/cars/get-all")
      if (response.ok) {
        const data = await response.json()
        setCars(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching cars:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookCar = (carId: string) => {
    if (!authLoading && !user) {
      setIsRegistrationPromptOpen(true)
      return
    }
    setSelectedCarId(carId)
    setIsModalOpen(true)
  }

  const handleRegister = () => {
    setIsRegistrationPromptOpen(false)
    window.location.href = "/register"
  }

  return (
    <>
      <section id="cars" className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Unser Fuhrpark</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Entdecken Sie unsere vielfältige Auswahl an modernen und komfortablen Fahrzeugen
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Fahrzeuge werden geladen...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars
                .filter((car) => car.available)
                .map((car) => (
                  <div
                    key={car.id}
                    className="bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition"
                  >
                    <div className="relative h-48 bg-muted overflow-hidden">
                      <img
                        src={car.image_url || "/placeholder.svg?height=200&width=400"}
                        alt={`${car.name} ${car.year}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm font-semibold text-primary">{car.name}</p>
                          <h3 className="text-lg font-bold text-foreground">{car.year}</h3>
                        </div>
                        <p className="text-lg font-bold text-primary">CHF {car.price_per_day}/Tag</p>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Users size={16} />
                          {car.seats} Personen
                        </div>
                        <div className="flex items-center gap-1">
                          <Fuel size={16} />
                          {car.fuel_type}
                        </div>
                        <div className="flex items-center gap-1">
                          <Gauge size={16} />
                          {car.transmission}
                        </div>
                      </div>

                      <button
                        onClick={() => handleBookCar(car.id)}
                        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold"
                      >
                        Jetzt mieten
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>

      <RegistrationPromptDialog
        isOpen={isRegistrationPromptOpen}
        onClose={() => setIsRegistrationPromptOpen(false)}
        onRegister={handleRegister}
      />

      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} preselectedCarId={selectedCarId} />
    </>
  )
}
