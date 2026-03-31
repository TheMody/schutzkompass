import { pgTable, uuid, varchar, text, numeric, boolean, timestamp } from 'drizzle-orm/pg-core';
import { organisations } from './organisations';
import { products } from './products';
import { sbomComponents } from './sboms';
import { users } from './users';

export const vulnerabilities = pgTable('vulnerabilities', {
  id: uuid('id').primaryKey().defaultRandom(),
  componentId: uuid('component_id').references(() => sbomComponents.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  organisationId: uuid('organisation_id').references(() => organisations.id).notNull(),
  cveId: varchar('cve_id', { length: 30 }),
  cvssScore: numeric('cvss_score'),
  severity: varchar('severity', { length: 20 }), // 'critical' | 'high' | 'medium' | 'low' | 'info'
  description: text('description'),
  exploitAvailable: boolean('exploit_available').default(false),
  status: varchar('status', { length: 20 }).notNull(), // 'open' | 'triaged' | 'in_progress' | 'fixed' | 'accepted' | 'false_positive'
  assignedTo: uuid('assigned_to').references(() => users.id),
  targetFixVersion: varchar('target_fix_version', { length: 100 }),
  firstDetectedAt: timestamp('first_detected_at').defaultNow(),
  resolvedAt: timestamp('resolved_at'),
  acceptedJustification: text('accepted_justification'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
