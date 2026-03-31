'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { registerUser, loginUser } from '@/lib/actions/auth';

export default function RegisterPage() {
  const router = useRouter();
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
      const result = await registerUser(formData);
      if (result.success) {
        // Registration succeeded — sign in via server action (bypasses CSRF).
        // loginUser will throw NEXT_REDIRECT on success, which Next.js handles
        // by redirecting the browser to /dashboard. If it fails, it returns an error.
        const loginResult = await loginUser(email, password);
        // If we reach here, loginUser returned without redirect (auth error)
        if (!loginResult.success) {
          // Auto-login failed — redirect to login page manually
          router.push('/login');
        }
      } else {
        setError(result.error || 'Ein Fehler ist aufgetreten.');
      }
    } catch {
      // NEXT_REDIRECT is handled transparently by Next.js and won't reach here.
      // If we do get here, it's an unexpected error.
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
          Erstellen Sie Ihr Konto und starten Sie mit Ihrem Compliance-Check.
        </p>
      </div>
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Ihr Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Max Müller"
          />
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-medium">
            Firmenname
          </label>
          <input
            id="company"
            name="company"
            type="text"
            required
            className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Muster GmbH"
          />
        </div>
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
            minLength={8}
            className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Mindestens 8 Zeichen"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? 'Konto wird erstellt...' : 'Registrieren'}
        </button>
      </form>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Bereits ein Konto?{' '}
        <Link href="/login" className="text-accent hover:underline">
          Anmelden
        </Link>
      </div>
    </div>
  );
}
