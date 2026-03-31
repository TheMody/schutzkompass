'use client';

import { Plug, CheckCircle2, ExternalLink } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  connected: boolean;
  icon: string;
}

const integrations: Integration[] = [
  { id: '1', name: 'BSI IT-Grundschutz Kompendium', description: 'Automatischer Import von BSI-Maßnahmen und -Bausteinen.', category: 'Compliance', connected: true, icon: '🛡️' },
  { id: '2', name: 'NVD / CVE-Datenbank', description: 'Automatischer Schwachstellenabgleich mit der National Vulnerability Database.', category: 'Security', connected: true, icon: '🔍' },
  { id: '3', name: 'Jira', description: 'Maßnahmen und Aufgaben direkt als Jira-Tickets erstellen.', category: 'Projektmanagement', connected: false, icon: '📋' },
  { id: '4', name: 'Microsoft Teams', description: 'Benachrichtigungen bei Vorfällen und Fristüberschreitungen.', category: 'Kommunikation', connected: false, icon: '💬' },
  { id: '5', name: 'Resend', description: 'Transaktionale E-Mails für Lieferantenfragebögen und Benachrichtigungen.', category: 'E-Mail', connected: false, icon: '📧' },
  { id: '6', name: 'GitHub / GitLab', description: 'SBOM-Import aus CI/CD-Pipelines.', category: 'DevOps', connected: false, icon: '🐙' },
];

export default function IntegrationenPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Integrationen</h1>
        <p className="text-muted-foreground">
          Verbinden Sie SchutzKompass mit Ihren bestehenden Tools und Datenquellen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((int) => (
          <div key={int.id} className="rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{int.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{int.name}</h3>
                  {int.connected && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{int.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                    {int.category}
                  </span>
                </div>
              </div>
              <button
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium ${
                  int.connected
                    ? 'border border-green-200 bg-green-50 text-green-700'
                    : 'bg-[#1e3a5f] text-white hover:bg-[#2a4f7f]'
                }`}
              >
                {int.connected ? 'Verbunden' : 'Verbinden'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-dashed bg-muted/50 p-6 text-center">
        <Plug className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Benötigen Sie eine weitere Integration?{' '}
          <button className="text-[#1e3a5f] underline inline-flex items-center gap-1">
            Feature anfragen <ExternalLink className="h-3 w-3" />
          </button>
        </p>
      </div>
    </div>
  );
}
