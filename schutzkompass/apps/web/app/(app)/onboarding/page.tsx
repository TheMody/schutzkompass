'use client';

import React, { useState, useCallback } from 'react';
import { Wizard, useWizard, type WizardStep } from '@schutzkompass/ui';
import { computeOnboardingResults, saveOnboardingResults } from '@/lib/actions/onboarding';
import type { Nis2ApplicabilityInput } from '@/lib/services/nis2-applicability';
import type { CraClassificationInput } from '@/lib/services/cra-classifier';
import type { OnboardingResults } from '@/lib/actions/onboarding';
import { useRouter } from 'next/navigation';

import { nis2Sectors } from '@schutzkompass/compliance-content';

// ── Wizard Step Definitions ─────────────────────────────────────────

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'company',
    title: 'Unternehmensprofil',
    description: 'Grundlegende Informationen zu Ihrem Unternehmen',
  },
  {
    id: 'nis2',
    title: 'NIS2-Prüfung',
    description: 'Prüfung der Betroffenheit durch die NIS2-Richtlinie',
  },
  {
    id: 'cra',
    title: 'CRA-Prüfung',
    description: 'Einordnung Ihrer Produkte gemäß dem Cyber Resilience Act',
  },
  {
    id: 'results',
    title: 'Ergebnis',
    description: 'Ihre persönliche Compliance-Einschätzung',
  },
];

// ── Main Onboarding Page ────────────────────────────────────────────

