import type {
  FindingSource,
  MatchType,
  PolicyCategory,
  PolicyTermType,
  Severity,
} from "@/features/policy/types";
import type { Channel, ContentType } from "@/features/review/types";

export function getSeverityLabel(severity: Severity) {
  const labels: Record<Severity, string> = {
    critical: "긴급 검토",
    high: "높음",
    low: "낮음",
    medium: "보통",
  };

  return labels[severity];
}

export function getPolicyCategoryLabel(category: PolicyCategory) {
  const labels: Record<PolicyCategory, string> = {
    brand_tone_mismatch: "브랜드 톤 불일치",
    community_slang: "커뮤니티/은어 표현",
    comparative_rank: "비교/순위 표현",
    custom_forbidden_term: "직접 등록 금지어",
    event_condition_missing: "이벤트 조건 누락 가능성",
    exaggerated_claim: "과장 광고 표현",
    guarantee_claim: "확정/보장 표현",
    legal_review_required: "법적 검토 필요 표현",
    sensitive_industry: "민감 업종 표현",
  };

  return labels[category];
}

export function getPolicyTermTypeLabel(type: PolicyTermType) {
  return type === "forbidden" ? "금지어" : "주의어";
}

export function getMatchTypeLabel(matchType: MatchType) {
  const labels: Record<MatchType, string> = {
    contains: "포함",
    exact: "정확히 일치",
    normalized: "정규화 일치",
    regex: "정규식",
  };

  return labels[matchType];
}

export function getFindingSourceLabel(source: FindingSource) {
  const labels: Record<FindingSource, string> = {
    image_ocr: "이미지 OCR",
    pasted_text: "붙여넣은 텍스트",
    vision_ai: "AI 이미지 분석",
  };

  return labels[source];
}

export function getContentTypeLabel(contentType: ContentType) {
  const labels: Record<ContentType, string> = {
    ad_copy: "광고 문구",
    image_only: "이미지만 검수",
    mixed: "복합 콘텐츠",
    sns_caption: "SNS 캡션",
    video_script: "영상 대본",
    web_banner: "웹 배너",
  };

  return labels[contentType];
}

export function getReviewChannelLabel(channel: Channel) {
  const labels: Record<Channel, string> = {
    homepage: "홈페이지",
    instagram: "인스타그램",
    newsletter: "뉴스레터",
    offline: "오프라인",
    push: "푸시",
    tiktok: "틱톡",
    web_banner: "웹 배너",
    youtube: "유튜브",
  };

  return labels[channel];
}
