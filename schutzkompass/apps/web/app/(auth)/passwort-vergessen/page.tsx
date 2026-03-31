'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement password reset email sending
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmitted(true);
    setIsLoading(false);
  }

  if (submitted) {
    return (
      <div className="rounded-lg border bg-card p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">E-Mail gesendet</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Wenn ein Konto mit dieser E-Mail-Adresse existiert, haben wir Ihnen einen Link zum
            Zurücksetzen Ihres Passworts gesendet.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-medium text-accent hover:underline"
          >
            ← Zurück zur Anmeldung
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-primary">Passwort vergessen</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen.
        </p>
      </div>
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
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? 'Wird gesendet...' : 'Link senden'}
        </button>
      </form>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-accent hover:underline">
          ← Zurück zur Anmeldung
        </Link>
      </div>
    </div>
  );
}
