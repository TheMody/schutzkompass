import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * Get the current authenticated session or redirect to login.
 * Use this in Server Components and Server Actions.
 */
export async function getRequiredSession() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  return session;
}

/**
 * Get the current session (may be null).
 * Use this in Server Components and Server Actions.
 */
export async function getOptionalSession() {
  return auth();
}

/**
 * Check if the current user has one of the required roles.
 * Redirects to dashboard if not authorized.
 */
export async function requireRole(...roles: string[]) {
  const session = await getRequiredSession();
  const userRole = (session.user as any).role;
  if (!roles.includes(userRole)) {
    redirect('/dashboard');
  }
  return session;
}
