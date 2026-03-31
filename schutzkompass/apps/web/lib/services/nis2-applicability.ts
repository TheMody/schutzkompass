/**
 * NIS2 Applicability Engine
 *
 * Implements the NIS2 Directive (EU 2022/2555) applicability logic.
 * Determines if an organisation falls under NIS2 as "essential" or "important" entity.
 */

// NIS2 Annex I: Sectors of High Criticality (Wesentliche Einrichtungen)
// IDs match packages/compliance-content/nis2/sectors.json
const ANNEX_I_SECTORS = [
  'energy',
  'transport',
  'banking',
  'financial_market',
  'health',
  'drinking_water',
  'waste_water',
  'digital_infrastructure',
  'ict_service_management',
  'public_administration',
  'space',
];

// NIS2 Annex II: Other Critical Sectors (Wichtige Einrichtungen)
const ANNEX_II_SECTORS = [
  'postal',
  'waste_management',
  'chemicals',
  'food',
  'manufacturing',
  'digital_providers',
  'research',
];

export interface Nis2ApplicabilityInput {
  /** Selected NACE sector codes or NIS2 sector identifiers */
  sectors: string[];
  /** Number of employees */
  employeeCount: number;
  /** Annual revenue in EUR */
  annualRevenue: number;
  /** Annual balance sheet total in EUR */
  balanceSheetTotal?: number;
  /** Is the org a sole provider of critical service in a member state? */
  isSoleProviderOfCriticalService?: boolean;
  /** Does the org provide DNS, TLD, or domain registration services? */
  providesDnsOrTldServices?: boolean;
  /** Is the org a public administration entity? */
  isPublicAdministration?: boolean;
  /** Has a member state explicitly designated the org? */
  isExplicitlyDesignated?: boolean;
  /** Was the org previously identified as critical under CER Directive? */
  wasCriticalUnderCer?: boolean;
  /** Is the org a trust service provider? */
  isTrustServiceProvider?: boolean;
}

export interface Nis2ApplicabilityResult {
  /** Whether NIS2 applies to this organisation */
  applicable: boolean;
  /** Entity type: 'essential' | 'important' | 'not_applicable' */
  entityType: 'essential' | 'important' | 'not_applicable';
  /** Human-readable explanation in German */
  reasoning: string[];
  /** Which NIS2 sectors the org falls under */
  matchedSectors: {
    sector: string;
    annex: 'I' | 'II';
    label: string;
  }[];
  /** Size classification */
  sizeCategory: 'large' | 'medium' | 'small' | 'micro';
  /** Confidence level of the assessment */
  confidence: 'high' | 'medium' | 'low';
}

const SECTOR_LABELS: Record<string, string> = {
  energy: 'Energie',
  transport: 'Verkehr',
  banking: 'Bankwesen',
  financial_market: 'Finanzmarktinfrastrukturen',
  health: 'Gesundheitswesen',
  drinking_water: 'Trinkwasser',
  waste_water: 'Abwasser',
  digital_infrastructure: 'Digitale Infrastruktur',
  ict_service_management: 'IKT-Dienstleistungsmanagement (B2B)',
  public_administration: 'Öffentliche Verwaltung',
  space: 'Weltraum',
  postal: 'Post- und Kurierdienste',
  waste_management: 'Abfallbewirtschaftung',
  chemicals: 'Chemie',
  food: 'Lebensmittel',
  manufacturing: 'Verarbeitendes Gewerbe / Herstellung',
  digital_providers: 'Digitale Dienste',
  research: 'Forschung',
};

function classifySize(employeeCount: number, annualRevenue: number): 'large' | 'medium' | 'small' | 'micro' {
  const revenueInMillions = annualRevenue / 1_000_000;

  if (employeeCount >= 250 || revenueInMillions >= 50) {
    return 'large';
  }
  if (employeeCount >= 50 || revenueInMillions >= 10) {
    return 'medium';
  }
  if (employeeCount >= 10 || revenueInMillions >= 2) {
    return 'small';
  }
  return 'micro';
}

