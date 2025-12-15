"use client"

import { useAuth } from "@/hooks/useAuth"
import { User, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"

export default function UserProfile() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Bitte melden Sie sich an</p>
        <Link href="/login" className="text-primary hover:underline mt-2 inline-block">
          Anmelden
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <User className="text-primary" size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{user.full_name || "Benutzer"}</h3>
          <p className="text-sm text-muted-foreground">Kundenprofile</p>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-foreground">
          <Mail size={18} className="text-primary" />
          <span className="text-sm">{user.email}</span>
        </div>
        {user.phone && (
          <div className="flex items-center gap-2 text-foreground">
            <Phone size={18} className="text-primary" />
            <span className="text-sm">{user.phone}</span>
          </div>
        )}
        {user.address && (
          <div className="flex items-center gap-2 text-foreground">
            <MapPin size={18} className="text-primary" />
            <span className="text-sm">{user.address}</span>
          </div>
        )}
      </div>

      <Link
        href="/dashboard/profile"
        className="block mt-4 w-full text-center py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium"
      >
        Profil bearbeiten
      </Link>
    </div>
  )
}
