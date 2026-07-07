import { AppShell } from "@/components/layout/AppShell";

export default function CampaignsLoading() {
  return (
    <AppShell activePath="/campaigns">
      <div className="grid gap-6 p-6 sm:p-8">
        <div className="h-28 rounded-xl bg-[var(--color-surface-soft)]" />
        <div className="h-20 rounded-xl bg-[var(--color-surface-soft)]" />
        <div className="h-96 rounded-xl bg-[var(--color-surface-soft)]" />
      </div>
    </AppShell>
  );
}
