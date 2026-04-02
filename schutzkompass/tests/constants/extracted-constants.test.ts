/**
 * F53: Extracted Constants (from "use server" files) — Unit Tests
 */
import { describe, it, expect } from 'vitest';
import {
  INCIDENT_CATEGORY_LABELS,
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_STATUS_LABELS,
  INCIDENT_CATEGORY_ICONS,
} from '@/lib/constants/incidents';
import {
  RISK_CLASS_LABELS,
  QUESTIONNAIRE_STATUS_LABELS,
  QUESTIONNAIRE,
} from '@/lib/constants/suppliers';
import {
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
  ANNEX_VII_SECTIONS,
} from '@/lib/constants/conformity';
import {
  VULN_STATUS_LABELS,
} from '@/lib/constants/vulnerabilities';

describe('Incident Constants', () => {
  it('INCIDENT_CATEGORY_LABELS covers all 8 categories', () => {
    expect(Object.keys(INCIDENT_CATEGORY_LABELS)).toHaveLength(8);
    expect(INCIDENT_CATEGORY_LABELS.ransomware).toContain('Ransomware');
    expect(INCIDENT_CATEGORY_LABELS.phishing).toContain('Phishing');
  });

  it('INCIDENT_SEVERITY_LABELS covers all 4 severities', () => {
    expect(Object.keys(INCIDENT_SEVERITY_LABELS)).toHaveLength(4);
    expect(INCIDENT_SEVERITY_LABELS.critical).toBe('Kritisch');
  });

  it('INCIDENT_STATUS_LABELS covers all 6 statuses', () => {
    expect(Object.keys(INCIDENT_STATUS_LABELS)).toHaveLength(6);
    expect(INCIDENT_STATUS_LABELS.detected).toBe('Erkannt');
    expect(INCIDENT_STATUS_LABELS.closed).toBe('Geschlossen');
  });

  it('INCIDENT_CATEGORY_ICONS has emoji for each category', () => {
    expect(Object.keys(INCIDENT_CATEGORY_ICONS)).toHaveLength(8);
    for (const icon of Object.values(INCIDENT_CATEGORY_ICONS)) {
      expect(icon.length).toBeGreaterThan(0);
    }
  });
});

describe('Supplier Constants', () => {
  it('RISK_CLASS_LABELS covers all 3 classes', () => {
    expect(Object.keys(RISK_CLASS_LABELS)).toHaveLength(3);
    expect(RISK_CLASS_LABELS.critical).toBe('Kritisch');
  });

  it('QUESTIONNAIRE_STATUS_LABELS covers all 5 statuses', () => {
    expect(Object.keys(QUESTIONNAIRE_STATUS_LABELS)).toHaveLength(5);
  });

  it('QUESTIONNAIRE has 30 questions', () => {
    expect(QUESTIONNAIRE).toHaveLength(30);
  });

  it('QUESTIONNAIRE covers all 7 categories', () => {
    const categories = new Set(QUESTIONNAIRE.map((q) => q.category));
    expect(categories.size).toBe(7);
    expect(categories).toContain('Governance & Organisation');
    expect(categories).toContain('Zugriffskontrolle');
    expect(categories).toContain('Netzwerksicherheit');
    expect(categories).toContain('Incident Management');
    expect(categories).toContain('Schwachstellenmanagement');
    expect(categories).toContain('Mitarbeitersicherheit');
  });

  it('each question has bilingual text and weight 1-5', () => {
    for (const q of QUESTIONNAIRE) {
      expect(q.key).toBeTruthy();
      expect(q.textDe.length).toBeGreaterThan(10);
      expect(q.textEn.length).toBeGreaterThan(10);
      expect(q.weight).toBeGreaterThanOrEqual(1);
      expect(q.weight).toBeLessThanOrEqual(5);
    }
  });

  it('question keys are unique', () => {
    const keys = QUESTIONNAIRE.map((q) => q.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('Conformity Constants', () => {
  it('DOCUMENT_TYPE_LABELS covers all 8 document types', () => {
    expect(Object.keys(DOCUMENT_TYPE_LABELS)).toHaveLength(8);
    expect(DOCUMENT_TYPE_LABELS.annex_vii_techdoc).toContain('Technische Dokumentation');
    expect(DOCUMENT_TYPE_LABELS.eu_declaration).toContain('Konformitätserklärung');
  });

  it('DOCUMENT_STATUS_LABELS covers all 4 statuses', () => {
    expect(Object.keys(DOCUMENT_STATUS_LABELS)).toHaveLength(4);
    expect(DOCUMENT_STATUS_LABELS.draft).toBe('Entwurf');
    expect(DOCUMENT_STATUS_LABELS.published).toBe('Veröffentlicht');
  });

  it('ANNEX_VII_SECTIONS has 8 sections', () => {
    expect(ANNEX_VII_SECTIONS).toHaveLength(8);
  });

  it('each section has required fields', () => {
    for (const section of ANNEX_VII_SECTIONS) {
      expect(section.id).toBeTruthy();
      expect(section.title).toBeTruthy();
      expect(section.description.length).toBeGreaterThan(10);
      expect(['empty', 'partial', 'complete']).toContain(section.status);
      expect(section.requiredFields.length).toBeGreaterThan(0);
    }
  });

  it('sections cover key CRA Annex VII topics', () => {
    const titles = ANNEX_VII_SECTIONS.map((s) => s.title);
    const joined = titles.join(' ');
    expect(joined).toContain('Produktbeschreibung');
    expect(joined).toContain('SBOM');
    expect(joined).toContain('Schwachstellenbehandlung');
    expect(joined).toContain('Supportzeitraum');
  });
});

describe('Vulnerability Constants', () => {
  it('VULN_STATUS_LABELS covers all 5 statuses', () => {
    expect(Object.keys(VULN_STATUS_LABELS)).toHaveLength(5);
    expect(VULN_STATUS_LABELS.open).toBe('Offen');
    expect(VULN_STATUS_LABELS.mitigated).toBe('Behoben');
    expect(VULN_STATUS_LABELS.false_positive).toBe('False Positive');
  });
});
