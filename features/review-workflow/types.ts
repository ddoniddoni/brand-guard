import type { CampaignStatus } from "@/features/campaign/types";

export type ReviewAction =
  | "START_PR_REVIEW"
  | "REQUEST_REVISION"
  | "REQUEST_LEGAL_REVIEW"
  | "APPROVE"
  | "REJECT"
  | "REANALYZE";

export type ReviewerComment = {
  id: string;
  authorName: string;
  role: string;
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
