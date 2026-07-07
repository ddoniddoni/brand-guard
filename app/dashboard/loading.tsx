import { AppShell } from "@/components/layout/AppShell";

export default function DashboardLoading() {
  return (
    <AppShell activePath="/dashboard">
      <div className="grid gap-6 p-6 sm:p-8">
        <div className="h-32 rounded-xl bg-[var(--color-surface-soft)]" />
        <div className="grid gap-4 md:grid-cols-4">
          {["pending", "high", "approved", "average"].map((item) => (
            <div
              className="h-36 rounded-xl bg-[var(--color-surface-soft)]"
              key={item}
            />
          ))}
        </div>
        <div className="h-80 rounded-xl bg-[var(--color-surface-soft)]" />
      </div>
    </AppShell>
  );
}
