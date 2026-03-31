import { pgTable, uuid, varchar, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { organisations } from './organisations';
import { users } from './users';
import { assets } from './assets';

export const riskAssessments = pgTable('risk_assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  organisationId: uuid('organisation_id').references(() => organisations.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(), // 'draft' | 'in_progress' | 'completed' | 'archived'
  assessorId: uuid('assessor_id').references(() => users.id),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const riskEntries = pgTable('risk_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').references(() => riskAssessments.id).notNull(),
  assetId: uuid('asset_id').references(() => assets.id),
  threatDescription: text('threat_description').notNull(),
  threatCategory: varchar('threat_category', { length: 100 }),
  likelihood: integer('likelihood').notNull(), // 1-5
  impact: integer('impact').notNull(), // 1-5
  riskLevel: varchar('risk_level', { length: 20 }), // computed: 'critical' | 'high' | 'medium' | 'low' | 'negligible'
  treatment: varchar('treatment', { length: 20 }), // 'accept' | 'mitigate' | 'transfer' | 'avoid'
  treatmentDescription: text('treatment_description'),
  controlIds: jsonb('control_ids').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
