'use client';

import { useState } from 'react';
import {
  HelpCircle,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Lightbulb,
  Shield,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const faqItems: FaqItem[] = [
  {
    category: 'NIS2',
    question: 'Was ist NIS2 und bin ich betroffen?',
    answer: 'Die NIS2-Richtlinie (EU 2022/2555) ist die überarbeitete EU-Richtlinie zur Netz- und Informationssicherheit. Sie betrifft Unternehmen in 18 Sektoren ab 50 Mitarbeitern oder 10 Mio. € Umsatz. Nutzen Sie unseren Betroffenheits-Check unter Organisation → Betroffenheits-Check.',
  },
  {
    category: 'NIS2',
    question: 'Welche Meldefristen gelten bei einem Sicherheitsvorfall?',
    answer: 'NIS2 Art. 23 schreibt vor: 24h Frühwarnung an das BSI, 72h detaillierte Vorfallmeldung, 30 Tage Abschlussbericht. SchutzKompass trackt diese Fristen automatisch im Vorfallmanagement.',
  },
  {
    category: 'CRA',
    question: 'Was ist der Cyber Resilience Act (CRA)?',
    answer: 'Der CRA (EU 2024/2847) stellt Cybersecurity-Anforderungen an alle Produkte mit digitalen Elementen, die auf dem EU-Markt verkauft werden. Hersteller müssen SBOM pflegen, Schwachstellen melden und Support-Zeiträume einhalten.',
  },
  {
    category: 'CRA',
    question: 'Welche CRA-Kategorie hat mein Produkt?',
    answer: 'Der CRA unterscheidet 4 Kategorien: Standard (Modul A Selbstbewertung), Wichtig Klasse I, Wichtig Klasse II (Modul B+C oder Normen) und Kritisch (Modul H, EU-Zertifizierung). Unser CRA-Klassifizierer hilft bei der Einordnung.',
  },
  {
    category: 'Plattform',
    question: 'Wie erstelle ich einen SBOM?',
    answer: 'Gehen Sie zu Produkte → SBOM-Manager. Sie können SBOMs manuell erstellen, per CycloneDX/SPDX-Datei importieren, oder direkt aus Ihrer CI/CD-Pipeline generieren lassen.',
  },
  {
    category: 'Plattform',
    question: 'Kann ich mehrere Benutzer einladen?',
    answer: 'Ja! Unter Einstellungen → Benutzer & Rollen können Sie Team-Mitglieder als Admin, Bearbeiter oder Betrachter einladen. Jede Rolle hat unterschiedliche Berechtigungen.',
  },
  {
    category: 'Plattform',
    question: 'Wie sende ich einen Lieferanten-Fragebogen?',
    answer: 'Unter Organisation → Lieferketten-Sicherheit können Sie Lieferanten anlegen und per Klick den 30-Fragen Sicherheitsfragebogen versenden. Lieferanten erhalten einen tokenbasierten Zugang ohne Login.',
  },
];

const guides = [
  { icon: <Shield className="h-5 w-5 text-blue-500" />, title: 'NIS2 Compliance Quickstart', description: 'In 5 Schritten zur NIS2-Konformität', link: '#' },
  { icon: <FileText className="h-5 w-5 text-purple-500" />, title: 'CRA Technische Dokumentation', description: 'Annex VII Schritt-für-Schritt Anleitung', link: '#' },
  { icon: <AlertTriangle className="h-5 w-5 text-red-500" />, title: 'Vorfall-Meldeweg', description: 'Wie Sie NIS2-konform Vorfälle melden', link: '#' },
  { icon: <Lightbulb className="h-5 w-5 text-yellow-500" />, title: 'Best Practices Risikobewertung', description: 'BSI-Grundschutz und ISO 27005 Methodik', link: '#' },
];

export default function HilfeSupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const categories = [...new Set(faqItems.map((f) => f.category))];
  const filtered = filterCategory ? faqItems.filter((f) => f.category === filterCategory) : faqItems;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Hilfe & Support</h1>
        <p className="text-muted-foreground">
          Anleitungen, FAQ und Support-Ressourcen für SchutzKompass.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guides.map((guide) => (
          <a
            key={guide.title}
            href={guide.link}
            className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            {guide.icon}
            <div>
              <p className="font-semibold text-sm">{guide.title}</p>
              <p className="text-xs text-muted-foreground">{guide.description}</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
          </a>
        ))}
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <HelpCircle className="h-5 w-5" /> Häufig gestellte Fragen
        </h2>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilterCategory(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium border ${
              !filterCategory ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'bg-card text-muted-foreground border-border hover:bg-muted'
            }`}
          >
            Alle
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium border ${
                filterCategory === cat ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'bg-card text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map((faq, idx) => (
            <div key={idx} className="rounded-lg border bg-card shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                    {faq.category}
                  </span>
                  <span className="font-medium text-sm">{faq.question}</span>
                </div>
                {openFaq === idx ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-sm text-muted-foreground border-t pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-lg border bg-card p-6 shadow-sm text-center">
        <MessageCircle className="h-8 w-8 text-[#0d9488] mx-auto mb-2" />
        <h3 className="font-semibold">Noch Fragen?</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Unser Support-Team hilft Ihnen gerne weiter.
        </p>
        <button className="mt-3 rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a4f7f]">
          Support kontaktieren
        </button>
      </div>
    </div>
  );
}
