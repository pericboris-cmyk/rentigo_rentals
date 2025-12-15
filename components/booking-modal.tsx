"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import {
  CalendarIcon,
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
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import PhoneInput from "@/components/phone-input"
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog"
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
  validateBirthDate,
  validateName,
  validatePhoneNumber,
  validateEmail,
  validateLicenseIssueDate,
  validateBookingDates,
  areDriversIdentical,
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
  const totalSteps = 4 // Reduced from 5 to 4 steps (removed vehicle selection step)
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
      console.log("[v0] Fetching available cars for dates:", formData.pickupDate, formData.dropoffDate)
      const response = await fetch(
        `/api/cars/get-available?pickupDate=${formData.pickupDate}&dropoffDate=${formData.dropoffDate}`,
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
        return showVehicles && cars.length > 0
      case 2:
        return !!formData.carId
      case 3:
        return true
      case 4:
        return true
      case 5:
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
    const errors: ValidationError[] = []

    switch (step) {
      case 1: {
        // Validate booking dates
        const dateError = validateBookingDates(
          formData.pickupDate,
          formData.pickupTime,
          formData.returnDate,
          formData.returnTime,
        )
        if (dateError) errors.push(dateError)

        const pickupAddressError = validateLocationAddress(formData.pickupAddress, "Abholstandort")
        if (pickupAddressError) errors.push(pickupAddressError)

        const dropoffAddressError = validateLocationAddress(formData.dropoffAddress, "Rückgabestandort")
        if (dropoffAddressError) errors.push(dropoffAddressError)
        break
      }
      case 2: {
        // Car selection - no additional validation needed
        break
      }
      case 3: {
        // Extras selection - no additional validation needed
        break
      }
      case 4: {
        // Validate main driver
        const driver1 = driverData.driver1

        const firstNameError = validateName(driver1.firstName, "Vorname")
        if (firstNameError) errors.push(firstNameError)

        const lastNameError = validateName(driver1.lastName, "Nachname")
        if (lastNameError) errors.push(lastNameError)

        const birthDateError = validateBirthDate(driver1.birthDate, "Geburtsdatum")
        if (birthDateError) errors.push(birthDateError)

        const licenseIssueError = validateLicenseIssueDate(driver1.licenseIssueDate, driver1.birthDate)
        if (licenseIssueError) errors.push(licenseIssueError)

        // Validate additional driver if selected
        if (selectedExtras.includes("additional_driver")) {
          const driver2 = driverData.driver2

          const d2FirstNameError = validateName(driver2.firstName, "Zusatzfahrer Vorname")
          if (d2FirstNameError) errors.push(d2FirstNameError)

          const d2LastNameError = validateName(driver2.lastName, "Zusatzfahrer Nachname")
          if (d2LastNameError) errors.push(d2LastNameError)

          const d2BirthDateError = validateBirthDate(driver2.birthDate, "Zusatzfahrer Geburtsdatum")
          if (d2BirthDateError) errors.push(d2BirthDateError)

          const d2LicenseIssueError = validateLicenseIssueDate(
            driver2.licenseIssueDate,
            driver2.birthDate,
            "Zusatzfahrer Führerschein-Ausstellungsdatum",
          )
          if (d2LicenseIssueError) errors.push(d2LicenseIssueError)

          // Check if drivers are identical
          if (areDriversIdentical(driver1, driver2)) {
            errors.push({
              field: "Zusatzfahrer",
              message: "Hauptfahrer und Zusatzfahrer dürfen nicht identisch sein",
            })
          }
        }
        break
      }
      case 5: {
        // Validate contact information
        const firstNameError = validateName(formData.firstName, "Vorname")
        if (firstNameError) errors.push(firstNameError)

        const lastNameError = validateName(formData.lastName, "Nachname")
        if (lastNameError) errors.push(lastNameError)

        const emailError = validateEmail(formData.email)
        if (emailError) errors.push(emailError)

        const phoneError = validatePhoneNumber(formData.phone)
        if (phoneError) errors.push(phoneError)
        break
      }
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return
    }

    if (step === 1) {
      if (!formData.carId) {
        toast.error("Bitte wählen Sie ein Fahrzeug aus")
        return
      }
      setStep(2) // Go to extras (was step 3)
    } else if (step === 2) {
      setStep(3) // Go to driver data (was step 4)
    } else if (step === 3) {
      setStep(4) // Go to confirmation (was step 5)
    }
  }

  const handleBack = () => {
    if (step === 4) {
      setStep(3)
    } else if (step === 3) {
      setStep(2)
    } else if (step === 2) {
      setStep(1)
    } else {
      handleClose()
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
    if (!canProceed() || step === totalSteps) return

    if (!validateCurrentStep()) {
      return
    }

    setValidationErrors([])
    setStep((prev) => Math.min(prev + 1, totalSteps))
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

  const getStepLabel = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return "Daten & Fahrzeug"
      case 2:
        return "Extras"
      case 3:
        return "Fahrerdaten"
      case 4:
        return "Bestätigung"
      default:
        return ""
    }
  }

  // Placeholder for handleSubmit - this needs to be defined
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    const bookingData = {
      ...formData,
      selectedExtras: selectedExtras,
      driver1: selectedExtras.includes("additional_driver") ? driverData.driver1 : null,
      driver2: selectedExtras.includes("additional_driver") ? driverData.driver2 : null,
      totalPrice: total,
      car: selectedCar,
      days: days,
      userId: user?.id,
    }

    try {
      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Buchung fehlgeschlagen")
      }

      const result = await response.json()
      setBookingId(result.bookingId)
      setBookingComplete(true)
      toast.success("Buchung erfolgreich!")
      // Optionally redirect or show a success message
      // router.push(`/booking-success/${result.bookingId}`)
    } catch (err: any) {
      console.error("Booking error:", err)
      setError(err.message)
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-5xl max-h-[95vh] overflow-y-auto p-4 sm:p-6 md:p-8">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold">{getStepLabel(step)}</DialogTitle>

          {/* Step Indicator - Mobile optimized */}
          <div className="space-y-2">
            {/* Mobile: Show only current step description */}
            <div className="sm:hidden text-center">
              <p className="text-sm text-muted-foreground">
                Schritt {step} von {totalSteps}
              </p>
            </div>

            {/* Desktop: Show all steps */}
            <div className="hidden sm:flex justify-between items-center relative">
              {[1, 2, 3, 4].map((stepNum) => (
                <div key={stepNum} className="flex flex-col items-center flex-1 relative">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      stepNum === step
                        ? "bg-primary text-primary-foreground"
                        : stepNum < step
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {stepNum < step ? <Check size={16} /> : stepNum}
                  </div>
                  <span
                    className={`mt-1 text-xs font-medium ${
                      stepNum === step ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {getStepLabel(stepNum)}
                  </span>
                  {stepNum < 4 && (
                    <div
                      className={`absolute top-4 left-[50%] w-full h-[2px] ${
                        stepNum < step ? "bg-primary" : "bg-muted"
                      }`}
                      style={{ zIndex: -1 }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Step 1: Buchungsdaten & Fahrzeugauswahl */}
          {step === 1 && (
            <div className="space-y-4 sm:space-y-6">
              {/* Booking Dates Section */}
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 text-foreground">
                  Buchungsdaten
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Wählen Sie Ihren Mietzeitraum und Standorte
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
                  <Label htmlFor="returnDate" className="flex items-center gap-2 font-medium text-sm sm:text-base">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                    Rückgabedatum
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-11 px-4 bg-transparent text-left font-normal",
                          !formData.returnDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.returnDate ? (
                          format(new Date(formData.returnDate + "T12:00:00"), "PPP", { locale: de })
                        ) : (
                          <span>Datum wählen</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.returnDate ? new Date(formData.returnDate + "T12:00:00") : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setFormData((prev) => ({
                              ...prev,
                              returnDate: formatDateForDB(date),
                            }))
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
                  <Label htmlFor="returnTime" className="flex items-center gap-2 font-medium text-sm sm:text-base">
                    <Clock className="w-4 h-4 text-primary" />
                    Rückgabezeit
                  </Label>
                  <Select
                    value={formData.returnTime}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, returnTime: value }))}
                  >
                    <SelectTrigger className="h-11 px-4 bg-transparent">
                      <SelectValue placeholder="Zeit wählen" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {generateTimeOptions().map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
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
                  <Label htmlFor="dropoffAddress" className="flex items-center gap-2 font-medium text-sm sm:text-base">
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

              {/* Load Vehicles Button */}
              {!showVehicles && (
                <Button
                  type="button"
                  onClick={handleLoadVehicles}
                  disabled={!isStep1Valid || loadingCars}
                  className="w-full h-10 sm:h-11"
                >
                  {loadingCars ? "Lade Fahrzeuge..." : "Verfügbare Fahrzeuge anzeigen"}
                </Button>
              )}

              {/* Vehicle Selection - shown after loading */}
              {showVehicles && (
                <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-1 text-foreground">Verfügbare Fahrzeuge</h3>
                    <p className="text-sm text-muted-foreground">
                      {availableCars.length} {availableCars.length === 1 ? "Fahrzeug" : "Fahrzeuge"} für Ihren Zeitraum
                    </p>
                  </div>

                  {loadingCars ? (
                    <div className="py-8 text-center text-muted-foreground">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      Lade verfügbare Fahrzeuge...
                    </div>
                  ) : cars.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      Keine Fahrzeuge für den ausgewählten Zeitraum verfügbar.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {cars.map((car) => {
                        const isSelected = formData.carId === car.id
                        return (
                          <div
                            key={car.id}
                            onClick={() => setFormData((prev) => ({ ...prev, carId: car.id }))}
                            className={`border rounded-lg p-3 cursor-pointer transition-all ${
                              isSelected
                                ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="flex gap-3">
                              {car.image_url && (
                                <img
                                  src={car.image_url || "/placeholder.svg"}
                                  alt={`${car.name} ${car.year}`}
                                  className="w-24 sm:w-28 h-20 object-cover rounded flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-foreground truncate">
                                      {car.name} {car.year}
                                    </h4>
                                    <div className="flex flex-wrap gap-2 sm:gap-3 mt-1 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Users size={12} /> {car.seats}
                                      </span>
                                      <span>{car.transmission}</span>
                                      <span>{car.fuel_type}</span>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <div className="text-base sm:text-lg font-bold text-primary">
                                      CHF {car.price_per_day}
                                    </div>
                                    <div className="text-[10px] sm:text-[11px] text-muted-foreground">pro Tag</div>
                                  </div>
                                </div>
                                {isSelected && (
                                  <div className="mt-2 flex items-center gap-1 text-primary text-xs">
                                    <Check size={14} />
                                    <span className="font-medium">Ausgewählt</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Change dates button */}
                  {cars.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowVehicles(false)
                        setCars([])
                        setFormData((prev) => ({ ...prev, carId: "" }))
                      }}
                      className="w-full h-10 sm:h-11"
                    >
                      Daten ändern
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Extras (was Step 3) */}
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

          {/* Step 3: Fahrerdaten (was Step 4) */}
          {step === 3 && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 text-foreground">Fahrerdaten</h2>
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

          {/* Step 4: Bestätigung (was Step 5) */}
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

                      <div className="border-t-2 border-primary/30 pt-3 mt-3 flex items-center justify-between bg-primary/5 rounded-lg p-3">
                        <span className="text-lg font-bold text-foreground flex items-center gap-2">
                          <DollarSign size={20} className="text-primary" />
                          Gesamtpreis
                        </span>
                        <span className="text-2xl font-bold text-primary">CHF {total.toFixed(2)}</span>
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
        </form>

        <div className="flex gap-3 pt-4 border-t">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={handleBack} className="flex-1 h-10 sm:h-11 bg-transparent">
              Zurück
            </Button>
          )}
          {step < totalSteps ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1 h-10 sm:h-11"
              disabled={step === 1 && !formData.carId}
            >
              Weiter
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting} className="flex-1 h-10 sm:h-11">
              {isSubmitting ? "Wird gebucht..." : "Jetzt buchen"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
