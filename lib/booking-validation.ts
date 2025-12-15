export interface ValidationError {
  field: string
  message: string
}

// Helper: Check if name contains numbers or special characters
export function isValidName(name: string): boolean {
  const nameRegex = /^[a-zA-ZäöüÄÖÜéèêëàâîïôûùç\-\s]+$/
  return nameRegex.test(name)
}

// Helper: Check if name is a placeholder/fake name
export function isFakeName(name: string): boolean {
  const lowerName = name.toLowerCase().trim()
  const fakePatterns = ["aaa", "bbb", "test", "fake", "xxx", "asdf", "qwer"]

  // Check for repeated characters (e.g., "aaaa")
  if (/^(.)\1+$/.test(lowerName)) return true

  // Check for common fake patterns
  if (fakePatterns.some((pattern) => lowerName.includes(pattern))) return true

  return false
}

// Helper: Calculate age from birthdate
export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

// Helper: Check if phone number is fake/repeated
export function isFakePhoneNumber(phone: string): boolean {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "")

  // Check for repeated patterns
  const fakePatterns = [
    "000000",
    "111111",
    "222222",
    "333333",
    "444444",
    "555555",
    "666666",
    "777777",
    "888888",
    "999999",
    "123456",
    "654321",
  ]

  if (fakePatterns.some((pattern) => digits.includes(pattern))) return true

  // Check if all digits are the same
  if (/^(\d)\1+$/.test(digits)) return true

  return false
}

// Helper: Check if email is fake
export function isFakeEmail(email: string): boolean {
  const lowerEmail = email.toLowerCase()
  const fakePatterns = [
    "test@test",
    "abc@abc",
    "fake@fake",
    "asdf@asdf",
    "example@example",
    "123@123",
    "aaa@aaa",
    "xxx@xxx",
  ]

  return fakePatterns.some((pattern) => lowerEmail.includes(pattern))
}

// Helper: Check if Swiss postal code is valid (4 digits)
export function isValidSwissPostalCode(postalCode: string): boolean {
  return /^\d{4}$/.test(postalCode)
}

// Validate birthdate
export function validateBirthDate(birthDate: string, fieldName = "Geburtsdatum"): ValidationError | null {
  if (!birthDate) {
    return { field: fieldName, message: `${fieldName} ist erforderlich` }
  }

  const birth = new Date(birthDate)
  const today = new Date()

  // Check if date is in the future
  if (birth > today) {
    return { field: fieldName, message: `${fieldName} darf nicht in der Zukunft liegen` }
  }

  // Check if person is at least 18 years old
  const age = calculateAge(birthDate)
  if (age < 18) {
    return { field: fieldName, message: `Sie müssen mindestens 18 Jahre alt sein (aktuell: ${age} Jahre)` }
  }

  return null
}

// Validate name
export function validateName(name: string, fieldName: string): ValidationError | null {
  if (!name || name.trim().length === 0) {
    return { field: fieldName, message: `${fieldName} ist erforderlich` }
  }

  if (!isValidName(name)) {
    return { field: fieldName, message: `${fieldName} darf keine Zahlen oder Sonderzeichen enthalten` }
  }

  if (isFakeName(name)) {
    return { field: fieldName, message: `Bitte geben Sie einen realistischen ${fieldName} ein` }
  }

  if (name.trim().length < 2) {
    return { field: fieldName, message: `${fieldName} muss mindestens 2 Zeichen lang sein` }
  }

  return null
}

// Validate phone number
export function validatePhoneNumber(phone: string): ValidationError | null {
  if (!phone || phone.trim().length === 0) {
    return { field: "Telefon", message: "Telefonnummer ist erforderlich" }
  }

  // Remove all non-digit characters for validation
  const digits = phone.replace(/\D/g, "")

  // Check for fake patterns
  if (isFakePhoneNumber(phone)) {
    return { field: "Telefon", message: "Bitte geben Sie eine gültige Telefonnummer ein" }
  }

  // Check minimum length after country code (at least 8 digits)
  if (digits.length < 10) {
    // +41 (2) + 8 digits = 10
    return { field: "Telefon", message: "Telefonnummer muss mindestens 8 Ziffern nach der Landesvorwahl enthalten" }
  }

  return null
}

