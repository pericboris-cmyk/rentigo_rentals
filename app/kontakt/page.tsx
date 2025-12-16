"use client"

import type React from "react"
import toast from "react-hot-toast"
import { useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import PhoneInput from "@/components/phone-input"

export default function KontaktPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus("success")
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        })
      } else {
        setSubmitStatus("error")
      }
    } catch (error) {
      console.error("[v0] Error submitting contact form:", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setSubmitStatus("idle"), 5000)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, phone: value }))
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">Kontaktieren Sie uns</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Haben Sie Fragen oder benötigen Sie Unterstützung? Wir sind für Sie da und helfen Ihnen gerne weiter.
          </p>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Kontaktinformationen</h2>
              <p className="text-muted-foreground mb-8">
                Erreichen Sie uns über eine der folgenden Möglichkeiten. Unser Team steht Ihnen zur Verfügung.
              </p>
            </div>

            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-accent/50 hover:bg-accent transition">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">E-Mail</h3>
                  <a
                    href="mailto:rentigorentals@gmail.com"
                    className="text-muted-foreground hover:text-primary transition"
                  >
                    rentigorentals@gmail.com
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">Antwort innerhalb von 24 Stunden</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-accent/50 hover:bg-accent transition">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Telefon</h3>
                  <a href="tel:+41789714241" className="text-muted-foreground hover:text-primary transition">
                    +41 78 971 42 41
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">Mo-Fr: 8:00 - 18:00 Uhr</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-accent/50 hover:bg-accent transition">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Adresse</h3>
                  <p className="text-muted-foreground">
                    Rentigo Rentals
                    <br />
                    Bruggweg 19
                    <br />
                    4703 Kestenholz, Schweiz
                  </p>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-accent/50 hover:bg-accent transition">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Öffnungszeiten</h3>
                  <p className="text-muted-foreground">
                    Montag - Freitag: 8:00 - 17:00 Uhr
                    <br />
                    Samstag: 8:00 - 17:00 Uhr
                    <br />
                    Sonntag: Geschlossen
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-foreground mb-6">Senden Sie uns eine Nachricht</h2>

            {submitStatus === "success" && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-600 font-medium">Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet.</p>
              </div>
            )}

            {submitStatus === "error" && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-600 font-medium">
                  Es gab einen Fehler beim Senden Ihrer Nachricht. Bitte versuchen Sie es erneut.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Name *</label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ihr Name"
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">E-Mail *</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ihre@email.ch"
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Telefon</label>
                  <PhoneInput value={formData.phone} onChange={handlePhoneChange} name="phone" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Betreff *</label>
                  <Input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Wie können wir helfen?"
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nachricht *</label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Ihre Nachricht..."
                  rows={6}
                  required
                  className="w-full resize-none"
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Wird gesendet...
                  </>
                ) : (
                  <>
                    <Send size={18} className="mr-2" />
                    Nachricht senden
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                * Pflichtfelder - Ihre Daten werden vertraulich behandelt
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 px-4 bg-accent/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Besuchen Sie uns</h2>
            <p className="text-muted-foreground">Unsere Hauptniederlassung befindet sich in Kestenholz, Schweiz</p>
          </div>

          <div
            className="w-full rounded-2xl overflow-hidden border border-border shadow-lg"
            style={{ minHeight: "420px", height: "420px" }}
          >
            <iframe
              src="https://storage.googleapis.com/maps-solutions-fe0gtdv8pp/locator-plus/7b9f/locator-plus.html"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              title="Rentigo Rentals Location"
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
