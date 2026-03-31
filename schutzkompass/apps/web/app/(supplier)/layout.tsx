export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center border-b bg-card px-6">
        <span className="text-lg font-bold text-primary">SchutzKompass</span>
        <span className="ml-2 text-sm text-muted-foreground">
          Lieferanten-Portal
        </span>
      </header>
      <main className="flex-1 bg-muted/30 p-6">{children}</main>
    </div>
  );
}
