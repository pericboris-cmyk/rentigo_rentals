import { CheckCircle2, Zap, Heart, MapPin, Clock } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: CheckCircle2,
      title: "Einfache Buchung",
      description: "Buchen Sie in wenigen Minuten online - schnell, einfach und sicher.",
    },
    {
      icon: Zap,
      title: "Keine versteckten Gebühren",
      description: "Vollständige Transparenz bei den Preisen. Keine Überraschungen bei der Rechnungsstellung.",
    },
    {
      icon: Heart,
      title: "Premium Fahrzeuge",
      description: "Gut gepflegte Autos in Top-Zustand für Ihren Komfort.",
    },
    {
      icon: MapPin,
      title: "Mehrere Standorte",
      description: "Abhol- und Rückgabepunkte in der ganzen Schweiz.",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Unser Kundenservice-Team ist immer für Sie erreichbar.",
    },
  ]

  const topFeatures = features.slice(0, 3)
  const bottomFeatures = features.slice(3)

  const Card = ({ feature }: { feature: (typeof features)[number] }) => {
    const Icon = feature.icon
    return (
      <div className="p-6 bg-card rounded-lg border border-border hover:border-primary hover:shadow-lg transition">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
          <Icon className="text-primary" size={24} />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
        <p className="text-muted-foreground">{feature.description}</p>
      </div>
    )
  }

  return (
    <section id="features" className="py-16 md:py-24 bg-secondary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Unsere Vorteile</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Qualität, Service und faire Preise</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {topFeatures.map((feature, index) => (
            <Card key={index} feature={feature} />
          ))}

          <div className="lg:col-span-3 flex flex-col md:flex-row justify-center gap-8">
            {bottomFeatures.map((feature, index) => (
              <div key={index} className="w-full md:w-[calc(50%-16px)] lg:w-[360px]">
                <Card feature={feature} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
