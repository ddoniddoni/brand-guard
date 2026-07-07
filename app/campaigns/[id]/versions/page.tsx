import { CampaignVersionsRoute } from "@/components/campaign/CampaignVersionsRoute";
import { AppShell } from "@/components/layout/AppShell";
import {
  getCampaignById,
  getVersionComparisonByCampaignId,
} from "@/features/campaign/api";

export default async function CampaignVersionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = getCampaignById(id) ?? null;
  const comparison = getVersionComparisonByCampaignId(id);

  return (
    <AppShell activePath="/campaigns">
      <CampaignVersionsRoute
        campaignId={id}
        initialCampaign={campaign}
        initialComparison={comparison}
      />
    </AppShell>
  );
}
