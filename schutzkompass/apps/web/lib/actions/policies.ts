'use server';

import { policyTemplates } from '@schutzkompass/compliance-content';

// Types derived from policy templates JSON
export type PolicyCategory = keyof typeof policyTemplates.categories;

export interface PolicySection {
  heading: string;
  body: string;
}

export interface PolicyTemplate {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  nis2Article: string;
  bsiReference: string;
  category: PolicyCategory;
  tags: string[];
  version: string;
  lastUpdated: string;
  pages: number;
  language: string;
  sections: PolicySection[];
}

export interface PolicyCategoryInfo {
  label: string;
  icon: string;
}

/**
 * Get all policy templates, optionally filtered by category
 */
export async function getPolicies(category?: PolicyCategory): Promise<PolicyTemplate[]> {
  const all = policyTemplates.policies as PolicyTemplate[];
  if (category) {
    return all.filter((p) => p.category === category);
  }
  return all;
}

/**
 * Get all policy categories with labels
 */
export async function getPolicyCategories(): Promise<Record<PolicyCategory, PolicyCategoryInfo>> {
  return policyTemplates.categories as Record<PolicyCategory, PolicyCategoryInfo>;
}

/**
 * Get a single policy template by ID
 */
export async function getPolicyById(id: string): Promise<PolicyTemplate | null> {
  const all = policyTemplates.policies as PolicyTemplate[];
  return all.find((p) => p.id === id) ?? null;
}

/**
 * Get policy statistics
 */
export async function getPolicyStatistics() {
  const all = policyTemplates.policies as PolicyTemplate[];
  const categories = policyTemplates.categories as Record<PolicyCategory, PolicyCategoryInfo>;

  const byCategory: Record<string, number> = {};
  for (const cat of Object.keys(categories)) {
    byCategory[cat] = all.filter((p) => p.category === cat).length;
  }

  return {
    total: all.length,
    byCategory,
    nis2Count: all.filter((p) => p.nis2Article).length,
    craCount: all.filter((p) => p.category === 'cra').length,
  };
}
