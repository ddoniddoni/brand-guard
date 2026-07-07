import { Plus } from "lucide-react";
import Link from "next/link";
import type { CampaignChannel, CampaignStatus } from "@/features/campaign/types";
import type { RiskLevel } from "@/features/risk-analysis/types";
import { CampaignListClient } from "@/components/campaign/CampaignListClient";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { campaigns } from "@/mocks/data/campaigns";

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = getParam(params, "q")?.toLowerCase().trim() ?? "";
  const status = getParam(params, "status") as CampaignStatus | undefined;
  const risk = getParam(params, "risk") as RiskLevel | undefined;
  const channel = getParam(params, "channel") as CampaignChannel | undefined;
  const sort = getParam(params, "sort") ?? "updatedAt";

  return (
    <AppShell activePath="/campaigns">
      <PageHeader
        action={
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[var(--color-primary)] px-5 text-sm font-medium text-white hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
            href="/campaigns/new"
          >
            <Plus aria-hidden="true" size={16} strokeWidth={1.8} />
            새 검토 요청
          </Link>
        }
        description="상태, 리스크 레벨, 채널을 기준으로 게시 전 검토 요청을 찾고 정렬합니다."
        eyebrow="검토 요청"
        title="검토 요청 목록"
      />
      <CampaignListClient
        filters={{ channel, query, risk, sort, status }}
        initialCampaigns={campaigns}
      />
    </AppShell>
  );
}
