import { http, HttpResponse } from "msw";
import {
  getAnalysisByCampaignId,
  getCampaignById,
  getCampaigns,
  getVersionComparisonByCampaignId,
} from "@/features/campaign/api";

export const handlers = [
  http.get("/api/campaigns", () =>
    HttpResponse.json({ campaigns: getCampaigns() }),
  ),
  http.get("/api/campaigns/:id/analysis", ({ params }) => {
    const id = String(params.id);

    if (!getCampaignById(id)) {
      return HttpResponse.json({ message: "Campaign not found" }, { status: 404 });
    }

    return HttpResponse.json({ analysis: getAnalysisByCampaignId(id) });
  }),
  http.get("/api/campaigns/:id/versions", ({ params }) => {
    const id = String(params.id);

    if (!getCampaignById(id)) {
      return HttpResponse.json({ message: "Campaign not found" }, { status: 404 });
    }

    return HttpResponse.json({
      comparison: getVersionComparisonByCampaignId(id),
    });
  }),
];
