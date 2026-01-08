import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/components/auth-context"
import { Toaster } from "sonner"
import GoogleAnalytics from "@/components/google-analytics"
import CookieConsent from "@/components/cookie-consent"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "Rentigo Rentals - Premium Car Rental Service",
  description: "Buchen Sie Ihren nächsten Mietwagen bei Rentigo Rentals. Schnell, einfach und zuverlässig.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/rentigo-logo.jpg",
        sizes: "32x32",
      },
    ],
    apple: "/rentigo-logo.jpg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className={`${geist.variable} ${geistMono.variable}`}>
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
