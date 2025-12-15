"use client"

import type React from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

interface Car {
  id: string
  name: string
  model: string
  transmission: string
  seats: number
  price_per_day: number
  image_url: string | null
  available: boolean
  mileage?: number
  year?: number
  fuel_type?: string
  created_at: string
  updated_at: string
  license_plate?: string
  color?: string
}

export default function AdminCarsPage() {
  const { user, authUser, loading } = useAuth()
  const [cars, setCars] = useState<Car[]>([])
  const [loadingCars, setLoadingCars] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCar, setEditingCar] = useState<Car | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [carToDelete, setCarToDelete] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    transmission: "Automatik",
    seats: "5",
    price_per_day: "",
    image_url: "",
    available: true,
    mileage: "",
    year: new Date().getFullYear().toString(),
    fuel_type: "Benzin",
    license_plate: "",
    color: "",
  })

  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const fetchCars = async () => {
    setLoadingCars(true)
    try {
      const response = await fetch("/api/admin/cars")
      if (response.ok) {
        const data = await response.json()
        setCars(data.cars)
      }
    } catch (error) {
      console.error("Error fetching cars:", error)
    } finally {
      setLoadingCars(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchCars()
    }
  }, [user])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Bitte wählen Sie eine Bilddatei")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Bild darf maximal 5MB groß sein")
      return
    }

    setImageFile(file)

    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setFormData({ ...formData, image_url: e.target?.result as string })
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.model || !formData.price_per_day) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus")
      return
    }

    const loadingToast = toast.loading(editingCar ? "Fahrzeug wird aktualisiert..." : "Fahrzeug wird hinzugefügt...")

    console.log("[v0] Submitting car form:", { editingCar: editingCar?.id, formData })

    try {
      if (editingCar) {
        console.log("[v0] Updating car:", editingCar.id)
        const response = await fetch(`/api/admin/cars/${editingCar.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        console.log("[v0] Update response status:", response.status)
        const responseData = await response.json()
        console.log("[v0] Update response data:", responseData)

        if (response.ok) {
          toast.success("Fahrzeug erfolgreich aktualisiert!", { id: loadingToast })
          resetForm()
          await fetchCars()
        } else {
          console.error("[v0] Update failed:", responseData)
          toast.error(responseData.error || "Fehler beim Aktualisieren des Fahrzeugs", { id: loadingToast })
        }
      } else {
        console.log("[v0] Creating new car")
        const response = await fetch("/api/admin/cars", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        console.log("[v0] Create response status:", response.status)
        const responseData = await response.json()
        console.log("[v0] Create response data:", responseData)

        if (response.ok) {
          toast.success("Fahrzeug erfolgreich hinzugefügt!", { id: loadingToast })
          resetForm()
          await fetchCars()
        } else {
          console.error("[v0] Create failed:", responseData)
          toast.error(responseData.error || "Fehler beim Hinzufügen des Fahrzeugs", { id: loadingToast })
        }
      }
    } catch (error) {
      console.error("[v0] Error saving car:", error)
      toast.error("Fehler beim Speichern des Fahrzeugs", { id: loadingToast })
    }
  }

  const handleDelete = async (carId: string) => {
    console.log("[v0] Deleting car:", carId)

    const loadingToast = toast.loading("Fahrzeug wird gelöscht...")

    try {
      const response = await fetch(`/api/admin/cars/${carId}`, {
        method: "DELETE",
      })

      console.log("[v0] Delete response status:", response.status)
      const responseData = await response.json()
      console.log("[v0] Delete response data:", responseData)

      if (response.ok) {
        toast.success("Fahrzeug erfolgreich gelöscht!", { id: loadingToast })
        await fetchCars()
      } else {
        console.error("[v0] Delete failed:", responseData)
        toast.error(responseData.error || "Fehler beim Löschen des Fahrzeugs", { id: loadingToast })
      }
    } catch (error) {
      console.error("[v0] Error deleting car:", error)
      toast.error("Fehler beim Löschen des Fahrzeugs", { id: loadingToast })
    }
  }

  const startEdit = (car: Car) => {
    setEditingCar(car)
    setFormData({
      name: car.name,
      model: car.model,
      transmission: car.transmission,
      seats: car.seats.toString(),
      price_per_day: car.price_per_day.toString(),
      image_url: car.image_url || "",
      available: car.available,
      mileage: car.mileage?.toString() || "0",
      year: car.year?.toString() || new Date().getFullYear().toString(),
      fuel_type: car.fuel_type || "Benzin",
      license_plate: (car as any).license_plate || "",
      color: (car as any).color || "",
    })
    setShowAddForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      model: "",
      transmission: "Automatik",
      seats: "5",
      price_per_day: "",
      image_url: "",
      available: true,
      mileage: "",
      year: new Date().getFullYear().toString(),
      fuel_type: "Benzin",
      license_plate: "",
      color: "",
    })
    setEditingCar(null)
    setShowAddForm(false)
    setImageFile(null)
  }

  const openDeleteDialog = (carId: string) => {
    setCarToDelete(carId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (carToDelete) {
      handleDelete(carToDelete)
    }
    setDeleteDialogOpen(false)
    setCarToDelete(null)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Wird geladen...</p>
        </div>
      </main>
    )
  }

  if (!authUser || !user) {
    redirect("/login")
  }

  if (user.role !== "admin") {
    redirect("/")
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link href="/admin" className="text-primary hover:underline inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Zurück zum Admin Dashboard
            </Link>
          </div>

          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Fahrzeugverwaltung</h1>
              <p className="text-muted-foreground">Verwalten Sie Ihren Fahrzeugbestand</p>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
              <Plus size={20} />
              Neues Fahrzeug
            </Button>
          </div>

          {showAddForm && (
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-foreground mb-6">
                {editingCar ? "Fahrzeug bearbeiten" : "Neues Fahrzeug hinzufügen"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Marke</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="z.B. BMW"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Modell</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="z.B. 3er"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transmission">Getriebe</Label>
                    <select
                      id="transmission"
                      value={formData.transmission}
                      onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                      required
                    >
                      <option value="Automatik">Automatik</option>
                      <option value="Manuell">Manuell</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seats">Sitzplätze</Label>
                    <Input
                      id="seats"
                      type="number"
                      min="2"
                      max="9"
                      value={formData.seats}
                      onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price_per_day">Preis pro Tag (CHF)</Label>
                    <Input
                      id="price_per_day"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price_per_day}
                      onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                      placeholder="z.B. 89.00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Baujahr</Label>
                    <Input
                      id="year"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mileage">Kilometerstand</Label>
                    <Input
                      id="mileage"
                      type="number"
                      min="0"
                      value={formData.mileage}
                      onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                      placeholder="z.B. 50000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fuel_type">Kraftstoff</Label>
                    <select
                      id="fuel_type"
                      value={formData.fuel_type}
                      onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                      required
                    >
                      <option value="Benzin">Benzin</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Elektro">Elektro</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Plug-in-Hybrid">Plug-in-Hybrid</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="license_plate">Kennzeichen</Label>
                    <Input
                      id="license_plate"
                      value={formData.license_plate}
                      onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                      placeholder="ZH-123456"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Farbe</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="Schwarz"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="image_upload">Bild hochladen (optional)</Label>
                    <Input
                      id="image_upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="cursor-pointer"
                    />
                    {formData.image_url && (
                      <div className="mt-2">
                        <img
                          src={formData.image_url || "/placeholder.svg"}
                          alt="Vorschau"
                          className="w-32 h-32 object-cover rounded-lg border border-border"
                        />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Oder geben Sie eine Bild-URL ein</p>
                    <Input
                      id="image_url"
                      type="url"
                      value={imageFile ? "" : formData.image_url}
                      onChange={(e) => {
                        setImageFile(null)
                        setFormData({ ...formData, image_url: e.target.value })
                      }}
                      placeholder="https://example.com/car.jpg"
                      disabled={!!imageFile}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="available"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="available" className="cursor-pointer">
                    Verfügbar
                  </Label>
                </div>

                <div className="flex gap-4">
                  <Button type="submit">{editingCar ? "Speichern" : "Hinzufügen"}</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Abbrechen
                  </Button>
                </div>
              </form>
            </div>
          )}

          {loadingCars ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Fahrzeuge werden geladen...</p>
            </div>
          ) : cars.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <div className="mx-auto text-muted-foreground mb-4 w-12 h-12 bg-secondary flex items-center justify-center">
                <Plus size={48} />
              </div>
              <p className="text-muted-foreground">Noch keine Fahrzeuge vorhanden</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <div key={car.id} className="bg-card border border-border rounded-lg overflow-hidden">
                  {car.image_url ? (
                    <img
                      src={car.image_url || "/placeholder.svg"}
                      alt={`${car.name} ${car.model}`}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-secondary flex items-center justify-center">
                      <Plus className="text-muted-foreground" size={48} />
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-foreground">
                          {car.name} {car.model}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {car.transmission} • {car.seats} Sitze
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {car.year} • {car.fuel_type} • {car.mileage?.toLocaleString()} km
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          car.available ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                        }`}
                      >
                        {car.available ? "Verfügbar" : "Nicht verfügbar"}
                      </span>
                    </div>

                    <p className="text-2xl font-bold text-primary mb-4">CHF {car.price_per_day}/Tag</p>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(car)} className="flex-1 gap-2">
                        <Edit size={16} />
                        Bearbeiten
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(car.id)}
                        className="flex-1 gap-2 text-red-600 hover:bg-red-500/10"
                      >
                        <Trash2 size={16} />
                        Löschen
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Fahrzeug löschen?"
        description="Sind Sie sicher, dass Sie dieses Fahrzeug löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
        confirmText="Fahrzeug löschen"
      />

      <Footer />
    </main>
  )
}
