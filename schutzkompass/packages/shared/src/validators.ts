import { z } from 'zod';
import {
  USER_ROLES,
  CRA_CATEGORIES,
  CONFORMITY_PATHWAYS,
  ASSET_TYPES,
  CRITICALITY_LEVELS,
  RISK_TREATMENTS,
  CONTROL_STATUSES,
  CONTROL_PRIORITIES,
  VULNERABILITY_STATUSES,
  INCIDENT_TYPES,
  SUPPLIER_RISK_CLASSES,
  QUESTIONNAIRE_ANSWERS,
  PRODUCT_TYPES,
} from './constants';

// ─── Organisation ─────────────────────────────────────
export const createOrganisationSchema = z.object({
  name: z.string().min(1, 'Firmenname ist erforderlich').max(255),
  address: z.string().optional(),
  hrbNumber: z.string().max(50).optional(),
  naceCodes: z.array(z.string()).optional(),
  employeeCount: z.number().int().positive().optional(),
  annualRevenue: z.string().optional(),
});

export const updateOrganisationSchema = createOrganisationSchema.partial();

// ─── User ─────────────────────────────────────────────
export const registerUserSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
  name: z.string().min(1, 'Name ist erforderlich').max(255),
  companyName: z.string().min(1, 'Firmenname ist erforderlich').max(255),
});

export const loginSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(1, 'Passwort ist erforderlich'),
});

export const createUserSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  name: z.string().min(1).max(255),
  role: z.enum(USER_ROLES),
});

// ─── Asset ────────────────────────────────────────────
export const createAssetSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich').max(255),
  type: z.enum(ASSET_TYPES),
  description: z.string().optional(),
  criticality: z.enum(CRITICALITY_LEVELS).optional(),
  owner: z.string().max(255).optional(),
  location: z.string().max(255).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateAssetSchema = createAssetSchema.partial();

// ─── Risk Assessment ──────────────────────────────────
export const createRiskAssessmentSchema = z.object({
  title: z.string().min(1, 'Titel ist erforderlich').max(255),
});

export const createRiskEntrySchema = z.object({
  assessmentId: z.string().uuid(),
  assetId: z.string().uuid().optional(),
  threatDescription: z.string().min(10, 'Beschreibung muss mindestens 10 Zeichen lang sein').max(2000),
  threatCategory: z.string().optional(),
  likelihood: z.number().int().min(1).max(5),
  impact: z.number().int().min(1).max(5),
  treatment: z.enum(RISK_TREATMENTS).optional(),
  treatmentDescription: z.string().optional(),
  controlIds: z.array(z.string()).optional(),
});

// ─── Product ──────────────────────────────────────────
export const createProductSchema = z.object({
  name: z.string().min(1, 'Produktname ist erforderlich').max(255),
  model: z.string().max(255).optional(),
  version: z.string().max(100).optional(),
  description: z.string().optional(),
  productType: z.enum(PRODUCT_TYPES).optional(),
  hasSoftware: z.boolean().optional(),
  hasNetworkConnection: z.boolean().optional(),
  craCategory: z.enum(CRA_CATEGORIES).optional(),
  conformityPathway: z.enum(CONFORMITY_PATHWAYS).optional(),
  supportPeriodStart: z.string().optional(),
  supportPeriodEnd: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();

// ─── Supplier ─────────────────────────────────────────
export const createSupplierSchema = z.object({
  name: z.string().min(1, 'Lieferantenname ist erforderlich').max(255),
  contactEmail: z.string().email('Ungültige E-Mail-Adresse').optional(),
  contactName: z.string().max(255).optional(),
  riskClass: z.enum(SUPPLIER_RISK_CLASSES).optional(),
  notes: z.string().optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial();

// ─── Questionnaire ────────────────────────────────────
export const questionnaireResponseSchema = z.object({
  questionKey: z.string().min(1),
  answer: z.enum(QUESTIONNAIRE_ANSWERS).optional(),
  comment: z.string().optional(),
});

// ─── Incident ─────────────────────────────────────────
export const createIncidentSchema = z.object({
  type: z.enum(INCIDENT_TYPES),
  title: z.string().min(1, 'Titel ist erforderlich').max(255),
  description: z.string().optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low'] as const).optional(),
  detectedAt: z.string().datetime(),
  affectedProductIds: z.array(z.string().uuid()).optional(),
});

// ─── Incident Timeline ───────────────────────────────
export const createTimelineEntrySchema = z.object({
  incidentId: z.string().uuid(),
  action: z.string().min(1).max(100),
  description: z.string().optional(),
  timestamp: z.string().datetime(),
});

// ─── Control ──────────────────────────────────────────
export const createControlSchema = z.object({
  nis2Article: z.string().max(20).optional(),
  bsiGrundschutzId: z.string().max(20).optional(),
  title: z.string().min(1, 'Titel ist erforderlich').max(255),
  description: z.string().optional(),
  status: z.enum(CONTROL_STATUSES),
  priority: z.enum(CONTROL_PRIORITIES).optional(),
  dueDate: z.string().optional(),
  evidence: z.string().optional(),
});

export const updateControlSchema = createControlSchema.partial();

// ─── Vulnerability ────────────────────────────────────
export const updateVulnerabilitySchema = z.object({
  status: z.enum(VULNERABILITY_STATUSES),
  assignedTo: z.string().uuid().optional(),
  targetFixVersion: z.string().max(100).optional(),
  acceptedJustification: z.string().optional(),
});

// ─── Onboarding ───────────────────────────────────────
export const onboardingStep1Schema = z.object({
  name: z.string().min(1, 'Firmenname ist erforderlich').max(255),
  address: z.string().optional(),
  naceCodes: z.array(z.string()).min(1, 'Bitte wählen Sie mindestens einen Sektor'),
  employeeCount: z.number().int().positive(),
  annualRevenue: z.string().optional(),
});

export const nis2ApplicabilitySchema = z.object({
  sector: z.string().min(1),
  employeeRange: z.enum(['lt50', '50_250', '250_1000', 'gt1000']),
  revenueRange: z.enum(['lt10m', '10m_50m', 'gt50m']),
  providesEssentialServices: z.boolean(),
  isPartOfCriticalInfrastructure: z.boolean(),
});

export const craApplicabilitySchema = z.object({
  producesSoftwareProducts: z.boolean(),
  hasNetworkConnection: z.boolean(),
  soldInEu: z.boolean(),
});
