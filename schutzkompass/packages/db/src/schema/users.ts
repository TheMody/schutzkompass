import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { organisations } from './organisations';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  organisationId: uuid('organisation_id').references(() => organisations.id).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 30 }).notNull(), // 'admin' | 'compliance_officer' | 'viewer' | 'auditor'
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
