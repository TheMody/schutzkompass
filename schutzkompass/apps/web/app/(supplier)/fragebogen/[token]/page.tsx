export default function SupplierQuestionnairePage({
  params,
}: {
  params: { token: string };
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-lg border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Lieferanten-Sicherheitsbewertung</h1>
        <p className="mt-2 text-muted-foreground">
          Bitte füllen Sie den folgenden Fragebogen aus.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
        <p className="text-muted-foreground">
          Fragebogen wird in Sprint 8 implementiert.
        </p>
      </div>
    </div>
  );
}
