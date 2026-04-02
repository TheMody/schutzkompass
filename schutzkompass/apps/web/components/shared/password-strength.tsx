'use client';

import { useMemo } from 'react';

interface PasswordStrengthResult {
  score: number; // 0-4
  label: string;
  color: string;
  bgColor: string;
  checks: { label: string; met: boolean }[];
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const checks = [
    { label: 'Mindestens 8 Zeichen', met: password.length >= 8 },
    { label: 'Großbuchstabe (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'Kleinbuchstabe (a-z)', met: /[a-z]/.test(password) },
    { label: 'Zahl (0-9)', met: /[0-9]/.test(password) },
    { label: 'Sonderzeichen (!@#$...)', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const metCount = checks.filter((c) => c.met).length;

  // Score: 0-4 based on checks met
  let score: number;
  if (password.length === 0) score = 0;
  else if (metCount <= 1) score = 0;
  else if (metCount === 2) score = 1;
  else if (metCount === 3) score = 2;
  else if (metCount === 4) score = 3;
  else score = 4;

  const labels = ['Sehr schwach', 'Schwach', 'Mittel', 'Stark', 'Sehr stark'];
  const colors = ['text-red-600', 'text-orange-600', 'text-yellow-600', 'text-green-600', 'text-green-700'];
  const bgColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-700'];

  return {
    score,
    label: password.length === 0 ? '' : labels[score],
    color: password.length === 0 ? '' : colors[score],
    bgColor: password.length === 0 ? '' : bgColors[score],
    checks,
  };
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);

  if (password.length === 0) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i <= strength.score ? strength.bgColor : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Label */}
      <p className={`text-xs font-medium ${strength.color}`}>{strength.label}</p>

      {/* Checklist */}
      <ul className="space-y-0.5">
        {strength.checks.map((check) => (
          <li
            key={check.label}
            className={`flex items-center gap-1.5 text-xs ${
              check.met ? 'text-green-600' : 'text-muted-foreground'
            }`}
          >
            <span>{check.met ? '✓' : '○'}</span>
            <span>{check.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
