// ── Conformity Labels & Constants ───────────────────────────────────
// Extracted from actions/conformity.ts to avoid "use server" export restriction.

export type DocumentType =
  | 'annex_vii_techdoc'
  | 'eu_declaration'
  | 'module_a_assessment'
  | 'risk_assessment'
  | 'sbom_export'
  | 'vulnerability_report'
  | 'management_summary'
  | 'ce_checklist';

export type DocumentStatus = 'draft' | 'in_review' | 'approved' | 'published';

export interface AnnexViiSection {
  id: string;
  title: string;
  description: string;
  status: 'empty' | 'partial' | 'complete';
  requiredFields: string[];
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  annex_vii_techdoc: 'Technische Dokumentation (Annex VII)',
  eu_declaration: 'EU-Konformitätserklärung',
  module_a_assessment: 'Modul A Selbstbewertung',
  risk_assessment: 'Cybersecurity-Risikobewertung',
  sbom_export: 'SBOM-Export',
  vulnerability_report: 'Schwachstellenbericht',
  management_summary: 'Management Summary',
  ce_checklist: 'CE-Kennzeichnung Checkliste',
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: 'Entwurf',
  in_review: 'In Prüfung',
  approved: 'Freigegeben',
  published: 'Veröffentlicht',
};

export const ANNEX_VII_SECTIONS: AnnexViiSection[] = [
  {
    id: 'sec-1',
    title: '1. Allgemeine Produktbeschreibung',
    description: 'Beschreibung des Produkts mit digitalem Element, einschließlich des beabsichtigten Zwecks und der wesentlichen Funktionen.',
    status: 'complete',
    requiredFields: ['Produktname', 'Version', 'Beabsichtigter Zweck', 'Wesentliche Funktionen', 'Hardware-/Software-Anforderungen'],
  },
  {
    id: 'sec-2',
    title: '2. Design- und Entwicklungsinformationen',
    description: 'Informationen über den Entwurf und die Entwicklung des Produkts, einschließlich Architektur und Datenflüsse.',
    status: 'partial',
    requiredFields: ['Systemarchitektur', 'Datenflussdiagramme', 'Sicherheitsarchitektur', 'Kryptographische Verfahren'],
  },
  {
    id: 'sec-3',
    title: '3. Cybersecurity-Risikobewertung',
    description: 'Cybersecurity-Risikobewertung gemäß Art. 13 Abs. 2 CRA.',
    status: 'partial',
    requiredFields: ['Bedrohungsanalyse', 'Risikoidentifikation', 'Risikobewertung', 'Risikobehandlung'],
  },
  {
    id: 'sec-4',
    title: '4. Angewandte harmonisierte Normen',
    description: 'Verzeichnis der angewandten Normen und Standards.',
    status: 'empty',
    requiredFields: ['Angewandte Normen (EN/ISO)', 'Abweichungen', 'Alternative Lösungen'],
  },
  {
    id: 'sec-5',
    title: '5. Ergebnisse von Cybersecurity-Tests',
    description: 'Ergebnisse aller durchgeführten Cybersecurity-Tests und -Prüfungen.',
    status: 'empty',
    requiredFields: ['Penetrationstest-Ergebnisse', 'Schwachstellenscan-Berichte', 'Fuzz-Testing', 'Code-Analyse'],
  },
  {
    id: 'sec-6',
    title: '6. SBOM (Software Bill of Materials)',
    description: 'Vollständige Software-Stückliste des Produkts.',
    status: 'complete',
    requiredFields: ['Komponentenliste', 'Lizenzen', 'Versionen', 'Bekannte Schwachstellen'],
  },
  {
    id: 'sec-7',
    title: '7. Schwachstellenbehandlung',
    description: 'Prozesse und Verfahren für die Schwachstellenbehandlung während des Support-Zeitraums.',
    status: 'partial',
    requiredFields: ['Meldeverfahren', 'Behebungsfristen (SLAs)', 'Patch-Verteilung', 'Koordinierte Offenlegung'],
  },
  {
    id: 'sec-8',
    title: '8. Supportzeitraum und Update-Pflichten',
    description: 'Information zum Support-Zeitraum und zu regelmäßigen Sicherheitsupdates.',
    status: 'empty',
    requiredFields: ['Support-Enddatum', 'Update-Frequenz', 'Automatische Updates', 'End-of-Life-Planung'],
  },
];
