'use server';

import { checkNis2Applicability, type Nis2ApplicabilityInput } from '@/lib/services/nis2-applicability';
import { classifyCraProduct, type CraClassificationInput } from '@/lib/services/cra-classifier';
import { db } from '@schutzkompass/db';
import { organisations } from '@schutzkompass/db';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

// ── Types ───────────────────────────────────────────────────────────
export interface OnboardingState {
  step1: CompanyProfileData | null;
  step2: Nis2CheckData | null;
  step3: CraCheckData | null;
  results: OnboardingResults | null;
}

export interface CompanyProfileData {
  companyName: string;
  address: string;
  hrbNumber: string;
  employeeCount: number;
  annualRevenue: number;
  sectors: string[];
}

export interface Nis2CheckData extends Nis2ApplicabilityInput {}

export interface CraCheckData {
  hasProducts: boolean;
  products: CraClassificationInput[];
}

export interface OnboardingResults {
  nis2: ReturnType<typeof checkNis2Applicability>;
  cra: ReturnType<typeof classifyCraProduct>[];
  summary: {
    nis2Applicable: boolean;
    nis2EntityType: string;
    craApplicable: boolean;
    craCategoryHighest: string;
    overallRiskLevel: 'low' | 'medium' | 'high';
    nextSteps: string[];
  };
}

// ── Server Actions ──────────────────────────────────────────────────

export async function evaluateNis2(input: Nis2ApplicabilityInput) {
  return checkNis2Applicability(input);
}

export async function evaluateCra(input: CraClassificationInput) {
  return classifyCraProduct(input);
}

export async function computeOnboardingResults(
  nis2Input: Nis2ApplicabilityInput,
  craProducts: CraClassificationInput[],
) {
  const nis2Result = checkNis2Applicability(nis2Input);
  const craResults = craProducts.map((p) => classifyCraProduct(p));

  const craApplicable = craResults.some((r) => r.applicable);
  const craCategoryMap: Record<string, number> = {
    not_applicable: 0,
    default: 1,
    important_class_1: 2,
    important_class_2: 3,
    critical: 4,
  };
  const highestCraCategory = craResults.reduce(
    (max, r) => ((craCategoryMap[r.category] || 0) > (craCategoryMap[max] || 0) ? r.category : max),
    'not_applicable' as string,
  );
  const highestCraCategoryLabel =
    craResults.find((r) => r.category === highestCraCategory)?.categoryLabel || 'Nicht anwendbar';

  // Compute overall risk level
  let overallRiskLevel: 'low' | 'medium' | 'high' = 'low';
  if (nis2Result.applicable && nis2Result.entityType === 'essential') {
    overallRiskLevel = 'high';
  } else if (nis2Result.applicable || highestCraCategory === 'critical') {
    overallRiskLevel = 'high';
  } else if (craApplicable) {
    overallRiskLevel = 'medium';
  }

  // Generate personalised next steps
  const nextSteps: string[] = [];

  if (nis2Result.applicable) {
    nextSteps.push('NIS2-Betroffenheitsanalyse detailliert durchführen');
    nextSteps.push('Risikomanagement-Framework gemäß Art. 21 NIS2 aufsetzen');
    nextSteps.push('Meldeprozesse für Sicherheitsvorfälle einrichten (Art. 23)');
    nextSteps.push('Lieferkettensicherheit bewerten und dokumentieren');

    if (nis2Result.entityType === 'essential') {
      nextSteps.push('Registrierung als wesentliche Einrichtung bei der zuständigen Behörde');
      nextSteps.push('Geschäftsleitungs-Schulung zu Cybersecurity-Governance planen');
    }
  }

  if (craApplicable) {
    nextSteps.push('Produkt-Inventar mit CRA-Klassifizierung vervollständigen');
    nextSteps.push('SBOM (Software Bill of Materials) für alle Produkte erstellen');
    nextSteps.push('Schwachstellenmanagement-Prozess einrichten');

    if (
      highestCraCategory === 'important_class_1' ||
      highestCraCategory === 'important_class_2' ||
      highestCraCategory === 'critical'
    ) {
      nextSteps.push('Konformitätsbewertungsstelle (Notified Body) auswählen');
    }

    if (highestCraCategory === 'important_class_2' || highestCraCategory === 'critical') {
      nextSteps.push('Penetrationstests und Code-Reviews planen');
    }
  }

  if (!nis2Result.applicable && !craApplicable) {
    nextSteps.push(
      'Obwohl NIS2 und CRA derzeit nicht direkt anwendbar sind, empfehlen wir grundlegende Cybersecurity-Maßnahmen.',
    );
    nextSteps.push('Prüfen Sie, ob Sie als Zulieferer in die Lieferkette regulierter Unternehmen fallen.');
  }

  const summary = {
    nis2Applicable: nis2Result.applicable,
    nis2EntityType: nis2Result.entityType,
    craApplicable,
    craCategoryHighest: highestCraCategoryLabel,
    overallRiskLevel,
    nextSteps,
  };

  return {
    nis2: nis2Result,
    cra: craResults,
    summary,
  };
}

