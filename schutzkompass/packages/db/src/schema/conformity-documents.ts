import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { organisations } from './organisations';
import { products } from './products';

export const conformityDocuments = pgTable('conformity_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  organisationId: uuid('organisation_id').references(() => organisations.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'declaration_of_conformity' | 'technical_documentation' | 'annex_vii' | 'checklist'
  title: varchar('title', { length: 255 }).notNull(),
  version: varchar('version', { length: 50 }),
  status: varchar('status', { length: 20 }).notNull(), // 'draft' | 'review' | 'approved' | 'archived'
  filePath: varchar('file_path', { length: 500 }),
  content: text('content'), // structured content (JSON or rich text)
  approvedBy: uuid('approved_by'),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
