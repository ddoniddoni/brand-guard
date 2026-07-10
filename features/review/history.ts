import type {
  ReviewStatus,
  ReviewWorkspace,
} from "@/features/review/types";

export type ReviewHistoryStatusFilter =
  | "all"
  | "in_progress"
  | Extract<ReviewStatus, "COMPLETED" | "FAILED" | "REVIEWED">;

export type ReviewHistorySummary = {
  analyzed: number;
  failed: number;
  reviewed: number;
  total: number;
};

export function getReviewHistorySummary(
  workspaces: ReviewWorkspace[],
): ReviewHistorySummary {
  return workspaces.reduce<ReviewHistorySummary>(
    (summary, workspace) => {
      const status = workspace.reviewJob.status;

      summary.total += 1;
      if (status === "COMPLETED" || status === "REVIEWED") {
        summary.analyzed += 1;
      }
      if (status === "FAILED") {
        summary.failed += 1;
      }
      if (status === "REVIEWED") {
        summary.reviewed += 1;
      }

      return summary;
    },
    { analyzed: 0, failed: 0, reviewed: 0, total: 0 },
  );
}

export function filterReviewHistory({
  query,
  statusFilter,
  workspaces,
}: {
  query: string;
  statusFilter: ReviewHistoryStatusFilter;
  workspaces: ReviewWorkspace[];
}) {
  const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");

  return workspaces.filter((workspace) => {
    const statusMatched = matchesStatusFilter(
      workspace.reviewJob.status,
      statusFilter,
    );

    if (!statusMatched) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchableText = [
      workspace.reviewJob.title,
      workspace.reviewJob.brandName,
      workspace.reviewJob.reviewerName,
      workspace.reviewJob.originalText,
      workspace.report?.reviewerMemo,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("ko-KR");

    return searchableText.includes(normalizedQuery);
  });
}

function matchesStatusFilter(
  status: ReviewStatus,
  filter: ReviewHistoryStatusFilter,
) {
  if (filter === "all") {
    return true;
  }

  if (filter === "in_progress") {
    return status === "DRAFT" || status === "ANALYZING";
  }

  return status === filter;
}
