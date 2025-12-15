"use client"

import type React from "react"
import { toast } from "react-toastify"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Pencil, Trash2, Package, ArrowLeft, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"

type Extra = {
  id: string
  name: string
  description: string
  price_per_day: number
  icon_name: string
  active: boolean
}

export default function AdminExtrasPage() {
  const [extras, setExtras] = useState<Extra[]>([])
  const [loading, setLoading] = useState(true)
  const [tableExists, setTableExists] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ open: boolean; extraId: string; extraName: string }>({
    open: false,
    extraId: "",
    extraName: "",
  })
  const [editingExtra, setEditingExtra] = useState<Extra | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price_per_day: "",
    icon_name: "Package",
    active: true,
  })

  useEffect(() => {
    fetchExtras()
  }, [])

  const fetchExtras = async () => {
    try {
      console.log("[v0] Fetching extras...")
      const response = await fetch("/api/admin/extras")

      console.log("[v0] Extras API response status:", response.status)

      if (!response.ok) {
        const error = await response.json()
        console.error("[v0] Error fetching extras:", error)
        setTableExists(false)
        setExtras([])
        return
      }

      const data = await response.json()
      console.log("[v0] Extras data received:", data)

      if (Array.isArray(data)) {
        console.log("[v0] Extras count:", data.length)
        setExtras(data)
        setTableExists(true)
      } else if (data.error) {
        console.error("[v0] Error fetching extras:", data.error)
        setTableExists(false)
        setExtras([])
      } else {
        console.log("[v0] No extras data, setting empty array")
        setExtras([])
      }
    } catch (error) {
      console.error("[v0] Error fetching extras:", error)
      setTableExists(false)
      setExtras([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.price_per_day) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus")
      return
    }

    const loadingToast = toast.loading(
      editingExtra ? "Zusatzleistung wird aktualisiert..." : "Zusatzleistung wird hinzugefügt...",
    )

    try {
      const url = editingExtra ? `/api/admin/extras/${editingExtra.id}` : "/api/admin/extras"
      const method = editingExtra ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price_per_day: Number.parseFloat(formData.price_per_day),
        }),
      })

      if (!response.ok) {
        toast.error("Fehler beim Speichern der Zusatzleistung", { id: loadingToast })
        return
      }

      toast.success(
        editingExtra ? "Zusatzleistung erfolgreich aktualisiert!" : "Zusatzleistung erfolgreich hinzugefügt!",
        { id: loadingToast },
      )
      await fetchExtras()
      setIsModalOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving extra:", error)
      toast.error("Fehler beim Speichern der Zusatzleistung", { id: loadingToast })
    }
  }

  const handleDelete = async (id: string, name: string) => {
    setDeleteConfirmModal({ open: true, extraId: id, extraName: name })
  }

  const confirmDelete = async () => {
    const loadingToast = toast.loading("Zusatzleistung wird gelöscht...")

    try {
      const response = await fetch(`/api/admin/extras/${deleteConfirmModal.extraId}`, { method: "DELETE" })
      if (!response.ok) {
        toast.error("Fehler beim Löschen der Zusatzleistung", { id: loadingToast })
        return
      }
      toast.success("Zusatzleistung erfolgreich gelöscht!", { id: loadingToast })
      await fetchExtras()
      setDeleteConfirmModal({ open: false, extraId: "", extraName: "" })
    } catch (error) {
      console.error("Error deleting extra:", error)
      toast.error("Fehler beim Löschen der Zusatzleistung", { id: loadingToast })
    }
  }

  const openEditModal = (extra: Extra) => {
    setEditingExtra(extra)
    setFormData({
      name: extra.name,
      description: extra.description || "",
      price_per_day: extra.price_per_day.toString(),
      icon_name: extra.icon_name,
      active: extra.active,
    })
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setEditingExtra(null)
    setFormData({
      name: "",
      description: "",
      price_per_day: "",
      icon_name: "Package",
      active: true,
    })
  }

  if (loading) {
    return <div className="p-8">Laden...</div>
  }

  if (!tableExists) {
    return (
      <div className="container mx-auto p-8">
        <Card className="border-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              Extras-Tabelle nicht gefunden
            </CardTitle>
            <CardDescription>Die Datenbanktabelle für Zusatzleistungen existiert noch nicht.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Bitte führen Sie das folgende SQL-Script aus:</p>
            <div className="rounded bg-muted p-4 font-mono text-sm">scripts/15-create-extras-table.sql</div>
            <p className="text-sm text-muted-foreground">
              Sie können das Script über die Script-Verwaltung ausführen oder direkt in der Supabase-Konsole.
            </p>
            <Button onClick={() => window.location.reload()}>Nach Script-Ausführung neu laden</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6">
        <Link href="/admin" className="text-primary hover:underline inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Zurück zum Admin Dashboard
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Zusatzleistungen verwalten</h1>
          <p className="text-muted-foreground">Verwalten Sie die buchbaren Zusatzleistungen</p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setIsModalOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Neue Zusatzleistung
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {extras.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Keine Zusatzleistungen vorhanden</p>
              <Button
                onClick={() => {
                  resetForm()
                  setIsModalOpen(true)
                }}
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Erste Zusatzleistung erstellen
              </Button>
            </CardContent>
          </Card>
        ) : (
          extras.map((extra) => (
            <Card key={extra.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{extra.name}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => openEditModal(extra)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(extra.id, extra.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>{extra.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Preis pro Tag:</span>
                    <span className="text-sm">CHF {extra.price_per_day.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <span className={`text-sm ${extra.active ? "text-green-600" : "text-red-600"}`}>
                      {extra.active ? "Aktiv" : "Inaktiv"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingExtra ? "Zusatzleistung bearbeiten" : "Neue Zusatzleistung"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preis pro Tag (CHF)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price_per_day}
                onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icon Name</Label>
              <Input
                id="icon"
                value={formData.icon_name}
                onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                placeholder="z.B. Users, Shield, Navigation"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="active">Aktiv</Label>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false)
                  resetForm()
                }}
                className="flex-1"
              >
                Abbrechen
              </Button>
              <Button type="submit" className="flex-1">
                Speichern
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteConfirmModal.open}
        onOpenChange={(open) => setDeleteConfirmModal({ ...deleteConfirmModal, open })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Zusatzleistung löschen?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Möchten Sie die Zusatzleistung <span className="font-semibold">{deleteConfirmModal.extraName}</span>{" "}
              wirklich löschen?
            </p>
            <p className="text-sm text-red-600">Diese Aktion kann nicht rückgängig gemacht werden.</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmModal({ open: false, extraId: "", extraName: "" })}
                className="flex-1"
              >
                Abbrechen
              </Button>
              <Button variant="destructive" onClick={confirmDelete} className="flex-1">
                Löschen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
