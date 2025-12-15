"use client"

import type React from "react"
import { useState } from "react"
import { toast } from "sonner"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface FormData {
  location: string
  pickupDate: string
  returnDate: string
  passengers: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

export default function BookingForm() {
  // Fetch locations and cars from API instead of mock data
  const { data: locationsData } = useSWR("/api/locations/get-all", fetcher)
  const { data: carsData } = useSWR("/api/cars/get-all", fetcher)

  const locations = locationsData || []
  const cars = carsData || []

  const [formData, setFormData] = useState<FormData>({
    location: "",
    pickupDate: "",
    returnDate: "",
    passengers: "2",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  const [selectedCar, setSelectedCar] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const calculateDays = () => {
    if (!formData.pickupDate || !formData.returnDate) return 0
    const pickup = new Date(formData.pickupDate)
    const returnDate = new Date(formData.returnDate)
    const days = Math.ceil((returnDate.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(days, 1)
  }

  const getSelectedCarData = () => {
    return cars.find((car) => car.id === selectedCar)
  }

  const calculateTotal = () => {
    const car = getSelectedCarData()
    if (!car) return 0
    const days = calculateDays()
    return Number.parseFloat(car.price_per_day) * days
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCar) {
      toast.error("Bitte wählen Sie ein Fahrzeug aus")
      return
    }

    if (new Date(formData.returnDate) <= new Date(formData.pickupDate)) {
      toast.error("Das Rückgabedatum muss nach dem Abholdatum liegen")
      return
    }

    setSubmitting(true)

    try {
      console.log("[v0] Submitting booking to API...")
      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          carId: selectedCar,
          pickupLocationId: formData.location,
          dropoffLocationId: formData.location,
          pickupDate: formData.pickupDate,
          dropoffDate: formData.returnDate,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          totalPrice: calculateTotal(),
        }),
      })

      const result = await response.json()
      console.log("[v0] Booking response:", result)

      if (!response.ok) {
        throw new Error(result.error || "Booking failed")
      }

      toast.success(
        `Buchung erfolgreich! Bestätigungs-ID: ${result.booking.id.slice(0, 8).toUpperCase()}. Sie erhalten eine Bestätigung per E-Mail.`,
        { duration: 5000 },
      )

      // Reset form
      setFormData({
        location: "",
        pickupDate: "",
        returnDate: "",
        passengers: "2",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      })
      setSelectedCar("")
    } catch (error) {
      console.error("[v0] Booking error:", error)
      toast.error(
        `Fehler bei der Buchung: ${error instanceof Error ? error.message : "Bitte versuchen Sie es später erneut."}`,
      )
    } finally {
      setSubmitting(false)
    }
  }

  // This component is kept for backward compatibility but could be removed if not used elsewhere
  return (
    null
  )
}
