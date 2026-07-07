import { AppShell } from "@/components/layout/AppShell";

export default function CampaignNewLoading() {
  return (
    <AppShell activePath="/campaigns/new">
      <div className="grid gap-6 p-6 sm:p-8">
        <div className="h-28 rounded-xl bg-[var(--color-surface-soft)]" />
        <div className="h-80 rounded-xl bg-[var(--color-surface-soft)]" />
        <div className="h-64 rounded-xl bg-[var(--color-surface-soft)]" />
      </div>
    </AppShell>
  );
}
