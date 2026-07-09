import { ReviewCreateForm } from "@/components/review/ReviewCreateForm";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";

export default function NewReviewPage() {
  return (
    <AppShell activePath="/reviews/new">
      <PageHeader
        description="영상 대본, 광고 문구, SNS 캡션과 이미지 속 텍스트를 브랜드 정책 사전 기준으로 검사합니다."
        eyebrow="콘텐츠 검수"
        title="새 콘텐츠 검수"
      />
      <ReviewCreateForm />
    </AppShell>
  );
}
