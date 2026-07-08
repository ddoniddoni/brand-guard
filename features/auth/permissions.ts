import type { CurrentUser } from "@/features/auth/mock-users";
import type { Campaign } from "@/features/campaign/types";
import type { ApprovalStep } from "@/features/review-workflow/types";

export function isRequesterForCampaign(user: CurrentUser, campaign: Campaign) {
  return campaign.requesterName === user.name;
}

export function getCurrentApprovalStep(
  steps: ApprovalStep[],
  campaign: Campaign,
) {
  const activeStep = campaign.currentApprovalStepId
    ? steps.find((step) => step.id === campaign.currentApprovalStepId)
    : undefined;

  if (activeStep?.status === "in_progress") {
    return activeStep;
  }

  return (
    steps.find((step) => step.status === "in_progress") ??
    activeStep ??
    steps.find((step) => step.status === "pending")
  );
}

export function isCurrentApprovalOwner(
  user: CurrentUser,
  step?: ApprovalStep,
) {
  if (!step || step.role === "ADMIN" || step.role === "REQUESTER") {
    return false;
  }

  return step.ownerName === user.name || step.role === user.role;
}

export function canMakeApprovalDecision({
  campaign,
  currentStep,
  user,
}: {
  campaign: Campaign;
  currentStep?: ApprovalStep;
  user: CurrentUser;
}) {
  return (
    campaign.status === "IN_APPROVAL" && isCurrentApprovalOwner(user, currentStep)
  );
}
