import { ReviewResultClient } from "@/components/review/ReviewResultClient";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function ReviewResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell activePath="/reviews">
      <PageHeader
        description="정책 매칭 후보, OCR 문구, 검출 위치, 수정 제안을 확인하고 검수 리포트를 저장합니다."
        eyebrow="검수 결과"
        title="콘텐츠 검수 리포트"
      />
      <ReviewResultClient reviewId={id} />
    </AppShell>
  );
}
