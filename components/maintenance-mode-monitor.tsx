"use client"

import { useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-context"

export function MaintenanceModeMonitor() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const isCheckingRef = useRef(false)
  const errorCountRef = useRef(0)

  useEffect(() => {
    if (pathname === "/wartung" || pathname === "/login" || pathname?.startsWith("/admin")) {
      return
    }

    const checkMaintenanceMode = async () => {
      if (isCheckingRef.current) return
      if (errorCountRef.current >= 3) {
        console.log("[v0] Maintenance monitor stopped after 3 consecutive errors")
        return
      }

      isCheckingRef.current = true

      try {
        const response = await fetch("/api/admin/maintenance", {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (response.ok) {
          const data = await response.json()
          errorCountRef.current = 0

          if (data.maintenanceMode && user?.role !== "admin") {
            console.log("[v0] Maintenance mode activated, redirecting to /wartung")
            window.location.href = "/wartung"
          }
        } else {
          errorCountRef.current++
        }
      } catch (error) {
        errorCountRef.current++
        if (errorCountRef.current <= 3) {
          console.error("[v0] Error checking maintenance mode:", error)
        }
      } finally {
        isCheckingRef.current = false
      }
    }

    checkMaintenanceMode()

    const interval = setInterval(() => {
      if (errorCountRef.current < 3) {
        checkMaintenanceMode()
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [pathname, user, router])

  return null
}
