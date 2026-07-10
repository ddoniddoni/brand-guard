import { PolicyTermTable } from "@/components/dictionary/PolicyTermTable";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";

export default function DictionariesPage() {
  return (
    <AppShell activePath="/dictionaries">
      <PageHeader
        description="브랜드가 공개 전 확인해야 하는 금지어, 주의어, 대체 표현을 관리합니다."
        eyebrow="브랜드 정책 사전"
        title="정책 사전 관리"
      />
      <div className="mx-auto grid w-full max-w-[1500px] gap-6 px-5 py-6 sm:px-6 lg:px-8">
        <PolicyTermTable />
      </div>
    </AppShell>
  );
}
