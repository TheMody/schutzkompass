import { pgTable, uuid, varchar, text, boolean, integer, numeric, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const organisations = pgTable('organisations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  hrbNumber: varchar('hrb_number', { length: 50 }),
  naceCodes: jsonb('nace_codes').$type<string[]>(),
  employeeCount: integer('employee_count'),
  annualRevenue: numeric('annual_revenue'),
  nis2EntityType: varchar('nis2_entity_type', { length: 20 }),
  nis2Applicable: boolean('nis2_applicable'),
  craApplicable: boolean('cra_applicable'),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
