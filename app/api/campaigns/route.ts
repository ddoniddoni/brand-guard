import { NextResponse } from "next/server";
import { getCampaigns } from "@/features/campaign/api";

export function GET() {
  return NextResponse.json({ campaigns: getCampaigns() });
}
