# SchutzKompass — Benutzerhandbuch

> **Version 1.0** · Stand: Juli 2025
> Ihre All-in-One-Plattform für NIS2- & CRA-Compliance

---

## Inhaltsverzeichnis

1. [Einführung](#1-einführung)
2. [Erste Schritte](#2-erste-schritte)
3. [Dashboard](#3-dashboard)
4. [Organisation (NIS2)](#4-organisation-nis2)
   - 4.1 [Betroffenheits-Check](#41-betroffenheits-check)
   - 4.2 [Asset-Inventar](#42-asset-inventar)
   - 4.3 [Risikobewertung](#43-risikobewertung)
   - 4.4 [Maßnahmen-Tracker](#44-maßnahmen-tracker)
   - 4.5 [Richtlinien-Bibliothek](#45-richtlinien-bibliothek)
   - 4.6 [Lieferketten-Sicherheit](#46-lieferketten-sicherheit)
   - 4.7 [Vorfallmanagement](#47-vorfallmanagement)
   - 4.8 [Audit & Nachweise](#48-audit--nachweise)
5. [Produkte (CRA)](#5-produkte-cra)
   - 5.1 [Produkt-Inventar](#51-produkt-inventar)
   - 5.2 [SBOM-Manager](#52-sbom-manager)
   - 5.3 [Schwachstellen-Monitor](#53-schwachstellen-monitor)
   - 5.4 [Meldewesen](#54-meldewesen)
   - 5.5 [Konformitäts-Dokumentation](#55-konformitäts-dokumentation)
   - 5.6 [Produkt-Lebenszyklus](#56-produkt-lebenszyklus)
6. [Einstellungen](#6-einstellungen)
   - 6.1 [Organisation](#61-organisation)
   - 6.2 [Benutzer & Rollen](#62-benutzer--rollen)
   - 6.3 [Integrationen](#63-integrationen)
   - 6.4 [Profil](#64-profil)
7. [Hilfe & Support](#7-hilfe--support)
8. [Glossar](#8-glossar)
9. [FAQ](#9-faq)

---

## 1. Einführung

### Was ist SchutzKompass?

**SchutzKompass** ist eine webbasierte Compliance-Plattform, die Unternehmen dabei unterstützt, die Anforderungen der **EU NIS2-Richtlinie** (Network and Information Security Directive 2) und des **EU Cyber Resilience Act (CRA)** strukturiert umzusetzen.

Die Plattform bietet:

- **NIS2-Compliance**: Betroffenheitsprüfung, Risikobewertung, Maßnahmen-Tracking, Richtlinien-Vorlagen, Lieferketten-Management, Vorfallmanagement und Audit-Vorbereitung
- **CRA-Compliance**: Produkt-Inventar, SBOM-Management, Schwachstellen-Monitoring, Konformitäts-Dokumentation und Lebenszyklus-Verwaltung

### Für wen ist SchutzKompass?

| Zielgruppe | Nutzen |
|---|---|
| **IT-Sicherheitsbeauftragte (CISO)** | Gesamtüberblick über den Compliance-Status, Risiken und Maßnahmen |
| **Geschäftsführung** | Dashboard-KPIs, Audit-Readiness, regulatorische Pflichten |
| **Produktverantwortliche** | CRA-Produktklassifizierung, SBOM, Schwachstellen-Triage |
| **Compliance-Manager** | Richtlinien, Nachweise, Konformitätserklärungen |
| **IT-Administratoren** | Asset-Inventar, Lieferketten-Bewertung |

### Systemvoraussetzungen

- Moderner Webbrowser (Chrome, Firefox, Edge, Safari – jeweils aktuelle Version)
- Internetzugang
- Bildschirmauflösung ≥ 1280 × 720 px empfohlen

---

## 2. Erste Schritte

### 2.1 Registrierung & Anmeldung

1. Öffnen Sie SchutzKompass in Ihrem Browser.
2. Klicken Sie auf **„Registrieren"** und geben Sie Ihren Namen, Ihre E-Mail-Adresse und ein sicheres Passwort ein.
3. Nach der Registrierung werden Sie automatisch angemeldet.
4. Für spätere Anmeldungen nutzen Sie die **Login-Seite** mit E-Mail und Passwort.

> **Tipp:** Verwenden Sie ein Passwort mit mindestens 8 Zeichen, Groß-/Kleinschreibung und Sonderzeichen.

### 2.2 Onboarding-Assistent

Beim ersten Login führt Sie ein **4-Schritte-Assistent** durch die initiale Einrichtung:

| Schritt | Beschreibung |
|---|---|
| **1 – Organisation** | Firmenname, Branche, Standort, Mitarbeiterzahl |
| **2 – NIS2-Prüfung** | Automatische Betroffenheitsprüfung basierend auf Ihren Angaben (19 Sektoren werden geprüft) |
| **3 – CRA-Prüfung** | Angabe, ob Sie digitale Produkte herstellen; automatische CRA-Klassifizierung |
| **4 – Zusammenfassung** | Ergebnis der Betroffenheitsanalyse mit konkreten nächsten Schritten |

Nach Abschluss des Onboardings landen Sie auf dem **Dashboard** und können sofort mit der Arbeit beginnen.

### 2.3 Navigation

Die **Seitenleiste** (links) ist Ihr zentraler Navigationspunkt und in folgende Bereiche gegliedert:

- 🏠 **Dashboard** — Gesamtübersicht
- 🏢 **Organisation (NIS2)** — Alle NIS2-bezogenen Module (8 Unterseiten)
- 📦 **Produkte (CRA)** — Alle CRA-bezogenen Module (6 Unterseiten)
- ⚙️ **Einstellungen** — Organisation, Benutzer, Integrationen
- ❓ **Hilfe & Support** — FAQ, Anleitungen, Kontakt

Klicken Sie auf einen Bereich, um die zugehörigen Untermenüs aufzuklappen.

---

## 3. Dashboard

Das Dashboard bietet Ihnen einen **Echtzeit-Überblick** über den gesamten Compliance-Status Ihrer Organisation.

### Kennzahlen-Karten

Oben im Dashboard sehen Sie vier zentrale KPIs:

| Karte | Beschreibung |
|---|---|
| **Gesamt-Compliance** | Prozentualer Fortschritt über alle NIS2-Maßnahmen |
| **Offene Risiken** | Anzahl identifizierter Risiken, die noch nicht behandelt wurden |
| **Aktive Assets** | Gesamtzahl der erfassten IT-Assets |
| **CRA-Produkte** | Anzahl der registrierten Produkte mit CRA-Relevanz |

### Compliance-Donut

Ein **Kreisdiagramm** zeigt den Anteil erfüllter vs. offener Maßnahmen auf einen Blick.

### Risiko-Heatmap

Die **5×5-Risikomatrix** visualisiert Ihre Risiken nach Eintrittswahrscheinlichkeit (X-Achse) und Auswirkung (Y-Achse). Die Farben bedeuten:

| Farbe | Risikostufe |
|---|---|
| 🟢 Grün | Niedriges Risiko (1–4) |
| 🟡 Gelb | Mittleres Risiko (5–9) |
| 🟠 Orange | Hohes Risiko (10–16) |
| 🔴 Rot | Kritisches Risiko (17–25) |

### Risikoverteilung

Ein **Balkendiagramm** zeigt, wie viele Risiken in jeder Stufe (niedrig, mittel, hoch, kritisch) existieren.

---

## 4. Organisation (NIS2)

### 4.1 Betroffenheits-Check

**Pfad:** Organisation → Betroffenheits-Check

Hier prüfen Sie, ob Ihre Organisation unter die NIS2-Richtlinie fällt.

#### So funktioniert es:

1. Wählen Sie Ihren **Sektor** aus 19 verfügbaren Sektoren (z.B. Energie, Transport, Gesundheit, Digitale Infrastruktur).
2. Wählen Sie den zugehörigen **Teilsektor**.
3. Geben Sie **Mitarbeiterzahl** und **Jahresumsatz** an.
4. Klicken Sie auf **„Prüfung starten"**.

#### Ergebnis:

Die Plattform berechnet automatisch:

- **Betroffenheitsstatus**: Betroffen / Nicht betroffen
- **Einrichtungstyp**: Wesentliche Einrichtung / Wichtige Einrichtung
- **Begründung**: Warum Sie betroffen sind (Schwellenwerte, Sektor-Zuordnung)
- **Pflichten**: Konkrete regulatorische Anforderungen, die für Sie gelten

> **Hintergrund:** NIS2 unterscheidet zwischen „wesentlichen" und „wichtigen" Einrichtungen. Wesentliche Einrichtungen (z.B. Energie, Gesundheit, Digitale Infrastruktur) unterliegen strengeren Aufsichtsmaßnahmen.

### 4.2 Asset-Inventar

**Pfad:** Organisation → Asset-Inventar

Das Asset-Inventar erfasst alle IT-Systeme, Netzwerke, Datenbanken und Anwendungen Ihrer Organisation.

#### Assets hinzufügen

1. Klicken Sie auf **„Asset hinzufügen"**.
2. Füllen Sie das Formular aus:
   - **Name** — Bezeichnung des Assets (z.B. „Produktions-Server")
   - **Typ** — Server, Netzwerk, Anwendung, Datenbank, IoT-Gerät, Sonstiges
   - **Kritikalität** — Niedrig, Mittel, Hoch, Kritisch
   - **Standort** — Physischer oder logischer Standort
   - **Verantwortlich** — Zuständige Person
3. Klicken Sie auf **„Speichern"**.

#### CSV-Import

Für die Massenerfassung können Sie Assets per **CSV-Datei** importieren:

1. Klicken Sie auf **„CSV importieren"**.
2. Wählen Sie Ihre CSV-Datei aus.
3. Das erwartete Format ist:
   ```
   name,type,criticality,location,owner
   Webserver,server,high,RZ-1,Max Mustermann
   ```
4. Die Plattform validiert die Daten und importiert sie automatisch.

#### Asset-Übersicht

Die Tabelle zeigt alle Assets mit:
- Name, Typ, Kritikalität, Standort, Verantwortlicher
- Filterung nach Typ und Kritikalität möglich
- Klick auf ein Asset öffnet die **Detailansicht**

### 4.3 Risikobewertung

**Pfad:** Organisation → Risikobewertung

Hier führen Sie strukturierte Risikobewertungen nach der **5×5-Risikomatrix** durch.

#### Neue Risikobewertung erstellen

1. Klicken Sie auf **„Neue Bewertung"**.
2. Geben Sie einen **Titel** und eine **Beschreibung** ein.
3. Wählen Sie ein **Asset** aus (optional, aber empfohlen).
4. Die Bewertung wird mit dem Status „Entwurf" erstellt.

#### Risiken erfassen

Für jede Bewertung können Sie einzelne Risiken hinzufügen:

1. Öffnen Sie eine Bewertung.
2. Klicken Sie auf **„Risiko hinzufügen"**.
3. Wählen Sie eine **Bedrohung** aus dem integrierten Bedrohungskatalog (20 Bedrohungen, z.B. Ransomware, Phishing, DDoS).
4. Bewerten Sie:
   - **Eintrittswahrscheinlichkeit** (1–5): Sehr unwahrscheinlich → Sehr wahrscheinlich
   - **Auswirkung** (1–5): Vernachlässigbar → Katastrophal
5. Geben Sie vorhandene **Gegenmaßnahmen** und den **Risikoverantwortlichen** ein.
6. Der **Risikoscore** wird automatisch berechnet (Wahrscheinlichkeit × Auswirkung).

#### Risikomatrix (Heatmap)

Die visuelle Heatmap zeigt alle Risiken in einer 5×5-Matrix:
- **X-Achse**: Eintrittswahrscheinlichkeit
- **Y-Achse**: Auswirkung
- Jeder Punkt repräsentiert ein Risiko
- Mouseover zeigt Details

### 4.4 Maßnahmen-Tracker

**Pfad:** Organisation → Maßnahmen-Tracker

Der Maßnahmen-Tracker bildet die **10 NIS2-Maßnahmenbereiche** (Art. 21 Abs. 2 NIS2) ab und verknüpft sie mit konkreten BSI-Grundschutz-Kontrollen.

#### Struktur

Die Maßnahmen sind nach NIS2-Artikeln gruppiert:

| Artikel | Bereich |
|---|---|
| Art. 21(2)(a) | Risikoanalyse & Sicherheitskonzepte |
| Art. 21(2)(b) | Bewältigung von Sicherheitsvorfällen |
| Art. 21(2)(c) | Aufrechterhaltung des Betriebs (BCM) |
| Art. 21(2)(d) | Sicherheit der Lieferkette |
| Art. 21(2)(e) | Sicherheit bei Erwerb, Entwicklung & Wartung |
| Art. 21(2)(f) | Bewertung der Wirksamkeit |
| Art. 21(2)(g) | Cyberhygiene & Schulungen |
| Art. 21(2)(h) | Kryptografie |
| Art. 21(2)(i) | Personalsicherheit & Zugriffskontrolle |
| Art. 21(2)(j) | Multi-Faktor-Authentifizierung |

#### Maßnahmen bearbeiten

Für jede Kontrolle können Sie:
- **Status setzen**: Nicht begonnen → In Umsetzung → Umgesetzt → Nicht anwendbar
- **Verantwortlichen** zuweisen
- **Fälligkeitsdatum** festlegen
- **Notizen** hinzufügen

#### Compliance-Score

Oben auf der Seite wird der **Gesamt-Compliance-Score** als Prozentbalken angezeigt. Er berechnet sich aus dem Anteil umgesetzter Maßnahmen an der Gesamtzahl.

### 4.5 Richtlinien-Bibliothek

**Pfad:** Organisation → Richtlinien-Bibliothek

Die Richtlinien-Bibliothek enthält **12 vordefinierte Sicherheitsrichtlinien-Vorlagen**, die für NIS2-Compliance benötigt werden.

#### Verfügbare Kategorien

| Kategorie | Richtlinien (Beispiele) |
|---|---|
| **Governance** | Informationssicherheits-Leitlinie, Risikomanagement-Richtlinie |
| **Operativ** | Incident-Response-Plan, BCM-Richtlinie, Patch-Management |
| **Technisch** | Zugriffskontroll-Richtlinie, Kryptografie-Richtlinie, Netzwerksicherheit |
| **Personal** | Sicherheitsbewusstsein & Schulungen |

#### Richtlinien nutzen

1. Wählen Sie eine Kategorie oder durchsuchen Sie alle Vorlagen.
2. Klicken Sie auf eine Richtlinie, um die **Vorschau** zu öffnen.
3. Sie sehen den Titel, die Beschreibung, den Status und den NIS2-Artikelbezug.
4. Setzen Sie den **Status**: Entwurf → In Prüfung → Genehmigt → Veröffentlicht
5. **Exportieren** Sie die Richtlinie als Vorlage für Ihre interne Dokumentation.

### 4.6 Lieferketten-Sicherheit

**Pfad:** Organisation → Lieferketten-Sicherheit

NIS2 verlangt die Bewertung und Überwachung Ihrer Lieferanten und Dienstleister hinsichtlich Cybersicherheit.

#### Lieferanten verwalten

1. Klicken Sie auf **„Lieferant hinzufügen"**.
2. Geben Sie ein:
   - **Name** des Lieferanten
   - **Kategorie**: Software, Hardware, Cloud, Managed Services, Beratung
   - **Kritikalität**: Niedrig, Mittel, Hoch, Kritisch
   - **Kontakt-E-Mail**
3. Klicken Sie auf **„Speichern"**.

#### Sicherheitsbewertung (Fragebogen)

Für jeden Lieferanten können Sie einen **30-Fragen-Fragebogen** durchführen:

- Der Fragebogen umfasst **7 Kategorien**:
  1. Sicherheitsorganisation (5 Fragen)
  2. Zugriffskontrolle (5 Fragen)
  3. Kryptografie & Datenschutz (4 Fragen)
  4. Incident Management (4 Fragen)
  5. Business Continuity (4 Fragen)
  6. Compliance & Audits (4 Fragen)
  7. Software-Entwicklung (4 Fragen)

- Jede Frage wird bewertet: **Ja** (100%) / **Teilweise** (50%) / **Nein** (0%) / **Nicht anwendbar** (wird ausgeschlossen)
- Der **Gesamt-Score** wird automatisch berechnet

#### Risikobewertung der Lieferanten

Basierend auf dem Fragebogen-Score ergibt sich eine Risikoeinstufung:

| Score | Risiko | Bedeutung |
|---|---|---|
| 80–100% | 🟢 Niedrig | Gute Sicherheitspraktiken |
| 60–79% | 🟡 Mittel | Verbesserungsbedarf |
| 40–59% | 🟠 Hoch | Erhebliche Lücken |
| 0–39% | 🔴 Kritisch | Sofortiger Handlungsbedarf |

### 4.7 Vorfallmanagement

**Pfad:** Organisation → Vorfallmanagement

Das Vorfallmanagement unterstützt Sie bei der **Erkennung, Bewertung und Meldung** von Sicherheitsvorfällen gemäß den NIS2-Fristen.

#### Vorfall erfassen (Wizard)

Ein **3-Schritte-Assistent** führt Sie durch die Erfassung:

| Schritt | Eingaben |
|---|---|
| **1 – Grunddaten** | Titel, Beschreibung, Entdeckungszeitpunkt |
| **2 – Klassifizierung** | Betroffene Systeme, Art des Vorfalls, Auswirkung |
| **3 – Erstbewertung** | Schweregrad (automatisch berechnet), betroffene Benutzer, Status |

#### Schweregrad-Berechnung

Der Schweregrad wird automatisch anhand mehrerer Faktoren berechnet:

- **Anzahl betroffener Systeme**
- **Anzahl betroffener Benutzer**
- **Art des Vorfalls** (Ransomware → höherer Schweregrad)
- **Datenverlust vorhanden** (ja → Erhöhung)

Ergebnis: **Niedrig**, **Mittel**, **Hoch** oder **Kritisch**

#### NIS2-Meldefristen

Für meldepflichtige Vorfälle zeigt SchutzKompass die **gesetzlichen Fristen** als Countdown-Timer:

| Frist | Zeitraum | Beschreibung |
|---|---|---|
| 🔴 **Frühwarnung** | 24 Stunden | Erste Meldung an die zuständige Behörde (BSI) |
| 🟠 **Erstbewertung** | 72 Stunden | Detaillierte Erstbewertung mit Schweregrad und IoCs |
| 🟡 **Abschlussbericht** | 30 Tage | Vollständiger Bericht mit Root-Cause-Analyse |

Die Timer laufen ab dem Entdeckungszeitpunkt und werden farblich hervorgehoben:
- **Rot**: Frist überschritten
- **Orange**: < 25% der Zeit verbleibend
- **Grün**: Ausreichend Zeit

#### Vorfall-Detailansicht

Klicken Sie auf einen Vorfall, um die Detailansicht zu öffnen:
- **Timeline** mit allen Ereignissen und Statusänderungen
- **Aktuelle Fristen** mit Countdown
- Möglichkeit, den **Status** zu aktualisieren (Offen → In Bearbeitung → Eingedämmt → Behoben → Abgeschlossen)

### 4.8 Audit & Nachweise

**Pfad:** Organisation → Audit & Nachweise

Bereiten Sie sich strukturiert auf **NIS2-Audits** vor und verwalten Sie alle Nachweisdokumente zentral.

#### Audit-Readiness-Check

Der Readiness-Check prüft automatisch verschiedene Bereiche:

| Prüfbereich | Was wird geprüft? |
|---|---|
| Richtlinien | Sind alle Pflicht-Richtlinien genehmigt? |
| Risikobewertungen | Gibt es aktuelle Risikobewertungen? |
| Maßnahmen | Wie ist der Umsetzungsstand der Kontrollen? |
| Vorfallmanagement | Ist ein Incident-Response-Plan vorhanden? |
| Lieferketten | Sind kritische Lieferanten bewertet? |
| Schulungen | Sind Mitarbeiterschulungen dokumentiert? |

Jeder Bereich wird mit einem Status versehen:
- ✅ **Bestanden** — Anforderung erfüllt
- ⚠️ **Teilweise** — Verbesserungsbedarf
- ❌ **Nicht bestanden** — Handlungsbedarf

#### Nachweisspeicher (Evidence Repository)

Laden Sie relevante Dokumente hoch und verknüpfen Sie sie mit Compliance-Bereichen:

- Sicherheitsrichtlinien (PDF)
- Risikobewertungen
- Schulungsnachweise
- Penetrationstest-Berichte
- Lieferanten-Bewertungen
- Audit-Protokolle

Jeder Nachweis wird mit **Titel, Beschreibung, Kategorie und Upload-Datum** versehen.

#### Auditor-Portal (Vorschau)

Das Auditor-Portal bietet externen Prüfern eine **schreibgeschützte Ansicht** auf ausgewählte Compliance-Nachweise. (In der aktuellen Version als Vorschau verfügbar.)

---

## 5. Produkte (CRA)

### 5.1 Produkt-Inventar

**Pfad:** Produkte → Produkt-Inventar

Erfassen und klassifizieren Sie alle Ihre digitalen Produkte gemäß dem **Cyber Resilience Act (CRA)**.

#### Produkt hinzufügen

1. Klicken Sie auf **„Produkt hinzufügen"**.
2. Füllen Sie das Formular aus:
   - **Name** — Produktbezeichnung
   - **Version** — Aktuelle Versionsnummer
   - **Kategorie**: Standard, Important Class I, Important Class II, Critical
   - **Beschreibung**
3. Klicken Sie auf **„Speichern"**.

#### CRA-Klassifizierung

Die Plattform klassifiziert Ihre Produkte automatisch nach CRA-Kategorien:

| Kategorie | Beschreibung | Beispiele |
|---|---|---|
| **Standard** | Standardprodukte mit grundlegenden Anforderungen | Taschenlampen-Apps, einfache Tools |
| **Important Class I** | Produkte mit erhöhten Sicherheitsanforderungen | Browser, Passwort-Manager, VPN |
| **Important Class II** | Produkte mit hohen Sicherheitsanforderungen | Firewalls, IDS/IPS, Hypervisoren |
| **Critical** | Kritische Produkte | Hardware-Sicherheitsmodule, Smart-Meter-Gateways |

> **Hinweis:** Produkte der Klasse „Important Class II" und „Critical" erfordern eine **Konformitätsbewertung durch Dritte** (Zertifizierungsstelle).

#### Produkt-Detailansicht

Klicken Sie auf ein Produkt, um Details zu sehen:
- Allgemeine Informationen
- Verknüpfte SBOMs
- Bekannte Schwachstellen
- CRA-Pflichtenstatus

### 5.2 SBOM-Manager

**Pfad:** Produkte → SBOM-Manager

Der SBOM-Manager (Software Bill of Materials) erfasst und verwaltet alle **Software-Komponenten** Ihrer Produkte.

#### Warum SBOM?

Der CRA verlangt, dass Hersteller eine vollständige SBOM für jedes Produkt bereitstellen. Die SBOM dokumentiert:
- Alle verwendeten Open-Source- und Drittanbieter-Komponenten
- Versionsnummern
- Lizenzen
- Bekannte Schwachstellen

#### SBOM-Übersicht

Die Tabelle zeigt alle erfassten SBOM-Komponenten:

| Spalte | Beschreibung |
|---|---|
| **Name** | Name der Komponente (z.B. `express`, `lodash`) |
| **Version** | Installierte Version |
| **Lizenz** | Lizenztyp (MIT, Apache-2.0, etc.) |
| **Typ** | Bibliothek, Framework, Tool |
| **Risiko** | Automatisch berechnetes Risiko |

#### Komponenten-Detail

Klicken Sie auf eine Komponente, um Details zu sehen:
- Vollständiger Name und Version
- Lizenzinformationen
- Verknüpfte Schwachstellen (CVEs)
- Abhängigkeitsbaum

#### SBOM importieren/exportieren

- **Import**: Unterstützung für CycloneDX- und SPDX-Formate (geplant)
- **Export**: SBOM-Daten als JSON exportieren

### 5.3 Schwachstellen-Monitor

**Pfad:** Produkte → Schwachstellen-Monitor

Der Schwachstellen-Monitor überwacht automatisch bekannte Sicherheitslücken (**CVEs**) in Ihren SBOM-Komponenten.

#### CVE-Übersicht

Die Tabelle zeigt alle bekannten Schwachstellen:

| Spalte | Beschreibung |
|---|---|
| **CVE-ID** | Eindeutige Kennung (z.B. CVE-2024-1234) |
| **Schweregrad** | Kritisch / Hoch / Mittel / Niedrig (CVSS-basiert) |
| **CVSS-Score** | Numerischer Score (0.0–10.0) |
| **Betroffene Komponente** | Welche SBOM-Komponente betroffen ist |
| **Status** | Offen / In Bearbeitung / Behoben / Akzeptiert |

#### Schwachstellen-Triage

Für jede Schwachstelle können Sie eine **Triage** durchführen:

1. Klicken Sie auf eine CVE, um die Detailansicht zu öffnen.
2. Bewerten Sie die **Relevanz** für Ihr Produkt.
3. Setzen Sie den **Status**:
   - **Offen** — Noch nicht bewertet
   - **In Bearbeitung** — Fix wird entwickelt
   - **Behoben** — Patch verfügbar/eingespielt
   - **Akzeptiert** — Risiko bewusst akzeptiert (mit Begründung)
4. Weisen Sie einen **Verantwortlichen** zu.
5. Setzen Sie ein **Fälligkeitsdatum**.

#### CVSS-Schweregrade

| CVSS-Score | Schweregrad | Farbe |
|---|---|---|
| 9.0–10.0 | 🔴 Kritisch | Rot |
| 7.0–8.9 | 🟠 Hoch | Orange |
| 4.0–6.9 | 🟡 Mittel | Gelb |
| 0.1–3.9 | 🟢 Niedrig | Grün |

### 5.4 Meldewesen

**Pfad:** Produkte → Meldewesen

Das Meldewesen unterstützt Sie bei der **Erstellung und Verwaltung** von Meldungen an Behörden gemäß NIS2 und CRA.

#### Meldetypen

| Typ | Basis | Empfänger |
|---|---|---|
| **NIS2-Vorfallmeldung** | Art. 23 NIS2 | Zuständige Behörde (BSI) / CSIRT |
| **CRA-Schwachstellenmeldung** | Art. 11 CRA | ENISA |
| **CRA-Vorfallmeldung** | Art. 14 CRA | Marktüberwachungsbehörde |

#### Meldung erstellen

1. Klicken Sie auf **„Neue Meldung"**.
2. Wählen Sie den **Meldetyp** (NIS2 oder CRA).
3. Füllen Sie die vordefinierten **Formularfelder** aus (je nach Meldetyp unterschiedlich).
4. Überprüfen Sie die Meldung.
5. Ändern Sie den Status: Entwurf → Eingereicht → Bestätigt

#### Meldestatus verfolgen

Alle erstellten Meldungen werden in einer Übersichtstabelle angezeigt mit:
- Meldetyp, Datum, Status, Referenznummer
- Filterung nach Typ und Status

### 5.5 Konformitäts-Dokumentation

**Pfad:** Produkte → Konformitäts-Dokumentation

Erstellen und verwalten Sie die **technische Dokumentation** und die **EU-Konformitätserklärung** gemäß CRA Annex VII.

#### Annex VII Abschnitte

Die Konformitätsdokumentation ist in **8 Abschnitte** gemäß CRA Annex VII gegliedert:

| Nr. | Abschnitt | Inhalt |
|---|---|---|
| 1 | Produktbeschreibung | Allgemeine Beschreibung, bestimmungsgemäße Verwendung |
| 2 | Risikobewertung | Cybersicherheits-Risikobewertung des Produkts |
| 3 | Angewandte Standards | Referenzierte harmonisierte Normen |
| 4 | Sicherheitseigenschaften | Technische Sicherheitsmaßnahmen |
| 5 | Technische Dokumentation | Systemarchitektur, Datenflüsse |
| 6 | Test- und Prüfergebnisse | Penetrationstests, Code-Reviews |
| 7 | Schwachstellen-Behandlung | Prozess für Schwachstellen-Management |
| 8 | Unterstützungszeitraum | Geplanter Support-Zeitraum |

#### Dokumente verwalten

Für jeden Abschnitt können Sie:
1. Den **Status** setzen: Nicht begonnen → In Bearbeitung → Abgeschlossen → Genehmigt
2. **Dokumente hochladen** (PDF, Word, etc.)
3. **Notizen** hinzufügen

#### EU-Konformitätserklärung

SchutzKompass stellt eine **Vorlage für die EU-Konformitätserklärung** bereit, die die Pflichtangaben gemäß CRA enthält:
- Herstellerinformationen
- Produktidentifikation
- Referenzierte Normen
- Erklärung der Konformität
- Unterschrift des Bevollmächtigten

### 5.6 Produkt-Lebenszyklus

**Pfad:** Produkte → Produkt-Lebenszyklus

Verwalten Sie den **gesamten Lebenszyklus** Ihrer Produkte und erfüllen Sie die CRA-Anforderungen für kontinuierliche Sicherheitsupdates.

#### Lebenszyklus-Phasen

| Phase | Symbol | Beschreibung |
|---|---|---|
| **Entwicklung** | 🔵 | Initiale Entwicklung und Sicherheits-by-Design |
| **Erstveröffentlichung** | 🟢 | Markteinführung mit vollständiger Dokumentation |
| **Aktiver Support** | 🟢 | Regelmäßige Sicherheitsupdates und Patches |
| **Sicherheitsupdate** | 🟡 | Nur noch Sicherheitsupdates |
| **End of Life** | 🔴 | Kein weiterer Support |

#### CRA-Update-Pflichten

Der CRA verlangt:
- **Kostenlose Sicherheitsupdates** für den gesamten Support-Zeitraum (mindestens 5 Jahre nach Inverkehrbringen)
- **Unverzügliche Bereitstellung** von Sicherheitspatches bei bekannten Schwachstellen
- **Information der Nutzer** über verfügbare Updates

Die Plattform zeigt Ihnen pro Produkt:
- Den aktuellen Lebenszyklus-Status
- Den geplanten Support-Zeitraum
- Wann Sicherheitsupdates fällig sind

---

## 6. Einstellungen

### 6.1 Organisation

**Pfad:** Einstellungen → Organisation

Verwalten Sie die **Stammdaten Ihrer Organisation**:

- Firmenname
- Branche / Sektor
- Adresse
- Steuernummer / USt-ID
- Kontaktdaten
- NIS2-Einrichtungstyp

Änderungen werden mit **„Speichern"** übernommen.

### 6.2 Benutzer & Rollen

**Pfad:** Einstellungen → Benutzer & Rollen

Verwalten Sie die **Team-Mitglieder** und deren Zugriffsrechte.

#### Benutzer einladen

1. Klicken Sie auf **„Mitglied einladen"**.
2. Geben Sie die **E-Mail-Adresse** ein.
3. Wählen Sie die **Rolle**:

| Rolle | Rechte |
|---|---|
| **Admin** | Vollzugriff auf alle Bereiche, Benutzerverwaltung |
| **Manager** | Lesen und Bearbeiten aller Compliance-Daten |
| **Viewer** | Nur Lesezugriff |

4. Klicken Sie auf **„Einladen"**.

#### Benutzer verwalten

In der Übersichtstabelle sehen Sie alle Team-Mitglieder mit:
- Name, E-Mail, Rolle, Status (Aktiv / Eingeladen)
- Möglichkeit, Rollen zu ändern oder Benutzer zu entfernen

### 6.3 Integrationen

**Pfad:** Einstellungen → Integrationen

Verbinden Sie SchutzKompass mit externen Systemen:

| Integration | Beschreibung | Status |
|---|---|---|
| **BSI Warnmeldungen** | Automatischer Import von BSI-Sicherheitswarnungen | Verfügbar |
| **NVD (NIST)** | Automatischer CVE-Abgleich mit SBOM-Komponenten | Verfügbar |
| **Jira** | Synchronisation von Maßnahmen und Schwachstellen-Tickets | Geplant |
| **Microsoft Teams** | Benachrichtigungen bei neuen Vorfällen/Schwachstellen | Geplant |
| **Resend (E-Mail)** | E-Mail-Benachrichtigungen und Einladungen | Verfügbar |
| **GitHub / GitLab** | Automatischer SBOM-Import aus Repositories | Geplant |

Für jede Integration können Sie den **API-Schlüssel** hinterlegen und die Verbindung **testen**.

### 6.4 Profil

**Pfad:** Klick auf Ihren Namen in der Navigation (oder Einstellungen → Profil)

Verwalten Sie Ihr persönliches Profil:
- **Name** und **E-Mail-Adresse** ändern
- **Passwort** ändern (aktuelles Passwort + neues Passwort + Bestätigung)
- **Benachrichtigungseinstellungen** anpassen

---

## 7. Hilfe & Support

**Pfad:** Hilfe & Support

Die Hilfe-Seite bietet:

### FAQ

Häufig gestellte Fragen zu:
- NIS2-Grundlagen und Betroffenheit
- CRA-Anforderungen und Fristen
- Plattform-Bedienung

### Anleitungen

Schritt-für-Schritt-Guides für typische Aufgaben:
- Ersteinrichtung der Organisation
- Durchführung einer Risikobewertung
- Erstellung einer SBOM
- Vorbereitung auf ein NIS2-Audit

### Support-Kontakt

Bei Fragen wenden Sie sich an:
- **E-Mail**: support@schutzkompass.de
- **Telefon**: Verfügbar während der Geschäftszeiten
- **In-App**: Feedback-Formular direkt in der Plattform

---

## 8. Glossar

| Begriff | Erklärung |
|---|---|
| **NIS2** | Network and Information Security Directive 2 — EU-Richtlinie zur Cybersicherheit für Organisationen |
| **CRA** | Cyber Resilience Act — EU-Verordnung für die Cybersicherheit digitaler Produkte |
| **BSI** | Bundesamt für Sicherheit in der Informationstechnik |
| **CSIRT** | Computer Security Incident Response Team |
| **ENISA** | European Union Agency for Cybersecurity |
| **SBOM** | Software Bill of Materials — Stückliste aller Software-Komponenten |
| **CVE** | Common Vulnerabilities and Exposures — Kennung für bekannte Schwachstellen |
| **CVSS** | Common Vulnerability Scoring System — Bewertungssystem für Schwachstellen |
| **IoC** | Indicator of Compromise — Hinweis auf eine Kompromittierung |
| **BCM** | Business Continuity Management — Notfallplanung |
| **Annex VII** | Anhang VII des CRA — Anforderungen an die technische Dokumentation |
| **Art. 21** | Artikel 21 der NIS2 — Risikomanagementmaßnahmen |
| **Art. 23** | Artikel 23 der NIS2 — Meldepflichten bei Vorfällen |
| **Frühwarnung** | Erste Meldung innerhalb von 24h nach Entdeckung eines Vorfalls |
| **Konformitätserklärung** | Offizielle Erklärung des Herstellers, dass ein Produkt die CRA-Anforderungen erfüllt |
| **Wesentliche Einrichtung** | NIS2-Kategorie für Organisationen in kritischen Sektoren mit strengeren Pflichten |
| **Wichtige Einrichtung** | NIS2-Kategorie für Organisationen in weniger kritischen Sektoren |

---

## 9. FAQ

### Allgemein

**F: Ist SchutzKompass eine Zertifizierung?**
A: Nein. SchutzKompass ist ein Compliance-Management-Tool, das Sie bei der Umsetzung der NIS2- und CRA-Anforderungen unterstützt. Die eigentliche Zertifizierung oder Prüfung erfolgt durch zuständige Behörden oder akkreditierte Stellen.

**F: Kann ich SchutzKompass auch nutzen, wenn ich nicht von NIS2 betroffen bin?**
A: Ja. Die Plattform bietet Best-Practice-Sicherheitsmaßnahmen nach BSI-Grundschutz, die für jede Organisation nützlich sind.

**F: Werden meine Daten verschlüsselt?**
A: Ja. Alle Daten werden verschlüsselt übertragen (HTTPS/TLS) und in der Datenbank gespeichert.

### NIS2

**F: Wann muss ich NIS2 umsetzen?**
A: Die NIS2-Richtlinie musste bis Oktober 2024 in nationales Recht umgesetzt werden. Die nationalen Umsetzungsgesetze (in Deutschland: NIS2UmsuCG) definieren die genauen Fristen.

**F: Was passiert, wenn ich die Meldefristen nicht einhalte?**
A: NIS2 sieht Sanktionen vor. Für wesentliche Einrichtungen können Bußgelder bis zu 10 Mio. € oder 2% des weltweiten Jahresumsatzes verhängt werden.

**F: Muss ich alle 30 BSI-Grundschutz-Kontrollen umsetzen?**
A: Nicht unbedingt alle. Die relevanten Kontrollen hängen von Ihrem Einrichtungstyp und Sektor ab. SchutzKompass hilft Ihnen bei der Priorisierung.

### CRA

**F: Ab wann gilt der CRA?**
A: Der CRA tritt stufenweise in Kraft. Die Meldepflichten gelten ab September 2026, die vollständigen Anforderungen ab Dezember 2027.

**F: Brauche ich für jedes Produkt eine SBOM?**
A: Ja. Der CRA verlangt eine maschinenlesbare SBOM für jedes digitale Produkt, das in der EU vertrieben wird.

**F: Was ist der Unterschied zwischen Important Class I und Class II?**
A: Class II-Produkte haben höhere Sicherheitsanforderungen und erfordern in der Regel eine Konformitätsbewertung durch eine benannte Stelle (Drittprüfung). Class I-Produkte können unter bestimmten Bedingungen per Selbstbewertung konformitätsbewertet werden.

---

> **Hinweis:** Dieses Benutzerhandbuch bezieht sich auf SchutzKompass Version 1.0. Funktionen und Abläufe können sich in zukünftigen Versionen ändern. Bei Fragen wenden Sie sich an den Support.
