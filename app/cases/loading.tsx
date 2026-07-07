import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";

export default function CasesLoading() {
  return (
    <AppShell activePath="/cases">
      <PageHeader
        description="검토 사례와 재사용 체크포인트를 불러오는 중입니다."
        eyebrow="Cases"
        title="케이스 라이브러리"
      />
      <div className="mx-auto grid w-full max-w-[1500px] gap-6 px-5 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              className="h-36 animate-pulse rounded-xl bg-[var(--color-surface-soft)]"
              key={index}
            />
          ))}
        </section>
        <div className="h-20 animate-pulse rounded-xl bg-[var(--color-surface-soft)]" />
        <div className="h-96 animate-pulse rounded-xl bg-[var(--color-surface-soft)]" />
      </div>
    </AppShell>
  );
}
