import { pgTable, uuid, varchar, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { organisations } from './organisations';

export const assets = pgTable('assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  organisationId: uuid('organisation_id').references(() => organisations.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'server' | 'endpoint' | 'network' | 'cloud' | 'ot_device' | 'application'
  description: text('description'),
  criticality: varchar('criticality', { length: 20 }), // 'critical' | 'high' | 'medium' | 'low'
  owner: varchar('owner', { length: 255 }),
  location: varchar('location', { length: 255 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
