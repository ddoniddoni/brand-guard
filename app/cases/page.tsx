import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";

const cases = [
  {
    title: "게시일과 문구 맥락 불일치",
    category: "민감 날짜",
    channel: "Push",
    checkpoint: "프로모션 표현과 게시 예정일의 조합을 사전 확인",
  },
  {
    title: "제품 사용 컷의 시각 패턴 후보",
    category: "시각 패턴 후보",
    channel: "Instagram",
    checkpoint: "손동작이 명확한 대체 컷 또는 제품 단독 컷 검토",
  },
  {
    title: "커뮤니티 은어로 오해 가능한 카피",
    category: "커뮤니티 은어",
    channel: "Web banner",
    checkpoint: "더 넓은 고객층이 이해 가능한 표현으로 조정",
  },
];

export default function CasesPage() {
  return (
    <AppShell activePath="/cases">
      <PageHeader
        description="과거 유형을 학습 가능한 체크포인트로 정리하는 mock 케이스 라이브러리입니다."
        eyebrow="Cases"
        title="케이스 라이브러리"
      />
      <div className="grid gap-4 px-6 py-6 sm:px-8 lg:grid-cols-3">
        {cases.map((item) => (
          <article
            className="rounded-xl border border-[var(--color-hairline)] bg-white p-5"
            key={item.title}
          >
            <p className="text-sm text-[var(--color-muted)]">
              {item.category} · {item.channel}
            </p>
            <h2 className="mt-3 text-xl font-normal leading-tight">
              {item.title}
            </h2>
            <p className="mt-4 text-sm leading-6 text-[var(--color-body)]">
              {item.checkpoint}
            </p>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
