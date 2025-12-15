"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import type { User as ProfileUser } from "@/lib/supabase/auth"

interface AuthContextType {
  user: ProfileUser | null
  authUser: SupabaseUser | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ProfileUser | null>(null)
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/user")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setAuthUser(data.authUser)
      } else if (response.status !== 401) {
        // Only log non-401 errors
        console.error("Error fetching user:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error fetching user:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const signOut = async () => {
    try {
      setUser(null)
      setAuthUser(null)

      const response = await fetch("/api/auth/sign-out", { method: "POST" })

      if (response.ok) {
        try {
          const maintenanceResponse = await fetch("/api/admin/maintenance")
          if (maintenanceResponse.ok) {
            const maintenanceData = await maintenanceResponse.json()
            if (maintenanceData.maintenanceMode) {
              window.location.href = "/wartung"
              return
            }
          }
        } catch (error) {
          console.error("Error checking maintenance mode:", error)
        }

        window.location.href = "/"
      } else {
        console.error("Sign out failed:", await response.text())
      }
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, authUser, loading, signOut, refreshUser }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
