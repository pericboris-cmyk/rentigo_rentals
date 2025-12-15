import RegisterForm from "@/components/register-form"
import Link from "next/link"

export const metadata = {
  title: "Registrieren | Rentigo Rentals",
  description: "Erstellen Sie ein neues Konto bei Rentigo Rentals",
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const params = await searchParams
  const redirectUrl = params.redirect

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl shadow-lg border border-border p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-lg">R</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Rentigo</h1>
            <p className="text-muted-foreground mt-2">Erstellen Sie ein neues Konto</p>
          </div>

          <RegisterForm redirectUrl={redirectUrl} />

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
