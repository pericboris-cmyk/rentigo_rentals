"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  name?: string
  required?: boolean
  className?: string
}

const countries = [
  { code: "+41", flag: "🇨🇭", name: "Schweiz" },
  { code: "+49", flag: "🇩🇪", name: "Deutschland" },
  { code: "+43", flag: "🇦🇹", name: "Österreich" },
  { code: "+33", flag: "🇫🇷", name: "Frankreich" },
  { code: "+39", flag: "🇮🇹", name: "Italien" },
  { code: "+34", flag: "🇪🇸", name: "Spanien" },
  { code: "+44", flag: "🇬🇧", name: "Vereinigtes Königreich" },
  { code: "+1", flag: "🇺🇸", name: "USA" },
  { code: "+1", flag: "🇨🇦", name: "Kanada" },
  { code: "+31", flag: "🇳🇱", name: "Niederlande" },
  { code: "+32", flag: "🇧🇪", name: "Belgien" },
  { code: "+45", flag: "🇩🇰", name: "Dänemark" },
  { code: "+46", flag: "🇸🇪", name: "Schweden" },
  { code: "+47", flag: "🇳🇴", name: "Norwegen" },
  { code: "+48", flag: "🇵🇱", name: "Polen" },
  { code: "+351", flag: "🇵🇹", name: "Portugal" },
  { code: "+30", flag: "🇬🇷", name: "Griechenland" },
  { code: "+420", flag: "🇨🇿", name: "Tschechien" },
  { code: "+36", flag: "🇭🇺", name: "Ungarn" },
  { code: "+40", flag: "🇷🇴", name: "Rumänien" },
  { code: "+359", flag: "🇧🇬", name: "Bulgarien" },
  { code: "+385", flag: "🇭🇷", name: "Kroatien" },
  { code: "+386", flag: "🇸🇮", name: "Slowenien" },
  { code: "+421", flag: "🇸🇰", name: "Slowakei" },
  { code: "+372", flag: "🇪🇪", name: "Estland" },
  { code: "+371", flag: "🇱🇻", name: "Lettland" },
  { code: "+370", flag: "🇱🇹", name: "Litauen" },
  { code: "+353", flag: "🇮🇪", name: "Irland" },
  { code: "+358", flag: "🇫🇮", name: "Finnland" },
  { code: "+7", flag: "🇷🇺", name: "Russland" },
  { code: "+380", flag: "🇺🇦", name: "Ukraine" },
  { code: "+90", flag: "🇹🇷", name: "Türkei" },
  { code: "+20", flag: "🇪🇬", name: "Ägypten" },
  { code: "+27", flag: "🇿🇦", name: "Südafrika" },
  { code: "+91", flag: "🇮🇳", name: "Indien" },
  { code: "+86", flag: "🇨🇳", name: "China" },
  { code: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "+82", flag: "🇰🇷", name: "Südkorea" },
  { code: "+65", flag: "🇸🇬", name: "Singapur" },
  { code: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "+66", flag: "🇹🇭", name: "Thailand" },
  { code: "+84", flag: "🇻🇳", name: "Vietnam" },
  { code: "+62", flag: "🇮🇩", name: "Indonesien" },
  { code: "+63", flag: "🇵🇭", name: "Philippinen" },
  { code: "+61", flag: "🇦🇺", name: "Australien" },
  { code: "+64", flag: "🇳🇿", name: "Neuseeland" },
  { code: "+52", flag: "🇲🇽", name: "Mexiko" },
  { code: "+55", flag: "🇧🇷", name: "Brasilien" },
  { code: "+54", flag: "🇦🇷", name: "Argentinien" },
  { code: "+56", flag: "🇨🇱", name: "Chile" },
  { code: "+57", flag: "🇨🇴", name: "Kolumbien" },
  { code: "+51", flag: "🇵🇪", name: "Peru" },
  { code: "+971", flag: "🇦🇪", name: "Vereinigte Arabische Emirate" },
  { code: "+966", flag: "🇸🇦", name: "Saudi-Arabien" },
  { code: "+972", flag: "🇮🇱", name: "Israel" },
]

export default function PhoneInput({ value, onChange, name, required, className }: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(countries[0])

  // Extract country code and number from value
  const currentCode = value.match(/^\+\d+/)?.[0] || selectedCountry.code
  const phoneNumber = value.replace(/^\+\d+\s*/, "")

  const handleCountrySelect = (country: (typeof countries)[0]) => {
    setSelectedCountry(country)
    onChange(`${country.code} ${phoneNumber}`)
    setIsOpen(false)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const number = e.target.value.replace(/[^\d\s]/g, "")
    onChange(`${selectedCountry.code} ${number}`)
  }

  return (
    <div className={`flex flex-col sm:flex-row gap-2 ${className}`}>
      {/* Country Code Dropdown */}
      <div className="relative w-full sm:w-auto">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between gap-2 px-3 py-2.5 h-[44px] w-full sm:w-auto border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none">{selectedCountry.flag}</span>
            <span className="text-sm font-medium">{selectedCountry.code}</span>
          </div>
          <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full left-0 mt-1 w-full sm:w-64 bg-popover border border-border rounded-md shadow-lg py-1 z-50 max-h-64 overflow-y-auto">
              {countries.map((country, index) => (
                <button
                  key={`${country.code}-${country.name}-${index}`}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className="flex items-center gap-3 w-full px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                >
                  <span className="text-lg leading-none">{country.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{country.name}</p>
                    <p className="text-xs text-muted-foreground">{country.code}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Phone Number Input */}
      <input
        type="tel"
        name={name}
        value={phoneNumber}
        onChange={handlePhoneChange}
        placeholder="79 123 45 67"
        required={required}
        className="flex h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  )
}
