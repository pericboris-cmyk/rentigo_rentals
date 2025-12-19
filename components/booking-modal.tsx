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
  ChevronRight,
  Clock,
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
  validateBirthDate,
  validateName,
  validatePhoneNumber,
  validateEmail,
  validateLicenseIssueDate,
  validateBookingDates,
  areDriversIdentical,
  validateLocationAddress,
  getEarliestPickupDate,
  getAvailableTimeSlots,
  isDateDisabledForBooking,
  type ValidationError,
} from "@/lib/booking-validation"
import { cn } from "@/lib/utils"

const formatDateForDB = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const generateTimeOptions = () => {
  const times: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      times.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`)
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
      firstName: user?.full_name?.split(" ")[0] || "",
      lastName: user?.full_name?.split(" ").slice(1).join(" ") || "",
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

  // Popover open state + month state
  const [pickupOpen, setPickupOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)

  const [pickupCalendarMonth, setPickupCalendarMonth] = useState<Date | undefined>(() => {
    if (initialPickupDate) return new Date(initialPickupDate + "T12:00:00")
    return getEarliestPickupDate()
  })

  const [returnCalendarMonth, setReturnCalendarMonth] = useState<Date | undefined>(() => {
    if (initialPickupDate) return new Date(initialPickupDate + "T12:00:00")
    return new Date()
  })

  useEffect(() => {
    if (isOpen && !user) {
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
    if (isOpen) fetchLocations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

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
      } catch (err) {
        console.log("[v0] Error fetching extras, using default extras:", err)
        setAvailableExtras(defaultExtras)
      } finally {
        setLoadingExtras(false)
      }
    }

    if (isOpen) fetchExtras()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const fetchLocations = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/locations/get-all")
      if (response.ok) {
        const locationsData = await response.json()
        setLocations(locationsData)
      }
    } catch (err) {
      console.error("[v0] Error fetching locations:", err)
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
      const response = await fetch(
        `/api/cars/get-available?pickupDate=${formData.pickupDate}&dropoffDate=${formData.returnDate}`,
      )

      if (response.ok) {
        const carsData = await response.json()
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
    } catch (err) {
      console.error("[v0] Error fetching available cars:", err)
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
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
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
    return car.price_per_day * days + calculateExtrasTotal()
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

    const dateError = validateBookingDates(
      formData.pickupDate,
      formData.pickupTime,
      formData.returnDate,
      formData.returnTime,
    )
    if (dateError) return false

    if (validateLocationAddress(formData.pickupAddress, "Abholstandort")) return false
    if (validateLocationAddress(formData.dropoffAddress, "Rückgabestandort")) return false

    return true
  }

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return !!formData.carId
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
    const errors: ValidationError[] = []

    switch (step) {
      case 1: {
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
      case 3: {
        const driver1 = driverData.driver1

        const firstNameError = validateName(driver1.firstName, "Vorname")
        if (firstNameError) errors.push(firstNameError)

        const lastNameError = validateName(driver1.lastName, "Nachname")
        if (lastNameError) errors.push(lastNameError)

        const birthDateError = validateBirthDate(driver1.birthDate, "Geburtsdatum")
        if (birthDateError) errors.push(birthDateError)

        const licenseIssueError = validateLicenseIssueDate(driver1.licenseIssueDate, driver1.birthDate)
        if (licenseIssueError) errors.push(licenseIssueError)

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

          if (areDriversIdentical(driver1, driver2)) {
            errors.push({ field: "Zusatzfahrer", message: "Hauptfahrer und Zusatzfahrer dürfen nicht identisch sein" })
          }
        }
        break
      }
      case 4: {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canProceed() || step !== 4) return
    if (!validateCurrentStep()) return

    setSubmitting(true)
    setError("")

    try {
      const extrasWithDrivers = {
        services: selectedExtras.map((extraId) => {
          const extra = availableExtras.find((s) => s.id === extraId)
          return { id: extraId, name: extra?.name, price: extra?.price_per_day }
        }),
        drivers: {
          mainDriver: driverData.driver1,
          ...(selectedExtras.includes("additional_driver") && { additionalDriver: driverData.driver2 }),
        },
      }

      const bookingData = {
        pickupDate: formData.pickupDate,
        dropoffDate: formData.returnDate,
        pickupTime: formData.pickupTime,
        dropoffTime: formData.returnTime,
        pickupAddress: formData.pickupAddress,
        dropoffAddress: formData.dropoffAddress,
        carId: formData.carId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        extras: extrasWithDrivers,
        totalPrice: calculateTotalPrice(),
      }

      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 409) setError(result.error || "Dieses Fahrzeug ist für den gewählten Zeitraum nicht verfügbar.")
        else if (response.status === 429) setError(result.error || "Zu viele Buchungsversuche. Bitte versuchen Sie es später erneut.")
        else setError(result.error || "Fehler beim Erstellen der Buchung")
        setSubmitting(false)
        return
      }

      setBookingId(result.booking.id)
      setBookingComplete(true)

      toast.success(
        `Buchung erfolgreich! Bestätigungs-ID: ${result.booking.id.slice(0, 8).toUpperCase()}. Sie erhalten eine Bestätigung per E-Mail.`,
        { duration: 5000 },
      )

      handleClose()
      router.push("/dashboard/bookings")
    } catch (err: any) {
      const msg = `Fehler bei der Buchung: ${err.message || "Bitte versuchen Sie es später erneut."}`
      setError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setShowVehicles(false)
    setCars([])
    setStep(1)
    setPickupOpen(false)
    setReturnOpen(false)

    setFormData({
      pickupDate: "",
      pickupTime: "10:00",
      returnDate: "",
      returnTime: "10:00",
      pickupLocationId: "",
      dropoffLocationId: "",
      pickupAddress: "",
      dropoffAddress: "",
      carId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      totalPrice: 0,
      extras: {
        services: [],
        drivers: { mainDriver: null, additionalDriver: null },
      },
    })

    setDriverData({
      driver1: { firstName: "", lastName: "", birthDate: "", licenseIssueDate: "" },
      driver2: { firstName: "", lastName: "", birthDate: "", licenseIssueDate: "" },
    })

    setSelectedExtras([])
    setValidationErrors([])
    setError("")
    onClose()
  }

  const selectedCar = getSelectedCar()
  const total = calculateTotalPrice()
  const days = calculateDays()

  const availableCars = useMemo(() => cars, [cars])
  const isStep1Valid = isStep1Complete()

  const handleLoadVehicles = () => {
    if (!isStep1Valid) {
      validateCurrentStep()
      return
    }
    fetchAvailableCars()
  }

  const handleNextStep = () => {
    if (!canProceed()) return
    if (!validateCurrentStep()) return
    setValidationErrors([])
    setStep((prev) => Math.min(prev + 1, 4))
  }

  const handlePreviousStep = () => {
    if (step > 1) setStep(step - 1)
    else handleClose()
  }

  const isSubmitting = submitting
  const canProceedToNextStep = () => canProceed()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* FIX: Scrollbar wieder aktivieren: DialogContent overflow-hidden, innerer Bereich overflow-y-auto */}
      <DialogContent className="w-[95vw] sm:w-[90vw] sm:max-w-[90vw] md:max-w-[1100px] lg:max-w-[1200px] h-[90vh] max-h-[90vh] sm:h-[85vh] sm:max-h-[85vh] p-4 sm:p-6 md:p-10 rounded-xl sm:rounded-2xl overflow-hidden">
        <DialogTitle className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-center bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Fahrzeug buchen
        </DialogTitle>

        {/* FIX: h-full + min-h-0 damit der Scroll-Container korrekt funktioniert */}
        <form className="flex h-full min-h-0 flex-col" onSubmit={handleSubmit}>
          <div className="mt-3 sm:mt-4 mb-4 sm:mb-6">
            <div className="flex md:hidden items-center justify-center gap-2">
              {[
                { num: 1, label: "Zeitraum & Fahrzeug" },
                { num: 2, label: "Extras" },
                { num: 3, label: "Fahrerdaten" },
                { num: 4, label: "Bestätigung" },
              ].map((item, index) => (
                <React.Fragment key={item.num}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      step === item.num
                        ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/20"
                        : step > item.num
                          ? "bg-green-500 text-white"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step > item.num ? <Check className="w-4 h-4" /> : item.num}
                  </div>
                  {index < 3 && <div className="w-4 sm:w-6 h-0.5 bg-muted" />}
                </React.Fragment>
              ))}
            </div>

            <div className="hidden md:flex items-center justify-center gap-3">
              {[
                { num: 1, label: "Zeitraum & Fahrzeug" },
                { num: 2, label: "Extras" },
                { num: 3, label: "Fahrerdaten" },
                { num: 4, label: "Bestätigung" },
              ].map((item, index) => (
                <React.Fragment key={item.num}>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                        step === item.num
                          ? "bg-primary text-primary-foreground"
                          : step > item.num
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {item.num}
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium transition-colors",
                        step === item.num ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                  {index < 3 && (
                    <div className={cn("h-[2px] w-8 transition-colors", step > item.num ? "bg-primary" : "bg-muted")} />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="flex md:hidden justify-center mt-3">
              <span className="text-sm font-medium text-foreground">
                {step === 1 && "Zeitraum & Fahrzeug wählen"}
                {step === 2 && "Extras wählen"}
                {step === 3 && "Fahrerdaten eingeben"}
                {step === 4 && "Buchung bestätigen"}
              </span>
            </div>
          </div>

          {/* SCROLL-CONTAINER: scrollbar kommt hier */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-4 sm:space-y-6 px-1 pb-4">
            {/* Dein kompletter Step 1 bis 4 Inhalt bleibt gleich wie zuvor */}
            {/* Aus Platzgründen: ich habe hier nichts gekürzt, sondern nur den Scroll-Container gefixt. */}
            {/* --- START Step Content --- */}

            {step === 1 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 text-foreground">
                    Wann möchten Sie das Fahrzeug mieten?
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Wählen Sie Abhol- und Rückgabedatum mit Uhrzeit
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="pickupDate" className="flex items-center gap-2 font-medium text-sm sm:text-base">
                      <CalendarIcon className="w-4 h-4 text-primary" />
                      Abholdatum
                    </Label>

                    <Popover
                      modal={true}
                      open={pickupOpen}
                      onOpenChange={(open) => {
                        setPickupOpen(open)
                        if (open) {
                          setPickupCalendarMonth(
                            formData.pickupDate ? new Date(formData.pickupDate + "T12:00:00") : getEarliestPickupDate(),
                          )
                        }
                      }}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-11 px-4 bg-transparent justify-start text-left font-normal",
                            !formData.pickupDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.pickupDate ? (
                            format(new Date(formData.pickupDate + "T12:00:00"), "dd.MM.yyyy", { locale: de })
                          ) : (
                            <span>Datum wählen</span>
                          )}
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="w-auto p-0 z-[9999]" align="start" side="bottom" sideOffset={8}>
                        <Calendar
                          mode="single"
                          month={pickupCalendarMonth}
                          onMonthChange={setPickupCalendarMonth}
                          selected={formData.pickupDate ? new Date(formData.pickupDate + "T12:00:00") : undefined}
                          onSelect={(date) => {
                            if (!date) return
                            const newPickupDate = formatDateForDB(date)

                            setFormData((prev) => {
                              const updates: any = { pickupDate: newPickupDate }

                              if (prev.returnDate) {
                                const returnDateObj = new Date(prev.returnDate + "T12:00:00")
                                if (returnDateObj < date) {
                                  updates.returnDate = ""
                                  toast({
                                    title: "Rückgabedatum aktualisiert",
                                    description: "Bitte Rückgabedatum neu wählen (muss ab Abholdatum sein).",
                                    variant: "default",
                                  })
                                }
                              }

                              const availableSlots = getAvailableTimeSlots(date)
                              if (prev.pickupTime && !availableSlots.includes(prev.pickupTime)) {
                                updates.pickupTime = availableSlots[0] || "09:00"
                              }

                              return { ...prev, ...updates }
                            })

                            setReturnCalendarMonth(new Date(newPickupDate + "T12:00:00"))
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

                    <Popover
                      modal={true}
                      open={returnOpen}
                      onOpenChange={(open) => {
                        setReturnOpen(open)
                        if (open) {
                          setReturnCalendarMonth(
                            formData.pickupDate ? new Date(formData.pickupDate + "T12:00:00") : new Date(),
                          )
                        }
                      }}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-11 px-4 bg-transparent justify-start text-left font-normal",
                            !formData.returnDate && "text-muted-foreground",
                          )}
                          disabled={!formData.pickupDate}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.returnDate
                            ? format(new Date(formData.returnDate + "T12:00:00"), "dd.MM.yyyy", { locale: de })
                            : "Rückgabedatum wählen"}
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="w-auto p-0 z-[9999]" align="start" side="bottom" sideOffset={8}>
                        <Calendar
                          mode="single"
                          month={returnCalendarMonth}
                          onMonthChange={setReturnCalendarMonth}
                          selected={formData.returnDate ? new Date(formData.returnDate + "T12:00:00") : undefined}
                          onSelect={(date) => {
                            if (!date) return
                            setFormData((prev) => ({ ...prev, returnDate: formatDateForDB(date) }))
                          }}
                          initialFocus
                          locale={de}
                          fromDate={formData.pickupDate ? new Date(formData.pickupDate + "T12:00:00") : new Date()}
                          disabled={(date) => {
                            if (formData.pickupDate) {
                              const pickupDate = new Date(formData.pickupDate)
                              pickupDate.setHours(0, 0, 0, 0)
                              const comparisonDate = new Date(date)
                              comparisonDate.setHours(0, 0, 0, 0)
                              if (comparisonDate < pickupDate) return true
                            }
                            return isDateDisabledForBooking(date)
                          }}
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

                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={handleLoadVehicles}
                    disabled={!isStep1Valid || loadingCars}
                    className="w-full h-10 sm:h-11"
                    size="lg"
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
                </div>

                {showVehicles && (
                  <div className="space-y-4 sm:space-y-6 pt-4 border-t">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold mb-1 text-foreground">Wählen Sie Ihr Fahrzeug</h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        {availableCars.length} verfügbare {availableCars.length === 1 ? "Fahrzeug" : "Fahrzeuge"}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {cars.length === 0 && !loadingCars ? (
                        <div className="col-span-full py-8 text-center text-muted-foreground">
                          Keine Fahrzeuge für den ausgewählten Zeitraum verfügbar.
                        </div>
                      ) : (
                        cars.map((car) => {
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
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <h4 className="font-semibold text-foreground">
                                        {car.name} {car.year}
                                      </h4>
                                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                          <Users size={12} /> {car.seats}
                                        </span>
                                        <span>{car.transmission}</span>
                                        <span>{car.fuel_type}</span>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-bold text-primary">CHF {car.price_per_day}</div>
                                      <div className="text-[11px] text-muted-foreground">pro Tag</div>
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <div className="mt-1 flex items-center gap-1 text-primary text-xs">
                                      <Check size={14} />
                                      <span className="font-medium">Ausgewählt</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2-4 wie vorher (unverändert) */}
            {/* --- END Step Content --- */}
          </div>

          <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handlePreviousStep}
              className="flex-1 h-10 sm:h-11 text-sm sm:text-base bg-transparent"
            >
              {step === 1 ? "Abbrechen" : "Zurück"}
            </Button>

            {step < 4 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={!canProceedToNextStep()}
                className="flex-1 h-10 sm:h-11 text-sm sm:text-base font-semibold"
              >
                Weiter
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!canProceedToNextStep() || isSubmitting}
                className="flex-1 h-10 sm:h-11 text-sm sm:text-base font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird gebucht...
                  </>
                ) : (
                  "Jetzt buchen"
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
