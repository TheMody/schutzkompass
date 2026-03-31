# Detailed Implementation Plan: Combined NIS2 + CRA Compliance Platform

## Platform Name: "SchuttzKompass" (Protection Compass)
**Tagline**: Cybersecurity-Compliance für den deutschen Mittelstand — Organisation schützen, Produkte absichern.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Market Analysis & Positioning](#2-market-analysis--positioning)
3. [Regulatory Foundations](#3-regulatory-foundations)
4. [Product Architecture](#4-product-architecture)
5. [Module Specifications](#5-module-specifications)
6. [Data Model](#6-data-model)
7. [Technology Stack](#7-technology-stack)
8. [Development Roadmap](#8-development-roadmap)
9. [Team Plan](#9-team-plan)
10. [Go-to-Market Strategy](#10-go-to-market-strategy)
11. [Pricing Model](#11-pricing-model)
12. [Financial Plan](#12-financial-plan)
13. [Risk Analysis](#13-risk-analysis)
14. [Competitive Positioning](#14-competitive-positioning)
15. [Success Metrics](#15-success-metrics)

---

## 1. Executive Summary

### The Opportunity
Two EU regulations create simultaneous, high-penalty compliance obligations for tens of thousands of German companies that have never dealt with cybersecurity regulation:

- **NIS2 Directive** (transposed via NIS2UmsuCG): Affects 29,000-40,000 organizations in Germany. Requires IT/OT risk management, incident reporting to BSI (24h/72h/30d), supply chain security, management accountability. Penalties up to €10M or 2% of turnover. Personal liability for executives (Geschäftsführerhaftung).

- **Cyber Resilience Act (CRA)** (Regulation EU 2024/2847): Affects every manufacturer of products with digital elements (~50,000+ in Germany). Requires SBOM maintenance, vulnerability handling, ENISA/CSIRT reporting (24h/72h/14d), CE marking for cybersecurity, secure development lifecycle. Penalties up to €15M or 2.5% of turnover. Vulnerability reporting starts Sep 11, 2026; full compliance Dec 11, 2027.

### The Product
A single web-based compliance platform with two product lines:

1. **SchutzKompass|Organisation** (NIS2): Guides a company through organizational cybersecurity compliance — risk assessment, policy management, supplier security, incident reporting to BSI.
2. **SchutzKompass|Produkt** (CRA): Guides a manufacturer through product cybersecurity compliance — product inventory, SBOM management, vulnerability monitoring, ENISA/CSIRT reporting, conformity documentation, CE marking.

### Why Combined
- **Same buyer**: The CISO, Head of IT Security, or (in Mittelstand) the IT-Leiter and Geschäftsführer.
- **Overlapping concepts**: Risk assessment, vulnerability management, incident reporting, supply chain security. 60-70% of the platform infrastructure is shared.
- **Cross-sell**: A manufacturer who makes connected products needs BOTH NIS2 (for their organization) AND CRA (for their products). E.g., Festo needs NIS2 for their corporate IT/OT and CRA for every connected actuator they sell.
- **Competitive moat**: No competitor offers both NIS2 organizational compliance AND CRA product compliance in one platform. Secjur and DataGuard focus on organizational GRC. ONEKEY focuses on firmware analysis. This combined positioning is unique.

### Key Numbers
- Addressable market in Germany: 29,000-40,000 (NIS2) + 50,000+ (CRA), with significant overlap (10,000-20,000 companies need both)
- Conservative addressable: ~40,000-60,000 unique companies
- Target segment: Mittelstand (50-2,000 employees), €10M-€500M revenue
- Price point: €499-€3,499/month (vs. €50K-€200K consulting alternative)
- Year 1 ARR target: €400K-€800K
- Year 3 ARR target: €5M-€10M

---

## 2. Market Analysis & Positioning

### Target Segments (Priority Order)

#### Segment 1: Manufacturing companies with connected products (NIS2 + CRA)
- Machine builders, sensor manufacturers, industrial automation, building technology
- 50-2,000 employees, €10M-€500M revenue
- Need both NIS2 (organizational) and CRA (product security)
- Examples: Festo, SICK, Trumpf, Beckhoff, Pilz, ifm electronic, Weidmüller, Phoenix Contact, Lapp Group
- Estimated count in Germany: 8,000-15,000 firms
- **Highest value per customer** (buy both product lines)

#### Segment 2: Manufacturers with connected products (CRA only)
- Smaller manufacturers of IoT devices, smart home products, consumer electronics, connected appliances
- 10-200 employees, €2M-€50M revenue
- Not necessarily NIS2-affected but CRA is mandatory for their products
- Estimated count: 20,000-35,000 firms
- **Largest volume segment**

#### Segment 3: Non-manufacturing companies newly under NIS2 (NIS2 only)
- Logistics, food production, chemicals, waste management, energy, healthcare
- 50-1,000 employees
- No connected products to sell, but their organization falls under NIS2
- Estimated count: 15,000-25,000 firms
- **Covered by SchutzKompass|Organisation only**

### Positioning Statement
"SchutzKompass is the compliance platform that German Mittelstand manufacturers use to meet NIS2 and CRA requirements — without hiring a CISO, without engaging consultants, and at 10% of the cost. We turn 4,800 pages of BSI IT-Grundschutz and the 100+ pages of the CRA into clear, actionable steps in plain German."

### Key Differentiators vs. Competition

| Feature | SchutzKompass | Secjur (Munich) | DataGuard (Munich) | ONEKEY (Düsseldorf) | Vanta/Drata (US) |
|---|---|---|---|---|---|
| NIS2 compliance workflow | Yes (deep) | Yes (broad) | Yes (broad) | No | No |
| CRA product compliance | Yes (deep) | No | No | Partial (firmware only) | No |
| SBOM management | Yes | No | No | Yes | No |
| BSI IT-Grundschutz mapping | Yes | Limited | Limited | No | No |
| German language | Yes | Yes | Yes | Yes | No |
| Mittelstand pricing | €499-€3,499/month | €300-€2,000/month | Enterprise pricing | Enterprise pricing | $10K-$50K/year |
| Self-service (no consultant needed) | Yes | Yes | No | No | Yes |
| ENISA/CSIRT vulnerability reporting | Yes | No | No | No | No |
| Combined org + product compliance | **Yes (unique)** | No | No | No | No |

---

## 3. Regulatory Foundations

### NIS2 Requirements (mapped to platform modules)

| NIS2 Article/Requirement | Platform Module | Implementation |
|---|---|---|
| Art. 21(1): Risk management measures | Risk Assessment Engine | Guided risk assessment with BSI IT-Grundschutz mapping |
| Art. 21(2)(a): Policies on risk analysis and IS | Policy Manager | Template library, 50+ policies in German |
| Art. 21(2)(b): Incident handling | Incident Manager | BSI reporting workflow (24h/72h/30d) |
| Art. 21(2)(c): Business continuity, backup mgmt | Controls Tracker | BCP templates, backup assessment checklist |
| Art. 21(2)(d): Supply chain security | Supplier Manager | Questionnaires, risk scoring, monitoring |
| Art. 21(2)(e): Security in network/IS acquisition, development, maintenance | Controls Tracker | Asset inventory, SDLC checklist |
| Art. 21(2)(f): Policies/procedures on effectiveness assessment | Audit Module | Self-assessment workflows, audit preparation |
| Art. 21(2)(g): Basic cyber hygiene practices and training | Training Tracker | Training plan, awareness materials |
| Art. 21(2)(h): Policies on cryptography | Policy Manager | Crypto policy templates |
| Art. 21(2)(i): HR security, access control, asset management | Controls Tracker | HR onboarding/offboarding, access reviews |
| Art. 21(2)(j): Multi-factor authentication, secured communication | Controls Tracker | MFA assessment, secure comms checklist |
| Art. 23: Incident reporting obligations | Incident Manager | BSI-formatted reports, timeline tracking |
| Art. 20: Governance / management accountability | Dashboard | Management liability explainer, board reports |
| Supply chain cascading requirements | Supplier Portal | Customer-facing compliance evidence sharing |

### CRA Requirements (mapped to platform modules)

| CRA Requirement | Platform Module | Implementation |
|---|---|---|
| Art. 13: Manufacturer obligations (risk assessment) | Product Risk Assessment | Per-product cybersecurity risk assessment |
| Art. 13: Technical documentation (Annex VII) | Documentation Generator | Structured templates for Annex VII content |
| Art. 13: Conformity assessment (Annex VIII) | Conformity Workflow | Module A self-assessment, or third-party prep |
| Art. 13: EU Declaration of Conformity (Annex V/VI) | Declaration Generator | Auto-generated declarations from product data |
| Art. 13: CE marking | CE Marking Guide | Step-by-step guide, checklist, evidence storage |
| Art. 13: Support period definition | Product Lifecycle Manager | Track support periods per product |
| Art. 14: Vulnerability reporting to CSIRT + ENISA | Vulnerability Reporter | ENISA Single Reporting Platform integration prep, 24h/72h/14d workflow |
| Annex I Part I: Essential cybersecurity requirements | Product Security Checklist | Checklist per product: default passwords, crypto, access control, secure updates, data minimization |
| Annex I Part II: Vulnerability handling | Vulnerability Manager | CVD process, vulnerability intake, triage, fix tracking |
| Annex III/IV: Product categorization | Product Classifier | Classify products as default, important Class I/II, critical |
| SBOM requirement | SBOM Manager | Import, generate, maintain, monitor SBOMs |
| Secure update delivery | Update Tracker | Track which field products need updates, notification workflows |
| Implementing Reg. (EU) 2025/2392: Technical product descriptions | Product Classifier | Product category matching against official technical descriptions |

### Key Regulatory Dates

| Date | Milestone | Platform Response |
|---|---|---|
| ~~Dec 10, 2024~~ | CRA entered into force | Already past — marketing trigger |
| **Jun 11, 2026** | CRA: Member states designate notified bodies | Conformity assessment module must be ready |
| **Sep 11, 2026** | CRA: Vulnerability reporting obligations begin | ENISA reporting module must be operational |
| **H2 2025 - H1 2026** | NIS2UmsuCG expected passage in Germany | NIS2 module must be market-ready |
| **Dec 11, 2027** | CRA: Full application — all requirements | Full CRA compliance workflow ready |
| Ongoing | NIS2: Enforcement by BSI | Continuous compliance monitoring |

---

## 4. Product Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SchutzKompass Platform                       │
│                     (React Frontend + REST API)                     │
├─────────────────────────────────┬───────────────────────────────────┤
│  SchutzKompass|Organisation     │   SchutzKompass|Produkt           │
│  (NIS2 Compliance)              │   (CRA Compliance)                │
│                                 │                                   │
│  ┌───────────────────────┐      │   ┌───────────────────────┐      │
│  │ NIS2 Applicability    │      │   │ Product Classifier     │      │
│  │ Check                 │      │   │ (Default/Imp I/II/Crit)│      │
│  ├───────────────────────┤      │   ├───────────────────────┤      │
│  │ Risk Assessment       │      │   │ SBOM Manager           │      │
│  │ (BSI IT-Grundschutz)  │      │   │ (SPDX, CycloneDX)     │      │
│  ├───────────────────────┤      │   ├───────────────────────┤      │
│  │ Controls & Policy     │      │   │ Vulnerability Monitor  │      │
│  │ Manager               │      │   │ (CVE/NVD pipeline)     │      │
│  ├───────────────────────┤      │   ├───────────────────────┤      │
│  │ BSI Incident          │      │   │ ENISA/CSIRT Vuln       │      │
│  │ Reporter              │      │   │ Reporter               │      │
│  ├───────────────────────┤      │   ├───────────────────────┤      │
│  │ Supplier Security     │      │   │ Conformity & CE        │      │
│  │ Manager               │      │   │ Documentation          │      │
│  ├───────────────────────┤      │   ├───────────────────────┤      │
│  │ Audit & Evidence      │      │   │ Product Lifecycle      │      │
│  │ Manager               │      │   │ Manager                │      │
│  └───────────────────────┘      │   └───────────────────────┘      │
├─────────────────────────────────┴───────────────────────────────────┤
│                    Shared Platform Services                          │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ ┌────────────┐  │
│  │ User & Org   │ │ Document     │ │ Notification│ │ Reporting  │  │
│  │ Management   │ │ Storage      │ │ Engine      │ │ & Export   │  │
│  ├──────────────┤ ├──────────────┤ ├─────────────┤ ├────────────┤  │
│  │ Audit Log    │ │ Integration  │ │ Scheduling  │ │ Dashboard  │  │
│  │ (immutable)  │ │ Layer (APIs) │ │ (cron jobs) │ │ Engine     │  │
│  └──────────────┘ └──────────────┘ └─────────────┘ └────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│                     Data Layer                                       │
│  PostgreSQL (primary) │ Redis (cache/sessions) │ S3 (documents)     │
│  Hosted in Germany (Hetzner Cloud / IONOS / OTC)                    │
│  Encryption at rest (AES-256) + in transit (TLS 1.3)                │
│  Daily encrypted backups, 30-day retention                          │
└─────────────────────────────────────────────────────────────────────┘
```

### External Integrations

```
┌─────────────────────────────────────────────────────────────┐
│                   External Data Sources                      │
│                                                             │
│  NVD/CVE Database ──────► Vulnerability Monitor             │
│  OSV.dev ────────────────► Vulnerability Monitor             │
│  GitHub Advisory DB ─────► Vulnerability Monitor             │
│  BSI CERT-Bund Feeds ───► Threat Intelligence               │
│  ENISA Reporting API ────► CSIRT/ENISA Reporter (future)    │
│                                                             │
│  Open Source SBOM Tools:                                    │
│  Syft ───────────────────► SBOM Generation                  │
│  Trivy ──────────────────► SBOM + Vuln Scanning             │
│  cdxgen ─────────────────► SBOM Generation (CycloneDX)      │
│  Grype ──────────────────► Vulnerability matching            │
│                                                             │
│  Customer Tool Integrations (Phase 2+):                     │
│  Microsoft 365 ──────────► Evidence collection              │
│  Azure AD / Entra ───────► User/access evidence             │
│  Jira / Azure DevOps ───► Task export                       │
│  SIEM (export format) ──► Incident correlation              │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Module Specifications

### 5.1 Shared: Company Profile & Onboarding

**Purpose**: Capture company information once, determine applicability for both NIS2 and CRA.

**Onboarding Flow** (10-15 minutes):
1. Company basics: Name, address, sector (NACE code), employee count, annual revenue
2. NIS2 applicability check: Sector classification, entity type (essential/important), services provided
3. CRA applicability check: "Do you manufacture, develop, or market products with software, firmware, or network connectivity?" → product inventory trigger
4. Result: Personalized compliance dashboard showing which regulations apply, with timelines and priority recommendations

**Data Captured**:
- Legal entity information (name, HRB number, Handelsregister, address)
- NACE sector codes (primary + secondary)
- Employee count, turnover (for NIS2 thresholds)
- Group structure (parent/subsidiaries for NIS2 scoping)
- IT infrastructure overview (cloud, on-prem, hybrid)
- Product portfolio overview (if manufacturer)

### 5.2 SchutzKompass|Organisation — NIS2 Modules

#### Module O1: Betroffenheits-Check (Applicability Assessment)
- Decision tree based on NIS2 sector list (18 sectors) + employee/revenue thresholds
- Handles edge cases: group company aggregation, multi-sector companies, KRITIS overlap
- Generates PDF "Betroffenheitsanalyse" for board presentation
- Includes personal liability explainer for Geschäftsführer with legal references
- Estimated completion time: 15-20 minutes

#### Module O2: Risikobewertung (Risk Assessment)
- Pre-built risk catalog by industry (manufacturing, logistics, energy, food, chemicals, waste management, healthcare)
- Asset inventory wizard: guided discovery of IT systems (servers, endpoints, cloud), OT systems (PLCs, SCADA, HMI), network infrastructure, data stores
- Threat catalog mapped to BSI IT-Grundschutz Kompendium (elementary threats: 47 categories)
- Risk scoring: 5×5 matrix (likelihood × impact), with NIS2-specific impact categories (service availability, data confidentiality, safety)
- Automatic gap identification: which BSI IT-Grundschutz Bausteine are missing
- Risk treatment plan generator: accept/mitigate/transfer/avoid for each risk
- Output: Risk register (exportable as Excel/PDF), management summary, treatment plan

**Pre-populated industry templates**:
- Manufacturing: OT risks (SCADA compromise, PLC manipulation, industrial network breach), IP theft, supply chain IT compromise
- Logistics: TMS/WMS compromise, GPS/tracking manipulation, warehouse IoT risks
- Energy: Smart meter infrastructure, SCADA/substation risks, grid management systems
- Food: HACCP system compromise, cold chain monitoring manipulation, production line sabotage

#### Module O3: Maßnahmenmanager (Controls & Policy Manager)
- Maps NIS2 Art. 21(2)(a-j) to specific, implementable measures
- Each measure has:
  - Title and description in plain German (no jargon)
  - Why it's required (NIS2 article reference)
  - How to implement it (step-by-step instructions for a non-expert IT admin)
  - Evidence requirements (what to upload/document to prove compliance)
  - Estimated effort (hours/days) and approximate cost
  - Priority (must-have vs. should-have vs. nice-to-have)
- Policy template library (50+ templates in German, .docx format):
  - Informationssicherheits-Leitlinie (IS policy)
  - Richtlinie zur Zugriffskontrolle (access control policy)
  - Passwortrichtlinie (password policy)
  - Richtlinie für mobile Geräte (mobile device policy)
  - Backup-Richtlinie (backup policy)
  - Incident-Response-Plan
  - Business-Continuity-Plan
  - Lieferanten-Sicherheitsrichtlinie (supplier security policy)
  - Kryptographie-Richtlinie (cryptography policy)
  - Netzwerksicherheits-Richtlinie (network security policy)
  - Personalsicherheits-Richtlinie (HR security policy)
  - Schulungsplan Informationssicherheit (training plan)
  - And 38+ more
- Each template is pre-filled with company name, date, version, and customizable
- Task assignment: assign measures to team members with deadlines
- Progress tracking: traffic-light dashboard per control domain
- Integration: export tasks to Jira, Asana, MS Planner, or email

#### Module O4: Lieferketten-Sicherheit (Supply Chain Security)
- Supplier inventory: import from ERP (CSV) or manual entry
- Risk classification: critical / important / standard supplier
- Standardized security questionnaire (based on BSI supply chain requirements + NIS2 Art. 21(2)(d)):
  - 30-40 questions covering: access management, incident handling, data protection, business continuity, subcontractor management
  - Available in German and English
  - Questionnaire scoring algorithm: weighted risk score per supplier
- Supplier portal: external suppliers log in, fill questionnaire, upload certifications
- Monitoring: track ISO 27001 certificates, penetration test reports, expiry dates
- Bulk operations: send questionnaires to 200+ suppliers, automatic reminders, response tracking
- Risk dashboard: heatmap of supplier risk, trends over time, due-for-renewal alerts

#### Module O5: Vorfallmanagement (Incident Management)
- Incident detection aid: "Is this an incident?" decision tree for non-experts
  - Network slowdown? Ransomware popup? Phishing email clicked? Unusual login? Data leak suspicion?
- Classification engine: maps incident to NIS2 severity criteria
  - Has the incident caused or can it cause severe operational disruption?
  - Has it affected other organizations?
  - Has it caused or can it cause financial loss?
  - Is personal data affected?
- Reporting workflow with built-in timers:
  1. **24h early warning**: Template pre-filled, submitted to BSI (format TBD, manual export initially)
  2. **72h full notification**: Detailed report including IoCs, affected systems, scope
  3. **30-day final report**: Root cause analysis, remediation measures, lessons learned
- Evidence attachment: screenshots, logs, email headers, timeline entries
- Internal communication templates: board notification, employee notification, customer notification, press statement
- Post-incident review: structured retrospective, action items, compliance evidence
- Incident register: searchable log of all incidents, exportable for auditors
- Immutable audit trail: every action timestamped and logged

#### Module O6: Audit & Nachweis (Evidence Management)
- Central document repository with version control
- Evidence mapping: each NIS2 requirement linked to specific evidence items
- Automated evidence collection (Phase 2): Microsoft 365 compliance reports, Azure AD logs
- Audit preparation wizard: generates auditor-ready evidence packages
- Auditor portal: read-only access for external auditors, organized by control domain
- Annual review workflow: auto-generates review tasks at configurable intervals
- Compliance percentage dashboard: real-time compliance score across all control domains

### 5.3 SchutzKompass|Produkt — CRA Modules

#### Module P1: Produkt-Inventar & Klassifikation (Product Inventory & Classification)
- Product registration form:
  - Product name, model/version, description
  - Does it have software/firmware? → If no, likely out of CRA scope
  - Does it connect to a network or device (logical or physical data connection)? → Scope trigger
  - Type: hardware, software, or combined
  - Intended market (EU/non-EU)
  - Expected product lifetime / support period
- **CRA category classification engine**:
  - Default product → self-assessment (Module A) allowed
  - Important Class I (Annex III): identity management, browsers, password managers, VPNs, network management, SIEM, patch management, boot managers, OS, routers, switches, smart home general purpose, IoT with security functions, microcontrollers with security functions
  - Important Class II (Annex III): hypervisors/container runtime, firewalls, intrusion detection, tamper-resistant microprocessors, smart cards, smart meter gateways, hardware with security boxes, smart cards
  - Critical (Annex IV): hardware with security boxes for smart meter gateways, smart cards, secure elements, HSMs
  - Classification based on Implementing Regulation (EU) 2025/2392 technical descriptions
- Conformity assessment pathway determination:
  - Default → Module A (self-assessment)
  - Important Class I → Module A only if harmonized standards applied; otherwise third-party (Module B+C or H)
  - Important Class II → third-party required (Module B+C or H)
  - Critical → third-party required
- Output: Per-product compliance roadmap with deadlines and required actions
- Portfolio dashboard: all products, their categories, compliance status

#### Module P2: SBOM-Manager (Software Bill of Materials)
- **SBOM Import**: Upload existing SBOMs in SPDX 2.3 or CycloneDX 1.5+ format (JSON, XML, or tag-value)
- **SBOM Generation** (via integration):
  - Upload firmware binary → Run Syft/Trivy in sandboxed container → Return SBOM
  - Upload source code manifest (package.json, requirements.txt, pom.xml, Cargo.toml, go.mod) → Run cdxgen → Return SBOM
  - Manual component entry for custom/proprietary components
- **SBOM Lifecycle Management**:
  - Version control: each firmware release gets a new SBOM snapshot
  - Diff view: what components changed between versions
  - Component graph: dependency tree visualization
  - License detection: flag GPL, LGPL, AGPL, and proprietary components
- **Supplier SBOM collection**:
  - Request SBOMs from component suppliers (via email/portal)
  - Track which suppliers have provided SBOMs and which haven't
  - Merge supplier SBOMs into product-level SBOM
- **Standards compliance**:
  - Validate SBOMs against NTIA minimum elements
  - Flag incomplete SBOMs (missing supplier, missing version, missing hash)
  - Export in multiple formats (SPDX, CycloneDX)

#### Module P3: Schwachstellen-Monitor (Vulnerability Monitor)
- **Continuous monitoring pipeline**:
  - Nightly scan of all SBOM components against:
    - NVD (National Vulnerability Database)
    - OSV.dev (Open Source Vulnerabilities)
    - GitHub Security Advisories
    - BSI CERT-Bund advisories
  - Match CPE (Common Platform Enumeration) identifiers from SBOM to CVE entries
  - For components without CPE: fuzzy matching by name + version range
- **Risk scoring**:
  - CVSS base score (from NVD)
  - Exploitability assessment: is there a known exploit? (CISA KEV, ExploitDB)
  - Product exposure: is the vulnerable component reachable from network? (user input)
  - Combined risk score: Critical / High / Medium / Low / Info
- **Dashboard per product**:
  - Total vulnerabilities by severity
  - New vulnerabilities since last check
  - Vulnerabilities with known exploits (top priority)
  - Aging report: how long vulnerabilities have been open
  - Trend chart: vulnerability count over time
- **Workflow**:
  - Automated alerts (email, webhook) for new Critical/High vulnerabilities
  - Triage: accept risk (with justification), plan fix (assign to developer, set target version), mark as false positive
  - Fix verification: when new SBOM uploaded, auto-check if vulnerability is resolved
- **Batch operations**: Filter by severity, product line, component; export to CSV

#### Module P4: Meldewesen (ENISA/CSIRT Vulnerability & Incident Reporting)
- **Actively exploited vulnerability reporting** (CRA Art. 14, effective Sep 11, 2026):
  1. **24h early warning**: Notification that an actively exploited vulnerability exists
  2. **72h main notification**: Details of the vulnerability, affected products, initial assessment
  3. **14-day final report** (after corrective/mitigating measure available): Full analysis, fix deployed, affected product versions
- **Severe incident reporting** (CRA Art. 14):
  1. **24h early warning**: Incident affecting product security detected
  2. **72h main notification**: Detailed incident information
  3. **30-day final report**: Root cause, remediation, lessons learned
- **Submission**:
  - Initially: generate pre-filled PDF/XML reports for manual submission to ENISA Single Reporting Platform and national CSIRT
  - Phase 2: direct API integration with ENISA Single Reporting Platform (when API available)
  - Auto-determines relevant CSIRT based on manufacturer's main establishment
- **Distinct from NIS2 incident reporting**: NIS2 is about incidents affecting the organization's own IT; CRA is about vulnerabilities/incidents affecting the products sold. Platform handles both workflows with clear separation.

#### Module P5: Konformitäts-Dokumentation (Conformity Documentation Generator)
- **Technical documentation** (Annex VII):
  - General description of the product
  - Design and development details (system architecture, data flows, security mechanisms)
  - Cybersecurity risk assessment documentation
  - Information on essential requirements and how they are met
  - List of harmonized standards, common specifications, or EU certifications applied
  - SBOM reference
  - EU Declaration of Conformity (or simplified version)
  - Each section has guided input forms with help text explaining what to write
  - Output: structured document in PDF/Word format meeting Annex VII requirements
- **EU Declaration of Conformity** (Annex V/VI):
  - Auto-generated from product data
  - Includes: manufacturer info, product identification, essential requirements declared, standards applied, conformity assessment procedure used, notified body (if applicable), signature field
  - Simplified version (Annex VI) also available
- **CE marking checklist**:
  - Pre-conditions verified: risk assessment done, technical documentation complete, conformity assessment passed, declaration drawn up
  - CE marking application guide (physical products: location on product; software: in documentation)
- **Module A (internal control) workflow**:
  - Self-assessment checklist covering all Annex I essential requirements
  - Evidence collection for each requirement
  - Internal review and sign-off workflow
  - Document package generator for market surveillance authority requests

#### Module P6: Produkt-Lebenszyklus (Product Lifecycle Manager)
- **Support period management**:
  - Define support period per product (must be at least 5 years or expected product lifetime, whichever is longer — CRA Art. 13(8))
  - Track end-of-support dates
  - Alert before support period expiration
  - Plan for end-of-life: last security update, customer notification, transition guidance
- **Field product tracking** (simplified):
  - Which firmware versions are deployed in the field
  - Which products need security updates
  - Customer notification workflow: "Security update available for [product] — please update"
  - Update deployment tracking: how many customers have applied the update
- **Coordinated Vulnerability Disclosure (CVD) process**:
  - External vulnerability intake form (on company website)
  - Triage workflow: receive → validate → assess → fix → disclose
  - Acknowledgment timelines, researcher communication templates
  - Public disclosure coordinated with patch availability

---

## 6. Data Model (Core Entities)

```
Organisation
├── id, name, address, hrb_number, nace_codes[]
├── employee_count, annual_revenue
├── nis2_entity_type (essential/important/not_applicable)
├── cra_applicable (boolean)
│
├── Users[]
│   ├── id, email, name, role (admin/compliance_officer/auditor/viewer)
│   └── permissions[]
│
├── Assets[] (for NIS2)
│   ├── id, name, type (server/endpoint/network/cloud/ot_device/application)
│   ├── criticality (critical/high/medium/low)
│   ├── owner, location, ip_address
│   └── threats[] → RiskAssessmentEntries[]
│
├── Suppliers[]
│   ├── id, name, contact, risk_class (critical/important/standard)
│   ├── iso27001_cert_date, iso27001_expiry
│   ├── questionnaire_status, risk_score
│   └── QuestionnaireResponses[]
│
├── Policies[]
│   ├── id, title, version, status (draft/review/approved/expired)
│   ├── owner, review_date, next_review
│   └── document_blob
│
├── RiskAssessments[]
│   ├── id, date, assessor, status
│   ├── RiskEntries[]
│   │   ├── threat, likelihood, impact, risk_level
│   │   ├── treatment (accept/mitigate/transfer/avoid)
│   │   └── Controls[]
│   └── treatment_plan
│
├── Incidents[] (NIS2 incidents — organizational)
│   ├── id, title, detected_at, severity
│   ├── bsi_report_status (early_warning/notification/final)
│   ├── bsi_24h_sent_at, bsi_72h_sent_at, bsi_30d_sent_at
│   ├── TimelineEntries[]
│   └── EvidenceAttachments[]
│
├── Products[] (for CRA)
│   ├── id, name, model, version, description
│   ├── cra_category (default/important_class_I/important_class_II/critical)
│   ├── conformity_pathway (self_assessment/third_party_module_b_c/third_party_module_h)
│   ├── support_period_start, support_period_end
│   ├── ce_marking_applied (boolean)
│   ├── declaration_of_conformity_id
│   │
│   ├── SBOMs[]
│   │   ├── id, version, format (spdx/cyclonedx), generated_at
│   │   ├── Components[]
│   │   │   ├── name, version, supplier, license, cpe, purl
│   │   │   └── Vulnerabilities[]
│   │   │       ├── cve_id, cvss_score, severity, status (open/triaged/fixed/accepted)
│   │   │       ├── exploit_available, first_detected, resolved_at
│   │   │       └── assigned_to, target_fix_version
│   │   └── sbom_blob (original file)
│   │
│   ├── ProductRiskAssessments[]
│   │   ├── essential_requirement, status (met/partial/not_met)
│   │   └── evidence_description, evidence_attachment
│   │
│   ├── VulnerabilityReports[] (ENISA/CSIRT — product vulnerabilities)
│   │   ├── id, type (actively_exploited/severe_incident)
│   │   ├── early_warning_sent_at, main_notification_sent_at, final_report_sent_at
│   │   └── affected_products[], details
│   │
│   └── ConformityDocuments[]
│       ├── type (technical_documentation/declaration_of_conformity/risk_assessment)
│       ├── version, status, document_blob
│       └── reviewed_by, approved_at
│
├── AuditLog[] (immutable)
│   ├── timestamp, user_id, action, entity_type, entity_id
│   └── details (JSON)
│
└── ComplianceScores (materialized view)
    ├── nis2_overall_percentage
    ├── nis2_by_domain{} (risk_mgmt, incident, supply_chain, etc.)
    ├── cra_overall_percentage
    └── cra_by_product{}
```

---

## 7. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React 18 + TypeScript + Tailwind CSS + shadcn/ui | Modern, maintainable, good component library, fast development |
| **Backend API** | Node.js (NestJS) or Python (FastAPI) + TypeScript/Python | NestJS for structured enterprise app; FastAPI if team prefers Python |
| **Database** | PostgreSQL 16 | Robust, JSON support for flexible schemas, mature |
| **Cache/Sessions** | Redis | Session management, rate limiting, job queues |
| **Task Queue** | BullMQ (Node.js) or Celery (Python) | Async jobs: SBOM processing, vulnerability scanning, report generation |
| **Document Storage** | S3-compatible (MinIO on Hetzner, or IONOS S3) | SBOMs, evidence files, policy documents, generated reports |
| **SBOM Processing** | Syft, Trivy, Grype (containerized CLI tools) | Open-source, well-maintained, support SPDX + CycloneDX |
| **Vulnerability Data** | NVD API v2, OSV.dev API, GitHub Advisory API | Primary vulnerability data sources, free |
| **PDF Generation** | Puppeteer or WeasyPrint | Generate audit reports, declarations of conformity, management summaries |
| **Email** | Postmark or Mailgun (EU region) | Transactional email for notifications, supplier questionnaires |
| **Authentication** | Keycloak (self-hosted) or Auth0 | SSO support (Azure AD integration for corporate customers), MFA |
| **Hosting** | Hetzner Cloud (Nuremberg/Falkenstein) | German hosting, ISO 27001 certified DC, excellent price/performance |
| **Container Orchestration** | Kubernetes (Hetzner managed K8s) or Docker Compose (early phase) | Start with Docker Compose, move to K8s at 50+ customers |
| **CI/CD** | GitLab CI (self-hosted on Hetzner) or GitHub Actions | Automated testing, deployment, SBOM scanning of own product |
| **Monitoring** | Grafana + Prometheus + Loki | Infrastructure and application monitoring |
| **Error Tracking** | Sentry (self-hosted, EU) | Application error tracking |

### Hosting Requirements (German Data Sovereignty)
- All customer data stored exclusively in German data centers
- Hetzner Cloud: Nuremberg (NBG1) or Falkenstein (FSN1) — ISO 27001 certified
- Alternative: IONOS Cloud (Frankfurt) or Open Telekom Cloud (Frankfurt/Berlin)
- No US-owned cloud provider for primary data storage (GDPR + customer trust)
- Encryption at rest: AES-256 for database, S3 storage
- Encryption in transit: TLS 1.3 mandatory
- Daily encrypted backups, stored in second German DC, 30-day retention
- Penetration test annually (by external firm) — practice what you preach

---

## 8. Development Roadmap

### Phase 0: Foundation (Month 1-2)
**Goal**: Set up infrastructure, core platform, authentication, multi-tenancy

Deliverables:
- [ ] Repository setup, CI/CD pipeline, development environment
- [ ] PostgreSQL schema (core entities: Organisation, User, AuditLog)
- [ ] Authentication system (email/password, SSO prep)
- [ ] Multi-tenant data isolation
- [ ] Base UI framework (navigation, dashboard shell, settings)
- [ ] Company onboarding flow (company profile, sector, size)
- [ ] German hosting infrastructure (Hetzner Cloud, Docker Compose)
- [ ] Basic audit logging

Team: 2 full-stack developers, 1 PM/compliance expert

### Phase 1: NIS2 MVP (Month 3-5)
**Goal**: Modules O1 (Applicability) + O2 (Risk Assessment) + O3 (Controls Manager, basic)

Deliverables:
- [ ] NIS2 applicability assessment wizard with sector decision tree
- [ ] PDF report generator for board presentation
- [ ] Asset inventory (manual entry, CSV import)
- [ ] Risk assessment engine with pre-built industry catalogs
- [ ] Risk scoring matrix (5×5), risk register
- [ ] BSI IT-Grundschutz Bausteine mapping (top 30 most relevant)
- [ ] Controls tracker with traffic-light status
- [ ] 20 policy templates in German (most critical policies)
- [ ] Compliance dashboard with percentage scores
- [ ] Management summary export (PDF)

**Milestone**: Demo to 5 prospective pilot customers

### Phase 2: CRA MVP (Month 4-7, overlapping with Phase 1)
**Goal**: Modules P1 (Product Classification) + P2 (SBOM Manager) + P3 (Vulnerability Monitor, basic)

Deliverables:
- [ ] Product registration and inventory
- [ ] CRA category classifier (default/important/critical) based on Implementing Reg. 2025/2392
- [ ] Conformity assessment pathway determination
- [ ] SBOM upload (SPDX, CycloneDX JSON/XML import + validation)
- [ ] SBOM component viewer with dependency tree
- [ ] SBOM generation via Syft/Trivy integration (upload firmware binary → get SBOM)
- [ ] Vulnerability monitoring pipeline (NVD API nightly scan)
- [ ] Vulnerability dashboard per product
- [ ] Basic alerting (email for new Critical/High CVEs)
- [ ] Product compliance status dashboard

**Milestone**: First SBOM successfully generated from customer firmware; vulnerability monitoring operational

### Phase 3: Reporting & Incident Management (Month 6-9)
**Goal**: Modules O5 (Incident Manager) + P4 (ENISA Reporter) + complete O3 (full policy library)

Deliverables:
- [ ] NIS2 incident detection decision tree
- [ ] BSI reporting workflow (24h/72h/30d) with timer
- [ ] Incident timeline, evidence attachment, audit trail
- [ ] CRA vulnerability reporting workflow (24h/72h/14d) with timer
- [ ] Pre-filled report templates (BSI format + ENISA format)
- [ ] Communication templates (board, employees, customers, press)
- [ ] Post-incident review workflow
- [ ] Full policy template library (50+ German policies)
- [ ] Task assignment and deadline tracking for controls

**CRITICAL MILESTONE — Sep 11, 2026**: CRA vulnerability reporting obligations begin. Module P4 must be production-ready.

### Phase 4: Supply Chain & Conformity Documentation (Month 8-11)
**Goal**: Modules O4 (Supplier Manager) + P5 (Conformity Documentation) + P6 (Lifecycle Manager, basic)

Deliverables:
- [ ] Supplier inventory with risk classification
- [ ] Supplier security questionnaire (30-40 questions, DE/EN)
- [ ] Supplier portal (external login, questionnaire filling)
- [ ] Supplier risk scoring and monitoring dashboard
- [ ] Bulk questionnaire operations
- [ ] CRA technical documentation generator (Annex VII structure)
- [ ] EU Declaration of Conformity generator (Annex V/VI)
- [ ] Module A self-assessment workflow
- [ ] CE marking checklist and guidance
- [ ] Product support period tracking

**Milestone**: First customer completes full CRA conformity documentation through the platform

### Phase 5: Audit, Evidence & Refinement (Month 10-13)
**Goal**: Modules O6 (Audit/Evidence Manager) + Auditor portal + integrations

Deliverables:
- [ ] Central evidence repository with document versioning
- [ ] Evidence mapping to requirements (NIS2 + CRA)
- [ ] Auditor portal (read-only, organized by control domain/product)
- [ ] Annual review workflow automation
- [ ] Microsoft 365 / Azure AD integration for automated evidence collection
- [ ] Jira / Azure DevOps task export
- [ ] CSV/Excel export of all data
- [ ] Advanced reporting (board-ready compliance reports, trend charts)
- [ ] German-language help center and documentation

### Phase 6: Scale & Expansion (Month 14-24)
**Goal**: Channel partner tools, Austrian/Swiss variants, advanced features

Deliverables:
- [ ] Partner portal for MSPs/resellers (customer management, white-label option)
- [ ] Austrian NIS2 transposition variant (NISG 2024)
- [ ] Swiss NIST/ISO mapping (Switzerland not EU, but customer demand from Swiss manufacturers)
- [ ] Coordinated Vulnerability Disclosure (CVD) public intake form
- [ ] ENISA Single Reporting Platform API integration (when available)
- [ ] AI-assisted document drafting (policy text suggestions, risk description generation — using locally-hosted LLM or EU-hosted API, not US cloud)
- [ ] Benchmarking: anonymous cross-customer comparison of compliance maturity
- [ ] ISO 27001 certification management module (add-on)
- [ ] Marketplace: vetted security service providers (pen testers, SOC, consultants)

---

## 9. Team Plan

### Founding Team (Month 1-3): 4-5 People

| Role | Profile | Responsibility | Monthly Cost |
|---|---|---|---|
| **CTO / Lead Developer** | Full-stack, 5+ years, NestJS or FastAPI, PostgreSQL, React | Architecture, backend, infrastructure, code reviews | €7,000-€9,000 |
| **Frontend Developer** | React + TypeScript, 3+ years, strong UX sense | UI/UX, component library, dashboards, forms | €5,500-€7,000 |
| **Backend / Security Engineer** | Python or Node.js, experience with SBOM tools, CVE/NVD, container security | SBOM pipeline, vulnerability monitoring, integrations | €6,000-€8,000 |
| **Compliance & Product Lead** | IT security background (BSI, TÜV, or consulting), knows NIS2 + CRA, speaks native German | Content creation, product decisions, compliance accuracy, pilot customer management | €7,000-€9,000 |
| **CEO / Business Development** (founder) | Sales experience in B2B SaaS, German Mittelstand network | Sales, partnerships, fundraising, strategy | €5,000-€7,000 (founder salary) |

**Month 1-3 total**: ~€30,000-€40,000/month = **€90K-€120K**

### Growth Team (Month 4-9): Add 2-3 People

| Role | When | Monthly Cost |
|---|---|---|
| Backend Developer #2 | Month 4 | €5,500-€7,000 |
| Content/Compliance Specialist #2 | Month 6 | €4,500-€6,000 |
| Customer Success / Sales | Month 6 | €4,000-€5,500 |

**Month 4-9 total team cost**: ~€40,000-€55,000/month

### Full Team by Month 12: 8-10 People

| Role | Count |
|---|---|
| Developers (full-stack + backend + frontend) | 4-5 |
| Compliance/content specialists | 2 |
| Sales/business development | 1-2 |
| Customer success | 1 |
| **Total** | **8-10** |

**Month 12 monthly burn**: ~€60,000-€80,000/month

---

## 10. Go-to-Market Strategy

### Phase GTM-1: Awareness & Pilot Customers (Month 1-6)

**Free NIS2 + CRA Betroffenheits-Check** (lead generation):
- Web-based, 5-minute questionnaire: "Are you affected by NIS2 and/or CRA?"
- Generates personalized PDF report with timeline and action items
- Captures email for follow-up nurture sequence
- Target: 500+ completed checks in first 3 months via LinkedIn ads, IHK partnerships

**IHK partnerships** (Industrie- und Handelskammern):
- Partner with 5-10 IHKs in manufacturing-heavy regions (Stuttgart, Munich, Nuremberg, Hannover, Düsseldorf)
- Offer free NIS2/CRA awareness webinars through IHK channels
- IHK gets value (member service), we get leads
- Target: 5 IHK partnerships, 10 webinars, 200+ attendees

**Content marketing**:
- Blog: "NIS2 für den Mittelstand" and "CRA-Praxisleitfaden" series (German, SEO-optimized)
- LinkedIn presence: weekly posts on regulatory developments, practical tips
- Downloadable guides: "NIS2-Compliance in 10 Schritten", "CRA-Fahrplan für Hersteller"
- Newsletter: monthly regulatory updates

**Pilot program**: 
- 5-10 pilot customers (free or heavily discounted) for 3 months
- Criteria: manufacturing companies with connected products (need both NIS2 + CRA)
- Weekly feedback sessions, iterate product
- Goal: 3+ referenceable case studies by month 6

### Phase GTM-2: Channel & Direct Sales (Month 6-12)

**MSP/IT-Systemhaus partnerships**:
- Target: Bechtle (€16B revenue, 15,000 employees, serves thousands of Mittelstand firms), Cancom (€1.5B), Computacenter (€7B), and 10-20 regional IT-Systemhäuser
- Partnership model: 
  - Reseller agreement: MSP sells SchutzKompass, earns 20% recurring commission
  - MSP does onboarding and provides implementation services (firewall config, backup setup, etc.)
  - SchutzKompass handles compliance management, MSP handles technical implementation
  - Win-win: MSP gets new revenue stream + stickier customer relationships; we get distribution
- Target: 2-3 MSP partnerships signed by month 9, generating 20-40 customers by month 12

**Conference presence**:
- it-sa (Nuremberg, October) — Germany's largest IT security trade fair
- embedded world (Nuremberg, March) — largest embedded systems conference (CRA-heavy audience)
- Hannover Messe (April) — industrial automation (CRA target market)
- BSI-Grundschutz-Tag and BSI events
- BVMW (Bundesverband mittelständische Wirtschaft) regional events

**Direct sales**:
- Outbound to manufacturing companies with connected products (identifiable via product catalogs, trade fair exhibitor lists)
- Sales cycle: free Betroffenheits-Check → demo → trial → paid
- Expected sales cycle: 4-8 weeks for Starter/Professional, 8-16 weeks for Enterprise

### Phase GTM-3: Scale (Month 12-24)

**Industry-specific packaging**:
- "SchutzKompass für Maschinenbau" (machine builders)
- "SchutzKompass für Sensorhersteller" (sensor manufacturers)
- "SchutzKompass für Gebäudetechnik" (building technology)
- "SchutzKompass für Logistik" (logistics — NIS2 only)
- Each package has pre-configured risk catalogs, policy templates, and compliance checklists

**TÜV/DEKRA/notified body partnerships**:
- Position SchutzKompass as the recommended preparation tool for CRA conformity assessment
- Notified bodies benefit: customers come better prepared, assessments are faster
- Potential: co-branded "CRA-Ready" certification after completing SchutzKompass workflows

**DACH expansion**:
- Austria: NIS2 transposition (NISG 2024), CRA applies directly, German language
- Switzerland: not EU, but Swiss manufacturers selling into EU must comply with CRA; NIS2-adjacent requirements from Swiss NCSC
- Minimal localization effort (same language, similar corporate culture)

---

## 11. Pricing Model

### SchutzKompass|Organisation (NIS2)

| Tier | Target | Monthly Price | Includes |
|---|---|---|---|
| **Starter** | 50-150 employees | **€499/month** | Applicability check, risk assessment, controls tracker, 15 policy templates, 20 suppliers, incident management, compliance dashboard |
| **Professional** | 150-500 employees | **€999/month** | Everything in Starter + full policy library (50+), 100 suppliers, auditor portal, annual review automation |
| **Enterprise** | 500-2,000 employees | **€1,999/month** | Everything in Professional + unlimited suppliers, Microsoft 365 integration, custom risk catalog, dedicated support, SLA |

### SchutzKompass|Produkt (CRA)

| Tier | Target | Monthly Price | Includes |
|---|---|---|---|
| **Starter** | 1-5 products | **€799/month** | Product classification, SBOM management (import + generation), vulnerability monitoring, basic alerting, ENISA reporting prep |
| **Professional** | 6-25 products | **€1,799/month** | Everything in Starter + conformity documentation generator, product lifecycle management, CVD workflow, advanced dashboards |
| **Enterprise** | 25+ products | **€3,499/month** | Everything in Professional + unlimited products, API access, custom integrations, notified body collaboration portal, dedicated support |

### Combined Bundle (NIS2 + CRA)

| Tier | Monthly Price | Saving vs. Separate |
|---|---|---|
| **Kombi Starter** | **€999/month** (vs. €1,298) | 23% discount |
| **Kombi Professional** | **€2,199/month** (vs. €2,798) | 21% discount |
| **Kombi Enterprise** | **€3,999/month** (vs. €5,498) | 27% discount |

### One-time Fees

| Service | Price | Description |
|---|---|---|
| **Onboarding NIS2** | €2,500 | Remote workshop: initial risk assessment, asset inventory, priority setting (1 day) |
| **Onboarding CRA** | €3,500 | Remote workshop: product inventory, first SBOM generation, classification review (1-2 days) |
| **Onboarding Kombi** | €5,000 | Combined onboarding (2 days) |
| **Annual compliance review** | €2,000 | Guided review of all compliance elements, update recommendations |

### Price Justification

| Alternative | Typical Cost | SchutzKompass Equivalent |
|---|---|---|
| NIS2 compliance consulting project | €50,000-€200,000 (one-time, no ongoing) | €15,000/year (Organisation Professional + onboarding) |
| Hiring a CISO | €100,000-€150,000/year + benefits | €12,000-€24,000/year |
| Enterprise GRC platform (OneTrust, ServiceNow) | €50,000-€500,000/year | €12,000-€48,000/year |
| CRA consulting engagement | €30,000-€100,000 per product line | €13,000/year (Produkt Professional + onboarding) |
| Hiring a product security engineer | €80,000-€120,000/year + benefits | €10,000-€42,000/year |

---

## 12. Financial Plan

### Startup Costs (Pre-Revenue)

| Category | Amount | Notes |
|---|---|---|
| Company formation (GmbH) | €25,000 | Stammkapital |
| Legal (GmbH setup, contracts, AGB, DPA) | €8,000 | Lawyer for template contracts, data processing agreements |
| Compliance content creation | €15,000 | Legal review of policy templates, risk catalogs |
| Initial cloud infrastructure | €3,000 | First 3 months hosting |
| Domain, branding, website | €5,000 | Logo, corporate design, landing page |
| **Total startup costs** | **€56,000** | Before first salaries |

### Monthly Burn Rate

| Phase | Period | Team Size | Monthly Burn | Cumulative Burn |
|---|---|---|---|---|
| Phase 0-1 | Month 1-5 | 4-5 people | €35,000 | €175,000 |
| Phase 2-3 | Month 6-9 | 6-7 people | €50,000 | €375,000 |
| Phase 4-5 | Month 10-13 | 8-9 people | €65,000 | €635,000 |
| Phase 6 | Month 14-18 | 9-10 people | €75,000 | €1,010,000 |

### Revenue Projections

| Quarter | New Customers | Total Customers | Avg Monthly Revenue/Customer | MRR | ARR |
|---|---|---|---|---|---|
| Q1 (Month 4-6) | 5 (pilot) | 5 | €500 (discounted pilots) | €2,500 | €30,000 |
| Q2 (Month 7-9) | 10 | 15 | €1,200 | €18,000 | €216,000 |
| Q3 (Month 10-12) | 20 | 35 | €1,400 | €49,000 | €588,000 |
| Q4 (Month 13-15) | 30 | 60 | €1,500 | €90,000 | €1,080,000 |
| Q5 (Month 16-18) | 40 | 95 | €1,600 | €152,000 | €1,824,000 |
| Q6 (Month 19-21) | 50 | 135 | €1,700 | €229,500 | €2,754,000 |
| Q7 (Month 22-24) | 60 | 180 | €1,800 | €324,000 | €3,888,000 |

**Assumptions**: 
- 5% monthly churn (reasonable for compliance SaaS — compliance is ongoing, not one-time)
- Mix of NIS2-only, CRA-only, and combined customers
- Average revenue grows as more customers choose Professional/Enterprise tiers
- Does not include one-time onboarding fees (add ~€3,000 per customer = additional €540K over 24 months)

### Funding Requirements

| Scenario | Total Capital Needed | Source |
|---|---|---|
| **Bootstrapped (lean)** | €300K-€400K | Founders' savings + EXIST Gründerstipendium (€3,000/person/month for 12 months, up to 3 founders = €108K) + first customer revenue |
| **Angel round** | €400K-€600K | 2-3 angels investing €150K-€200K each for 10-15% equity |
| **Seed round** (Month 12-18) | €1.5M-€2.5M | VC (e.g., Earlybird, Cherry Ventures, Capnamic, HV Capital — all German/EU VCs with cybersecurity thesis) |

**Recommendation**: Start bootstrapped with EXIST + founder capital. Reach €200K+ ARR by Month 12. Raise seed round at €1.5M for €12M-€15M pre-money valuation based on growth trajectory and regulatory tailwind.

### Path to Profitability

| Milestone | Estimated Timing | Details |
|---|---|---|
| Cash flow breakeven (monthly) | Month 14-16 | ~€65K MRR covers ~€65K monthly burn |
| Annual profitability | Month 18-20 | Cumulative revenue exceeds cumulative costs |
| Sustainable profitability | Month 24+ | ARR €3M+, team of 12-15, healthy margins |

---

## 13. Risk Analysis

| # | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| 1 | **NIS2UmsuCG delayed further** (beyond 2026) | Medium | High | EU directive already in force. BSI recommending preparation. OEM supply chain pressure creates urgency regardless. CRA product line is unaffected (EU regulation, directly applicable). |
| 2 | **CRA harmonized standards delayed** | Medium | Medium | Standards not required for Module A self-assessment. Platform works with essential requirements directly from CRA Annex I. Standards provide convenience, not necessity. |
| 3 | **Secjur/DataGuard add deep CRA features** | Medium | High | Our combined NIS2+CRA positioning is unique. CRA product security requires SBOM/firmware expertise they don't have. Speed: ship CRA module before they do. |
| 4 | **ONEKEY adds compliance management** | Medium | Medium | ONEKEY focuses on firmware analysis (deep tech). Compliance workflow is different skill set. Potential for partnership rather than competition. |
| 5 | **Large player enters** (Siemens, TÜV, SAP) | Low-Medium | High | Large companies move slowly. Siemens would build for their own product portfolio, not generic Mittelstand. TÜV might partner with us rather than build (we make their assessments easier). SAP would integrate into S/4HANA, not serve non-SAP users. |
| 6 | **Customers prefer consulting over software** | Medium | Medium | Offer hybrid model: SchutzKompass + partner consulting. MSP channel provides implementation services. Platform makes consulting faster, not replaces it entirely. |
| 7 | **Compliance content becomes outdated/inaccurate** | Low | Critical | Dedicated compliance specialist on team. Subscribe to BSI, ENISA, EC regulatory feeds. Legal review process for all content updates. If one customer gets bad advice, reputation is destroyed. |
| 8 | **Customer churn after initial compliance** | Medium | Medium | CRA requires continuous vulnerability monitoring and SBOM updates — inherently recurring. NIS2 requires annual reviews and ongoing incident readiness. Build features that increase value over time (benchmarking, supplier network effects). |
| 9 | **Data breach of SchutzKompass itself** | Low | Critical | Practice what we preach: ISO 27001 certification for own operations (by Month 12), annual pen tests, bug bounty program, German hosting with encryption at rest/transit, minimal data collection. |
| 10 | **ENISA Single Reporting Platform delays** | Medium | Low | Build manual export (pre-filled PDF/XML) first. API integration when platform is available. Customers can submit manually. |

---

## 14. Competitive Positioning

### Competitive Landscape Map

```
                          CRA Product Compliance
                                  ▲
                                  │
                    ONEKEY        │        SchutzKompass
                   (firmware      │       (compliance workflow
                    analysis)     │        + SBOM + NIS2)
                                  │
                                  │
 NIS2 Org ◄───────────────────────┼───────────────────────► CRA+NIS2
 Compliance                       │                         Combined
                                  │
                DataGuard         │
                Secjur            │
                (broad GRC)       │
                                  │
                    Vanta/Drata   │
                    (US, no NIS2  │
                     or CRA)      │
                                  ▼
                          NIS2 Org Compliance Only
```

SchutzKompass occupies the **upper-right quadrant** — the only platform offering both NIS2 organizational compliance AND CRA product security compliance. This positioning is currently unoccupied.

### Defensibility Layers

1. **Regulatory depth** (Month 1+): Expert-reviewed German compliance content for NIS2 + CRA. Hard to replicate without native German regulatory expertise.
2. **Combined platform** (Month 6+): Single login for both organizational and product security compliance. No switching between tools.
3. **SBOM + vulnerability pipeline** (Month 6+): Technical infrastructure for firmware analysis, SBOM management, CVE monitoring. Not trivial to build.
4. **MSP channel** (Month 9+): Exclusive/preferred partnerships with IT-Systemhäuser. Once MSPs train on SchutzKompass, switching costs increase.
5. **Supplier network effects** (Month 12+): As manufacturers use SchutzKompass for supplier questionnaires, suppliers join the platform to respond. Network grows.
6. **Customer evidence base** (Month 12+): Historical compliance data makes the platform more valuable over time. Switching means losing compliance history.
7. **Notified body partnerships** (Month 18+): If TÜV/DEKRA recommend SchutzKompass for CRA preparation, trust moat is very strong.

---

## 15. Success Metrics

### Phase 1 Metrics (Month 1-6)

| Metric | Target | Measurement |
|---|---|---|
| Betroffenheits-Check completions | 500+ | Web analytics |
| Pilot customers signed | 5-10 | CRM |
| NPS from pilot customers | >40 | Quarterly survey |
| IHK partnerships signed | 3-5 | Partnership agreements |
| Compliance content accuracy | 100% (zero errors) | Legal review log |

### Phase 2 Metrics (Month 7-12)

| Metric | Target | Measurement |
|---|---|---|
| Paying customers | 30-60 | Billing system |
| MRR | €40,000-€90,000 | Stripe/billing |
| MSP partnerships | 2-3 active | Pipeline CRM |
| SBOMs managed on platform | 100+ | Product analytics |
| Vulnerabilities monitored | 10,000+ components | System metrics |
| Customer retention (monthly) | >95% | Billing churn |
| Average onboarding time | <2 hours | Support analytics |
| Support ticket resolution | <24h first response | Helpdesk |

### Phase 3 Metrics (Month 13-24)

| Metric | Target | Measurement |
|---|---|---|
| Paying customers | 120-200 | Billing |
| ARR | €2M-€4M | Billing |
| Combined (NIS2+CRA) customers | >40% of base | Product analytics |
| DACH customers (AT/CH) | 10-20 | CRM |
| Products managed on platform | 500+ | Product analytics |
| Supplier questionnaires sent | 5,000+ | Platform analytics |
| Conference pipeline generated | €500K+ pipeline value | CRM |
| Team size | 12-15 | HR |

### North Star Metric
**Number of German Mittelstand companies achieving demonstrable NIS2 + CRA compliance through SchutzKompass.** This captures both products, customer success, and regulatory impact.

---

## Appendix A: Regulatory Reference Links

| Document | URL | Status |
|---|---|---|
| CRA Legal Text (Reg. 2024/2847) | https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R2847 | In force |
| CRA Summary | https://digital-strategy.ec.europa.eu/en/policies/cra-summary | Official EC page |
| CRA Manufacturers page | https://digital-strategy.ec.europa.eu/en/policies/cra-manufacturers | Updated Mar 2026 |
| CRA FAQ | https://ec.europa.eu/newsroom/dae/redirection/document/122331 | Official EC |
| CRA Product Categories (Impl. Reg. 2025/2392) | https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32025R2392 | In force (Nov 2025) |
| CRA Conformity Assessment | https://digital-strategy.ec.europa.eu/en/policies/cra-conformity-assessment | Official EC |
| BSI CRA Guidance (German) | https://www.bsi.bund.de/dok/cra | BSI official |
| BSI CRA Technical Guideline TR-03183 | https://www.bsi.bund.de/dok/tr-03183 | BSI official |
| NIS2 Directive (2022/2555) | https://eur-lex.europa.eu/eli/dir/2022/2555 | In force |
| BSI IT-Grundschutz Kompendium | https://www.bsi.bund.de/grundschutz | BSI official |
| NVD API v2 | https://nvd.nist.gov/developers/vulnerabilities | NIST |
| OSV.dev | https://osv.dev/ | Google-maintained |
| SPDX Specification | https://spdx.dev/ | Linux Foundation |
| CycloneDX Specification | https://cyclonedx.org/ | OWASP |

## Appendix B: Open-Source Tools to Integrate

| Tool | Purpose | License | Integration Method |
|---|---|---|---|
| Syft (Anchore) | SBOM generation from containers/filesystems | Apache 2.0 | CLI in container |
| Trivy (Aqua Security) | SBOM + vulnerability scanning | Apache 2.0 | CLI in container |
| Grype (Anchore) | Vulnerability matching against SBOMs | Apache 2.0 | CLI in container |
| cdxgen (CycloneDX) | SBOM generation from source code | Apache 2.0 | CLI in container |
| OSV-Scanner (Google) | Vulnerability scanning against OSV database | Apache 2.0 | CLI or API |
| SBOM Quality Score | SBOM completeness assessment | Open source | Library integration |

---

*This plan was created on March 26, 2026, based on regulatory status as of that date. CRA vulnerability reporting (Sep 2026) is 5.5 months away. CRA full application (Dec 2027) is 21 months away. NIS2UmsuCG passage in Germany is pending. All timelines should be adjusted if regulatory dates change.*

*Sources: EU Cyber Resilience Act official summary (EC, updated Dec 2025), CRA Manufacturers page (EC, updated Mar 2026), Commission Implementing Regulation (EU) 2025/2392 (product categories, Nov 2025), DORA Wikipedia article, AI Act high-level summary (artificialintelligenceact.eu), BSI CRA technical guideline TR-03183, PP-03 and PP-08 viability assessments from this repository.*
