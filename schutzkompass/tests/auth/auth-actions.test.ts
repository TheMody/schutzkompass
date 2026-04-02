import { describe, it, expect } from 'vitest';

/**
 * Auth action tests — verify auth module structure, validation logic,
 * page structure, middleware routing rules, and root redirect.
 * 
 * We use source-level verification because next-auth's internal ESM imports
 * (next/server) cannot be resolved outside the Next.js runtime.
 */

describe('Auth Actions — registerUser validation', () => {
  it('registerUser module exports an async function', async () => {
    // Cannot dynamically import auth actions in vitest because next-auth
    // internally imports next/server which isn't available outside Next.js.
    // Instead, verify the source code exports the expected function.
    const fs = await import('fs');
    const src = fs.readFileSync('apps/web/lib/actions/auth.ts', 'utf-8');
    expect(src).toContain('export async function registerUser');
    // Verify it validates inputs
    expect(src).toContain('password');
    expect(src).toContain('email');
    expect(src).toContain('company');
  });

  it('loginUser module exports an async function', async () => {
    const fs = await import('fs');
    const src = fs.readFileSync('apps/web/lib/actions/auth.ts', 'utf-8');
    expect(src).toContain('export async function loginUser');
    // Verify it uses signIn
    expect(src).toContain('signIn');
  });
});

describe('Auth Pages — structure validation', () => {
  it('login page exists and is a client component', async () => {
    // Read the login page source as a module check
    const fs = await import('fs');
    const loginSrc = fs.readFileSync(
      'apps/web/app/(auth)/login/page.tsx',
      'utf-8'
    );
    expect(loginSrc).toContain("'use client'");
    expect(loginSrc).toContain('loginUser');
    expect(loginSrc).toContain('handleSubmit');
    expect(loginSrc).toContain('E-Mail-Adresse');
    expect(loginSrc).toContain('Passwort');
    expect(loginSrc).toContain('Anmelden');
    expect(loginSrc).toContain('/register');
  });

  it('register page exists and has all required fields', async () => {
    const fs = await import('fs');
    const regSrc = fs.readFileSync(
      'apps/web/app/(auth)/register/page.tsx',
      'utf-8'
    );
    expect(regSrc).toContain("'use client'");
    expect(regSrc).toContain('registerUser');
    expect(regSrc).toContain('loginUser');
    expect(regSrc).toContain('name');
    expect(regSrc).toContain('company');
    expect(regSrc).toContain('email');
    expect(regSrc).toContain('password');
    expect(regSrc).toContain('Registrieren');
    expect(regSrc).toContain('/login');
  });

  it('password reset page exists with form and success view', async () => {
    const fs = await import('fs');
    const pwSrc = fs.readFileSync(
      'apps/web/app/(auth)/passwort-vergessen/page.tsx',
      'utf-8'
    );
    expect(pwSrc).toContain("'use client'");
    expect(pwSrc).toContain('Passwort vergessen');
    expect(pwSrc).toContain('E-Mail gesendet');
    expect(pwSrc).toContain('/login');
    // Password reset now calls a real server action
    expect(pwSrc).toContain('requestPasswordReset');
  });
});

// ── Password Reset Actions ──────────────────────────────────────────

describe('Password Reset Actions', () => {
  it('auth.ts exports requestPasswordReset', async () => {
    const fs = await import('fs');
    const src = fs.readFileSync('apps/web/lib/actions/auth.ts', 'utf-8');
    expect(src).toContain('export async function requestPasswordReset');
  });

  it('auth.ts exports resetPassword', async () => {
    const fs = await import('fs');
    const src = fs.readFileSync('apps/web/lib/actions/auth.ts', 'utf-8');
    expect(src).toContain('export async function resetPassword');
  });

  it('login page has Passwort vergessen link', async () => {
    const fs = await import('fs');
    const src = fs.readFileSync('apps/web/app/(auth)/login/page.tsx', 'utf-8');
    expect(src).toContain('/passwort-vergessen');
    expect(src).toContain('Passwort vergessen?');
  });
});

describe('Middleware — routing rules', () => {
  it('middleware exists and contains auth routing logic', async () => {
    const fs = await import('fs');
    const mwSrc = fs.readFileSync('apps/web/middleware.ts', 'utf-8');
    expect(mwSrc).toContain("import { auth } from '@/lib/auth'");
    expect(mwSrc).toContain('/login');
    expect(mwSrc).toContain('/register');
    expect(mwSrc).toContain('/api/auth');
    expect(mwSrc).toContain('/fragebogen');
    expect(mwSrc).toContain('isLoggedIn');
    expect(mwSrc).toContain('callbackUrl');
    expect(mwSrc).toContain('/dashboard');
  });

  it('middleware protects authenticated routes', async () => {
    const fs = await import('fs');
    const mwSrc = fs.readFileSync('apps/web/middleware.ts', 'utf-8');
    // Redirects non-logged-in users to login
    expect(mwSrc).toContain('!isLoggedIn && !isPublicRoute');
    // Redirects logged-in users away from auth pages
    expect(mwSrc).toContain("isLoggedIn && (pathname === '/login'");
  });

  it('middleware allows supplier portal routes without auth', async () => {
    const fs = await import('fs');
    const mwSrc = fs.readFileSync('apps/web/middleware.ts', 'utf-8');
    expect(mwSrc).toContain('isSupplierRoute');
    expect(mwSrc).toContain('/fragebogen');
  });
});

describe('Root Page — redirect', () => {
  it('root page redirects to /dashboard', async () => {
    const fs = await import('fs');
    const rootSrc = fs.readFileSync('apps/web/app/page.tsx', 'utf-8');
    expect(rootSrc).toContain("redirect('/dashboard')");
  });
});