// Validate email
export function validateEmail(email: string): ValidationError | null {
  if (!email || email.trim().length === 0) {
    return { field: "E-Mail", message: "E-Mail-Adresse ist erforderlich" }
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { field: "E-Mail", message: "Bitte geben Sie eine gültige E-Mail-Adresse ein" }
  }

  // Check for fake emails
  if (isFakeEmail(email)) {
    return { field: "E-Mail", message: "Bitte geben Sie eine echte E-Mail-Adresse ein" }
  }

  return null
}

// Validate license issue date
export function validateLicenseIssueDate(
  issueDate: string,
  birthDate: string,
  fieldName = "Führerschein-Ausstellungsdatum",
): ValidationError | null {
  if (!issueDate) {
    return { field: fieldName, message: `${fieldName} ist erforderlich` }
  }

  const issue = new Date(issueDate)
  const today = new Date()
  const birth = new Date(birthDate)

  // Check if date is in the future
  if (issue > today) {
    return { field: fieldName, message: `${fieldName} darf nicht in der Zukunft liegen` }
  }

  // Check if at least 1 year ago
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  if (issue > oneYearAgo) {
    return { field: fieldName, message: `Führerschein muss mindestens 1 Jahr alt sein` }
  }

  // Check if issue date is after 18th birthday
  const eighteenthBirthday = new Date(birth)
  eighteenthBirthday.setFullYear(eighteenthBirthday.getFullYear() + 18)

  if (issue < eighteenthBirthday) {
    return { field: fieldName, message: `Führerschein kann nicht vor dem 18. Geburtstag ausgestellt worden sein` }
  }

  return null
}

// Helper functions for advanced booking date/time logic with 15:00 cutoff
// Get the earliest allowed pickup date considering 15:00 cutoff
export function getEarliestPickupDate(): Date {
  const now = new Date()
  const currentHour = now.getHours()

  // After 15:00, earliest is +3 days, otherwise +2 days
  const daysToAdd = currentHour >= 15 ? 3 : 2

  const earliest = new Date()
  earliest.setDate(earliest.getDate() + daysToAdd)
  earliest.setHours(0, 0, 0, 0)

  return earliest
}

// Get the earliest allowed pickup time for a specific date
export function getEarliestPickupTimeForDate(date: Date): string | null {
  const now = new Date()
  const earliest = getEarliestPickupDate()

  // Normalize dates for comparison
  const dateOnly = new Date(date)
  dateOnly.setHours(0, 0, 0, 0)
  const earliestOnly = new Date(earliest)
  earliestOnly.setHours(0, 0, 0, 0)

  // If it's not the earliest possible date, all times are allowed
  if (dateOnly.getTime() !== earliestOnly.getTime()) {
    return null // No restriction
  }

  // On the earliest date, calculate 48h from now
  const minDateTime = new Date(now)
  minDateTime.setHours(minDateTime.getHours() + 48)

  // Return the hour (e.g., "21:00")
  const hour = minDateTime.getHours()
  return `${hour.toString().padStart(2, "0")}:00`
}

// Check if a date is disabled based on cutoff rules
export function isDateDisabledForBooking(date: Date): boolean {
  const earliest = getEarliestPickupDate()
  const dateOnly = new Date(date)
  dateOnly.setHours(0, 0, 0, 0)
  const earliestOnly = new Date(earliest)
  earliestOnly.setHours(0, 0, 0, 0)

  return dateOnly < earliestOnly
}

