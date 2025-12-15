"use client"

import Script from "next/script"
import { useEffect, useState } from "react"

export default function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false)

  useEffect(() => {
    const checkConsent = () => {
      const storedConsent = localStorage.getItem("cookie-consent")
      if (storedConsent) {
        const consent = JSON.parse(storedConsent)
        setAnalyticsEnabled(consent.analytics === true)
      }
    }

    // Check on mount
    checkConsent()

    // Listen for consent updates
    const handleConsentUpdate = (event: CustomEvent) => {
      setAnalyticsEnabled(event.detail.analytics === true)
    }

    window.addEventListener("cookie-consent-updated", handleConsentUpdate as EventListener)

    return () => {
      window.removeEventListener("cookie-consent-updated", handleConsentUpdate as EventListener)
    }
  }, [])

  // Don't load GA if no ID is provided or analytics not consented
  if (!gaId || !analyticsEnabled) {
    return null
  }

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            anonymize_ip: true,
            cookie_flags: 'SameSite=None;Secure'
          });
        `}
      </Script>
    </>
  )
}
