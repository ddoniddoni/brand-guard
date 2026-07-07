import { AppShell } from "@/components/layout/AppShell";

export default function CampaignsLoading() {
  return (
    <AppShell activePath="/campaigns">
      <div className="mx-auto grid w-full max-w-[1500px] gap-6 px-5 py-6 sm:px-6 lg:px-8">
        <div className="h-28 rounded-xl bg-[var(--color-surface-soft)]" />
        <div className="h-20 rounded-xl bg-[var(--color-surface-soft)]" />
        <div className="h-96 rounded-xl bg-[var(--color-surface-soft)]" />
      </div>
    </AppShell>
  );
}
