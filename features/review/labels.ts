import type {
  ReviewStatus,
  ReviewStatusEventType,
} from "@/features/review/types";

const reviewStatusLabels: Record<ReviewStatus, string> = {
  ANALYZING: "분석 중",
  COMPLETED: "분석 완료",
  DRAFT: "초안",
  FAILED: "재시도 필요",
  REVIEWED: "리포트 저장됨",
};

const reviewEventLabels: Record<ReviewStatusEventType, string> = {
  analysis_completed: "검수 분석 완료",
  analysis_failed: "검수 분석 실패",
  analysis_started: "검수 분석 시작",
  created: "검수 초안 생성",
  report_saved: "검수 리포트 저장",
  retry_started: "이미지 OCR 재시도",
};

export function getReviewStatusLabel(status: ReviewStatus) {
  return reviewStatusLabels[status];
}

export function getReviewEventLabel(type: ReviewStatusEventType) {
  return reviewEventLabels[type];
}
