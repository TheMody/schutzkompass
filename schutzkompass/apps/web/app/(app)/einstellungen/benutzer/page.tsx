'use client';

import { useState } from 'react';
import { Users, Plus, Shield, Mail, MoreHorizontal } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  lastActive: string;
}

const ROLE_LABELS = { admin: 'Admin', editor: 'Bearbeiter', viewer: 'Betrachter' };
const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-700',
  editor: 'bg-blue-100 text-blue-700',
  viewer: 'bg-muted text-muted-foreground',
};

const members: TeamMember[] = [
  { id: '1', name: 'Max Mustermann', email: 'max@example.com', role: 'admin', lastActive: '2026-04-01T10:00:00Z' },
  { id: '2', name: 'Lisa Sicherheit', email: 'lisa@example.com', role: 'editor', lastActive: '2026-04-01T09:30:00Z' },
  { id: '3', name: 'Tom Technik', email: 'tom@example.com', role: 'editor', lastActive: '2026-03-30T14:00:00Z' },
  { id: '4', name: 'Anna Audit', email: 'anna@example.com', role: 'viewer', lastActive: '2026-03-28T11:00:00Z' },
];

export default function BenutzerRollenPage() {
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Benutzer & Rollen</h1>
          <p className="text-muted-foreground">Team-Mitglieder und Berechtigungen verwalten.</p>
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="flex items-center gap-2 rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a4f7f]"
        >
          <Plus className="h-4 w-4" /> Einladen
        </button>
      </div>

      {showInvite && (
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h3 className="font-semibold text-sm mb-3">Neues Mitglied einladen</h3>
          <div className="flex gap-3">
            <input placeholder="E-Mail-Adresse" className="flex-1 rounded-lg border px-3 py-2 text-sm" />
            <select className="rounded-lg border px-3 py-2 text-sm">
              <option value="editor">Bearbeiter</option>
              <option value="viewer">Betrachter</option>
              <option value="admin">Admin</option>
            </select>
            <button className="rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a4f7f]">
              Senden
            </button>
          </div>
        </div>
      )}

      {/* Roles Description */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-purple-500" />
            <span className="font-semibold text-sm">Admin</span>
          </div>
          <p className="text-xs text-muted-foreground">Vollzugriff auf alle Bereiche, Benutzerverwaltung, Einstellungen.</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="font-semibold text-sm">Bearbeiter</span>
          </div>
          <p className="text-xs text-muted-foreground">Assets, Risiken, Maßnahmen, Produkte bearbeiten. Keine Benutzerverwaltung.</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm">Betrachter</span>
          </div>
          <p className="text-xs text-muted-foreground">Leserechte auf Dashboard, Berichte und Dokumente.</p>
        </div>
      </div>

      {/* Members Table */}
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">E-Mail</th>
              <th className="px-4 py-3 font-medium">Rolle</th>
              <th className="px-4 py-3 font-medium">Zuletzt aktiv</th>
              <th className="px-4 py-3 font-medium text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="px-4 py-3 font-medium">{m.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[m.role]}`}>
                    {ROLE_LABELS[m.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(m.lastActive).toLocaleDateString('de-DE')}
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