// Get available time slots for a specific date
export function getAvailableTimeSlots(date: Date): string[] {
  const allSlots = [
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

  const earliestTime = getEarliestPickupTimeForDate(date)

  // If no restriction, return all slots
  if (!earliestTime) {
    return allSlots
  }

  // Filter slots to only those >= earliest time
  return allSlots.filter((slot) => slot >= earliestTime)
}

// Validate booking dates with advanced rules
export function validateBookingDates(
  pickupDate: string,
  pickupTime: string,
  returnDate: string,
  returnTime: string,
): ValidationError | null {
  if (!pickupDate) {
    return { field: "Abholdatum", message: "Abholdatum ist erforderlich" }
  }

  if (!returnDate) {
    return { field: "Rückgabedatum", message: "Rückgabedatum ist erforderlich" }
  }

  if (!pickupTime) {
    return { field: "Abholzeit", message: "Abholzeit ist erforderlich" }
  }

  if (!returnTime) {
    return { field: "Rückgabezeit", message: "Rückgabezeit ist erforderlich" }
  }

  // Combine date and time for accurate validation
  const pickupDateTime = new Date(`${pickupDate}T${pickupTime}:00`)
  const returnDateTime = new Date(`${returnDate}T${returnTime}:00`)
  const now = new Date()

  const earliest = getEarliestPickupDate()
  const pickupDateOnly = new Date(pickupDate + "T00:00:00")
  pickupDateOnly.setHours(0, 0, 0, 0)
  const earliestOnly = new Date(earliest)
  earliestOnly.setHours(0, 0, 0, 0)

  // Check if pickup date is before earliest allowed date
  if (pickupDateOnly < earliestOnly) {
    const currentHour = now.getHours()
    if (currentHour >= 15) {
      return {
        field: "Abholdatum",
        message: "Nach 15:00 Uhr können Buchungen frühestens für übernächsten Tag gemacht werden (in 3 Tagen).",
      }
    } else {
      return {
        field: "Abholdatum",
        message: "Buchungen müssen mindestens 2 Tage im Voraus erfolgen. Frühester Abholtermin ist übermorgen.",
      }
    }
  }

  // If it's the earliest date, check if time is valid
  if (pickupDateOnly.getTime() === earliestOnly.getTime()) {
    const earliestTime = getEarliestPickupTimeForDate(pickupDateOnly)
    if (earliestTime && pickupTime < earliestTime) {
      return {
        field: "Abholzeit",
        message: `Am frühesten Tag müssen mindestens 48 Stunden zwischen jetzt und Abholung liegen. Früheste Zeit: ${earliestTime} Uhr`,
      }
    }
  }

  // Check if pickup date/time is in the past
  if (pickupDateTime < now) {
    return { field: "Abholdatum", message: "Abholdatum und -zeit dürfen nicht in der Vergangenheit liegen" }
  }

  // Check if return date/time is in the past
  if (returnDateTime < now) {
    return { field: "Rückgabedatum", message: "Rückgabedatum und -zeit dürfen nicht in der Vergangenheit liegen" }
  }

  // Check if return date/time is after pickup date/time
  if (returnDateTime <= pickupDateTime) {
    return { field: "Rückgabedatum", message: "Rückgabedatum und -zeit müssen nach Abholdatum und -zeit liegen" }
  }

  return null
}

// Validate location address
export function validateLocationAddress(address: string, fieldName: string): ValidationError | null {
  if (!address || address.trim().length === 0) {
    return { field: fieldName, message: `${fieldName} ist erforderlich` }
  }

  if (address.trim().length < 5) {
    return { field: fieldName, message: `${fieldName} muss mindestens 5 Zeichen lang sein` }
  }

  return null
}

// Check if two drivers are identical
export function areDriversIdentical(driver1: any, driver2: any): boolean {
  if (!driver1 || !driver2) return false

  // Compare all fields (except licenseNumber which was removed)
  return (
    driver1.firstName.toLowerCase().trim() === driver2.firstName.toLowerCase().trim() &&
    driver1.lastName.toLowerCase().trim() === driver2.lastName.toLowerCase().trim() &&
    driver1.birthDate === driver2.birthDate
  )
}

// Rate limiting storage (in-memory for simplicity, could use Redis in production)
const bookingAttempts = new Map<string, { count: number; firstAttempt: number }>()

export function checkRateLimit(identifier: string): { allowed: boolean; message?: string } {
  const now = Date.now()
  const windowMs = 10 * 60 * 1000 // 10 minutes
  const maxAttempts = 3

  const attempts = bookingAttempts.get(identifier)

  if (!attempts) {
    bookingAttempts.set(identifier, { count: 1, firstAttempt: now })
    return { allowed: true }
  }

  // Reset if window has passed
  if (now - attempts.firstAttempt > windowMs) {
    bookingAttempts.set(identifier, { count: 1, firstAttempt: now })
    return { allowed: true }
  }

  // Check if limit exceeded
  if (attempts.count >= maxAttempts) {
    const remainingTime = Math.ceil((windowMs - (now - attempts.firstAttempt)) / 1000 / 60)
    return {
      allowed: false,
      message: `Zu viele Buchungsversuche. Bitte versuchen Sie es in ${remainingTime} Minuten erneut.`,
    }
  }

  // Increment counter
  attempts.count++
  return { allowed: true }
}
