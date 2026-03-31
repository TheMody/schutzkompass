/**
 * CRA (Cyber Resilience Act) Classifier
 *
 * Implements EU Regulation 2024/2847 (CRA) product classification.
 * Determines CRA category and conformity assessment pathway.
 */

export interface CraClassificationInput {
  /** Does the product have digital elements (network connectivity, software)? */
  hasDigitalElements: boolean;
  /** Product type description */
  productType: string;
  /** Is it sold/placed on the EU market? */
  isPlacedOnEuMarket: boolean;
  /** Specific product category indicators */
  characteristics: {
    /** Is it an operating system, hypervisor, or container runtime? */
    isOsOrHypervisor?: boolean;
    /** Is it a firewall, IDS/IPS, or network security appliance? */
    isNetworkSecurityDevice?: boolean;
    /** Is it a microcontroller/microprocessor with security features? */
    isSecureMicroprocessor?: boolean;
    /** Is it a hardware security module (HSM), TPM, or secure element? */
    isHardwareSecurityModule?: boolean;
    /** Is it a smartcard or similar secure device? */
    isSmartcard?: boolean;
    /** Is it a smart home or IoT device? */
    isSmartHomeOrIoT?: boolean;
    /** Is it a password manager? */
    isPasswordManager?: boolean;
    /** Is it an identity/access management system? */
    isIamSystem?: boolean;
    /** Is it a VPN? */
    isVpn?: boolean;
    /** Is it a SIEM, SOAR, or security monitoring tool? */
    isSiemOrSecurityMonitoring?: boolean;
    /** Is it a boot manager or BIOS/UEFI system? */
    isBootManager?: boolean;
    /** Is it PKI or certificate management software? */
    isPkiOrCertManagement?: boolean;
    /** Is it a router, modem, or switch? */
    isRouterOrModem?: boolean;
    /** Is it an industrial control system (ICS/SCADA)? */
    isIndustrialControlSystem?: boolean;
    /** Is it a robot (industrial or personal)? */
    isRobot?: boolean;
    /** Is it used in critical infrastructure? */
    isUsedInCriticalInfrastructure?: boolean;
    /** Does it process personal or sensitive data as primary function? */
    processesPersonalData?: boolean;
  };
}

export interface CraClassificationResult {
  /** Whether the CRA applies */
  applicable: boolean;
  /** CRA product category */
  category: 'not_applicable' | 'default' | 'important_class_1' | 'important_class_2' | 'critical';
  /** German label for the category */
  categoryLabel: string;
  /** Available conformity assessment pathways */
  conformityPathways: ConformityPathway[];
  /** Recommended pathway */
  recommendedPathway: ConformityPathway;
  /** Key obligations */
  obligations: string[];
  /** Reasoning for classification */
  reasoning: string[];
  /** Support period requirement in years */
  minimumSupportPeriodYears: number;
}

export interface ConformityPathway {
  id: 'self_assessment' | 'harmonised_standard' | 'third_party_assessment' | 'eu_certification';
  label: string;
  description: string;
}

const PATHWAYS: Record<string, ConformityPathway> = {
  self_assessment: {
    id: 'self_assessment',
    label: 'Selbstbewertung (Modul A)',
    description:
      'Interne Fertigungskontrolle. Der Hersteller bewertet selbst die Konformität anhand der harmonisierten Normen.',
  },
  harmonised_standard: {
    id: 'harmonised_standard',
    label: 'Harmonisierte Norm (Modul A + hEN)',
    description:
      'Selbstbewertung auf Basis harmonisierter europäischer Normen (hEN). Einfacher als vollständige Drittprüfung.',
  },
  third_party_assessment: {
    id: 'third_party_assessment',
    label: 'Drittprüfung (Modul H)',
    description:
      'Vollständige Qualitätssicherung durch eine akkreditierte Konformitätsbewertungsstelle (Notified Body).',
  },
  eu_certification: {
    id: 'eu_certification',
    label: 'EU-Zertifizierung (EUCC)',
    description:
      'Europäisches Zertifizierungsschema für Cybersicherheit gemäß Cybersecurity Act.',
  },
};

