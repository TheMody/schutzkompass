import { pgTable, uuid, varchar, text, date, timestamp } from 'drizzle-orm/pg-core';
import { organisations } from './organisations';
import { users } from './users';

export const controls = pgTable('controls', {
  id: uuid('id').primaryKey().defaultRandom(),
  organisationId: uuid('organisation_id').references(() => organisations.id).notNull(),
  nis2Article: varchar('nis2_article', { length: 20 }),
  bsiGrundschutzId: varchar('bsi_grundschutz_id', { length: 20 }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 20 }).notNull(), // 'not_started' | 'in_progress' | 'implemented' | 'verified'
  priority: varchar('priority', { length: 20 }), // 'must' | 'should' | 'nice_to_have'
  assignedTo: uuid('assigned_to').references(() => users.id),
  dueDate: date('due_date'),
  evidence: text('evidence'),
  evidenceFilePath: varchar('evidence_file_path', { length: 500 }),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
