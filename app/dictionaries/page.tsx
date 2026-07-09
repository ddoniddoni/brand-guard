import { BookOpen } from "lucide-react";
import { PolicyTermTable } from "@/components/dictionary/PolicyTermTable";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { mockPolicyTerms } from "@/features/policy/mock-terms";

export default function DictionariesPage() {
  const enabledTerms = mockPolicyTerms.filter((term) => term.enabled);
  const forbiddenTerms = enabledTerms.filter((term) => term.type === "forbidden");
  const cautionTerms = enabledTerms.filter((term) => term.type === "caution");

  return (
    <AppShell activePath="/dictionaries">
      <PageHeader
        description="브랜드가 공개 전 확인해야 하는 금지어, 주의어, 대체 표현을 관리합니다."
        eyebrow="브랜드 정책 사전"
        title="정책 사전 관리"
      />
      <div className="mx-auto grid w-full max-w-[1500px] gap-6 px-5 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard
            description="현재 검수에 적용되는 활성 정책"
            icon={BookOpen}
            title="활성 정책"
            value={`${enabledTerms.length}`}
          />
          <MetricCard
            description="사용을 제한하는 표현"
            icon={BookOpen}
            title="금지어"
            value={`${forbiddenTerms.length}`}
          />
          <MetricCard
            description="맥락 검토가 필요한 표현"
            icon={BookOpen}
            title="주의어"
            value={`${cautionTerms.length}`}
          />
        </section>
        <PolicyTermTable />
      </div>
    </AppShell>
  );
}