export function classifyCraProduct(input: CraClassificationInput): CraClassificationResult {
  const reasoning: string[] = [];

  // 1. Check basic applicability
  if (!input.hasDigitalElements) {
    reasoning.push('Das Produkt enthält keine digitalen Elemente und fällt daher nicht unter den CRA.');
    return {
      applicable: false,
      category: 'not_applicable',
      categoryLabel: 'Nicht anwendbar',
      conformityPathways: [],
      recommendedPathway: PATHWAYS.self_assessment,
      obligations: [],
      reasoning,
      minimumSupportPeriodYears: 0,
    };
  }

  if (!input.isPlacedOnEuMarket) {
    reasoning.push(
      'Das Produkt wird nicht auf dem EU-Markt bereitgestellt und fällt daher nicht unter den CRA.',
    );
    return {
      applicable: false,
      category: 'not_applicable',
      categoryLabel: 'Nicht anwendbar',
      conformityPathways: [],
      recommendedPathway: PATHWAYS.self_assessment,
      obligations: [],
      reasoning,
      minimumSupportPeriodYears: 0,
    };
  }

  reasoning.push(
    'Das Produkt hat digitale Elemente und wird auf dem EU-Markt bereitgestellt — der CRA ist anwendbar.',
  );

  const c = input.characteristics;

  // 2. Check for Critical category (Annex IV)
  if (c.isHardwareSecurityModule || c.isSmartcard || c.isSecureMicroprocessor) {
    reasoning.push(
      'Das Produkt fällt als HSM, Smartcard oder sicherer Mikroprozessor unter die Kategorie "Kritisch" (Anhang IV).',
    );
    return buildResult('critical', reasoning, c);
  }

  // 3. Check for Important Class II (Annex III, Part II)
  if (c.isOsOrHypervisor) {
    reasoning.push(
      'Betriebssysteme, Hypervisoren und Container-Laufzeiten fallen unter "Wichtig Klasse II" (Anhang III, Teil II).',
    );
    return buildResult('important_class_2', reasoning, c);
  }
  if (c.isNetworkSecurityDevice) {
    reasoning.push(
      'Firewalls, IDS/IPS und Netzwerksicherheitsgeräte fallen unter "Wichtig Klasse II" (Anhang III, Teil II).',
    );
    return buildResult('important_class_2', reasoning, c);
  }
  if (c.isIndustrialControlSystem) {
    reasoning.push(
      'Industrielle Steuerungssysteme (ICS/SCADA) fallen unter "Wichtig Klasse II" (Anhang III, Teil II).',
    );
    return buildResult('important_class_2', reasoning, c);
  }
  if (c.isBootManager) {
    reasoning.push(
      'Boot-Manager und BIOS/UEFI-Systeme fallen unter "Wichtig Klasse II" (Anhang III, Teil II).',
    );
    return buildResult('important_class_2', reasoning, c);
  }

  // 4. Check for Important Class I (Annex III, Part I)
  if (c.isIamSystem) {
    reasoning.push(
      'Identitäts- und Zugangsmanagementsysteme fallen unter "Wichtig Klasse I" (Anhang III, Teil I).',
    );
    return buildResult('important_class_1', reasoning, c);
  }
  if (c.isPasswordManager) {
    reasoning.push(
      'Passwort-Manager fallen unter "Wichtig Klasse I" (Anhang III, Teil I).',
    );
    return buildResult('important_class_1', reasoning, c);
  }
  if (c.isVpn) {
    reasoning.push(
      'VPN-Produkte fallen unter "Wichtig Klasse I" (Anhang III, Teil I).',
    );
    return buildResult('important_class_1', reasoning, c);
  }
  if (c.isSiemOrSecurityMonitoring) {
    reasoning.push(
      'SIEM-, SOAR- und Sicherheitsüberwachungssysteme fallen unter "Wichtig Klasse I" (Anhang III, Teil I).',
    );
    return buildResult('important_class_1', reasoning, c);
  }
  if (c.isPkiOrCertManagement) {
    reasoning.push(
      'PKI- und Zertifikatsverwaltungssoftware fällt unter "Wichtig Klasse I" (Anhang III, Teil I).',
    );
    return buildResult('important_class_1', reasoning, c);
  }
  if (c.isRouterOrModem) {
    reasoning.push(
      'Router, Modems und Switches fallen unter "Wichtig Klasse I" (Anhang III, Teil I).',
    );
    return buildResult('important_class_1', reasoning, c);
  }
  if (c.isSmartHomeOrIoT) {
    reasoning.push(
      'Smart-Home- und IoT-Geräte fallen unter "Wichtig Klasse I" (Anhang III, Teil I).',
    );
    return buildResult('important_class_1', reasoning, c);
  }
  if (c.isRobot) {
    reasoning.push(
      'Roboter (industriell oder persönlich) fallen unter "Wichtig Klasse I" (Anhang III, Teil I).',
    );
    return buildResult('important_class_1', reasoning, c);
  }

  // 5. Default category
  reasoning.push(
    'Das Produkt fällt in keine spezielle Kategorie und wird als "Standard"-Produkt (Default) eingestuft.',
  );
  return buildResult('default', reasoning, c);
}

