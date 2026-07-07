import type {
  ApprovalStep,
  AuditLogEntry,
  ReviewerComment,
} from "@/features/review-workflow/types";

export const reviewerComments: ReviewerComment[] = [
  {
    id: "comment-001",
    campaignId: "cmp-001",
    authorName: "박준호",
    role: "PR_REVIEWER",
    body: "제품을 집는 장면일 가능성이 있어 보입니다. 다만 SNS 게시 전 대체 컷도 함께 비교하면 좋겠습니다.",
    createdAt: "2026-07-07T09:35:00.000Z",
  },
  {
    id: "comment-002",
    campaignId: "cmp-001",
    authorName: "김민서",
    role: "MARKETER",
    body: "손이 보이지 않는 제품 단독 컷을 준비해 두었습니다. 필요하면 v2로 업로드하겠습니다.",
    createdAt: "2026-07-07T09:50:00.000Z",
  },
  {
    id: "comment-003",
    campaignId: "cmp-001",
    authorName: "최하린",
    role: "BRAND_MANAGER",
    body: "AI 의견은 검토 후보로 보고, 제품 집는 동작이라는 설명 문구를 내부 승인 메모에 남기면 좋겠습니다.",
    createdAt: "2026-07-07T10:05:00.000Z",
  },
];

export const approvalSteps: ApprovalStep[] = [
  {
    id: "approval-step-001",
    campaignId: "cmp-001",
    order: 1,
    title: "소재 등록",
    ownerName: "김민서",
    role: "MARKETER",
    status: "completed",
    description: "이미지와 광고 카피를 등록했습니다.",
    decision: "approve",
    note: "SNS용 메인 비주얼 v1",
    updatedAt: "2026-07-07T09:00:00.000Z",
  },
  {
    id: "approval-step-002",
    campaignId: "cmp-001",
    order: 2,
    title: "AI 1차 검토",
    ownerName: "BrandGuard mock AI",
    role: "ADMIN",
    status: "completed",
    description: "시각 패턴 후보와 OCR 문구 후보를 구조화했습니다.",
    decision: "approve",
    note: "검토 후보 2건, 수정 제안 2건",
    updatedAt: "2026-07-07T09:10:00.000Z",
  },
  {
    id: "approval-step-003",
    campaignId: "cmp-001",
    order: 3,
    title: "담당자 의견 취합",
    ownerName: "박준호",
    role: "PR_REVIEWER",
    status: "in_progress",
    description: "AI 의견과 실제 소재 맥락을 담당자가 다시 확인합니다.",
    note: "대체 컷 비교 의견 수집 중",
    updatedAt: "2026-07-07T10:05:00.000Z",
  },
  {
    id: "approval-step-004",
    campaignId: "cmp-001",
    order: 4,
    title: "최종 결재",
    ownerName: "윤지수",
    role: "FINAL_APPROVER",
    status: "pending",
    description: "담당자 의견 취합 후 최종 승인, 수정 요청, 반려를 결정합니다.",
  },
];

export const auditLogEntries: AuditLogEntry[] = [
  {
    id: "audit-001",
    actorName: "BrandGuard mock AI",
    action: "AI 1차 검토 완료",
    fromStatus: "ANALYZING",
    toStatus: "AI_REVIEWED",
    note: "리스크 후보 2건과 수정 제안 2건을 생성했습니다.",
    createdAt: "2026-07-07T09:10:00.000Z",
  },
  {
    id: "audit-002",
    actorName: "김민서",
    action: "담당자 검토 요청",
    fromStatus: "AI_REVIEWED",
    toStatus: "STAKEHOLDER_REVIEW",
    note: "SNS 게시 전 2차 검토를 요청했습니다.",
    createdAt: "2026-07-07T09:20:00.000Z",
  },
];
