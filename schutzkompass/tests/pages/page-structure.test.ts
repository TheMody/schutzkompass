import { describe, it, expect } from 'vitest';
import * as fs from 'fs';

/**
 * Page structure tests — verify every page file exists, compiles pattern,
 * has correct navigation structure, and uses proper German labels.
 */

const APP_DIR = 'apps/web/app';

// ── Helper ──────────────────────────────────────────────────────────

function readPage(relPath: string): string {
  return fs.readFileSync(`${APP_DIR}/${relPath}`, 'utf-8');
}

// ── A. Auth pages ───────────────────────────────────────────────────

describe('Auth Pages Structure', () => {
  it('login page has email + password fields and error handling', () => {
    const src = readPage('(auth)/login/page.tsx');
    expect(src).toContain('type="email"');
    expect(src).toContain('type="password"');
    expect(src).toContain('setError');
    expect(src).toContain('setIsLoading');
  });

  it('register page has name + company + email + password fields', () => {
    const src = readPage('(auth)/register/page.tsx');
    expect(src).toContain('name="name"');
    expect(src).toContain('name="company"');
    expect(src).toContain('name="email"');
    expect(src).toContain('name="password"');
    expect(src).toContain('minLength={8}');
  });

  it('register page auto-logs in after registration', () => {
    const src = readPage('(auth)/register/page.tsx');
    expect(src).toContain('loginUser');
    // Falls back to redirect if auto-login fails
    expect(src).toContain("router.push('/login')");
  });
});

// ── B. Dashboard ────────────────────────────────────────────────────

describe('Dashboard Page Structure', () => {
  it('shows 4 overview cards', () => {
    const src = readPage('(app)/dashboard/page.tsx');
    expect(src).toContain('NIS2-Compliance');
    expect(src).toContain('Registrierte Assets');
    expect(src).toContain('Offene Maßnahmen');
    expect(src).toContain('Kritische / Hohe Risiken');
  });

  it('includes compliance donut chart', () => {
    const src = readPage('(app)/dashboard/page.tsx');
    expect(src).toContain('ComplianceDonut');
    expect(src).toContain('Compliance-Fortschritt');
  });

  it('includes risk heatmap chart', () => {
    const src = readPage('(app)/dashboard/page.tsx');
    expect(src).toContain('RiskHeatmapChart');
    expect(src).toContain('Risikomatrix');
  });

  it('includes risk distribution bar chart', () => {
    const src = readPage('(app)/dashboard/page.tsx');
    expect(src).toContain('Risikoverteilung');
    expect(src).toContain('critical');
    expect(src).toContain('high');
    expect(src).toContain('medium');
    expect(src).toContain('low');
    expect(src).toContain('negligible');
  });

  it('shows onboarding CTA when not completed', () => {
    const src = readPage('(app)/dashboard/page.tsx');
    expect(src).toContain('Onboarding abschließen');
    expect(src).toContain('/onboarding');
    expect(src).toContain('onboardingCompleted');
  });

  it('shows dynamic next steps from onboarding results', () => {
    const src = readPage('(app)/dashboard/page.tsx');
    expect(src).toContain('nextSteps');
    expect(src).toContain('stepToLink');
    expect(src).toContain('Nächste Schritte');
  });

  it('shows static next steps as fallback', () => {
    const src = readPage('(app)/dashboard/page.tsx');
    expect(src).toContain('Betroffenheits-Check durchführen');
    expect(src).toContain('Asset-Inventar pflegen');
    expect(src).toContain('Maßnahmen umsetzen');
    expect(src).toContain('Erste Risikobewertung erstellen');
    expect(src).toContain('Produkte registrieren');
  });

  it('loads data via server actions', () => {
    const src = readPage('(app)/dashboard/page.tsx');
    expect(src).toContain('getControlsStatistics');
    expect(src).toContain('getAssets');
    expect(src).toContain('getRiskAssessments');
    expect(src).toContain('getOnboardingStatus');
  });
});

// ── C. Onboarding ───────────────────────────────────────────────────

