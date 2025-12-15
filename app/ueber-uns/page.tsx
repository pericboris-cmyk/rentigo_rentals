import Header from "@/components/header"
import Footer from "@/components/footer"
import { Car, Users, Award, Target, Heart, Shield } from "lucide-react"
import Image from "next/image"

export default function AboutUs() {
  const values = [
    {
      icon: Heart,
      title: "Kundenzufriedenheit",
      description: "Ihre Zufriedenheit steht bei uns an erster Stelle. Wir bieten erstklassigen Service und Support.",
    },
    {
      icon: Shield,
      title: "Zuverlässigkeit",
      description: "Gut gewartete Fahrzeuge und transparente Prozesse für ein sicheres Mieterlebnis.",
    },
    {
      icon: Target,
      title: "Faire Preise",
      description: "Keine versteckten Kosten. Qualität zu fairen und transparenten Preisen.",
    },
  ]

  const stats = [
    { number: "5000+", label: "Zufriedene Kunden" },
    { number: "50+", label: "Moderne Fahrzeuge" },
    { number: "4", label: "Standorte in der Schweiz" },
    { number: "24/7", label: "Kundenservice" },
  ]

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
              Über Rentigo Rentals
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
              Ihr vertrauensvoller Partner für Autovermietung in der Schweiz. Wir verbinden Qualität, Service und faire
              Preise.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      

      {/* Story Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Unsere Geschichte</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Rentigo Rentals wurde mit dem Ziel gegründet, Autovermietung in der Schweiz einfach, transparent und fair zu gestalten. Als junges Unternehmen stehen wir am Anfang unserer Reise und setzen von Beginn an auf klare Abläufe, faire Preise und einen persönlichen Kundenservice.
                </p>
                <p>
                  Unser Fokus liegt auf modernen, gepflegten Fahrzeugen und einer unkomplizierten Buchung ohne versteckte Kosten. Ob für den Alltag, einen Wochenendausflug oder eine kurzfristige Mobilitätslösung, wir möchten unseren Kundinnen und Kunden eine verlässliche und stressfreie Erfahrung bieten.
                </p>
                <p>
                  Als neu gegründete Autovermietung legen wir besonderen Wert auf Vertrauen, Nähe zum Kunden und kontinuierliche Weiterentwicklung unseres Angebots.
                </p>
              </div>
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-border shadow-lg">
              <Image
                src="/luxury-car-rental-service-modern-vehicle.jpg"
                alt="Rentigo Rentals Fahrzeuge"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Unsere Werte</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Diese Prinzipien leiten uns in allem, was wir tun
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div
                  key={index}
                  className="p-8 bg-card rounded-lg border border-border hover:border-primary hover:shadow-lg transition"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="text-primary" size={28} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="text-primary" size={32} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Unsere Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Wir möchten jedem Kunden ein unkompliziertes, sicheres und angenehmes Mieterlebnis bieten. Durch moderne
              Technologie, transparente Prozesse und persönlichen Service schaffen wir Vertrauen und ermöglichen
              Mobilität, die sich jeder leisten kann.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24 bg-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Unser Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ein engagiertes Team, das sich um Ihre Bedürfnisse kümmert
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-card rounded-lg border border-border">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-primary" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Kundenservice</h3>
              <p className="text-sm text-muted-foreground">Freundlich, kompetent und immer für Sie erreichbar</p>
            </div>

            <div className="text-center p-6 bg-card rounded-lg border border-border">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="text-primary" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Fahrzeugpflege</h3>
              <p className="text-sm text-muted-foreground">Sorgt dafür, dass alle Fahrzeuge in Top-Zustand sind</p>
            </div>

            <div className="text-center p-6 bg-card rounded-lg border border-border">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-primary" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Qualitätssicherung</h3>
              <p className="text-sm text-muted-foreground">Garantiert höchste Standards bei Service und Fahrzeugen</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Bereit für Ihre nächste Fahrt?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Buchen Sie jetzt Ihr Wunschfahrzeug und erleben Sie unseren erstklassigen Service
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/#cars"
              className="px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold"
            >
              Fahrzeuge ansehen
            </a>
            <a
              href="/kontakt"
              className="px-8 py-4 bg-card text-foreground border border-border rounded-lg hover:border-primary transition font-semibold"
            >
              Kontakt aufnehmen
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
