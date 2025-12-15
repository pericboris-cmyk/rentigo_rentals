import LoginForm from "@/components/login-form"
import Link from "next/link"
import { ShieldCheck, LogIn } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"

async function checkMaintenanceMode() {
  try {
    const supabase = await createServerClient()
    const { data } = await supabase.from("site_settings").select("value").eq("key", "maintenance_mode").maybeSingle()

    return data?.value === "true"
  } catch {
    return false
  }
}

export const metadata = {
  title: "Anmelden | Rentigo Rentals",
  description: "Melden Sie sich bei Rentigo Rentals an",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const isMaintenanceMode = await checkMaintenanceMode()
  const params = await searchParams
  const redirectUrl = params.redirect

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl shadow-lg border border-border p-8">
          <div className="text-center mb-8">
            {isMaintenanceMode ? (
              <>
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="text-primary-foreground" size={24} />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Admin-Bereich</h1>
                <p className="text-muted-foreground mt-2">Nur für autorisierte Administratoren</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <LogIn className="text-primary-foreground" size={24} />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Anmelden</h1>
                <p className="text-muted-foreground mt-2">Willkommen zurück bei Rentigo Rentals</p>
              </>
            )}
          </div>

          <LoginForm isMaintenanceMode={isMaintenanceMode} redirectUrl={redirectUrl} />

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Zurück zur{" "}
              <Link href="/" className="text-primary hover:underline font-medium">
                Startseite
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
