import type { CampaignStatus, UserRole } from "@/features/campaign/types";

export type ReviewAction =
  | "START_ANALYSIS"
  | "COMPLETE_ANALYSIS"
  | "SUBMIT_FOR_APPROVAL"
  | "APPROVE_STEP"
  | "MARK_READY_TO_PUBLISH"
  | "REQUEST_REVISION"
  | "REJECT"
  | "REANALYZE";

export type ApprovalStepStatus =
  | "pending"
  | "in_progress"
  | "approved"
  | "revision_requested"
  | "rejected"
  | "skipped";

export type ApprovalDecision = "approve" | "request_revision" | "reject";

export type ApprovalStep = {
  id: string;
  campaignId: string;
  order: number;
  title: string;
  ownerName: string;
  role: UserRole;
  status: ApprovalStepStatus;
  description?: string;
  decision?: ApprovalDecision;
  comment?: string;
  decidedAt?: string;
};

export type ReviewerComment = {
  id: string;
  campaignId: string;
  authorName: string;
  role: UserRole;
  body: string;
  createdAt: string;
};

export type RequesterOpinionConclusion =
  | "submit_for_approval"
  | "needs_edit_before_submit"
  | "false_positive_likely";

export type RequesterOpinion = {
  id: string;
  campaignId: string;
  authorName: string;
  body: string;
  conclusion: RequesterOpinionConclusion;
  createdAt: string;
};

export type AuditLogEntry = {
  id: string;
  campaignId?: string;
  actorName: string;
  action:
    | "campaign_created"
    | "analysis_started"
    | "analysis_completed"
    | "requester_opinion_added"
    | "submitted_for_approval"
    | "approval_step_approved"
    | "revision_requested"
    | "campaign_rejected"
    | "campaign_final_approved"
    | "ready_to_publish"
    | "revision_uploaded"
    | "comment_added";
  fromStatus?: CampaignStatus;
  toStatus?: CampaignStatus;
  message: string;
  createdAt: string;
};

export type WorkflowTransition = {
  action: ReviewAction;
  label: string;
  nextStatus: CampaignStatus;
  description: string;
};
