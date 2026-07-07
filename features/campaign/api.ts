import { campaigns } from "@/mocks/data/campaigns";
import { analysisResults } from "@/mocks/data/analysis-results";
import { versionComparisons } from "@/mocks/data/versions";

export function getCampaigns() {
  return campaigns;
}

export function getCampaignById(id: string) {
  return campaigns.find((campaign) => campaign.id === id);
}

export function getAnalysisByCampaignId(campaignId: string) {
  return (
    analysisResults.find((analysis) => analysis.campaignId === campaignId) ??
    null
  );
}

export function getVersionComparisonByCampaignId(campaignId: string) {
  return (
    versionComparisons.find(
      (comparison) => comparison.campaignId === campaignId,
    ) ?? null
  );
}
