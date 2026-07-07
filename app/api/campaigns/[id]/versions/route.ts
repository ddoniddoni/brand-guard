import { NextResponse } from "next/server";
import {
  getCampaignById,
  getVersionComparisonByCampaignId,
} from "@/features/campaign/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const campaign = getCampaignById(id);

  if (!campaign) {
    return NextResponse.json({ message: "캠페인을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({
    comparison: getVersionComparisonByCampaignId(id),
  });
}
