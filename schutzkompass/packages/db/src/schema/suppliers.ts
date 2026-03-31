import { pgTable, uuid, varchar, text, integer, date, timestamp } from 'drizzle-orm/pg-core';
import { organisations } from './organisations';

export const suppliers = pgTable('suppliers', {
  id: uuid('id').primaryKey().defaultRandom(),
  organisationId: uuid('organisation_id').references(() => organisations.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactName: varchar('contact_name', { length: 255 }),
  riskClass: varchar('risk_class', { length: 20 }), // 'critical' | 'important' | 'standard'
  riskScore: integer('risk_score'), // 0-100
  questionnaireStatus: varchar('questionnaire_status', { length: 20 }), // 'not_sent' | 'sent' | 'in_progress' | 'completed' | 'overdue'
  questionnaireToken: varchar('questionnaire_token', { length: 64 }),
  questionnaireSentAt: timestamp('questionnaire_sent_at'),
  questionnaireCompletedAt: timestamp('questionnaire_completed_at'),
  iso27001CertExpiry: date('iso27001_cert_expiry'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const questionnaireResponses = pgTable('questionnaire_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  supplierId: uuid('supplier_id').references(() => suppliers.id).notNull(),
  questionKey: varchar('question_key', { length: 100 }).notNull(),
  answer: varchar('answer', { length: 20 }), // 'yes' | 'no' | 'partial' | 'not_applicable'
  comment: text('comment'),
  evidenceFilePath: varchar('evidence_file_path', { length: 500 }),
  answeredAt: timestamp('answered_at'),
});
