'use server';

import { auth } from '@/lib/auth';

/**
 * Get the current user's organisationId from the JWT session.
 * Throws if not authenticated.
 */
export async function getOrgId(): Promise<string> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Not authenticated');
  }
  const orgId = (session.user as any).organisationId;
  if (!orgId) {
    throw new Error('No organisation linked to user');
  }
  return orgId;
}

/**
 * Get the current user's id from the JWT session.
 * Throws if not authenticated.
 */
export async function getUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }
  return session.user.id;
}
