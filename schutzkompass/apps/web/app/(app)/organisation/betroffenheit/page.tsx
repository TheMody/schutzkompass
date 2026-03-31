import Link from 'next/link';

export default function BetroffenheitPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Betroffenheits-Check</h1>
        <p className="text-muted-foreground">
          Prüfen Sie, ob Ihr Unternehmen von NIS2 und/oder CRA betroffen ist.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
        <p className="text-muted-foreground mb-4">
          Starten Sie den geführten Onboarding-Assistenten, um Ihre Betroffenheit zu ermitteln.
        </p>
        <Link
          href="/onboarding"
          className="inline-flex items-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Betroffenheits-Check starten →
        </Link>
      </div>
    </div>
  );
}
