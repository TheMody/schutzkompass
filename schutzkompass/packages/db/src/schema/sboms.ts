import { pgTable, uuid, varchar, integer, timestamp } from 'drizzle-orm/pg-core';
import { products } from './products';

export const sboms = pgTable('sboms', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  version: varchar('version', { length: 100 }),
  format: varchar('format', { length: 20 }).notNull(), // 'spdx' | 'cyclonedx'
  source: varchar('source', { length: 20 }).notNull(), // 'uploaded' | 'generated_syft' | 'generated_trivy' | 'generated_cdxgen' | 'manual'
  componentCount: integer('component_count'),
  filePath: varchar('file_path', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sbomComponents = pgTable('sbom_components', {
  id: uuid('id').primaryKey().defaultRandom(),
  sbomId: uuid('sbom_id').references(() => sboms.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  version: varchar('version', { length: 100 }),
  supplier: varchar('supplier', { length: 255 }),
  license: varchar('license', { length: 100 }),
  cpe: varchar('cpe', { length: 500 }),
  purl: varchar('purl', { length: 500 }),
  type: varchar('type', { length: 50 }), // 'library' | 'framework' | 'os' | 'firmware' | 'application'
});
