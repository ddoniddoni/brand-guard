import type {
  ReviewStatus,
  ReviewStatusEvent,
  ReviewStatusEventType,
  ReviewWorkspace,
} from "@/features/review/types";

const allowedTransitions: Record<ReviewStatus, ReviewStatus[]> = {
  ANALYZING: ["COMPLETED", "FAILED"],
  COMPLETED: ["REVIEWED"],
  DRAFT: ["ANALYZING"],
  FAILED: ["ANALYZING"],
  REVIEWED: [],
};

export function initializeReviewWorkspace(
  workspace: ReviewWorkspace,
): ReviewWorkspace {
  const timestamp = workspace.reviewJob.createdAt;
  const event: ReviewStatusEvent = {
    createdAt: timestamp,
    id: createEventId(workspace.reviewJob.id, "created", timestamp),
    message: "검수 초안이 생성되었습니다.",
    toStatus: "DRAFT",
    type: "created",
  };

  return {
    ...workspace,
    events: [event],
    reviewJob: {
      ...workspace.reviewJob,
      status: "DRAFT" as const,
    },
  };
}

export function transitionReviewWorkspace(
  workspace: ReviewWorkspace,
  toStatus: ReviewStatus,
  message?: string,
): ReviewWorkspace {
  const fromStatus = workspace.reviewJob.status;

  if (!allowedTransitions[fromStatus].includes(toStatus)) {
    throw new Error(
      `허용되지 않은 검수 상태 전이입니다: ${fromStatus} → ${toStatus}`,
    );
  }

  const timestamp = new Date().toISOString();
  const type = getEventType(fromStatus, toStatus);
  const event: ReviewStatusEvent = {
    createdAt: timestamp,
    fromStatus,
    id: createEventId(workspace.reviewJob.id, type, timestamp),
    message,
    toStatus,
    type,
  };

  return {
    ...workspace,
    events: [...(workspace.events ?? []), event],
    reviewJob: {
      ...workspace.reviewJob,
      status: toStatus,
      updatedAt: timestamp,
    },
  };
}

export function getLatestReviewFailure(workspace: ReviewWorkspace) {
  return [...(workspace.events ?? [])]
    .reverse()
    .find((event) => event.type === "analysis_failed");
}

function getEventType(
  fromStatus: ReviewStatus,
  toStatus: ReviewStatus,
): ReviewStatusEventType {
  if (fromStatus === "DRAFT" && toStatus === "ANALYZING") {
    return "analysis_started";
  }

  if (fromStatus === "FAILED" && toStatus === "ANALYZING") {
    return "retry_started";
  }

  if (fromStatus === "ANALYZING" && toStatus === "FAILED") {
    return "analysis_failed";
  }

  if (fromStatus === "ANALYZING" && toStatus === "COMPLETED") {
    return "analysis_completed";
  }

  return "report_saved";
}

function createEventId(
  reviewJobId: string,
  type: ReviewStatusEventType,
  timestamp: string,
) {
  return `${reviewJobId}-${type}-${timestamp}`;
}
