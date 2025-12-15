"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import { useEffect, useState } from "react"
import { MapPin, Phone, Clock, Loader2 } from "lucide-react"

interface Location {
  id: string
  name: string
  city: string
  address: string
}

export default function LocationsPage() {
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

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="py-12 md:py-16 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Unsere Standorte</h1>
          <p className="text-lg text-muted-foreground">Besuchen Sie eine unserer Mietstationen in der ganzen Schweiz</p>
        </div>
      </section>

      {loading ? (
        <section className="py-20 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={40} />
        </section>
      ) : locations.length === 0 ? (
        <section className="py-20 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h2 className="text-2xl font-bold text-foreground mb-2">Keine Standorte verfügbar</h2>
            <p className="text-muted-foreground">Bitte führen Sie das SQL-Script aus, um Standorte hinzuzufügen.</p>
          </div>
        </section>
      ) : (
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {locations.map((location) =>
                location && location.id && location.name ? (
                  <div
                    key={location.id}
                    className="bg-card border border-border rounded-lg p-8 hover:shadow-lg transition"
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="text-primary" size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">{location.name}</h2>
                        <p className="text-muted-foreground">{location.city}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin size={20} className="text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Adresse</p>
                          <p className="text-muted-foreground">{location.address}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone size={20} className="text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Telefon</p>
                          <p className="text-muted-foreground">+41 78 971 42 41</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock size={20} className="text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Öffnungszeiten</p>
                          <p className="text-muted-foreground">Mo-Sa: 8:00-20:00 Uhr</p>
                          <p className="text-muted-foreground">So: 10:00-18:00 Uhr</p>
                        </div>
                      </div>
                    </div>

                    <button className="w-full mt-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium">
                      Jetzt buchen
                    </button>
                  </div>
                ) : null,
              )}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}
