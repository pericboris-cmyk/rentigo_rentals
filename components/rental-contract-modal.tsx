"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, FileText } from "lucide-react"
import { toast } from "sonner"

interface RentalContractModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bookingId: string
}

export function RentalContractModal({ open, onOpenChange, bookingId }: RentalContractModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    startMileage: "",
    endMileage: "",
    pickupTime: "10:00",
    dropoffTime: "10:00",
    lesseeAddress: "",
    lesseeCity: "",
    deposit: "1000",
    includedKm: "200",
    extraKmPrice: "0.50",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/generate-contract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          startMileage: Number.parseInt(formData.startMileage) || 0,
          endMileage: formData.endMileage ? Number.parseInt(formData.endMileage) : undefined,
          deposit: Number.parseFloat(formData.deposit),
          includedKm: Number.parseInt(formData.includedKm),
          extraKmPrice: Number.parseFloat(formData.extraKmPrice),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Convert base64 to blob and download
        const htmlContent = atob(data.contract)
        const blob = new Blob([htmlContent], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = data.filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast.success("Mietvertrag erfolgreich erstellt")
        onOpenChange(false)
      } else {
        const error = await response.json()
        toast.error(error.error || "Fehler beim Erstellen des Mietvertrags")
      }
    } catch (error) {
      console.error("[v0] Error:", error)
      toast.error("Fehler beim Erstellen des Mietvertrags")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <FileText className="text-primary" />
            Mietvertrag generieren
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Kilometer und Fahrzeug</h3>
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground font-medium">Fahrzeugname</p>
                    <p className="font-semibold text-foreground">-</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium">Kennzeichen</p>
                    <p className="font-semibold text-foreground">-</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium">Mietzeitraum</p>
                    <p className="font-semibold text-foreground">-</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium">Abholort</p>
                    <p className="font-semibold text-foreground">-</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium">Rückgabeort</p>
                    <p className="font-semibold text-foreground">-</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startMileage">Kilometerstand bei Übergabe *</Label>
                  <Input
                    id="startMileage"
                    type="number"
                    value={formData.startMileage}
                    onChange={(e) => setFormData({ ...formData, startMileage: e.target.value })}
                    placeholder="50000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endMileage">Kilometerstand bei Rückgabe (optional)</Label>
                  <Input
                    id="endMileage"
                    type="number"
                    value={formData.endMileage}
                    onChange={(e) => setFormData({ ...formData, endMileage: e.target.value })}
                    placeholder="50500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Übergabezeiten</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickupTime">Abholzeit</Label>
                  <Input
                    id="pickupTime"
                    type="time"
                    value={formData.pickupTime}
                    onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="dropoffTime">Rückgabezeit</Label>
                  <Input
                    id="dropoffTime"
                    type="time"
                    value={formData.dropoffTime}
                    onChange={(e) => setFormData({ ...formData, dropoffTime: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Mieter-Adresse</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lesseeAddress">Strasse und Hausnummer</Label>
                  <Input
                    id="lesseeAddress"
                    value={formData.lesseeAddress}
                    onChange={(e) => setFormData({ ...formData, lesseeAddress: e.target.value })}
                    placeholder="Musterstrasse 123"
                  />
                </div>
                <div>
                  <Label htmlFor="lesseeCity">PLZ und Ort</Label>
                  <Input
                    id="lesseeCity"
                    value={formData.lesseeCity}
                    onChange={(e) => setFormData({ ...formData, lesseeCity: e.target.value })}
                    placeholder="8001 Zürich"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Mietbedingungen</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="deposit">Kaution (CHF)</Label>
                  <Input
                    id="deposit"
                    type="number"
                    step="0.01"
                    value={formData.deposit}
                    onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="includedKm">Inkl. km pro Tag</Label>
                  <Input
                    id="includedKm"
                    type="number"
                    value={formData.includedKm}
                    onChange={(e) => setFormData({ ...formData, includedKm: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="extraKmPrice">Preis pro Extra-km (CHF)</Label>
                  <Input
                    id="extraKmPrice"
                    type="number"
                    step="0.01"
                    value={formData.extraKmPrice}
                    onChange={(e) => setFormData({ ...formData, extraKmPrice: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="border-t border-border pt-4 mt-4 flex gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Abbrechen
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} />
                Wird generiert...
              </>
            ) : (
              <>
                <FileText className="mr-2" size={18} />
                Mietvertrag erstellen
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
