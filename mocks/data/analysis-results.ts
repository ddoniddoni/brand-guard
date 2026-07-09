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
      "이미지 OCR 문구와 입력 카피에서 작성자와 결재자 검토가 필요한 후보가 정리되었습니다. 최종 판단은 소재 맥락을 아는 사람이 검토해야 합니다.",
    reviewRequired: true,
    createdAt: "2026-07-07T09:10:00.000Z",
    categories: [
      {
        id: "risk-002",
        category: "ocr_text",
        title: "이미지 OCR 문구 확인 권장",
        level: "low",
        confidence: 0.68,
        description:
          "프로모션 이미지에서 추출된 문구 일부가 게시 맥락과 함께 다르게 읽히지 않는지 검토가 권장됩니다.",
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
          "손동작, 제품 파지 방식, 크롭 기준처럼 자동 판정하기 어려운 시각 요소는 상품 설명서나 촬영 가이드에 명확히 남기세요.",
      },
      {
        id: "sug-002",
        target: "review_process",
        title: "PR 결재자 추가 검토 권장",
        description:
          "SNS 채널 게시 전 PR 결재자의 추가 검토를 권장합니다.",
      },
    ],
  },
];