describe('Onboarding Page Structure', () => {
  it('has 4-step wizard', () => {
    const src = readPage('(app)/onboarding/page.tsx');
    expect(src).toContain('Unternehmensprofil');
    expect(src).toContain('NIS2-Prüfung');
    expect(src).toContain('CRA-Prüfung');
    expect(src).toContain('Ergebnis');
  });

  it('collects company information in step 1', () => {
    const src = readPage('(app)/onboarding/page.tsx');
    expect(src).toContain('companyName');
    expect(src).toContain('employeeCount');
    expect(src).toContain('annualRevenue');
  });

  it('checks NIS2 criteria in step 2', () => {
    const src = readPage('(app)/onboarding/page.tsx');
    expect(src).toContain('selectedSectors');
    expect(src).toContain('isSoleProvider');
    expect(src).toContain('providesDns');
    expect(src).toContain('isPublicAdmin');
  });

  it('checks CRA criteria in step 3', () => {
    const src = readPage('(app)/onboarding/page.tsx');
    expect(src).toContain('hasProducts');
    expect(src).toContain('productType');
    expect(src).toContain('productChars');
  });

  it('computes and saves results', () => {
    const src = readPage('(app)/onboarding/page.tsx');
    expect(src).toContain('computeOnboardingResults');
    expect(src).toContain('saveOnboardingResults');
  });

  it('redirects to dashboard on completion', () => {
    const src = readPage('(app)/onboarding/page.tsx');
    expect(src).toContain("router.push('/dashboard')");
  });
});

// ── D. Asset Management ─────────────────────────────────────────────

describe('Asset Inventory Page Structure', () => {
  it('has CRUD operations', () => {
    const src = readPage('(app)/organisation/assets/page.tsx');
    expect(src).toContain('createAsset');
    expect(src).toContain('updateAsset');
    expect(src).toContain('deleteAsset');
    expect(src).toContain('Asset hinzufügen');
  });

  it('has search and filters', () => {
    const src = readPage('(app)/organisation/assets/page.tsx');
    expect(src).toContain('search');
    expect(src).toContain('filterType');
    expect(src).toContain('filterCriticality');
    expect(src).toContain('Assets suchen');
  });

  it('supports CSV import', () => {
    const src = readPage('(app)/organisation/assets/page.tsx');
    expect(src).toContain('importAssetsFromCsv');
    expect(src).toContain('CSV Import');
  });

  it('displays stats cards', () => {
    const src = readPage('(app)/organisation/assets/page.tsx');
    expect(src).toContain('stats.total');
    expect(src).toContain('stats.critical');
  });
});

// ── E. Risk Management ──────────────────────────────────────────────

describe('Risk Management Page Structure', () => {
  it('has 3-step risk wizard', () => {
    const src = readPage('(app)/organisation/risiken/page.tsx');
    expect(src).toContain('Assets auswählen');
    expect(src).toContain('Bedrohungen bewerten');
    expect(src).toContain('Risikobehandlung');
  });

  it('uses threat catalog for risk identification', () => {
    const src = readPage('(app)/organisation/risiken/page.tsx');
    expect(src).toContain('threatCatalog');
  });

  it('uses risk scoring engine', () => {
    const src = readPage('(app)/organisation/risiken/page.tsx');
    expect(src).toContain('calculateRiskScore');
    expect(src).toContain('getRiskMatrix');
  });

  it('supports risk treatment assignment', () => {
    const src = readPage('(app)/organisation/risiken/page.tsx');
    expect(src).toContain('RISK_TREATMENTS');
    expect(src).toContain('RISK_TREATMENT_LABELS');
  });
});

// ── F. Controls & Measures ──────────────────────────────────────────

describe('Controls Page Structure', () => {
  it('has control status management', () => {
    const src = readPage('(app)/organisation/massnahmen/page.tsx');
    expect(src).toContain('getControls');
    expect(src).toContain('updateControl');
    expect(src).toContain('CONTROL_STATUS_LABELS');
  });

  it('includes statistics', () => {
    const src = readPage('(app)/organisation/massnahmen/page.tsx');
    expect(src).toContain('getControlsStatistics');
  });
});

// ── G. Policy Library ───────────────────────────────────────────────

describe('Policy Library Page Structure', () => {
  it('displays policy templates', () => {
    const src = readPage('(app)/organisation/richtlinien/page.tsx');
    expect(src).toContain('getPolicies');
    // Should have NIS2 policy content
    expect(src).toContain('Richtlinien');
  });
});

// ── H. Supply Chain ─────────────────────────────────────────────────

describe('Supply Chain Page Structure', () => {
  it('has supplier CRUD', () => {
    const src = readPage('(app)/organisation/lieferkette/page.tsx');
    expect(src).toContain('createSupplier');
    expect(src).toContain('getSuppliers');
    expect(src).toContain('sendQuestionnaire');
  });

  it('has risk classification', () => {
    const src = readPage('(app)/organisation/lieferkette/page.tsx');
    expect(src).toContain('RISK_CLASS_LABELS');
  });

  it('has questionnaire system', () => {
    const src = readPage('(app)/organisation/lieferkette/page.tsx');
    expect(src).toContain('QUESTIONNAIRE');
    expect(src).toContain('sendQuestionnaire');
  });
});