// ── Save & Load Onboarding Results ──────────────────────────────────

export interface SaveOnboardingInput {
  companyName: string;
  address: string;
  hrbNumber: string;
  employeeCount: number;
  annualRevenue: number;
  nis2Applicable: boolean;
  nis2EntityType: string;
  craApplicable: boolean;
  craCategoryHighest: string;
  overallRiskLevel: 'low' | 'medium' | 'high';
  nextSteps: string[];
}

export async function saveOnboardingResults(input: SaveOnboardingInput): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Nicht authentifiziert.' };
    }

    const orgId = (session.user as any).organisationId as string;
    if (!orgId) {
      return { success: false, error: 'Keine Organisation gefunden.' };
    }

    await db
      .update(organisations)
      .set({
        name: input.companyName || undefined,
        address: input.address || undefined,
        hrbNumber: input.hrbNumber || undefined,
        employeeCount: input.employeeCount || undefined,
        annualRevenue: input.annualRevenue ? String(input.annualRevenue) : undefined,
        nis2Applicable: input.nis2Applicable,
        nis2EntityType: input.nis2EntityType,
        craApplicable: input.craApplicable,
        onboardingCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(organisations.id, orgId));

    return { success: true };
  } catch (err) {
    console.error('[saveOnboardingResults] Error:', err);
    return { success: false, error: 'Fehler beim Speichern der Ergebnisse.' };
  }
}

export interface OnboardingStatus {
  onboardingCompleted: boolean;
  nis2Applicable: boolean | null;
  nis2EntityType: string | null;
  craApplicable: boolean | null;
  nextSteps: string[];
}

export async function getOnboardingStatus(): Promise<OnboardingStatus> {
  const defaultStatus: OnboardingStatus = {
    onboardingCompleted: false,
    nis2Applicable: null,
    nis2EntityType: null,
    craApplicable: null,
    nextSteps: [],
  };

  try {
    const session = await auth();
    if (!session?.user) {
      return defaultStatus;
    }

    const orgId = (session.user as any).organisationId as string;
    if (!orgId) {
      return defaultStatus;
    }

    const [org] = await db
      .select()
      .from(organisations)
      .where(eq(organisations.id, orgId))
      .limit(1);

    if (!org) {
      return defaultStatus;
    }

    if (!org.onboardingCompleted) {
      return defaultStatus;
    }

    // Regenerate personalised next steps based on stored results
    const nextSteps: string[] = [];

    if (org.nis2Applicable) {
      nextSteps.push('Risikomanagement-Framework gemäß Art. 21 NIS2 aufsetzen');
      nextSteps.push('Meldeprozesse für Sicherheitsvorfälle einrichten (Art. 23)');
      nextSteps.push('Lieferkettensicherheit bewerten und dokumentieren');
      nextSteps.push('Maßnahmen gemäß NIS2 umsetzen');

      if (org.nis2EntityType === 'essential') {
        nextSteps.push('Registrierung als wesentliche Einrichtung bei der zuständigen Behörde');
        nextSteps.push('Geschäftsleitungs-Schulung zu Cybersecurity-Governance planen');
      }
    }

    if (org.craApplicable) {
      nextSteps.push('Produkt-Inventar mit CRA-Klassifizierung vervollständigen');
      nextSteps.push('SBOM (Software Bill of Materials) für alle Produkte erstellen');
      nextSteps.push('Schwachstellenmanagement-Prozess einrichten');
    }

    if (!org.nis2Applicable && !org.craApplicable) {
      nextSteps.push(
        'Obwohl NIS2 und CRA derzeit nicht direkt anwendbar sind, empfehlen wir grundlegende Cybersecurity-Maßnahmen.',
      );
    }

    // Always add general steps
    nextSteps.push('Asset-Inventar pflegen');
    nextSteps.push('Erste Risikobewertung erstellen');

    return {
      onboardingCompleted: true,
      nis2Applicable: org.nis2Applicable,
      nis2EntityType: org.nis2EntityType,
      craApplicable: org.craApplicable,
      nextSteps,
    };
  } catch (err) {
    console.error('[getOnboardingStatus] Error:', err);
    return defaultStatus;
  }
}
