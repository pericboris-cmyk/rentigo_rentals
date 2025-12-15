import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/components/auth-context"
import { Toaster } from "sonner"
import GoogleAnalytics from "@/components/google-analytics"
import CookieConsent from "@/components/cookie-consent"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Rentigo Rentals - Premium Car Rental Service",
  description: "Buchen Sie Ihren nächsten Mietwagen bei Rentigo Rentals. Schnell, einfach und zuverlässig.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Analytics />
          <Toaster position="top-right" richColors />
          <GoogleAnalytics />
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  )
}
