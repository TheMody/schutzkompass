'use server';

import bcrypt from 'bcryptjs';
import { db } from '@schutzkompass/db';
import { users, organisations } from '@schutzkompass/db';
import { eq } from 'drizzle-orm';
import { signIn } from '@/lib/auth';
import { AuthError } from 'next-auth';

interface RegisterResult {
  success: boolean;
  error?: string;
}

interface LoginResult {
  success: boolean;
  error?: string;
}

export async function registerUser(formData: FormData): Promise<RegisterResult> {
  const name = formData.get('name') as string;
  const company = formData.get('company') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !company || !email || !password) {
    return { success: false, error: 'Alle Felder sind erforderlich.' };
  }

  if (password.length < 8) {
    return { success: false, error: 'Das Passwort muss mindestens 8 Zeichen lang sein.' };
  }

  try {
    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser) {
      return { success: false, error: 'Ein Konto mit dieser E-Mail-Adresse existiert bereits.' };
    }

    // Create organisation
    const [org] = await db
      .insert(organisations)
      .values({
        name: company,
      })
      .returning();

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 12);

    await db.insert(users).values({
      organisationId: org.id,
      email: email.toLowerCase(),
      passwordHash,
      name,
      role: 'admin', // First user is always admin
    });

    return { success: true };
  } catch (err) {
    console.error('[registerUser] Database error:', err);
    return { success: false, error: 'Datenbankfehler: ' + (err instanceof Error ? err.message : String(err)) };
  }
}

export async function loginUser(email: string, password: string): Promise<LoginResult> {
  try {
    // Server-side signIn uses skipCSRFCheck internally, avoiding the
    // MissingCSRF error that occurs with client-side signIn from next-auth/react.
    // On success, signIn calls redirect() which throws NEXT_REDIRECT.
    // We re-throw that so Next.js handles the navigation automatically.
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard',
    });
    // We should never reach here because signIn always redirects on success.
    return { success: true };
  } catch (error) {
    // In Next.js, redirects are thrown as errors with a NEXT_REDIRECT digest.
    // We must re-throw these so Next.js can handle the redirect.
    if (error instanceof Error && 'digest' in error && typeof (error as any).digest === 'string' && (error as any).digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    // Handle actual auth errors (e.g. CredentialsSignin)
    if (error instanceof AuthError) {
      return { success: false, error: 'Ungültige E-Mail-Adresse oder falsches Passwort.' };
    }
    console.error('[loginUser] Error:', error);
    return { success: false, error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.' };
  }
}
