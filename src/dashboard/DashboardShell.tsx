type DashboardShellProps = {
  title?: string;
  description?: string;
};

export function DashboardShell({
  title = "Coming Soon",
  description = "This area is still under construction. We'll wire the corresponding dashboard experience shortly.",
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="text-slate-600 max-w-md mx-auto">{description}</p>
      </div>
    </div>
  );
}