// ── I. Incident Management ──────────────────────────────────────────

describe('Incident Management Page Structure', () => {
  it('has incident CRUD', () => {
    const src = readPage('(app)/organisation/vorfaelle/page.tsx');
    expect(src).toContain('createIncident');
    expect(src).toContain('updateIncidentStatus');
    expect(src).toContain('getIncidents');
  });

  it('has severity and status labels', () => {
    const src = readPage('(app)/organisation/vorfaelle/page.tsx');
    expect(src).toContain('INCIDENT_SEVERITY_LABELS');
    expect(src).toContain('INCIDENT_STATUS_LABELS');
  });

  it('has category filtering', () => {
    const src = readPage('(app)/organisation/vorfaelle/page.tsx');
    expect(src).toContain('INCIDENT_CATEGORY_LABELS');
  });
});

// ── J. Audit & Evidence ─────────────────────────────────────────────

describe('Audit Page Structure', () => {
  it('exists and is client component', () => {
    const src = readPage('(app)/organisation/audit/page.tsx');
    expect(src).toContain("'use client'");
  });
});

// ── K. Products (CRA) ──────────────────────────────────────────────

describe('Product Pages Structure', () => {
  it('product inventory has CRUD', () => {
    const src = readPage('(app)/produkte/page.tsx');
    expect(src).toContain('createProduct');
  });

  it('SBOM manager exists', () => {
    const src = readPage('(app)/produkte/sbom/page.tsx');
    expect(src).toContain('SBOM');
  });

  it('vulnerability monitor exists', () => {
    const src = readPage('(app)/produkte/schwachstellen/page.tsx');
    expect(src).toContain('Schwachstellen');
  });

  it('conformity documentation exists', () => {
    const src = readPage('(app)/produkte/konformitaet/page.tsx');
    expect(src).toContain('Konformit');
  });

  it('product lifecycle exists', () => {
    const src = readPage('(app)/produkte/lebenszyklus/page.tsx');
    expect(src).toContain('Lebenszyklus');
  });

  it('regulatory reports (Meldewesen) exists', () => {
    const src = readPage('(app)/produkte/meldungen/page.tsx');
    expect(src).toContain('Meldung');
  });
});

// ── L. Settings ─────────────────────────────────────────────────────

describe('Settings Pages Structure', () => {
  it('organization settings page exists', () => {
    const src = readPage('(app)/einstellungen/organisation/page.tsx');
    expect(src).toContain('Organisation');
  });

  it('user management page exists', () => {
    const src = readPage('(app)/einstellungen/benutzer/page.tsx');
    expect(src).toContain('Benutzer');
  });

  it('integrations page exists', () => {
    const src = readPage('(app)/einstellungen/integrationen/page.tsx');
    expect(src).toContain('Integration');
  });
});

// ── M. Help ─────────────────────────────────────────────────────────

describe('Help Page Structure', () => {
  it('help page exists', () => {
    const src = readPage('(app)/hilfe/page.tsx');
    expect(src).toContain('Hilfe');
  });
});

// ── N. Navigation ───────────────────────────────────────────────────

