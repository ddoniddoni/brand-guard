import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getChannelLabel } from "@/lib/format";
import { campaigns } from "@/mocks/data/campaigns";
import { analysisResults } from "@/mocks/data/analysis-results";

export default async function CampaignReviewPlaceholderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = campaigns.find((item) => item.id === id);

  if (!campaign) {
    notFound();
  }

  const analysis =
    analysisResults.find((item) => item.campaignId === campaign.id) ??
    analysisResults[0];

  return (
    <AppShell activePath="/campaigns">
      <PageHeader
        action={
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--color-hairline)] px-5 text-sm font-medium"
            href="/campaigns"
          >
            목록으로
          </Link>
        }
        description="정식 이미지 오버레이 리뷰 화면은 다음 단계에서 구현됩니다. 현재는 mock 분석 계약과 안전한 문구를 확인하는 placeholder입니다."
        eyebrow={`${campaign.brandName} · ${getChannelLabel(campaign.channel)}`}
        title={campaign.name}
      />
      <div className="grid gap-6 px-6 py-6 sm:px-8 xl:grid-cols-[1fr_420px]">
        <section className="rounded-xl bg-[var(--color-review-canvas)] p-6 text-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white/70">
                Review canvas placeholder
              </p>
              <h2 className="mt-2 text-2xl font-normal">이미지 오버레이 예정</h2>
            </div>
            <RiskBadge level={analysis.overallRiskLevel} />
          </div>
          <div className="mt-6 aspect-[16/10] rounded-lg bg-[var(--color-review-canvas-panel)] p-4">
            <div className="relative h-full rounded-md border border-white/10 bg-white/5">
              <div className="absolute left-[52%] top-[24%] h-[34%] w-[24%] rounded-md border-2 border-[var(--color-review-overlay-hand)] bg-[var(--color-review-overlay-hand)]/10" />
              <div className="absolute left-[14%] top-[66%] h-[12%] w-[58%] rounded-md border-2 border-[var(--color-review-overlay-ocr)] bg-[var(--color-review-overlay-ocr)]/10" />
            </div>
          </div>
        </section>

        <aside className="grid gap-4">
          <section className="rounded-xl border border-[var(--color-hairline)] bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">현재 상태</p>
              <StatusBadge status={campaign.status} />
            </div>
            <p className="mt-4 text-4xl font-normal">{analysis.overallRiskScore}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">
              {analysis.summary}
            </p>
          </section>

          {analysis.categories.map((finding) => (
            <section
              className="rounded-xl border border-[var(--color-hairline)] bg-white p-5"
              key={finding.id}
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-medium">{finding.title}</h2>
                <RiskBadge level={finding.level} />
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--color-body)]">
                {finding.description}
              </p>
              <ul className="mt-4 grid gap-2 text-sm leading-6 text-[var(--color-body)]">
                {finding.evidence.map((evidence) => (
                  <li key={evidence}>- {evidence}</li>
                ))}
              </ul>
              {finding.falsePositiveNote ? (
                <p className="mt-4 rounded-lg bg-[var(--color-surface-soft)] p-3 text-sm leading-6 text-[var(--color-body)]">
                  {finding.falsePositiveNote}
                </p>
              ) : null}
            </section>
          ))}
        </aside>
      </div>
    </AppShell>
  );
}