function buildResult(
  category: CraClassificationResult['category'],
  reasoning: string[],
  characteristics: CraClassificationInput['characteristics'],
): CraClassificationResult {
  const categoryLabels: Record<string, string> = {
    default: 'Standard (Default)',
    important_class_1: 'Wichtig – Klasse I',
    important_class_2: 'Wichtig – Klasse II',
    critical: 'Kritisch',
    not_applicable: 'Nicht anwendbar',
  };

  const conformityPathways = getConformityPathways(category);
  const recommendedPathway = conformityPathways[0];
  const obligations = getObligations(category, characteristics);

  return {
    applicable: true,
    category,
    categoryLabel: categoryLabels[category],
    conformityPathways,
    recommendedPathway,
    obligations,
    reasoning,
    minimumSupportPeriodYears: category === 'critical' ? 10 : 5,
  };
}

function getConformityPathways(category: CraClassificationResult['category']): ConformityPathway[] {
  switch (category) {
    case 'default':
      return [PATHWAYS.self_assessment];
    case 'important_class_1':
      return [PATHWAYS.harmonised_standard, PATHWAYS.third_party_assessment, PATHWAYS.eu_certification];
    case 'important_class_2':
      return [PATHWAYS.third_party_assessment, PATHWAYS.eu_certification];
    case 'critical':
      return [PATHWAYS.eu_certification, PATHWAYS.third_party_assessment];
    default:
      return [];
  }
}

function getObligations(
  category: CraClassificationResult['category'],
  characteristics: CraClassificationInput['characteristics'],
): string[] {
  const obligations: string[] = [];

  // Common obligations for all CRA products
  obligations.push('Cybersecurity-by-Design: Sicherheitsanforderungen bereits in der Entwurfsphase berücksichtigen');
  obligations.push('Schwachstellenmanagement: Prozess zur Erkennung und Behebung von Schwachstellen einrichten');
  obligations.push('SBOM: Software-Stückliste (Software Bill of Materials) erstellen und pflegen');
  obligations.push('Sicherheitsupdates: Kostenlose Sicherheitsupdates über den Supportzeitraum bereitstellen');
  obligations.push('Meldepflicht: Aktiv ausgenutzte Schwachstellen innerhalb von 24 Stunden an ENISA melden');
  obligations.push('Technische Dokumentation: Vollständige technische Dokumentation erstellen');
  obligations.push('EU-Konformitätserklärung: Konformitätserklärung ausstellen und CE-Kennzeichnung anbringen');
  obligations.push('Benutzerinformation: Sicherheitsrelevante Informationen für den Nutzer bereitstellen');

  if (category === 'important_class_1' || category === 'important_class_2' || category === 'critical') {
    obligations.push('Verschärfte Konformitätsbewertung: Bewertung durch Dritte oder EU-Zertifizierung erforderlich');
  }

  if (category === 'important_class_2' || category === 'critical') {
    obligations.push('Erweiterte Sicherheitsprüfung: Umfassende Penetrationstests und Code-Reviews erforderlich');
  }

  if (characteristics.isUsedInCriticalInfrastructure) {
    obligations.push(
      'Kritische Infrastruktur: Zusätzliche Anforderungen aufgrund des Einsatzes in kritischen Infrastrukturen',
    );
  }

  if (characteristics.processesPersonalData) {
    obligations.push(
      'Datenschutz: Zusätzliche Pflichten aufgrund der Verarbeitung personenbezogener Daten (DSGVO-Konformität sicherstellen)',
    );
  }

  return obligations;
}
