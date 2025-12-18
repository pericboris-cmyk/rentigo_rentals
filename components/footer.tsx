"use client"

import { Mail, Phone, MapPin, Instagram, Cookie } from "lucide-react"
import Image from "next/image"

export default function Footer() {
  const openCookieSettings = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cookie-consent")
      window.location.reload()
    }
  }

  return (
    <footer className="bg-foreground text-foreground-foreground">
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="mb-4 h-10 flex items-center">
                <Image
                  src="/rentigo-logo.jpg"
                  alt="Rentigo Rentals"
                  width={140}
                  height={50}
                  className="brightness-0 invert object-contain h-10 w-auto"
                  priority
                />
              </div>
              <p className="text-primary-foreground/80">Ihre vertrauenswürdige Plattform für Mietwagen seit 2025.</p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold mb-4">Unternehmen</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>
                  <a href="#" className="hover:text-primary-foreground transition">
                    Über uns
                  </a>
                </li>
                <li>{/* Placeholder for additional link */}</li>
                <li>
                  <a href="#" className="hover:text-primary-foreground transition">
                    Blog
                  </a>
                </li>
                <li>{/* Placeholder for additional link */}</li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold mb-4">Hilfe</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>{/* Placeholder for additional link */}</li>
                <li>
                  <a href="/kontakt" className="hover:text-primary-foreground transition">
                    Kontakt
                  </a>
                </li>
                <li>
                  <a href="/impressum" className="hover:text-primary-foreground transition">
                    Impressum
                  </a>
                </li>
                <li>
                  <a href="/datenschutz" className="hover:text-primary-foreground transition">
                    Datenschutz
                  </a>
                </li>
                <li>
                  <button
                    onClick={openCookieSettings}
                    className="hover:text-primary-foreground transition flex items-center gap-2"
                  >
                    <Cookie size={16} />
                    Cookie-Einstellungen
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold mb-4">Kontakt</h4>
              <div className="space-y-3 text-primary-foreground/80">
                <div className="flex items-center gap-2">
                  <Phone size={18} />
                  <span>+41 78 971 42 41</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={18} />
                  <span>rentigorentals@gmail.com</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={18} className="mt-1" />
                  <span>Solothurn, Schweiz</span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-primary-foreground/20 my-8"></div>

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-primary-foreground/70 text-sm">© 2025 Rentigo Rentals. Alle Rechte vorbehalten.</p>

            {/* Social Links */}
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="p-2 rounded-lg hover:bg-primary-foreground/10 transition">
                {/* Placeholder for Facebook link */}
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-primary-foreground/10 transition">
                {/* Placeholder for Twitter link */}
              </a>
              <a
                href="https://www.instagram.com/rentigo_rentals/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-primary-foreground/10 transition"
              >
                <Instagram size={20} />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-primary-foreground/10 transition">
                {/* Placeholder for LinkedIn link */}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
