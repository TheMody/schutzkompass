import { pgTable, uuid, varchar, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { organisations } from './organisations';
import { users } from './users';

export const incidents = pgTable('incidents', {
  id: uuid('id').primaryKey().defaultRandom(),
  organisationId: uuid('organisation_id').references(() => organisations.id).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'nis2_organisational' | 'cra_vulnerability' | 'cra_incident'
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  severity: varchar('severity', { length: 20 }), // 'critical' | 'high' | 'medium' | 'low'
  status: varchar('status', { length: 30 }).notNull(), // 'detected' | 'early_warning_sent' | 'notification_sent' | 'final_report_sent' | 'closed'
  detectedAt: timestamp('detected_at').notNull(),
  earlyWarningSentAt: timestamp('early_warning_sent_at'),
  notificationSentAt: timestamp('notification_sent_at'),
  finalReportSentAt: timestamp('final_report_sent_at'),
  affectedProductIds: jsonb('affected_product_ids').$type<string[]>(),
  reportedById: uuid('reported_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const incidentTimeline = pgTable('incident_timeline', {
  id: uuid('id').primaryKey().defaultRandom(),
  incidentId: uuid('incident_id').references(() => incidents.id).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  description: text('description'),
  userId: uuid('user_id').references(() => users.id),
  attachmentPath: varchar('attachment_path', { length: 500 }),
});
