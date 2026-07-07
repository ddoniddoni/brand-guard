import type { AnalysisResult } from "@/features/risk-analysis/types";

export const analysisResults: AnalysisResult[] = [
  {
    id: "analysis-001",
    campaignId: "cmp-001",
    versionId: "v1",
    source: "mock",
    overallRiskScore: 74,
    overallRiskLevel: "medium",
    summary:
      "이미지와 문구에서 담당자 검토가 필요한 리스크 후보가 확인되었습니다. 최종 판단은 캠페인 맥락을 아는 담당자가 검토해야 합니다.",
    reviewRequired: true,
    createdAt: "2026-07-07T09:10:00.000Z",
    categories: [
      {
        id: "risk-001",
        category: "visual_gesture",
        title: "손동작 후보 검토 필요",
        level: "medium",
        confidence: 0.74,
        description:
          "이미지 내 손동작이 일부 민감한 시각 패턴과 유사하게 해석될 가능성이 있습니다.",
        evidence: [
          "엄지와 검지 사이 거리가 가까운 형태가 감지되었습니다.",
          "일부 손가락이 가려져 있어 맥락 확인이 필요합니다.",
          "제품을 집는 동작일 가능성도 있습니다.",
        ],
        falsePositiveNote:
          "이 결과는 의도나 성향을 판정하지 않으며, 시각적 유사성에 기반한 검토 후보입니다.",
        regions: [
          {
            id: "region-001",
            type: "hand",
            x: 0.52,
            y: 0.24,
            width: 0.24,
            height: 0.34,
            confidence: 0.91,
            label: "시각 패턴 후보",
            landmarks: [
              { x: 0.56, y: 0.31, label: "손목" },
              { x: 0.63, y: 0.28, label: "엄지 끝" },
              { x: 0.65, y: 0.3, label: "검지 끝" },
            ],
          },
        ],
      },
      {
        id: "risk-002",
        category: "ocr_text",
        title: "문구 맥락 확인 권장",
        level: "low",
        confidence: 0.68,
        description:
          "프로모션 문구 일부가 특정 날짜와 함께 해석될 때 오해 가능성이 있어 검토가 권장됩니다.",
        evidence: [
          "이미지 하단에서 강조 문구가 OCR 후보로 추출되었습니다.",
          "게시 예정일과 함께 볼 때 메시지 톤 확인이 필요합니다.",
        ],
        falsePositiveNote:
          "OCR 결과는 이미지 품질과 폰트에 따라 오탐 가능성이 있으며, 실제 문구 확인이 필요합니다.",
        regions: [
          {
            id: "region-002",
            type: "ocr_text",
            x: 0.14,
            y: 0.66,
            width: 0.58,
            height: 0.12,
            confidence: 0.82,
            label: "문구 후보 영역",
          },
        ],
      },
    ],
    suggestions: [
      {
        id: "sug-001",
        target: "image",
        title: "제품 단독 컷 사용 검토",
        description:
          "손동작 해석 가능성을 줄이기 위해 손이 보이지 않는 제품 단독 이미지를 사용하는 방안을 검토하세요.",
      },
      {
        id: "sug-002",
        target: "review_process",
        title: "PR팀 2차 검토 요청",
        description:
          "SNS 채널 게시 전 PR 담당자의 추가 검토를 권장합니다.",
      },
    ],
  },
];
