"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  CalendarIcon,
  Loader2,
  DollarSign,
  Check,
  Users,
  Shield,
  Navigation,
  Baby,
  Briefcase,
  User,
  MapPin,
  FileText,
  Plus,
  Mail,
  Award as IdCard,
  Mountain,
  Package,
  Clock,
  ArrowLeft,
  ArrowRight,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import PhoneInput from "@/components/phone-input"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import {
  validateBookingDates,
  validateLocationAddress,
  getEarliestPickupDate, // New function from updates
  getAvailableTimeSlots, // New function from updates
  isDateDisabledForBooking, // New function from updates
  type ValidationError,
} from "@/lib/booking-validation"
import { cn } from "@/lib/utils" // Import cn utility

const formatDateForDB = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const generateTimeOptions = () => {
  const times = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
      times.push(timeString)
    }
  }
  return times
}

interface Car {
  id: string
  name: string
  model: string
  price_per_day: number
  seats: number
  transmission: string
  fuel_type: string
  image_url: string
  year?: number
  mileage?: number
}

interface Location {
  id: string
  name: string
  city: string
  address: string
}

type ExtraService = {
  id: string
  name: string
  description: string
  price_per_day: number
  icon_name: string
  active: boolean
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  preselectedCarId?: string
  initialPickupDate?: string
  initialDropoffDate?: string
}

// Helper for icons
function getIconComponent(iconName: string) {
  const icons: Record<string, any> = {
    Users,
    Shield,
    Navigation,
    Baby,
    Briefcase,
    Mountain,
    Package,
  }
  return icons[iconName] || Package
}

