import { describe, it, expect } from 'vitest';
import * as fs from 'fs';

/**
 * Action files validation — verify each server action file:
 * 1. Has 'use server' directive
 * 2. Exports expected functions
 * 3. Does NOT export const objects (F53 regression guard)
 */

const ACTIONS_DIR = 'apps/web/lib/actions';

function readAction(name: string): string {
  return fs.readFileSync(`${ACTIONS_DIR}/${name}.ts`, 'utf-8');
}

describe('Server Action Files — "use server" directive', () => {
  const actionFiles = [
    'auth', 'assets', 'controls', 'risks', 'policies',
    'onboarding', 'incidents', 'suppliers', 'conformity',
    'vulnerabilities', 'products', 'sbom',
  ];

  actionFiles.forEach((name) => {
    it(`${name}.ts has "use server" directive`, () => {
      const src = readAction(name);
      expect(src).toContain("'use server'");
    });
  });
});

describe('F53 Regression Guard — no const exports from "use server" files', () => {
  /**
   * Next.js "use server" files must only export async functions.
   * Exporting const objects (labels, arrays) causes runtime crashes.
   * Constants were extracted to lib/constants/*.ts.
   */

  it('incidents.ts does not export const labels', () => {
    const src = readAction('incidents');
    // Should NOT contain "export const INCIDENT_CATEGORY_LABELS"
    expect(src).not.toMatch(/^export const INCIDENT_CATEGORY_LABELS/m);
    expect(src).not.toMatch(/^export const INCIDENT_SEVERITY_LABELS/m);
    expect(src).not.toMatch(/^export const INCIDENT_STATUS_LABELS/m);
    expect(src).not.toMatch(/^export const INCIDENT_CATEGORY_ICONS/m);
  });

  it('suppliers.ts does not export const labels', () => {
    const src = readAction('suppliers');
    expect(src).not.toMatch(/^export const RISK_CLASS_LABELS/m);
    expect(src).not.toMatch(/^export const QUESTIONNAIRE_STATUS_LABELS/m);
    expect(src).not.toMatch(/^export const QUESTIONNAIRE/m);
  });

  it('conformity.ts does not export const labels', () => {
    const src = readAction('conformity');
    expect(src).not.toMatch(/^export const DOCUMENT_TYPE_LABELS/m);
    expect(src).not.toMatch(/^export const DOCUMENT_STATUS_LABELS/m);
    expect(src).not.toMatch(/^export const ANNEX_VII_SECTIONS/m);
  });

  it('vulnerabilities.ts does not export const labels', () => {
    const src = readAction('vulnerabilities');
    expect(src).not.toMatch(/^export const VULN_STATUS_LABELS/m);
  });
});

