'use client';

import Link from 'next/link';
import { useState } from 'react';
import { loginUser } from '@/lib/actions/auth';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // loginUser is a server action that uses signIn from @/lib/auth
      // (which internally uses skipCSRFCheck, bypassing the MissingCSRF error).
      // On success, it throws NEXT_REDIRECT which Next.js handles as a redirect.
      const result = await loginUser(email, password);
      // If we reach here, loginUser returned without redirect (auth error)
      if (!result.success) {
        setError(result.error || 'Ungültige E-Mail-Adresse oder falsches Passwort.');
      }
    } catch {
      // NEXT_REDIRECT is handled transparently by Next.js and won't reach here.
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-lg border bg-card p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-primary">SchutzKompass</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Melden Sie sich an, um auf Ihre Compliance-Plattform zuzugreifen.
        </p>
      </div>
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            E-Mail-Adresse
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="name@unternehmen.de"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Passwort
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? 'Anmeldung läuft...' : 'Anmelden'}
        </button>
      </form>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Noch kein Konto?{' '}
        <Link href="/register" className="text-accent hover:underline">
          Jetzt registrieren
        </Link>
      </div>
    </div>
  );
}
