import type { RiskCategory, RiskLevel } from "@/features/risk-analysis/types";

export type RiskDictionaryEntry = {
  id: string;
  title: string;
  category: RiskCategory;
  severity: RiskLevel;
  description: string;
  reviewGuide: string;
  saferAlternative: string;
  lastUpdated: string;
};

export const riskDictionaryEntries: RiskDictionaryEntry[] = [
  {
    id: "dict-001",
    title: "시각 패턴 후보",
    category: "visual_gesture",
    severity: "medium",
    description: "이미지 속 손동작이나 구도가 민감하게 해석될 수 있는 후보입니다.",
    reviewGuide: "제품 사용 맥락, 손가락 가림 여부, 대체 컷 가능성을 함께 검토합니다.",
    saferAlternative: "제품 단독 컷 또는 손동작이 명확한 이미지 사용",
    lastUpdated: "2026-07-01",
  },
  {
    id: "dict-002",
    title: "민감 날짜 예시",
    category: "sensitive_date",
    severity: "medium",
    description: "게시 예정일이 사회적으로 민감한 날짜와 겹칠 수 있는 후보입니다.",
    reviewGuide: "캠페인 메시지와 게시일의 조합이 의도치 않은 해석을 만들지 확인합니다.",
    saferAlternative: "게시일 조정 또는 맥락을 분명히 하는 보조 문구 추가",
    lastUpdated: "2026-06-28",
  },
  {
    id: "dict-003",
    title: "커뮤니티 은어 예시",
    category: "community_slang",
    severity: "low",
    description: "일부 온라인 커뮤니티에서 다르게 해석될 수 있는 표현 후보입니다.",
    reviewGuide: "브랜드 톤과 타깃 맥락에서 자연스러운 표현인지 확인합니다.",
    saferAlternative: "더 넓은 고객층이 이해하기 쉬운 일반 표현으로 변경",
    lastUpdated: "2026-06-20",
  },
];