export function checkNis2Applicability(input: Nis2ApplicabilityInput): Nis2ApplicabilityResult {
  const reasoning: string[] = [];
  const matchedSectors: Nis2ApplicabilityResult['matchedSectors'] = [];

  // 1. Classify by sector
  const annexISectors = input.sectors.filter((s) => ANNEX_I_SECTORS.includes(s));
  const annexIISectors = input.sectors.filter((s) => ANNEX_II_SECTORS.includes(s));

  for (const sector of annexISectors) {
    matchedSectors.push({
      sector,
      annex: 'I',
      label: SECTOR_LABELS[sector] || sector,
    });
  }
  for (const sector of annexIISectors) {
    matchedSectors.push({
      sector,
      annex: 'II',
      label: SECTOR_LABELS[sector] || sector,
    });
  }

  const hasAnnexISector = annexISectors.length > 0;
  const hasAnnexIISector = annexIISectors.length > 0;
  const hasAnySector = hasAnnexISector || hasAnnexIISector;

  if (!hasAnySector) {
    reasoning.push(
      'Ihre Organisation fällt in keinen der in Anhang I oder Anhang II der NIS2-Richtlinie genannten Sektoren.',
    );
  } else {
    if (hasAnnexISector) {
      reasoning.push(
        `Ihre Organisation ist in ${annexISectors.length} Sektor(en) mit hoher Kritikalität (Anhang I) tätig: ${annexISectors.map((s) => SECTOR_LABELS[s] || s).join(', ')}.`,
      );
    }
    if (hasAnnexIISector) {
      reasoning.push(
        `Ihre Organisation ist in ${annexIISectors.length} sonstigem(n) kritischen Sektor(en) (Anhang II) tätig: ${annexIISectors.map((s) => SECTOR_LABELS[s] || s).join(', ')}.`,
      );
    }
  }

  // 2. Classify by size
  const sizeCategory = classifySize(input.employeeCount, input.annualRevenue);
  const isLarge = sizeCategory === 'large';
  const isMediumOrLarger = sizeCategory === 'large' || sizeCategory === 'medium';

  const sizeLabels: Record<string, string> = {
    large: 'Großunternehmen (≥250 Mitarbeiter oder ≥50 Mio. € Umsatz)',
    medium: 'Mittleres Unternehmen (≥50 Mitarbeiter oder ≥10 Mio. € Umsatz)',
    small: 'Kleines Unternehmen (≥10 Mitarbeiter oder ≥2 Mio. € Umsatz)',
    micro: 'Kleinstunternehmen (<10 Mitarbeiter und <2 Mio. € Umsatz)',
  };
  reasoning.push(`Größenklassifizierung: ${sizeLabels[sizeCategory]}`);

  // 3. Special cases (apply regardless of size)
  let forceEssential = false;
  let forceApplicable = false;

  if (input.providesDnsOrTldServices) {
    forceEssential = true;
    forceApplicable = true;
    reasoning.push(
      'Als Anbieter von DNS-Diensten, TLD-Namenregistern oder Domain-Registrierungsdiensten gilt Ihre Organisation unabhängig von der Größe als wesentliche Einrichtung.',
    );
  }

  if (input.isTrustServiceProvider) {
    forceEssential = true;
    forceApplicable = true;
    reasoning.push(
      'Als qualifizierter Vertrauensdiensteanbieter gilt Ihre Organisation als wesentliche Einrichtung.',
    );
  }

  if (input.isSoleProviderOfCriticalService) {
    forceApplicable = true;
    reasoning.push(
      'Als einziger Anbieter eines kritischen Dienstes in einem Mitgliedstaat kann Ihre Organisation unabhängig von der Größe unter NIS2 fallen.',
    );
  }

  if (input.isPublicAdministration) {
    forceApplicable = true;
    reasoning.push(
      'Einrichtungen der öffentlichen Verwaltung fallen grundsätzlich unter NIS2.',
    );
  }

  if (input.isExplicitlyDesignated) {
    forceApplicable = true;
    reasoning.push(
      'Ihre Organisation wurde von einem Mitgliedstaat explizit als NIS2-Einrichtung identifiziert.',
    );
  }

  if (input.wasCriticalUnderCer) {
    forceEssential = true;
    forceApplicable = true;
    reasoning.push(
      'Ihre Organisation wurde bereits als kritische Einrichtung nach der CER-Richtlinie identifiziert und gilt daher als wesentliche Einrichtung.',
    );
  }

  // 4. Determine applicability and entity type
  let applicable = false;
  let entityType: 'essential' | 'important' | 'not_applicable' = 'not_applicable';

  if (forceEssential) {
    applicable = true;
    entityType = 'essential';
  } else if (forceApplicable || (hasAnySector && isMediumOrLarger)) {
    applicable = true;

    // Essential: Annex I + large enterprise, or public admin
    if ((hasAnnexISector && isLarge) || input.isPublicAdministration) {
      entityType = 'essential';
      reasoning.push(
        'Als Großunternehmen in einem Sektor mit hoher Kritikalität (Anhang I) wird Ihre Organisation als wesentliche Einrichtung eingestuft.',
      );
    } else {
      entityType = 'important';
      reasoning.push(
        'Ihre Organisation wird als wichtige Einrichtung eingestuft.',
      );
    }
  } else if (hasAnySector && !isMediumOrLarger) {
    reasoning.push(
      'Obwohl Ihre Organisation in einem NIS2-relevanten Sektor tätig ist, unterschreiten Sie die Größenschwelle (mind. 50 Mitarbeiter oder 10 Mio. € Umsatz). NIS2 ist grundsätzlich nicht anwendbar, es sei denn, ein Mitgliedstaat trifft eine gesonderte Bestimmung.',
    );
  } else {
    reasoning.push(
      'Basierend auf den angegebenen Informationen fällt Ihre Organisation nicht unter die NIS2-Richtlinie.',
    );
  }

  // 5. Confidence assessment
  let confidence: 'high' | 'medium' | 'low' = 'high';
  if (input.sectors.length === 0) {
    confidence = 'low';
    reasoning.push(
      'Hinweis: Da keine Sektorzuordnung vorgenommen wurde, ist die Einschätzung mit geringer Sicherheit verbunden. Bitte prüfen Sie Ihre Branchenzugehörigkeit erneut.',
    );
  } else if (sizeCategory === 'small' && hasAnySector) {
    confidence = 'medium';
    reasoning.push(
      'Hinweis: Da Ihre Organisation knapp unter der Größenschwelle liegt, empfehlen wir eine individuelle Prüfung. Mitgliedstaaten können auch kleinere Unternehmen einbeziehen.',
    );
  }

  return {
    applicable,
    entityType,
    reasoning,
    matchedSectors,
    sizeCategory,
    confidence,
  };
}
