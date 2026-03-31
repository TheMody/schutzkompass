import { pgTable, uuid, varchar, text, boolean, integer, date, timestamp } from 'drizzle-orm/pg-core';
import { organisations } from './organisations';

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  organisationId: uuid('organisation_id').references(() => organisations.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  model: varchar('model', { length: 255 }),
  version: varchar('version', { length: 100 }),
  description: text('description'),
  productType: varchar('product_type', { length: 20 }), // 'hardware' | 'software' | 'combined'
  hasSoftware: boolean('has_software'),
  hasNetworkConnection: boolean('has_network_connection'),
  craCategory: varchar('cra_category', { length: 30 }), // 'default' | 'important_class_I' | 'important_class_II' | 'critical' | 'out_of_scope'
  conformityPathway: varchar('conformity_pathway', { length: 30 }), // 'module_a' | 'module_b_c' | 'module_h'
  supportPeriodStart: date('support_period_start'),
  supportPeriodEnd: date('support_period_end'),
  ceMarkingApplied: boolean('ce_marking_applied').default(false),
  complianceScore: integer('compliance_score'), // 0-100
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
