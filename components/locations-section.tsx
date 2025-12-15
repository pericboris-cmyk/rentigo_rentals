"use client"

import { useEffect, useState } from "react"
import { MapPin, Loader2 } from "lucide-react"

interface Location {
  id: string
  name: string
  city: string
  address: string
}

export default function LocationsSection() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("/api/locations/get-all")
        if (response.ok) {
          const data = await response.json()
          setLocations(data)
        }
      } catch (error) {
        console.error("Error fetching locations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  return (
    <section id="locations" className="py-12 md:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-balance">{"Unsere Standorte in der Schweiz\n"}</h2>
        <p className="text-muted-foreground mb-12">Wir sind an zentralen Orten in der ganzen Schweiz für Sie da.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {locations.length > 0 ? (
            locations.map((location) => (
              <div
                key={location.id}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition cursor-pointer"
              >
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="text-primary flex-shrink-0" size={24} />
                  <div>
                    <h3 className="font-semibold text-foreground">{location.name}</h3>
                    <p className="text-sm text-muted-foreground">{location.city}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{location.address}</p>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground col-span-full text-center">Keine Standorte gefunden</p>
          )}
        </div>
      </div>
    </section>
  )
}
