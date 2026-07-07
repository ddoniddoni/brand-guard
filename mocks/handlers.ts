import { http, HttpResponse } from "msw";
import {
  getAnalysisByCampaignId,
  getApprovalStepsByCampaignId,
  getCampaignById,
  getCampaigns,
  getReviewCommentsByCampaignId,
  getVersionComparisonByCampaignId,
} from "@/features/campaign/api";

export const handlers = [
  http.get("/api/campaigns", () =>
    HttpResponse.json({ campaigns: getCampaigns() }),
  ),
  http.get("/api/campaigns/:id/analysis", ({ params }) => {
    const id = String(params.id);

    if (!getCampaignById(id)) {
      return HttpResponse.json({ message: "캠페인을 찾을 수 없습니다." }, { status: 404 });
    }

    return HttpResponse.json({ analysis: getAnalysisByCampaignId(id) });
  }),
  http.get("/api/campaigns/:id/versions", ({ params }) => {
    const id = String(params.id);

    if (!getCampaignById(id)) {
      return HttpResponse.json({ message: "캠페인을 찾을 수 없습니다." }, { status: 404 });
    }

    return HttpResponse.json({
      comparison: getVersionComparisonByCampaignId(id),
    });
  }),
  http.get("/api/campaigns/:id/approval", ({ params }) => {
    const id = String(params.id);

    if (!getCampaignById(id)) {
      return HttpResponse.json({ message: "캠페인을 찾을 수 없습니다." }, { status: 404 });
    }

    return HttpResponse.json({
      approvalSteps: getApprovalStepsByCampaignId(id),
      comments: getReviewCommentsByCampaignId(id),
    });
  }),
];
