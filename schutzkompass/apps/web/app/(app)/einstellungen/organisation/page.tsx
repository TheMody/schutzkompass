'use client';

import { useState } from 'react';
import { Building2, Globe, Mail, Phone, Save } from 'lucide-react';

export default function OrganisationPage() {
  const [orgName, setOrgName] = useState('Muster GmbH');
  const [industry, setIndustry] = useState('Herstellung');
  const [website, setWebsite] = useState('https://www.muster.de');
  const [contactEmail, setContactEmail] = useState('info@muster.de');
  const [phone, setPhone] = useState('+49 30 12345678');
  const [address, setAddress] = useState('Musterstraße 42, 10115 Berlin');
  const [employees, setEmployees] = useState('50-249');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Organisation</h1>
        <p className="text-muted-foreground">Grundlegende Informationen Ihrer Organisation.</p>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Organisationsdaten
          </h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Organisationsname</label>
              <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Branche</label>
              <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mitarbeiterzahl</label>
              <select value={employees} onChange={(e) => setEmployees(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm">
                <option value="1-49">1-49</option>
                <option value="50-249">50-249</option>
                <option value="250+">250+</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kontakt-E-Mail</label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefon</label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Adresse</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a4f7f]"
          >
            <Save className="h-4 w-4" /> {saved ? '✓ Gespeichert' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}
