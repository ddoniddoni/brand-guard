import type { CampaignStatus, UserRole } from "@/features/campaign/types";

export type ReviewAction =
  | "START_PR_REVIEW"
  | "START_STAKEHOLDER_REVIEW"
  | "REQUEST_REVISION"
  | "REQUEST_LEGAL_REVIEW"
  | "REQUEST_FINAL_APPROVAL"
  | "APPROVE"
  | "REJECT"
  | "REANALYZE";

export type ApprovalStepStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "blocked";

export type ApprovalDecision = "approve" | "request_revision" | "reject";

export type ApprovalStep = {
  id: string;
  campaignId: string;
  order: number;
  title: string;
  ownerName: string;
  role: UserRole;
  status: ApprovalStepStatus;
  description: string;
  decision?: ApprovalDecision;
  note?: string;
  updatedAt?: string;
};

export type ReviewerComment = {
  id: string;
  campaignId: string;
  authorName: string;
  role: UserRole;
  body: string;
  createdAt: string;
};

export type AuditLogEntry = {
  id: string;
  actorName: string;
  action: string;
  fromStatus?: CampaignStatus;
  toStatus?: CampaignStatus;
  note?: string;
  createdAt: string;
};

export type WorkflowTransition = {
  action: ReviewAction;
  label: string;
  nextStatus: CampaignStatus;
  description: string;
};