export default function BookingModal({
  isOpen,
  onClose,
  preselectedCarId,
  initialPickupDate,
  initialDropoffDate,
}: BookingModalProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [showVehicles, setShowVehicles] = useState(false)
  const [formData, setFormData] = useState({
    pickupDate: initialPickupDate || "",
    pickupTime: "10:00",
    returnDate: initialDropoffDate || "",
    returnTime: "10:00",
    pickupLocationId: "",
    dropoffLocationId: "",
    pickupAddress: "",
    dropoffAddress: "",
    carId: preselectedCarId || "",
    firstName: user?.full_name?.split(" ")[0] || "",
    lastName: user?.full_name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: "",
    totalPrice: 0,
    extras: {
      services: [] as string[],
      drivers: {
        mainDriver: null as any,
        additionalDriver: null as any,
      },
    },
  })

  const [selectedExtras, setSelectedExtras] = useState<string[]>([])

  const [driverData, setDriverData] = useState({
    driver1: {
      firstName: "",
      lastName: "",
      birthDate: "",
      licenseIssueDate: "",
    },
    driver2: {
      firstName: "",
      lastName: "",
      birthDate: "",
      licenseIssueDate: "",
    },
  })

  const [locations, setLocations] = useState<Location[]>([])
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [loadingCars, setLoadingCars] = useState(false)
  const [datesSelected, setDatesSelected] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [bookingComplete, setBookingComplete] = useState(false)
  const [bookingId, setBookingId] = useState("")

  useEffect(() => {
    if (isOpen && !user) {
      // User is not logged in, redirect to login with return URL
      const carParam = preselectedCarId ? `?carId=${preselectedCarId}` : ""
      router.push(`/login?redirect=${encodeURIComponent(`/fahrzeuge${carParam}`)}`)
      onClose()
    }
  }, [isOpen, user, router, onClose, preselectedCarId])

  const defaultExtras: ExtraService[] = [
    {
      id: "1",
      name: "Zusätzlicher Fahrer",
      description: "Berechtigung für einen weiteren Fahrer",
      price_per_day: 15.0,
      icon_name: "Users",
      active: true,
    },
    {
      id: "2",
      name: "Vollkasko-Versicherung",
      description: "Kompletter Schutz ohne Selbstbeteiligung",
      price_per_day: 25.0,
      icon_name: "Shield",
      active: true,
    },
    {
      id: "3",
      name: "GPS-Navigation",
      description: "Modernes Navigationsgerät",
      price_per_day: 8.0,
      icon_name: "Navigation",
      active: true,
    },
    {
      id: "4",
      name: "Kindersitz",
      description: "Sicherer Kindersitz (bis 12 Jahre)",
      price_per_day: 10.0,
      icon_name: "Baby",
      active: true,
    },
    {
      id: "5",
      name: "Winterreifen",
      description: "Premium-Winterreifen inklusive",
      price_per_day: 12.0,
      icon_name: "Briefcase",
      active: true,
    },
    {
      id: "6",
      name: "Ski-/Snowboard-Träger",
      description: "Für Ihre Wintersportausrüstung",
      price_per_day: 15.0,
      icon_name: "Mountain",
      active: true,
    },
  ]

  const [availableExtras, setAvailableExtras] = useState<ExtraService[]>(defaultExtras)
  const [loadingExtras, setLoadingExtras] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchLocations()
    }
  }, [isOpen])

  // Extras dynamisch laden
  useEffect(() => {
    const fetchExtras = async () => {
      try {
        const response = await fetch("/api/extras")
        if (!response.ok) {
          console.log("[v0] Extras table not found, using default extras")
          setAvailableExtras(defaultExtras)
          return
        }
        const data = await response.json()
        setAvailableExtras(data)
      } catch (error) {
        console.log("[v0] Error fetching extras, using default extras:", error)
        setAvailableExtras(defaultExtras)
      } finally {
        setLoadingExtras(false)
      }
    }

    if (isOpen) {
      fetchExtras()
    }
  }, [isOpen])

  // useEffect that automatically loaded cars has been removed

  const fetchLocations = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/locations/get-all")
      if (response.ok) {
        const locationsData = await response.json()
        setLocations(locationsData)
      }
    } catch (error) {
      console.error("[v0] Error fetching locations:", error)
      toast.error("Fehler beim Laden der Standorte")
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableCars = async () => {
    setLoadingCars(true)
    setDatesSelected(false)
    setCars([])
    setFormData((prev) => ({ ...prev, carId: "" }))

    try {
      console.log("[v0] Fetching available cars for dates:", formData.pickupDate, formData.returnDate)
      const response = await fetch(
        `/api/cars/get-available?pickupDate=${formData.pickupDate}&dropoffDate=${formData.returnDate}`,
      )

      if (response.ok) {
        const carsData = await response.json()
        console.log("[v0] Available cars:", carsData.length)
        setCars(carsData)
        setDatesSelected(true)
        setShowVehicles(true)

        if (carsData.length === 0) {
          toast.info("Für diesen Zeitraum sind leider keine Fahrzeuge verfügbar. Bitte wählen Sie andere Daten.")
        } else {
          if (preselectedCarId && carsData.some((car: any) => car.id === preselectedCarId)) {
            setFormData((prev) => ({ ...prev, carId: preselectedCarId }))
          }

          toast.success(
            `${carsData.length} Fahrzeug${carsData.length !== 1 ? "e" : ""} verfügbar für den gewählten Zeitraum`,
          )
        }
      } else {
        toast.error("Fehler beim Laden der verfügbaren Fahrzeuge")
      }
    } catch (error) {
      console.error("[v0] Error fetching available cars:", error)
      toast.error("Fehler beim Laden der verfügbaren Fahrzeuge")
    } finally {
      setLoadingCars(false)
    }
  }

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, phone: value }))
  }

  const calculateDays = () => {
    if (!formData.pickupDate || !formData.returnDate) return 0
    const pickup = new Date(formData.pickupDate)
    const returnDate = new Date(formData.returnDate)
    const diffTime = Math.abs(returnDate.getTime() - pickup.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getSelectedCar = () => cars.find((car) => car.id === formData.carId)

  const calculateExtrasTotal = () => {
    const days = calculateDays()
    return selectedExtras.reduce((sum, extraId) => {
      const extra = availableExtras.find((e) => e.id === extraId)
      return sum + (extra ? extra.price_per_day * days : 0)
    }, 0)
  }

  const calculateTotalPrice = () => {
    const car = getSelectedCar()
    if (!car) return 0
    const days = calculateDays()
    const carTotal = car.price_per_day * days
    const extrasTotal = calculateExtrasTotal()
    return carTotal + extrasTotal
  }

  const toggleExtra = (extraId: string) => {
    setSelectedExtras((prev) => (prev.includes(extraId) ? prev.filter((id) => id !== extraId) : [...prev, extraId]))
  }

  const isStep1Complete = (): boolean => {
    if (
      !formData.pickupDate ||
      !formData.returnDate ||
      !formData.pickupTime ||
      !formData.returnTime ||
      !formData.pickupAddress ||
      !formData.dropoffAddress
    ) {
      return false
    }

    // Validate dates
    const dateError = validateBookingDates(
      formData.pickupDate,
      formData.pickupTime,
      formData.returnDate,
      formData.returnTime,
    )
    if (dateError) return false

    // Validate addresses
    const pickupAddressError = validateLocationAddress(formData.pickupAddress, "Abholstandort")
    if (pickupAddressError) return false

    const dropoffAddressError = validateLocationAddress(formData.dropoffAddress, "Rückgabestandort")
    if (dropoffAddressError) return false

    return true
  }

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return showVehicles && !!formData.carId
      case 2:
        return true
      case 3:
        return true
      case 4:
        return (
          !!formData.firstName &&
          !!formData.lastName &&
          !!formData.email &&
          !!formData.phone &&
          formData.phone.length >= 10
        )
      default:
        return false
    }
  }

  const validateCurrentStep = (): boolean => {
    const errors: ValidationError[] = [] // Changed type for consistency

    switch (step) {
      case 1:
        if (!formData.pickupDate) errors.push({ field: "Abholdatum", message: "Abholdatum ist erforderlich" })
        if (!formData.pickupTime) errors.push({ field: "Abholzeit", message: "Abholzeit ist erforderlich" })
        if (!formData.returnDate) errors.push({ field: "Rückgabedatum", message: "Rückgabedatum ist erforderlich" })
        if (!formData.returnTime) errors.push({ field: "Rückgabezeit", message: "Rückgabezeit ist erforderlich" })
        if (!formData.pickupAddress || formData.pickupAddress.length < 5)
          errors.push({ field: "Abholstandort", message: "Abholstandort ist erforderlich" })
        if (!formData.dropoffAddress || formData.dropoffAddress.length < 5)
          errors.push({ field: "Rückgabestandort", message: "Rückgabestandort ist erforderlich" })

        if (showVehicles && !formData.carId) {
          errors.push({ field: "Fahrzeug", message: "Bitte wählen Sie ein Fahrzeug" })
        }
        break
      case 2:
        break
      case 3:
        break
      case 4:
        if (!formData.firstName) errors.push({ field: "Vorname", message: "Vorname ist erforderlich" })
        if (!formData.lastName) errors.push({ field: "Nachname", message: "Nachname ist erforderlich" })
        if (!formData.email) errors.push({ field: "E-Mail", message: "E-Mail ist erforderlich" })
        if (!formData.phone) errors.push({ field: "Telefon", message: "Telefon ist erforderlich" })
        break
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      handleClose()
    }
  }

  const handleNext = () => {
    if (!canProceed()) return

    // Validate current step before proceeding
    if (!validateCurrentStep()) {
      return
    }

    setValidationErrors([])
    setStep((prev) => Math.min(prev + 1, 5))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canProceed() || step !== 5) return

    if (!validateCurrentStep()) {
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const extrasWithDrivers = {
        services: selectedExtras.map((extraId) => {
          const extra = availableExtras.find((s) => s.id === extraId)
          return {
            id: extraId,
            name: extra?.name,
            price: extra?.price_per_day,
          }
        }),
        drivers: {
          mainDriver: driverData.driver1,
          ...(selectedExtras.includes("additional_driver") && {
            additionalDriver: driverData.driver2,
          }),
        },
      }

      const bookingData = {
        pickupDate: formData.pickupDate,
        dropoffDate: formData.returnDate,
        pickupTime: formData.pickupTime,
        dropoffTime: formData.returnTime, // Changed from returnTime to dropoffTime
        pickupAddress: formData.pickupAddress, // Changed from pickupLocationId to pickupAddress
        dropoffAddress: formData.dropoffAddress, // Changed from dropoffLocationId to dropoffAddress
        carId: formData.carId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        extras: extrasWithDrivers,
        totalPrice: calculateTotalPrice(),
      }

      console.log("[v0] Booking data being sent:", bookingData)

      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setError(result.error || "Dieses Fahrzeug ist für den gewählten Zeitraum nicht verfügbar.")
        } else if (response.status === 429) {
          setError(result.error || "Zu viele Buchungsversuche. Bitte versuchen Sie es später erneut.")
        } else {
          setError(result.error || "Fehler beim Erstellen der Buchung")
        }
        setSubmitting(false)
        return
      }

      console.log("[v0] Booking successful:", result)
      setBookingId(result.booking.id)
      setBookingComplete(true)

      toast.success(
        `Buchung erfolgreich! Bestätigungs-ID: ${result.booking.id.slice(0, 8).toUpperCase()}. Sie erhalten eine Bestätigung per E-Mail.`,
        { duration: 5000 },
      )

      handleClose()
      router.push("/dashboard/bookings")
    } catch (err: any) {
      console.error("[v0] Booking error:", err)
      const msg = `Fehler bei der Buchung: ${err.message || "Bitte versuchen Sie es später erneut."}`
      setError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      pickupDate: "",
      returnDate: "",
      pickupTime: "09:00", // Reset pickup time
      returnTime: "09:00", // Reset return time
      pickupLocationId: "",
      dropoffLocationId: "",
      // Resetting address fields as well
      pickupAddress: "",
      dropoffAddress: "",
      carId: preselectedCarId || "",
      firstName: user?.full_name?.split(" ")[0] || "",
      lastName: user?.full_name?.split(" ").slice(1).join(" ") || "",
      email: user?.email || "",
      phone: "",
      totalPrice: 0, // Reset totalPrice
      extras: {
        services: [], // Reset services
        drivers: {
          mainDriver: null, // Reset main driver
          additionalDriver: null, // Reset additional driver
        },
      },
    })
    setSelectedExtras([])
    setDriverData({
      driver1: { firstName: "", lastName: "", birthDate: "", licenseIssueDate: "" }, // Removed licenseNumber
      driver2: { firstName: "", lastName: "", birthDate: "", licenseIssueDate: "" }, // Removed licenseNumber
    })
    setStep(1)
    setError("")
    setCars([])
    setValidationErrors([])
    setBookingComplete(false)
    setBookingId("")
  }

  const handleClose = () => {
    setShowVehicles(false)
    setCars([])
    setStep(1)
    setFormData({
      pickupDate: "",
      pickupTime: "10:00",
      returnDate: "",
      returnTime: "10:00",
      pickupAddress: "",
      dropoffAddress: "",
      carId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      totalPrice: 0, // Reset totalPrice
      extras: {
        services: [], // Reset services
        drivers: {
          mainDriver: null, // Reset main driver
          additionalDriver: null, // Reset additional driver
        },
      },
    })
    setDriverData({
      driver1: {
        firstName: "",
        lastName: "",
        birthDate: "",
        licenseIssueDate: "",
      },
      driver2: {
        firstName: "",
        lastName: "",
        birthDate: "",
        licenseIssueDate: "",
      },
    })
    setSelectedExtras([])
    setValidationErrors([])
    setError("")
    onClose()
  }

  const selectedCar = getSelectedCar()
  const total = calculateTotalPrice()
  const days = calculateDays()

  // Memoized available cars and validity check for Step 1
  const availableCars = useMemo(() => cars, [cars])
  const isStep1Valid = isStep1Complete()

  // Handler for loading vehicles, consolidating logic
  const handleLoadVehicles = () => {
    if (!isStep1Valid) {
      validateCurrentStep() // Trigger validation to show errors
      return
    }
    fetchAvailableCars()
  }

  // Unified handler for proceeding to the next step
  const handleNextStep = () => {
    if (!canProceed() || step === 4) return

    if (!validateCurrentStep()) {
      return
    }

    setValidationErrors([])
    setStep((prev) => Math.min(prev + 1, 4))
  }

  // Unified handler for going back
  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      handleClose()
    }
  }

  // Renamed states for clarity
  const isSubmitting = submitting
  const isBookingComplete = bookingComplete

  // Renamed function for clarity
  const canProceedToNextStep = () => canProceed()

  // Renamed submit button handler
  const handleBooking = () => {
    if (!canProceedToNextStep() || step !== 4) return
    if (!validateCurrentStep()) return
    handleSubmit(new Event("submit") as React.FormEvent) // Simulate form submission
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-[90vw] sm:max-w-[90vw] md:max-w-[1100px] lg:max-w-[1200px] max-h-[90vh] sm:max-h-[85vh] p-4 sm:p-6 md:p-10 rounded-xl sm:rounded-2xl overflow-auto">
        <DialogTitle className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-center bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Fahrzeug buchen
        </DialogTitle>
        <form className="flex h-full flex-col" onSubmit={handleSubmit}>
          <div className="mt-3 sm:mt-4 mb-4 sm:mb-6">
            {/* Mobile: Icon-only indicators */}
            <div className="flex md:hidden items-center justify-center gap-2">
              {[
                { number: 1, label: "Zeitraum & Fahrzeug" },
                { number: 2, label: "Extras" },
                { number: 3, label: "Fahrerdaten" },
                { number: 4, label: "Bestätigen" },
              ].map((stepInfo, index) => (
                <React.Fragment key={stepInfo.number}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      step === stepInfo.number
                        ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/20"
                        : step > stepInfo.number
                          ? "bg-green-500 text-white"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step > stepInfo.number ? <Check className="w-4 h-4" /> : stepInfo.number}
                  </div>
                  {index < 3 && <div className="w-4 sm:w-6 h-0.5 bg-muted" />}
                </React.Fragment>
              ))}
            </div>

            {/* Desktop: Full indicators with labels */}
            <div className="hidden md:flex items-center justify-center gap-4">
              {[
                { number: 1, label: "Zeitraum & Fahrzeug" },
                { number: 2, label: "Extras" },
                { number: 3, label: "Fahrerdaten" },
                { number: 4, label: "Bestätigen" },
              ].map((stepInfo, index) => (
                <React.Fragment key={stepInfo.number}>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-semibold transition-all ${
                        step === stepInfo.number
                          ? "bg-primary text-primary-foreground shadow"
                          : step > stepInfo.number
                            ? "bg-green-500 text-white"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step > stepInfo.number ? <Check className="w-5 h-5" /> : stepInfo.number}
                    </div>
                    <span
                      className={`text-xs md:text-sm font-medium ${
                        step === stepInfo.number ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {stepInfo.label}
                    </span>
                  </div>
                  {index < 3 && <div className="w-12 h-0.5 bg-muted" />}
                </React.Fragment>
              ))}
            </div>

            {/* Mobile: Current step label below */}
            <div className="flex md:hidden justify-center mt-3">
              <span className="text-sm font-medium text-foreground">
                {step === 1 && "Zeitraum & Fahrzeug wählen"}
                {step === 2 && "Extras wählen"}
                {step === 3 && "Fahrerdaten eingeben"}
                {step === 4 && "Buchung bestätigen"}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
            {/* Step 1: Zeitraum & Fahrzeug */}
            {step === 1 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 text-foreground">
                    Wählen Sie Ihren Zeitraum
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Geben Sie Ihre Abhol- und Rückgabeinformationen ein
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="pickupDate" className="flex items-center gap-2 font-medium text-sm sm:text-base">
                      <CalendarIcon className="w-4 h-4 text-primary" />
                      Abholdatum
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-11 px-4 bg-transparent text-left font-normal",
                            !formData.pickupDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.pickupDate ? (
                            format(new Date(formData.pickupDate + "T12:00:00"), "PPP", { locale: de })
                          ) : (
                            <span>Datum wählen</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.pickupDate ? new Date(formData.pickupDate + "T12:00:00") : undefined}
                          onSelect={(date) => {
                            if (date) {
                              const newPickupDate = formatDateForDB(date)
                              setFormData((prev) => {
                                const updates: any = {
                                  pickupDate: newPickupDate,
                                }

                                // Auto-adjust pickup time if current time is not valid for selected date
                                const availableSlots = getAvailableTimeSlots(date)
                                if (prev.pickupTime && !availableSlots.includes(prev.pickupTime)) {
                                  updates.pickupTime = availableSlots[0] || "09:00"
                                }

                                return { ...prev, ...updates }
                              })
                            }
                          }}
                          initialFocus
                          locale={de}
                          fromDate={getEarliestPickupDate()}
                          disabled={isDateDisabledForBooking}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="pickupTime" className="flex items-center gap-2 font-medium text-sm sm:text-base">
                      <Clock className="w-4 h-4 text-primary" />
                      Abholzeit
                    </Label>
                    <Select
                      value={formData.pickupTime}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, pickupTime: value }))}
                    >
                      <SelectTrigger className="h-11 px-4 bg-transparent">
                        <SelectValue placeholder="Zeit wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {(formData.pickupDate
                          ? getAvailableTimeSlots(new Date(formData.pickupDate + "T12:00:00"))
                          : [
                              "00:00",
                              "01:00",
                              "02:00",
                              "03:00",
                              "04:00",
                              "05:00",
                              "06:00",
                              "07:00",
                              "08:00",
                              "09:00",
                              "10:00",
                              "11:00",
                              "12:00",
                              "13:00",
                              "14:00",
                              "15:00",
                              "16:00",
                              "17:00",
                              "18:00",
                              "19:00",
                              "20:00",
                              "21:00",
                              "22:00",
                              "23:00",
                            ]
                        ).map((time) => (
                          <SelectItem key={time} value={time}>
                            {time} Uhr
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="pickupAddress" className="flex items-center gap-2 font-medium text-sm sm:text-base">
                      <MapPin className="w-4 h-4 text-primary" />
                      Abholstandort *
                    </Label>
                    <Input
                      id="pickupAddress"
                      placeholder="Adresse"
                      value={formData.pickupAddress}
                      onChange={(e) => setFormData((prev) => ({ ...prev, pickupAddress: e.target.value }))}
                      className="h-11 px-4 bg-transparent"
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <Label
                      htmlFor="dropoffAddress"
                      className="flex items-center gap-2 font-medium text-sm sm:text-base"
                    >
                      <MapPin className="w-4 h-4 text-primary" />
                      Rückgabestandort *
                    </Label>
                    <Input
                      id="dropoffAddress"
                      placeholder="Adresse"
                      value={formData.dropoffAddress}
                      onChange={(e) => setFormData((prev) => ({ ...prev, dropoffAddress: e.target.value }))}
                      className="h-11 px-4 bg-transparent"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleLoadVehicles}
                  disabled={!isStep1Valid || loadingCars}
                  className="w-full h-11 sm:h-12 text-base sm:text-lg font-semibold mt-4 sm:mt-6"
                >
                  {loadingCars ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      Fahrzeuge werden geladen...
                    </>
                  ) : (
                    "Verfügbare Fahrzeuge anzeigen"
                  )}
                </Button>

                {showVehicles && cars.length > 0 && (
                  <div className="space-y-4 border-t pt-4 sm:pt-6 mt-4 sm:mt-6">
                    <div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 text-foreground">
                        Verfügbare Fahrzeuge
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        {cars.length} verfügbare{cars.length === 1 ? "s Fahrzeug" : " Fahrzeuge"} für Ihren Zeitraum
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {cars.map((car) => {
                        const isSelected = formData.carId === car.id
                        return (
                          <div
                            key={car.id}
                            onClick={() => setFormData((prev) => ({ ...prev, carId: car.id }))}
                            className={`border rounded-lg p-3 cursor-pointer transition-all ${
                              isSelected
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="flex gap-3">
                              {car.image_url && (
                                <img
                                  src={car.image_url || "/placeholder.svg"}
                                  alt={`${car.name} ${car.year}`}
                                  className="w-28 h-20 object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm">{car.name}</h4>
                                <p className="text-xs text-muted-foreground">{car.year}</p>
                                <p className="text-sm font-bold text-primary mt-1">CHF {car.price_per_day}/Tag</p>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="mt-2 flex items-center gap-1 text-xs text-primary font-medium">
                                <Check className="w-4 h-4" />
                                Ausgewählt
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Extras (previously step 3) */}
            {step === 2 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 text-foreground">
                    Zusatzleistungen
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Wählen Sie optionale Extras für Ihre Buchung
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                  {loadingExtras ? (
                    <div className="col-span-full py-6 text-center text-muted-foreground">
                      Zusatzleistungen werden geladen...
                    </div>
                  ) : availableExtras.length === 0 ? (
                    <div className="col-span-full py-6 text-center text-muted-foreground">
                      Keine Zusatzleistungen verfügbar
                    </div>
                  ) : (
                    availableExtras.map((service) => {
                      const IconComponent = getIconComponent(service.icon_name)
                      const isSelected = selectedExtras.includes(service.id)

                      return (
                        <div
                          key={service.id}
                          onClick={() => toggleExtra(service.id)}
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-sm"
                              : "border-border hover:border-primary/50 bg-background"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex gap-3 flex-1">
                              <div className={`p-2 rounded-lg ${isSelected ? "bg-primary/20" : "bg-muted"}`}>
                                <IconComponent
                                  size={18}
                                  className={isSelected ? "text-primary" : "text-muted-foreground"}
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground text-sm">{service.name}</h4>
                                <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
                                <div className="mt-2 text-sm font-semibold text-primary">
                                  CHF {service.price_per_day.toFixed(2)}/Tag
                                </div>
                              </div>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                              }`}
                            >
                              {isSelected && <Check size={13} className="text-primary-foreground" />}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {selectedExtras.length > 0 && (
                  <div className="border-t border-border pt-3 mt-3">
                    <h4 className="font-semibold text-foreground mb-2">Ausgewählte Extras:</h4>
                    <div className="space-y-1">
                      {selectedExtras.map((extraId) => {
                        const extra = availableExtras.find((e) => e.id === extraId)
                        if (!extra) return null
                        return (
                          <div key={extraId} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{extra.name}</span>
                            <span className="text-foreground font-medium">
                              CHF {(extra.price_per_day * days).toFixed(2)}
                            </span>
                          </div>
                        )
                      })}
                      <div className="border-t border-border pt-2 flex items-center justify-between font-semibold">
                        <span>Extras Gesamt:</span>
                        <span className="text-primary">CHF {calculateExtrasTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Fahrerdaten (previously step 4) */}
            {step === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 text-foreground">
                    Fahrerdaten
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">Geben Sie die Daten der Fahrer ein</p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="border border-primary/20 rounded-xl p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <IdCard className="h-5 w-5" />
                      Hauptfahrer
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label htmlFor="driver1-firstName">Vorname *</Label>
                        <Input
                          id="driver1-firstName"
                          value={driverData.driver1.firstName}
                          onChange={(e) =>
                            setDriverData((prev) => ({
                              ...prev,
                              driver1: { ...prev.driver1, firstName: e.target.value },
                            }))
                          }
                          placeholder="Max"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="driver1-lastName">Nachname *</Label>
                        <Input
                          id="driver1-lastName"
                          value={driverData.driver1.lastName}
                          onChange={(e) =>
                            setDriverData((prev) => ({
                              ...prev,
                              driver1: { ...prev.driver1, lastName: e.target.value },
                            }))
                          }
                          placeholder="Mustermann"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="driver1-birthDate">Geburtsdatum *</Label>
                        <Input
                          id="driver1-birthDate"
                          type="date"
                          value={driverData.driver1.birthDate}
                          onChange={(e) =>
                            setDriverData((prev) => ({
                              ...prev,
                              driver1: { ...prev.driver1, birthDate: e.target.value },
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="driver1-licenseIssueDate">Führerschein-Ausstellungsdatum *</Label>
                        <Input
                          id="driver1-licenseIssueDate"
                          type="date"
                          value={driverData.driver1.licenseIssueDate}
                          onChange={(e) =>
                            setDriverData((prev) => ({
                              ...prev,
                              driver1: { ...prev.driver1, licenseIssueDate: e.target.value },
                            }))
                          }
                          className="h-11 px-4"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {selectedExtras.includes("additional_driver") && (
                    <div className="border border-primary/20 rounded-xl p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Zusätzlicher Fahrer
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <Label htmlFor="driver2-firstName">Vorname *</Label>
                          <Input
                            id="driver2-firstName"
                            value={driverData.driver2.firstName}
                            onChange={(e) =>
                              setDriverData((prev) => ({
                                ...prev,
                                driver2: { ...prev.driver2, firstName: e.target.value },
                              }))
                            }
                            placeholder="Anna"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="driver2-lastName">Nachname *</Label>
                          <Input
                            id="driver2-lastName"
                            value={driverData.driver2.lastName}
                            onChange={(e) =>
                              setDriverData((prev) => ({
                                ...prev,
                                driver2: { ...prev.driver2, lastName: e.target.value },
                              }))
                            }
                            placeholder="Muster"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="driver2-birthDate">Geburtsdatum *</Label>
                          <Input
                            id="driver2-birthDate"
                            type="date"
                            value={driverData.driver2.birthDate}
                            onChange={(e) =>
                              setDriverData((prev) => ({
                                ...prev,
                                driver2: { ...prev.driver2, birthDate: e.target.value },
                              }))
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="driver2-licenseIssueDate">Führerschein-Ausstellungsdatum *</Label>
                          <Input
                            id="driver2-licenseIssueDate"
                            type="date"
                            value={driverData.driver2.licenseIssueDate}
                            onChange={(e) =>
                              setDriverData((prev) => ({
                                ...prev,
                                driver2: { ...prev.driver2, licenseIssueDate: e.target.value },
                              }))
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Zusammenfassung (previously step 5) */}
            {step === 4 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 text-foreground">
                    Buchung bestätigen
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Überprüfen Sie Ihre Angaben vor der Bestätigung
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="border border-primary/20 rounded-xl p-5 bg-gradient-to-br from-primary/5 to-primary/10 shadow-sm">
                    <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                      <User size={20} className="text-primary" />
                      Ihre Buchungsdaten
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-foreground font-semibold">
                          Vorname
                        </Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                          required
                          className="border-border bg-background"
                          placeholder="Max"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-foreground font-semibold">
                          Nachname
                        </Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                          required
                          className="border-border bg-background"
                          placeholder="Muster"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground font-semibold">
                          E-Mail
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                          required
                          className="border-border bg-background"
                          placeholder="max.muster@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-foreground font-semibold">
                          Telefon
                        </Label>
                        <PhoneInput value={formData.phone} onChange={handlePhoneChange} required />
                      </div>
                    </div>
                  </div>

                  {selectedCar && (
                    <div className="border border-border rounded-xl p-5 bg-background shadow-sm">
                      <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-primary" />
                        Zusammenfassung
                      </h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between py-1">
                          <span className="text-muted-foreground font-medium">Fahrzeug</span>
                          <span className="font-bold text-foreground">
                            {selectedCar.name} {selectedCar.year}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-1">
                          <span className="text-muted-foreground font-medium">Mietzeitraum</span>
                          <span className="font-semibold text-foreground">{days} Tage</span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-border">
                          <span className="text-muted-foreground font-medium">Preis pro Tag</span>
                          <span className="font-semibold text-foreground">CHF {selectedCar.price_per_day}</span>
                        </div>

                        {selectedExtras.length > 0 && (
                          <>
                            <div className="pt-3">
                              <div className="font-bold text-foreground mb-2 flex items-center gap-2">
                                <Plus size={16} className="text-primary" />
                                Zusatzleistungen
                              </div>
                              <div className="space-y-1 pl-4">
                                {selectedExtras.map((extraId) => {
                                  const extra = availableExtras.find((e) => e.id === extraId)
                                  if (!extra) return null
                                  return (
                                    <div key={extraId} className="flex items-center justify-between py-0.5">
                                      <span className="text-muted-foreground text-sm">{extra.name}</span>
                                      <span className="text-foreground font-medium text-sm">
                                        CHF {(extra.price_per_day * days).toFixed(2)}
                                      </span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </>
                        )}

                        <div className="border-t-2 border-primary/30 pt-3 mt-3 bg-primary/5 rounded-lg p-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <span className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                              <DollarSign size={20} className="text-primary flex-shrink-0" />
                              Gesamtpreis
                            </span>
                            <span className="text-2xl font-bold text-primary">CHF {total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-3">
                    <Mail size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Rechnung per E-Mail</p>
                      <p className="text-blue-700 dark:text-blue-300">
                        Nach der Buchung erhalten Sie automatisch eine Rechnung an die angegebene E-Mail-Adresse.
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{error}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="border-t bg-background px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePreviousStep}
              disabled={isSubmitting}
              className="w-full sm:w-auto order-2 sm:order-1 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>

            {step < 4 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={!canProceedToNextStep() || isSubmitting}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                Weiter
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleBooking}
                disabled={!canProceedToNextStep() || isSubmitting}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Wird gebucht...
                  </>
                ) : (
                  <>
                    Jetzt buchen
                    <Check className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
