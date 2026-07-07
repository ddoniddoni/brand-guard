import type { VersionComparison } from "@/features/campaign/version-types";
import { analysisResults } from "@/mocks/data/analysis-results";

const baseFindings = analysisResults[0]?.categories ?? [];
const handFinding = baseFindings.find((finding) => finding.id === "risk-001");
const ocrFinding = baseFindings.find((finding) => finding.id === "risk-002");

if (!handFinding || !ocrFinding) {
  throw new Error("Version mock data requires base risk findings.");
}

const refinedOcrFinding = {
  ...ocrFinding,
  id: "risk-003",
  confidence: 0.42,
  description:
    "수정된 문구는 의미가 더 명확하지만, 게시 일정과 함께 최종 톤 확인이 권장됩니다.",
  evidence: [
    "강한 표현을 줄이고 제품 사용 맥락을 보강했습니다.",
    "게시 예정일과 프로모션 톤을 함께 확인하면 충분합니다.",
  ],
  falsePositiveNote:
    "이 결과는 문구의 의도나 성향을 판정하지 않으며, 표현 맥락 확인을 돕는 검토 후보입니다.",
  level: "low" as const,
  title: "수정 문구 최종 확인 권장",
};

export const versionComparisons: VersionComparison[] = [
  {
    campaignId: "cmp-001",
    before: {
      id: "v1",
      campaignId: "cmp-001",
      label: "v1 original",
      riskScore: 74,
      status: "NEEDS_REVISION",
      createdAt: "2026-07-07T09:10:00.000Z",
      copy: "이번 여름, 모두가 주목할 한정 혜택을 놓치지 마세요.",
      imageNote:
        "제품을 손에 쥔 인물 컷. 손동작 후보와 OCR 문구 영역이 함께 표시됩니다.",
      findings: [handFinding, ocrFinding],
    },
    after: {
      id: "v2",
      campaignId: "cmp-001",
      label: "v2 revised",
      riskScore: 38,
      status: "AI_REVIEWED",
      createdAt: "2026-07-07T11:40:00.000Z",
      copy: "이번 여름, 제품의 산뜻한 사용감을 먼저 경험해 보세요.",
      imageNote:
        "손이 보이지 않는 제품 단독 컷. OCR 문구 영역만 낮은 위험 후보로 남았습니다.",
      findings: [refinedOcrFinding],
    },
    scoreDelta: -36,
    copyDiff: [
      { type: "unchanged", text: "이번 여름, " },
      { type: "removed", text: "모두가 주목할 한정 혜택을 놓치지 마세요." },
      { type: "added", text: "제품의 산뜻한 사용감을 먼저 경험해 보세요." },
    ],
    removedFindings: [handFinding],
    addedFindings: [refinedOcrFinding],
  },
];
