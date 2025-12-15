"use client"
import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import BookingForm from "@/components/booking-form"
import FeaturesSection from "@/components/features-section"
import CarsSection from "@/components/cars-section"
import LocationsSection from "@/components/locations-section"
import PricingSection from "@/components/pricing-section"
import TestimonialSection from "@/components/testimonial-section"
import Footer from "@/components/footer"
import ChristmasPromotion from "@/components/christmas-promotion"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <ChristmasPromotion />
      <BookingForm />
      <FeaturesSection />
      <CarsSection />
      <LocationsSection />
      <PricingSection />
      <TestimonialSection />
      <Footer />
    </main>
  )
}
