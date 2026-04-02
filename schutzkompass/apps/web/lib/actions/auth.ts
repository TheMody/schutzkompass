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

// ── Password Reset ─────────────────────────────────────────────────

interface PasswordResetToken {
  email: string;
  token: string;
  expiresAt: Date;
}

// In-memory token store (in production, use DB or Redis)
let resetTokens: PasswordResetToken[] = [];

function generateResetToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  if (!email) {
    return { success: false, error: 'E-Mail-Adresse ist erforderlich.' };
  }

  try {
    // Check if user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    // Always return success to avoid email enumeration
    if (!user) {
      return { success: true };
    }

    // Remove any existing tokens for this email
    resetTokens = resetTokens.filter((t) => t.email !== email.toLowerCase());

    // Create new token (valid for 1 hour)
    const token = generateResetToken();
    resetTokens.push({
      email: email.toLowerCase(),
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    // In production, send email with reset link:
    // const resetUrl = `${process.env.NEXTAUTH_URL}/passwort-zuruecksetzen?token=${token}`;
    // await sendEmail(email, 'Passwort zurücksetzen', `Klicken Sie hier: ${resetUrl}`);
    console.log(`[Password Reset] Token for ${email}: ${token}`);

    return { success: true };
  } catch (err) {
    console.error('[requestPasswordReset] Error:', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (!token || !newPassword) {
    return { success: false, error: 'Token und neues Passwort sind erforderlich.' };
  }

  if (newPassword.length < 8) {
    return { success: false, error: 'Das Passwort muss mindestens 8 Zeichen lang sein.' };
  }

  // Clean up expired tokens
  resetTokens = resetTokens.filter((t) => t.expiresAt > new Date());

  // Find valid token
  const resetToken = resetTokens.find((t) => t.token === token);
  if (!resetToken) {
    return { success: false, error: 'Ungültiger oder abgelaufener Link. Bitte fordern Sie einen neuen an.' };
  }

  try {
    // Hash new password and update user
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.email, resetToken.email));

    // Remove used token
    resetTokens = resetTokens.filter((t) => t.token !== token);

    return { success: true };
  } catch (err) {
    console.error('[resetPassword] Error:', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}