describe('Action Files — expected function exports', () => {
  it('auth.ts exports registerUser and loginUser', () => {
    const src = readAction('auth');
    expect(src).toContain('export async function registerUser');
    expect(src).toContain('export async function loginUser');
  });

  it('assets.ts exports CRUD functions', () => {
    const src = readAction('assets');
    expect(src).toContain('export async function getAssets');
    expect(src).toContain('export async function createAsset');
    expect(src).toContain('export async function updateAsset');
    expect(src).toContain('export async function deleteAsset');
    expect(src).toContain('export async function importAssetsFromCsv');
  });

  it('controls.ts exports management functions', () => {
    const src = readAction('controls');
    expect(src).toContain('export async function getControls');
    expect(src).toContain('export async function updateControl');
    expect(src).toContain('export async function getControlsStatistics');
  });

  it('risks.ts exports assessment functions', () => {
    const src = readAction('risks');
    expect(src).toContain('export async function getRiskAssessments');
    expect(src).toContain('export async function createRiskAssessment');
    expect(src).toContain('export async function createRiskEntry');
    expect(src).toContain('export async function getRiskEntries');
    expect(src).toContain('export async function getRiskStatistics');
  });

  it('policies.ts exports getPolicies', () => {
    const src = readAction('policies');
    expect(src).toContain('export async function getPolicies');
  });

  it('onboarding.ts exports compute and save functions', () => {
    const src = readAction('onboarding');
    expect(src).toContain('export async function computeOnboardingResults');
    expect(src).toContain('export async function saveOnboardingResults');
    expect(src).toContain('export async function getOnboardingStatus');
  });

  it('incidents.ts exports CRUD functions', () => {
    const src = readAction('incidents');
    expect(src).toContain('export async function getIncidents');
    expect(src).toContain('export async function createIncident');
    expect(src).toContain('export async function updateIncidentStatus');
    expect(src).toContain('export async function getIncidentStatistics');
    expect(src).toContain('export async function classifyIncidentSeverity');
  });

  it('suppliers.ts exports CRUD functions', () => {
    const src = readAction('suppliers');
    expect(src).toContain('export async function getSuppliers');
    expect(src).toContain('export async function createSupplier');
    expect(src).toContain('export async function updateSupplier');
    expect(src).toContain('export async function sendQuestionnaire');
    expect(src).toContain('export async function scoreQuestionnaire');
    expect(src).toContain('export async function getSupplierStatistics');
    expect(src).toContain('export async function getSupplierByToken');
    expect(src).toContain('export async function submitQuestionnaireResponses');
  });

  it('products.ts exports CRUD functions', () => {
    const src = readAction('products');
    expect(src).toContain('export async function getProducts');
    expect(src).toContain('export async function createProduct');
  });

  it('sbom.ts exports SBOM management functions', () => {
    const src = readAction('sbom');
    expect(src).toContain('export async function getSboms');
    expect(src).toContain('export async function getSbomById');
    expect(src).toContain('export async function uploadSbom');
    expect(src).toContain('export async function deleteSbom');
    expect(src).toContain('export async function getSbomStatistics');
  });

  it('vulnerabilities.ts exports vulnerability functions', () => {
    const src = readAction('vulnerabilities');
    expect(src).toContain('export async function getVulnerabilities');
    expect(src).toContain('export async function getVulnerabilityById');
    expect(src).toContain('export async function triageVulnerability');
    expect(src).toContain('export async function getVulnerabilityStatistics');
  });

  it('conformity.ts exports conformity functions', () => {
    const src = readAction('conformity');
    expect(src).toContain('export async function getConformityDocuments');
    expect(src).toContain('export async function getConformityDocumentById');
    expect(src).toContain('export async function updateDocumentStatus');
    expect(src).toContain('export async function getEvidenceItems');
    expect(src).toContain('export async function getConformityStatistics');
  });
});

describe('Constant Files — extracted from "use server" files', () => {
  const CONSTANTS_DIR = 'apps/web/lib/constants';

  it('incidents constants exist', () => {
    const src = fs.readFileSync(`${CONSTANTS_DIR}/incidents.ts`, 'utf-8');
    expect(src).toContain('INCIDENT_CATEGORY_LABELS');
    expect(src).toContain('INCIDENT_SEVERITY_LABELS');
    expect(src).toContain('INCIDENT_STATUS_LABELS');
    // File must not have 'use server' directive (only in comments is fine)
    expect(src).not.toMatch(/^'use server'/m);
  });

  it('suppliers constants exist', () => {
    const src = fs.readFileSync(`${CONSTANTS_DIR}/suppliers.ts`, 'utf-8');
    expect(src).toContain('RISK_CLASS_LABELS');
    expect(src).toContain('QUESTIONNAIRE_STATUS_LABELS');
    expect(src).toContain('QUESTIONNAIRE');
    expect(src).not.toContain("'use server'");
  });

  it('conformity constants exist', () => {
    const src = fs.readFileSync(`${CONSTANTS_DIR}/conformity.ts`, 'utf-8');
    expect(src).toContain('DOCUMENT_TYPE_LABELS');
    expect(src).toContain('DOCUMENT_STATUS_LABELS');
    expect(src).toContain('ANNEX_VII_SECTIONS');
    expect(src).not.toContain("'use server'");
  });

  it('vulnerabilities constants exist', () => {
    const src = fs.readFileSync(`${CONSTANTS_DIR}/vulnerabilities.ts`, 'utf-8');
    expect(src).toContain('VULN_STATUS_LABELS');
    expect(src).not.toContain("'use server'");
  });
});