describe('Navigation Structure', () => {
  it('sidebar has all main sections', () => {
    const src = fs.readFileSync(
      'apps/web/components/shared/app-sidebar.tsx',
      'utf-8'
    );
    expect(src).toContain('Dashboard');
    expect(src).toContain('Organisation (NIS2)');
    expect(src).toContain('Produkte (CRA)');
    expect(src).toContain('Einstellungen');
    expect(src).toContain('Hilfe & Support');
  });

  it('sidebar has all NIS2 sub-navigation', () => {
    const src = fs.readFileSync(
      'apps/web/components/shared/app-sidebar.tsx',
      'utf-8'
    );
    expect(src).toContain('Betroffenheits-Check');
    expect(src).toContain('Asset-Inventar');
    expect(src).toContain('Risikobewertung');
    expect(src).toContain('Maßnahmen-Tracker');
    expect(src).toContain('Richtlinien-Bibliothek');
    expect(src).toContain('Lieferketten-Sicherheit');
    expect(src).toContain('Vorfallmanagement');
    expect(src).toContain('Audit & Nachweise');
  });

  it('sidebar has all CRA sub-navigation', () => {
    const src = fs.readFileSync(
      'apps/web/components/shared/app-sidebar.tsx',
      'utf-8'
    );
    expect(src).toContain('Produkt-Inventar');
    expect(src).toContain('SBOM-Manager');
    expect(src).toContain('Schwachstellen-Monitor');
    expect(src).toContain('Meldewesen');
    expect(src).toContain('Konformitäts-Dokumentation');
    expect(src).toContain('Produkt-Lebenszyklus');
  });

  it('sidebar has correct href links', () => {
    const src = fs.readFileSync(
      'apps/web/components/shared/app-sidebar.tsx',
      'utf-8'
    );
    expect(src).toContain("'/dashboard'");
    expect(src).toContain("'/organisation/betroffenheit'");
    expect(src).toContain("'/organisation/assets'");
    expect(src).toContain("'/organisation/risiken'");
    expect(src).toContain("'/organisation/massnahmen'");
    expect(src).toContain("'/organisation/richtlinien'");
    expect(src).toContain("'/organisation/lieferkette'");
    expect(src).toContain("'/organisation/vorfaelle'");
    expect(src).toContain("'/organisation/audit'");
    expect(src).toContain("'/produkte'");
    expect(src).toContain("'/produkte/sbom'");
    expect(src).toContain("'/produkte/schwachstellen'");
    expect(src).toContain("'/produkte/meldungen'");
    expect(src).toContain("'/produkte/konformitaet'");
    expect(src).toContain("'/produkte/lebenszyklus'");
    expect(src).toContain("'/einstellungen/organisation'");
    expect(src).toContain("'/einstellungen/benutzer'");
    expect(src).toContain("'/einstellungen/integrationen'");
    expect(src).toContain("'/hilfe'");
  });

  it('sidebar has active state highlighting', () => {
    const src = fs.readFileSync(
      'apps/web/components/shared/app-sidebar.tsx',
      'utf-8'
    );
    expect(src).toContain('isActive');
    expect(src).toContain('bg-primary/10');
  });

  it('topbar has notification bell with badge', () => {
    const src = fs.readFileSync(
      'apps/web/components/shared/top-bar.tsx',
      'utf-8'
    );
    expect(src).toContain('Bell');
    expect(src).toContain('unreadCount');
    expect(src).toContain('Benachrichtigungen');
    expect(src).toContain('Alle gelesen');
  });

  it('topbar has user menu with logout', () => {
    const src = fs.readFileSync(
      'apps/web/components/shared/top-bar.tsx',
      'utf-8'
    );
    expect(src).toContain('signOut');
    expect(src).toContain('LogOut');
    expect(src).toContain('session');
  });

  it('app layout combines sidebar + topbar + main content', () => {
    const src = fs.readFileSync(
      'apps/web/app/(app)/layout.tsx',
      'utf-8'
    );
    expect(src).toContain('AppSidebar');
    expect(src).toContain('TopBar');
    expect(src).toContain('<main');
    expect(src).toContain('overflow-y-auto');
  });
});

// ── O. Supplier Questionnaire ───────────────────────────────────────

describe('Supplier Questionnaire Page', () => {
  it('is a full questionnaire implementation with token validation', () => {
    const src = readPage('(supplier)/fragebogen/[token]/page.tsx');
    expect(src).toContain('Lieferanten-Sicherheitsbewertung');
    expect(src).toContain('getSupplierByToken');
    expect(src).toContain('submitQuestionnaireResponses');
    expect(src).toContain('QUESTIONNAIRE');
    expect(src).toContain('handleSubmit');
  });

  it('handles invalid token, already completed, and submission states', () => {
    const src = readPage('(supplier)/fragebogen/[token]/page.tsx');
    expect(src).toContain('invalidToken');
    expect(src).toContain('alreadyCompleted');
    expect(src).toContain('Ungültiger Link');
    expect(src).toContain('Bereits eingereicht');
    expect(src).toContain('Vielen Dank');
  });

  it('has progress tracking and category accordion', () => {
    const src = readPage('(supplier)/fragebogen/[token]/page.tsx');
    expect(src).toContain('answeredCount');
    expect(src).toContain('expandedCategories');
    expect(src).toContain('toggleCategory');
    expect(src).toContain('progress');
  });
});

// ── P. Betroffenheits-Check ─────────────────────────────────────────

describe('Betroffenheits-Check Page', () => {
  it('redirects to onboarding wizard', () => {
    const src = readPage('(app)/organisation/betroffenheit/page.tsx');
    expect(src).toContain('/onboarding');
    expect(src).toContain('Betroffenheits-Check');
  });
});