export default function OnboardingPage() {
  const wizard = useWizard(WIZARD_STEPS.length);
  const router = useRouter();
  const [isCompleting, setIsCompleting] = useState(false);

  // Step 1 state
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [hrbNumber, setHrbNumber] = useState('');
  const [employeeCount, setEmployeeCount] = useState<number>(0);
  const [annualRevenue, setAnnualRevenue] = useState<number>(0);

  // Step 2 state
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [isSoleProvider, setIsSoleProvider] = useState(false);
  const [providesDns, setProvidesDns] = useState(false);
  const [isPublicAdmin, setIsPublicAdmin] = useState(false);
  const [isDesignated, setIsDesignated] = useState(false);
  const [wasCriticalCer, setWasCriticalCer] = useState(false);
  const [isTrustService, setIsTrustService] = useState(false);

  // Step 3 state
  const [hasProducts, setHasProducts] = useState(false);
  const [productHasDigital, setProductHasDigital] = useState(true);
  const [productOnEuMarket, setProductOnEuMarket] = useState(true);
  const [productType, setProductType] = useState('');
  const [productChars, setProductChars] = useState({
    isOsOrHypervisor: false,
    isNetworkSecurityDevice: false,
    isSecureMicroprocessor: false,
    isHardwareSecurityModule: false,
    isSmartcard: false,
    isSmartHomeOrIoT: false,
    isPasswordManager: false,
    isIamSystem: false,
    isVpn: false,
    isSiemOrSecurityMonitoring: false,
    isBootManager: false,
    isPkiOrCertManagement: false,
    isRouterOrModem: false,
    isIndustrialControlSystem: false,
    isRobot: false,
    isUsedInCriticalInfrastructure: false,
    processesPersonalData: false,
  });

  // Step 4 state
  const [results, setResults] = useState<OnboardingResults | null>(null);

  const handleStepChange = useCallback(
    async (step: number) => {
      // When navigating to results step, compute results
      if (step === 3 && !results) {
        setIsCompleting(true);
        try {
          const nis2Input: Nis2ApplicabilityInput = {
            sectors: selectedSectors.filter((s) => s !== 'none'),
            employeeCount,
            annualRevenue,
            isSoleProviderOfCriticalService: isSoleProvider,
            providesDnsOrTldServices: providesDns,
            isPublicAdministration: isPublicAdmin,
            isExplicitlyDesignated: isDesignated,
            wasCriticalUnderCer: wasCriticalCer,
            isTrustServiceProvider: isTrustService,
          };

          const craProducts: CraClassificationInput[] = hasProducts
            ? [
                {
                  hasDigitalElements: productHasDigital,
                  productType,
                  isPlacedOnEuMarket: productOnEuMarket,
                  characteristics: productChars,
                },
              ]
            : [];

          const res = await computeOnboardingResults(nis2Input, craProducts);
          setResults(res);
        } catch (e) {
          console.error('Error computing results:', e);
        } finally {
          setIsCompleting(false);
        }
      }
      wizard.goToStep(step);
    },
    [
      wizard,
      results,
      selectedSectors,
      employeeCount,
      annualRevenue,
      isSoleProvider,
      providesDns,
      isPublicAdmin,
      isDesignated,
      wasCriticalCer,
      isTrustService,
      hasProducts,
      productHasDigital,
      productOnEuMarket,
      productType,
      productChars,
    ],
  );

  const handleComplete = useCallback(async () => {
    if (!results) {
      router.push('/dashboard');
      return;
    }

    setIsCompleting(true);
    try {
      const saveResult = await saveOnboardingResults({
        companyName,
        address,
        hrbNumber,
        employeeCount,
        annualRevenue,
        nis2Applicable: results.summary.nis2Applicable,
        nis2EntityType: results.summary.nis2EntityType,
        craApplicable: results.summary.craApplicable,
        craCategoryHighest: results.summary.craCategoryHighest,
        overallRiskLevel: results.summary.overallRiskLevel,
        nextSteps: results.summary.nextSteps,
      });

      if (!saveResult.success) {
        console.error('[onboarding] Save error:', saveResult.error);
      }
    } catch (err) {
      console.error('[onboarding] Save error:', err);
    } finally {
      setIsCompleting(false);
    }

    router.push('/dashboard');
  }, [router, results, companyName, address, hrbNumber, employeeCount, annualRevenue]);

  const toggleSector = useCallback((sectorId: string) => {
    setSelectedSectors((prev) => {
      if (sectorId === 'none') {
        return prev.includes('none') ? [] : ['none'];
      }
      const without = prev.filter((s) => s !== 'none');
      return without.includes(sectorId) ? without.filter((s) => s !== sectorId) : [...without, sectorId];
    });
  }, []);

  const toggleProductChar = useCallback((key: keyof typeof productChars) => {
    setProductChars((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Willkommen bei SchutzKompass</h1>
        <p className="mt-2 text-muted-foreground">
          In wenigen Schritten ermitteln wir Ihre Betroffenheit durch die NIS2-Richtlinie und den Cyber
          Resilience Act (CRA).
        </p>
      </div>

      <Wizard
        steps={WIZARD_STEPS}
        currentStep={wizard.currentStep}
        onStepChange={handleStepChange}
        onComplete={handleComplete}
        isCompleting={isCompleting}
        completeLabel="Zum Dashboard →"
      >
        {wizard.currentStep === 0 && (
          <Step1CompanyProfile
            companyName={companyName}
            setCompanyName={setCompanyName}
            address={address}
            setAddress={setAddress}
            hrbNumber={hrbNumber}
            setHrbNumber={setHrbNumber}
            employeeCount={employeeCount}
            setEmployeeCount={setEmployeeCount}
            annualRevenue={annualRevenue}
            setAnnualRevenue={setAnnualRevenue}
          />
        )}
        {wizard.currentStep === 1 && (
          <Step2Nis2Check
            selectedSectors={selectedSectors}
            toggleSector={toggleSector}
            isSoleProvider={isSoleProvider}
            setIsSoleProvider={setIsSoleProvider}
            providesDns={providesDns}
            setProvidesDns={setProvidesDns}
            isPublicAdmin={isPublicAdmin}
            setIsPublicAdmin={setIsPublicAdmin}
            isDesignated={isDesignated}
            setIsDesignated={setIsDesignated}
            wasCriticalCer={wasCriticalCer}
            setWasCriticalCer={setWasCriticalCer}
            isTrustService={isTrustService}
            setIsTrustService={setIsTrustService}
          />
        )}
        {wizard.currentStep === 2 && (
          <Step3CraCheck
            hasProducts={hasProducts}
            setHasProducts={setHasProducts}
            productHasDigital={productHasDigital}
            setProductHasDigital={setProductHasDigital}
            productOnEuMarket={productOnEuMarket}
            setProductOnEuMarket={setProductOnEuMarket}
            productType={productType}
            setProductType={setProductType}
            productChars={productChars}
            toggleProductChar={toggleProductChar}
          />
        )}
        {wizard.currentStep === 3 && <Step4Results results={results} />}
      </Wizard>
    </div>
  );
}

// ── Step 1: Company Profile ─────────────────────────────────────────

function Step1CompanyProfile({
  companyName,
  setCompanyName,
  address,
  setAddress,
  hrbNumber,
  setHrbNumber,
  employeeCount,
  setEmployeeCount,
  annualRevenue,
  setAnnualRevenue,
}: {
  companyName: string;
  setCompanyName: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  hrbNumber: string;
  setHrbNumber: (v: string) => void;
  employeeCount: number;
  setEmployeeCount: (v: number) => void;
  annualRevenue: number;
  setAnnualRevenue: (v: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium mb-1.5">
          Unternehmensname *
        </label>
        <input
          id="companyName"
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Muster GmbH"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium mb-1.5">
          Adresse
        </label>
        <input
          id="address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Musterstraße 1, 12345 Berlin"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      <div>
        <label htmlFor="hrbNumber" className="block text-sm font-medium mb-1.5">
          Handelsregisternummer
        </label>
        <input
          id="hrbNumber"
          type="text"
          value={hrbNumber}
          onChange={(e) => setHrbNumber(e.target.value)}
          placeholder="HRB 12345"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="employeeCount" className="block text-sm font-medium mb-1.5">
            Anzahl Mitarbeiter *
          </label>
          <input
            id="employeeCount"
            type="number"
            min={0}
            value={employeeCount || ''}
            onChange={(e) => setEmployeeCount(parseInt(e.target.value) || 0)}
            placeholder="z.B. 120"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Relevant für die Größenklassifizierung (NIS2: ≥50 Mitarbeiter)
          </p>
        </div>

        <div>
          <label htmlFor="annualRevenue" className="block text-sm font-medium mb-1.5">
            Jahresumsatz (EUR) *
          </label>
          <input
            id="annualRevenue"
            type="number"
            min={0}
            value={annualRevenue || ''}
            onChange={(e) => setAnnualRevenue(parseInt(e.target.value) || 0)}
            placeholder="z.B. 15000000"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Relevant für die Größenklassifizierung (NIS2: ≥10 Mio. €)
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Step 2: NIS2 Check ──────────────────────────────────────────────

function Step2Nis2Check({
  selectedSectors,
  toggleSector,
  isSoleProvider,
  setIsSoleProvider,
  providesDns,
  setProvidesDns,
  isPublicAdmin,
  setIsPublicAdmin,
  isDesignated,
  setIsDesignated,
  wasCriticalCer,
  setWasCriticalCer,
  isTrustService,
  setIsTrustService,
}: {
  selectedSectors: string[];
  toggleSector: (id: string) => void;
  isSoleProvider: boolean;
  setIsSoleProvider: (v: boolean) => void;
  providesDns: boolean;
  setProvidesDns: (v: boolean) => void;
  isPublicAdmin: boolean;
  setIsPublicAdmin: (v: boolean) => void;
  isDesignated: boolean;
  setIsDesignated: (v: boolean) => void;
  wasCriticalCer: boolean;
  setWasCriticalCer: (v: boolean) => void;
  isTrustService: boolean;
  setIsTrustService: (v: boolean) => void;
}) {
  const annexISectors = nis2Sectors.filter((s) => s.annex === 'I');
  const annexIISectors = nis2Sectors.filter((s) => s.annex === 'II');
  const noneSector = nis2Sectors.find((s) => s.id === 'none');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3">
          In welchen Sektoren ist Ihr Unternehmen tätig? *
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Wählen Sie alle zutreffenden Sektoren gemäß NIS2-Richtlinie aus.
        </p>

        {/* Annex I */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">
            Anhang I — Sektoren mit hoher Kritikalität
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {annexISectors.map((sector) => (
              <label
                key={sector.id}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                  selectedSectors.includes(sector.id)
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedSectors.includes(sector.id)}
                  onChange={() => toggleSector(sector.id)}
                  className="accent-primary"
                />
                <span>{sector.name_de}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Annex II */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">
            Anhang II — Sonstige kritische Sektoren
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {annexIISectors.map((sector) => (
              <label
                key={sector.id}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                  selectedSectors.includes(sector.id)
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedSectors.includes(sector.id)}
                  onChange={() => toggleSector(sector.id)}
                  className="accent-primary"
                />
                <span>{sector.name_de}</span>
              </label>
            ))}
          </div>
        </div>

        {/* None */}
        {noneSector && (
          <label
            className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm cursor-pointer transition-colors ${
              selectedSectors.includes('none')
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border hover:border-primary/40'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedSectors.includes('none')}
              onChange={() => toggleSector('none')}
              className="accent-primary"
            />
            <span>{noneSector.name_de}</span>
          </label>
        )}
      </div>

      {/* Special conditions */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold mb-3">Besondere Umstände</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Die folgenden Kriterien können dazu führen, dass NIS2 unabhängig von der Unternehmensgröße
          anwendbar ist.
        </p>
        <div className="space-y-2">
          <Checkbox
            label="Einziger Anbieter eines kritischen Dienstes in einem Mitgliedstaat"
            checked={isSoleProvider}
            onChange={setIsSoleProvider}
          />
          <Checkbox
            label="Anbieter von DNS-Diensten, TLD-Registern oder Domain-Registrierung"
            checked={providesDns}
            onChange={setProvidesDns}
          />
          <Checkbox
            label="Einrichtung der öffentlichen Verwaltung"
            checked={isPublicAdmin}
            onChange={setIsPublicAdmin}
          />
          <Checkbox
            label="Explizit von einem Mitgliedstaat als NIS2-Einrichtung identifiziert"
            checked={isDesignated}
            onChange={setIsDesignated}
          />
          <Checkbox
            label="Bereits als kritische Einrichtung nach CER-Richtlinie identifiziert"
            checked={wasCriticalCer}
            onChange={setWasCriticalCer}
          />
          <Checkbox
            label="Qualifizierter Vertrauensdiensteanbieter"
            checked={isTrustService}
            onChange={setIsTrustService}
          />
        </div>
      </div>
    </div>
  );
}

// ── Step 3: CRA Check ───────────────────────────────────────────────

const CRA_PRODUCT_CHARACTERISTICS: { key: keyof typeof INITIAL_CHARS; label: string }[] = [
  { key: 'isOsOrHypervisor', label: 'Betriebssystem, Hypervisor oder Container-Laufzeit' },
  { key: 'isNetworkSecurityDevice', label: 'Firewall, IDS/IPS oder Netzwerksicherheitsgerät' },
  { key: 'isSecureMicroprocessor', label: 'Mikroprozessor mit Sicherheitsfunktionen' },
  { key: 'isHardwareSecurityModule', label: 'Hardware Security Module (HSM), TPM oder Secure Element' },
  { key: 'isSmartcard', label: 'Smartcard oder ähnliches sicheres Gerät' },
  { key: 'isSmartHomeOrIoT', label: 'Smart-Home- oder IoT-Gerät' },
  { key: 'isPasswordManager', label: 'Passwort-Manager' },
  { key: 'isIamSystem', label: 'Identitäts- und Zugangsmanagementsystem (IAM)' },
  { key: 'isVpn', label: 'VPN-Produkt' },
  { key: 'isSiemOrSecurityMonitoring', label: 'SIEM, SOAR oder Sicherheitsüberwachung' },
  { key: 'isBootManager', label: 'Boot-Manager oder BIOS/UEFI-System' },
  { key: 'isPkiOrCertManagement', label: 'PKI- oder Zertifikatsverwaltung' },
  { key: 'isRouterOrModem', label: 'Router, Modem oder Switch' },
  { key: 'isIndustrialControlSystem', label: 'Industrielles Steuerungssystem (ICS/SCADA)' },
  { key: 'isRobot', label: 'Roboter (industriell oder persönlich)' },
  { key: 'isUsedInCriticalInfrastructure', label: 'Einsatz in kritischer Infrastruktur' },
  { key: 'processesPersonalData', label: 'Verarbeitung personenbezogener Daten als Hauptfunktion' },
];

const INITIAL_CHARS = {
  isOsOrHypervisor: false,
  isNetworkSecurityDevice: false,
  isSecureMicroprocessor: false,
  isHardwareSecurityModule: false,
  isSmartcard: false,
  isSmartHomeOrIoT: false,
  isPasswordManager: false,
  isIamSystem: false,
  isVpn: false,
  isSiemOrSecurityMonitoring: false,
  isBootManager: false,
  isPkiOrCertManagement: false,
  isRouterOrModem: false,
  isIndustrialControlSystem: false,
  isRobot: false,
  isUsedInCriticalInfrastructure: false,
  processesPersonalData: false,
};

function Step3CraCheck({
  hasProducts,
  setHasProducts,
  productHasDigital,
  setProductHasDigital,
  productOnEuMarket,
  setProductOnEuMarket,
  productType,
  setProductType,
  productChars,
  toggleProductChar,
}: {
  hasProducts: boolean;
  setHasProducts: (v: boolean) => void;
  productHasDigital: boolean;
  setProductHasDigital: (v: boolean) => void;
  productOnEuMarket: boolean;
  setProductOnEuMarket: (v: boolean) => void;
  productType: string;
  setProductType: (v: string) => void;
  productChars: typeof INITIAL_CHARS;
  toggleProductChar: (key: keyof typeof INITIAL_CHARS) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-muted/50 p-4">
        <p className="text-sm">
          Der <strong>Cyber Resilience Act (CRA)</strong> betrifft Hersteller, Importeure und Händler
          von Produkten mit digitalen Elementen, die auf dem EU-Markt bereitgestellt werden.
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">
          Stellt Ihr Unternehmen Produkte mit digitalen Elementen her oder vertreibt diese?
        </h3>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="hasProducts"
              checked={hasProducts}
              onChange={() => setHasProducts(true)}
              className="accent-primary"
            />
            <span className="text-sm">Ja</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="hasProducts"
              checked={!hasProducts}
              onChange={() => setHasProducts(false)}
              className="accent-primary"
            />
            <span className="text-sm">Nein</span>
          </label>
        </div>
      </div>

      {hasProducts && (
        <>
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">Produktinformationen</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="productType" className="block text-sm font-medium mb-1.5">
                  Produktbezeichnung / -typ
                </label>
                <input
                  id="productType"
                  type="text"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  placeholder="z.B. Smart-Home-Gateway, Cloud-Plattform..."
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <Checkbox
                label="Das Produkt enthält digitale Elemente (Software, Netzwerkverbindung)"
                checked={productHasDigital}
                onChange={setProductHasDigital}
              />
              <Checkbox
                label="Das Produkt wird auf dem EU-Markt bereitgestellt"
                checked={productOnEuMarket}
                onChange={setProductOnEuMarket}
              />
            </div>
          </div>

          {productHasDigital && productOnEuMarket && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">Produktkategorie-Merkmale</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Wählen Sie alle zutreffenden Merkmale aus. Diese bestimmen die CRA-Einstufung.
              </p>
              <div className="space-y-2">
                {CRA_PRODUCT_CHARACTERISTICS.map((char) => (
                  <Checkbox
                    key={char.key}
                    label={char.label}
                    checked={productChars[char.key]}
                    onChange={() => toggleProductChar(char.key)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!hasProducts && (
        <div className="rounded-lg border-l-4 border-blue-400 bg-blue-50 p-4 dark:bg-blue-950/20">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Der CRA ist primär für Hersteller und Vertreiber von Produkten mit digitalen Elementen
            relevant. Wenn Sie keine solchen Produkte herstellen, ist der CRA für Ihr Unternehmen
            voraussichtlich nicht direkt anwendbar.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Step 4: Results ─────────────────────────────────────────────────

function Step4Results({ results }: { results: OnboardingResults | null }) {
  if (!results) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Ihre Ergebnisse werden berechnet...</p>
        </div>
      </div>
    );
  }

  const { nis2, cra, summary } = results;

  const riskColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  const riskLabels = {
    low: 'Niedrig',
    medium: 'Mittel',
    high: 'Hoch',
  };

  return (
    <div className="space-y-6">
      {/* Overall risk */}
      <div className="rounded-lg border p-6 text-center">
        <p className="text-sm text-muted-foreground mb-2">Gesamteinschätzung Compliance-Risiko</p>
        <span
          className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold ${riskColors[summary.overallRiskLevel]}`}
        >
          {riskLabels[summary.overallRiskLevel]}
        </span>
      </div>

      {/* NIS2 Result */}
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">NIS2-Richtlinie</h3>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              nis2.applicable
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
            }`}
          >
            {nis2.applicable ? `Betroffen — ${nis2.entityType === 'essential' ? 'Wesentliche' : 'Wichtige'} Einrichtung` : 'Nicht betroffen'}
          </span>
        </div>

        {nis2.matchedSectors.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Relevante Sektoren:</p>
            <div className="flex flex-wrap gap-1">
              {nis2.matchedSectors.map((s) => (
                <span
                  key={s.sector}
                  className="rounded bg-muted px-2 py-0.5 text-xs"
                >
                  {s.label} (Anhang {s.annex})
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1">
          {nis2.reasoning.map((r, i) => (
            <p key={i} className="text-sm text-muted-foreground">
              • {r}
            </p>
          ))}
        </div>

        <div className="mt-2">
          <span className="text-xs text-muted-foreground">
            Konfidenz: {nis2.confidence === 'high' ? 'Hoch' : nis2.confidence === 'medium' ? 'Mittel' : 'Niedrig'}
          </span>
        </div>
      </div>

      {/* CRA Result */}
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Cyber Resilience Act (CRA)</h3>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              summary.craApplicable
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
            }`}
          >
            {summary.craApplicable ? `Betroffen — ${summary.craCategoryHighest}` : 'Nicht betroffen'}
          </span>
        </div>

        {cra.map((product, i) => (
          <div key={i} className="space-y-1">
            {product.reasoning.map((r, j) => (
              <p key={j} className="text-sm text-muted-foreground">
                • {r}
              </p>
            ))}
            {product.applicable && product.conformityPathways.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">Konformitätsbewertung:</p>
                <p className="text-sm">
                  {product.recommendedPathway.label}: {product.recommendedPathway.description}
                </p>
              </div>
            )}
          </div>
        ))}

        {cra.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Keine Produkte angegeben — der CRA ist voraussichtlich nicht direkt anwendbar.
          </p>
        )}
      </div>

      {/* Next Steps */}
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold mb-3">Empfohlene nächste Schritte</h3>
        <ol className="space-y-2">
          {summary.nextSteps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// ── Shared Components ───────────────────────────────────────────────

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2 cursor-pointer rounded-lg border px-3 py-2.5 text-sm transition-colors hover:border-primary/40">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 accent-primary"
      />
      <span>{label}</span>
    </label>
  );
}
