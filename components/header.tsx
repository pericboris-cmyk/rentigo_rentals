"use client"

import { useState } from "react"
import { Menu, X, User, Settings, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import Image from "next/image"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    setIsMenuOpen(false)
    setIsUserMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/rentigo-logo.jpg" alt="Rentigo Rentals" width={120} height={40} className="h-10 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-foreground hover:text-primary transition">
              Startseite
            </Link>
            <Link href="/#cars" className="text-foreground hover:text-primary transition">
              Fahrzeuge
            </Link>
            <Link href="/ueber-uns" className="text-foreground hover:text-primary transition">
              Über uns
            </Link>
            <Link href="/kontakt" className="text-foreground hover:text-primary transition">
              Kontakt
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-accent transition"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <User size={18} className="text-primary-foreground" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">
                        {user.full_name || user.email.split("@")[0]}
                      </p>
                      <p className="text-xs text-muted-foreground">Angemeldet</p>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg py-2 z-50">
                      {user.role === "admin" && (
                        <>
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-2 px-4 py-2 hover:bg-accent transition"
                          >
                            <Settings size={16} />
                            <span className="text-sm text-foreground font-semibold text-primary">Admin Dashboard</span>
                          </Link>
                          <hr className="my-2 border-border" />
                        </>
                      )}
                      <Link
                        href="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-accent transition"
                      >
                        <User size={16} />
                        <span className="text-sm text-foreground">Dashboard</span>
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-accent transition"
                      >
                        <Settings size={16} />
                        <span className="text-sm text-foreground">Einstellungen</span>
                      </Link>
                      <hr className="my-2 border-border" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-accent transition w-full text-left"
                      >
                        <LogOut size={16} />
                        <span className="text-sm text-foreground">Abmelden</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-foreground hover:text-primary transition font-medium">
                  Anmelden
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium"
                >
                  Registrieren
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 flex flex-col space-y-2">
            <Link href="/" className="block px-4 py-2 text-foreground hover:text-primary">
              Startseite
            </Link>
            <Link href="/#cars" className="block px-4 py-2 text-foreground hover:text-primary">
              Fahrzeuge
            </Link>
            <Link href="/#pricing" className="block px-4 py-2 text-foreground hover:text-primary">
              Preise
            </Link>
            <Link href="/ueber-uns" className="block px-4 py-2 text-foreground hover:text-primary">
              Über uns
            </Link>
            <Link href="/kontakt" className="block px-4 py-2 text-foreground hover:text-primary">
              Kontakt
            </Link>
            {user ? (
              <>
                <div className="px-4 py-2 border-t border-border mt-2 pt-4">
                  <p className="text-sm font-medium text-foreground">{user.full_name || user.email.split("@")[0]}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                {user.role === "admin" && (
                  <Link href="/admin" className="block px-4 py-2 text-primary hover:text-primary/80 font-semibold">
                    Admin Dashboard
                  </Link>
                )}
                <Link href="/dashboard" className="block px-4 py-2 text-foreground hover:text-primary">
                  Dashboard
                </Link>
                <Link href="/dashboard/profile" className="block px-4 py-2 text-foreground hover:text-primary">
                  Einstellungen
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-left"
                >
                  Abmelden
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block w-full mt-4 px-4 py-2 text-foreground hover:text-primary">
                  Anmelden
                </Link>
                <Link
                  href="/register"
                  className="block w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-left"
                >
                  Registrieren
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
