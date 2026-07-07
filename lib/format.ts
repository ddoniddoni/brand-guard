import type { CampaignChannel, CampaignStatus } from "@/features/campaign/types";
import type { RiskCategory, RiskLevel } from "@/features/risk-analysis/types";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function getChannelLabel(channel: CampaignChannel) {
  const labels: Record<CampaignChannel, string> = {
    instagram: "인스타그램",
    youtube: "유튜브",
    tiktok: "틱톡",
    web_banner: "웹 배너",
    push: "푸시",
    offline: "오프라인",
  };

  return labels[channel];
}

export function getStatusLabel(status: CampaignStatus) {
  const labels: Record<CampaignStatus, string> = {
    DRAFT: "초안",
    ANALYZING: "분석 중",
    AI_REVIEWED: "AI 검토 완료",
    IN_APPROVAL: "결재 진행",
    NEEDS_REVISION: "수정 요청",
    APPROVED: "최종 승인",
    READY_TO_PUBLISH: "게시 가능",
    REJECTED: "반려",
  };

  return labels[status];
}

export function getRiskLevelLabel(level: RiskLevel) {
  const labels: Record<RiskLevel, string> = {
    low: "낮은 위험",
    medium: "중간 위험",
    high: "고위험",
    critical: "긴급 검토",
  };

  return labels[level];
}

export function getRiskCategoryLabel(category: RiskCategory) {
  const labels: Record<RiskCategory, string> = {
    visual_gesture: "시각 패턴 후보",
    ocr_text: "OCR 문구",
    sensitive_date: "민감 날짜",
    political_historical: "역사/정치 맥락",
    gender_conflict: "젠더 갈등",
    regional_discrimination: "지역 비하 후보",
    generation_conflict: "세대 갈등",
    disability_disease: "장애/질병 표현",
    race_nationality: "인종/국적",
    religion: "종교",
    labor_power_abuse: "노동/권력 남용",
    sexual_expression: "성적 표현",
    violence_disaster: "폭력/재난",
    community_slang: "커뮤니티 은어",
    brand_mismatch: "브랜드 부적합",
  };

  return labels[category];
}

export function getUserRoleLabel(role: string) {
  const labels: Record<string, string> = {
    ADMIN: "관리자",
    BRAND_MANAGER: "브랜드 매니저",
    FINAL_APPROVER: "최종 결정자",
    LEGAL_REVIEWER: "법무 검토자",
    MARKETING_REVIEWER: "마케팅 검토자",
    PR_REVIEWER: "PR 검토자",
    REQUESTER: "작성자",
  };

  return labels[role] ?? role;
}
