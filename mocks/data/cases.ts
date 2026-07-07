import type { CampaignChannel } from "@/features/campaign/types";
import type { RiskCategory, RiskLevel } from "@/features/risk-analysis/types";

export type CaseReviewOutcome =
  | "approved_after_revision"
  | "approved_with_note"
  | "monitoring"
  | "revision_requested";

export type CaseLibraryItem = {
  id: string;
  title: string;
  summary: string;
  category: RiskCategory;
  riskLevel: RiskLevel;
  channel: CampaignChannel;
  relatedCampaign: string;
  reviewDate: string;
  ownerName: string;
  outcome: CaseReviewOutcome;
  reviewSignal: string;
  checkpoints: string[];
  preventiveAction: string;
};

export const caseLibraryItems: CaseLibraryItem[] = [
  {
    id: "case-001",
    title: "제품 사용 컷의 시각 패턴 후보",
    summary:
      "손동작이 일부 민감한 시각 패턴과 유사하게 해석될 수 있어 대체 컷을 함께 검토한 사례입니다.",
    category: "visual_gesture",
    riskLevel: "medium",
    channel: "instagram",
    relatedCampaign: "여름 신제품 메인 비주얼",
    reviewDate: "2026-07-07",
    ownerName: "김민서",
    outcome: "approved_after_revision",
    reviewSignal: "제품을 집는 동작일 가능성과 손가락 가림 여부를 같이 확인했습니다.",
    checkpoints: [
      "손동작이 제품 맥락 없이 단독으로 보이지 않는지 확인",
      "동일 콘셉트의 대체 컷을 함께 비교",
    ],
    preventiveAction: "촬영 가이드에 손동작이 명확한 제품 사용 컷 예시를 추가",
  },
  {
    id: "case-002",
    title: "게시일과 프로모션 문구 맥락 불일치",
    summary:
      "프로모션 문구와 게시 예정일의 조합이 의도치 않은 해석을 만들 수 있어 일정과 문구를 함께 조정한 사례입니다.",
    category: "sensitive_date",
    riskLevel: "high",
    channel: "push",
    relatedCampaign: "휴일 프로모션 푸시 문구",
    reviewDate: "2026-07-06",
    ownerName: "박준호",
    outcome: "revision_requested",
    reviewSignal: "게시일 변경 또는 보조 문구 추가가 필요한 검토 후보로 기록했습니다.",
    checkpoints: [
      "게시일과 문구의 조합을 함께 검토",
      "할인/긴급 표현이 과도하게 읽히지 않는지 확인",
    ],
    preventiveAction: "캠페인 생성 단계에 민감 날짜 확인 체크포인트 추가",
  },
  {
    id: "case-003",
    title: "짧은 배너 카피의 은어 후보",
    summary:
      "짧은 표현이 일부 온라인 맥락에서 다르게 읽힐 수 있어 더 넓은 고객층이 이해하기 쉬운 문구로 바꾼 사례입니다.",
    category: "community_slang",
    riskLevel: "medium",
    channel: "web_banner",
    relatedCampaign: "웹 배너 출시 문구",
    reviewDate: "2026-07-05",
    ownerName: "최하린",
    outcome: "approved_after_revision",
    reviewSignal: "특정 의미를 단정하지 않고 표현 후보로만 검토했습니다.",
    checkpoints: [
      "약어와 신조어가 브랜드 톤에 맞는지 확인",
      "대체 가능한 일반 표현이 있는지 검토",
    ],
    preventiveAction: "배너 카피 리뷰에 일반 표현 대안 필드 추가",
  },
  {
    id: "case-004",
    title: "모델 컷과 할인 문구의 브랜드 톤 불일치",
    summary:
      "이미지 분위기와 강한 할인 문구가 브랜드 톤과 다르게 보일 가능성이 있어 문구 강도를 낮춘 사례입니다.",
    category: "brand_mismatch",
    riskLevel: "low",
    channel: "offline",
    relatedCampaign: "오프라인 포스터 수정안",
    reviewDate: "2026-07-03",
    ownerName: "이서연",
    outcome: "approved_with_note",
    reviewSignal: "브랜드 톤과 채널 맥락의 불일치 가능성을 검토했습니다.",
    checkpoints: [
      "브랜드 톤 가이드와 문구 강도 비교",
      "오프라인 현장 노출 맥락 확인",
    ],
    preventiveAction: "오프라인 소재 승인 전 브랜드 톤 체크를 필수 항목으로 지정",
  },
  {
    id: "case-005",
    title: "OCR 자막과 이미지 문구 중복 해석",
    summary:
      "썸네일 텍스트와 자막이 함께 보일 때 의미가 과장되어 읽힐 수 있어 문구 중복을 줄인 사례입니다.",
    category: "ocr_text",
    riskLevel: "low",
    channel: "youtube",
    relatedCampaign: "크리에이터 숏폼 썸네일",
    reviewDate: "2026-07-02",
    ownerName: "정도윤",
    outcome: "monitoring",
    reviewSignal: "OCR 문구와 이미지 문구의 결합 맥락을 확인했습니다.",
    checkpoints: [
      "썸네일 문구와 영상 자막을 함께 검토",
      "반복 표현이 과장된 인상을 만들지 않는지 확인",
    ],
    preventiveAction: "영상 썸네일 업로드 시 대표 자막도 함께 입력",
  },
  {
    id: "case-006",
    title: "사내 캠페인 문구의 위계 표현 검토",
    summary:
      "직접 지시형 문구가 일부 수신자에게 강압적으로 보일 수 있어 참여형 표현으로 완화한 사례입니다.",
    category: "labor_power_abuse",
    riskLevel: "medium",
    channel: "push",
    relatedCampaign: "사내 행사 리마인드",
    reviewDate: "2026-06-28",
    ownerName: "한지우",
    outcome: "approved_after_revision",
    reviewSignal: "조직 내 역할이나 권한을 단정하지 않고 표현 방식만 검토했습니다.",
    checkpoints: [
      "명령형 표현이 과도하지 않은지 확인",
      "수신자가 선택 가능성을 인지할 수 있는 문구인지 검토",
    ],
    preventiveAction: "사내 공지성 캠페인은 참여형 문장 템플릿 우선 사용",
  },
];
