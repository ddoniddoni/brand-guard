import type {
  AuditLogEntry,
  ReviewerComment,
} from "@/features/review-workflow/types";

export const reviewerComments: ReviewerComment[] = [
  {
    id: "comment-001",
    authorName: "박준호",
    role: "PR_REVIEWER",
    body: "제품을 집는 장면일 가능성이 있어 보입니다. 다만 SNS 게시 전 대체 컷도 함께 비교하면 좋겠습니다.",
    createdAt: "2026-07-07T09:35:00.000Z",
  },
  {
    id: "comment-002",
    authorName: "김민서",
    role: "MARKETER",
    body: "손이 보이지 않는 제품 단독 컷을 준비해 두었습니다. 필요하면 v2로 업로드하겠습니다.",
    createdAt: "2026-07-07T09:50:00.000Z",
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
    action: "PR 검토 요청",
    fromStatus: "AI_REVIEWED",
    toStatus: "PR_REVIEW",
    note: "SNS 게시 전 2차 검토를 요청했습니다.",
    createdAt: "2026-07-07T09:20:00.000Z",
  },
];
