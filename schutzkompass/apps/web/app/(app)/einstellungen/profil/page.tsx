'use client';

import { useState } from 'react';
import { User, Mail, Shield, Key, Save } from 'lucide-react';

export default function ProfilPage() {
  const [name, setName] = useState('Max Mustermann');
  const [email, setEmail] = useState('max@example.com');
  const [role] = useState('Admin');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="text-muted-foreground">Verwalten Sie Ihr Benutzerprofil und Ihre Sicherheitseinstellungen.</p>
      </div>

      {/* Profile Info */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold flex items-center gap-2">
            <User className="h-4 w-4" /> Persönliche Daten
          </h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">E-Mail</label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rolle</label>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-sm font-medium">{role}</span>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a4f7f]"
          >
            <Save className="h-4 w-4" /> {saved ? '✓ Gespeichert' : 'Speichern'}
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Key className="h-4 w-4" /> Sicherheit
          </h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Aktuelles Passwort</label>
            <input type="password" className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Neues Passwort</label>
            <input type="password" className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Passwort bestätigen</label>
            <input type="password" className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <button className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
            Passwort ändern
          </button>
        </div>
      </div>
    </div>
  );
}
