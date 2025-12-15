"use client"

import { X } from "lucide-react"

interface RegistrationPromptDialogProps {
  isOpen: boolean
  onClose: () => void
  onRegister: () => void
}

export default function RegistrationPromptDialog({ isOpen, onClose, onRegister }: RegistrationPromptDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Konto erforderlich</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition" aria-label="Schließen">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-muted-foreground mb-4">
            Du musst ein Konto erstellen, um eine Buchung durchführen zu können.
          </p>
          <p className="text-sm text-muted-foreground">
            Mit einem Konto kannst du Fahrzeuge buchen, deine Buchungen verwalten und exklusive Angebote erhalten.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onRegister}
            className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold"
          >
            Jetzt registrieren
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition font-semibold"
          >
            Abbrechen
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Hast du bereits ein Konto?{" "}
            <a href="/login" className="text-primary hover:underline font-semibold">
              Jetzt anmelden
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
