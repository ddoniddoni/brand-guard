import { ReviewHistoryClient } from "@/components/review/ReviewHistoryClient";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";

export default function HistoryPage() {
  return (
    <AppShell activePath="/history">
      <PageHeader
        description="저장된 검수 리포트와 후보 수, 최종 메모를 다시 확인합니다."
        eyebrow="히스토리"
        title="검수 기록"
      />
      <ReviewHistoryClient />
    </AppShell>
  );
}
