"use client";

import { runPolicyFilter } from "@/features/policy/filter-engine";
import { getStoredPolicyTerms } from "@/features/policy/local-policy-store";
import type {
  FindingSource,
  PolicyFinding,
  TextSegment,
} from "@/features/policy/types";
import { splitTextIntoSegments } from "@/features/policy/split-text";
import type { ReviewCreateInput } from "@/features/review/schema";
import type {
  OcrResult,
  OcrTextRegion,
  ReviewReport,
  ReviewWorkspace,
} from "@/features/review/types";
import type {
  OcrExtractionResult,
  OcrImageRegion,
} from "@/features/ocr/types";

const storageKey = "brandguard.review-workspaces.v1";

type StoredReviewPayload = {
  reviews: ReviewWorkspace[];
  version: number;
};

export type ReviewImageInput = {
  dataUrl: string;
  fileName: string;
  ocrResult?: OcrExtractionResult;
};

export function createReviewWorkspace({
  images,
  input,
  reviewerName,
}: {
  images: ReviewImageInput[];
  input: ReviewCreateInput;
  reviewerName: string;
}) {
  const timestamp = new Date().toISOString();
  const reviewJobId = `review-local-${Date.now().toString(36)}`;
  const textSegments = splitTextIntoSegments({
    reviewJobId,
    source: "pasted_text",
    text: input.originalText ?? "",
  });
  const ocrResults = images.map((image, index) =>
    createOcrResult({
      image,
      imageId: `${reviewJobId}-image-${index + 1}`,
      reviewJobId,
      timestamp,
    }),
  );
  const ocrSegments = ocrResults.flatMap((result) =>
    createOcrTextSegments({ result, reviewJobId }),
  );
  const segments = [...textSegments, ...ocrSegments];
  const policyTerms = getStoredPolicyTerms();
  const pastedTextFindings = runPolicyFilter({
    policyTerms,
    reviewJobId,
    source: "pasted_text",
    textSegments,
  }).findings;
  const ocrFindings = runPolicyFilter({
    policyTerms,
    reviewJobId,
    source: "image_ocr",
    textSegments: ocrSegments,
  }).findings;
  const findings = [...pastedTextFindings, ...ocrFindings];
  const workspace: ReviewWorkspace = {
    findings,
    ocrResults,
    report: undefined,
    reviewJob: {
      brandName: input.brandName.trim(),
      channel: input.channel,
      contentType: input.contentType,
      createdAt: timestamp,
      dictionaryId: input.dictionaryId,
      id: reviewJobId,
      imageUrls: images.map((image) => image.dataUrl),
      originalText: input.originalText?.trim(),
      reviewerName,
      status: "COMPLETED",
      title: input.title.trim(),
      updatedAt: timestamp,
    },
    segments,
    severityCounts: countBySeverity(findings),
    sourceCounts: countBySource(findings),
    visionConnectionState: "not_configured",
  };

  saveReviewWorkspace(workspace);

  return workspace;
}

export function getStoredReviewWorkspaces() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(storageKey) ?? "",
    ) as StoredReviewPayload;

    return Array.isArray(parsed.reviews) ? parsed.reviews : [];
  } catch {
    return [];
  }
}

export function getStoredReviewWorkspace(id: string) {
  return getStoredReviewWorkspaces().find((workspace) => workspace.reviewJob.id === id);
}

export function saveReviewReport(reviewJobId: string, reviewerMemo: string) {
  const reviews = getStoredReviewWorkspaces();
  const nextReviews = reviews.map((workspace) => {
    if (workspace.reviewJob.id !== reviewJobId) {
      return workspace;
    }

    const timestamp = new Date().toISOString();
    const report: ReviewReport = {
      createdAt: timestamp,
      id: `${reviewJobId}-report`,
      ocrFindingCount: workspace.sourceCounts.image_ocr,
      pastedTextFindingCount: workspace.sourceCounts.pasted_text,
      reviewerMemo: reviewerMemo.trim(),
      reviewJobId,
      summary: `총 ${workspace.findings.length}개의 검토 후보가 정리되었습니다.`,
      totalFindingCount: workspace.findings.length,
      visionFindingCount: workspace.sourceCounts.vision_ai,
    };

    return {
      ...workspace,
      report,
      reviewJob: {
        ...workspace.reviewJob,
        status: "REVIEWED" as const,
        updatedAt: timestamp,
      },
    };
  });

  persistReviewWorkspaces(nextReviews);

  return nextReviews.find((workspace) => workspace.reviewJob.id === reviewJobId);
}

function saveReviewWorkspace(workspace: ReviewWorkspace) {
  const reviews = [
    workspace,
    ...getStoredReviewWorkspaces().filter(
      (current) => current.reviewJob.id !== workspace.reviewJob.id,
    ),
  ];

  persistReviewWorkspaces(reviews);
}

function persistReviewWorkspaces(reviews: ReviewWorkspace[]) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: StoredReviewPayload = {
    reviews,
    version: 1,
  };

  window.localStorage.setItem(storageKey, JSON.stringify(payload));
}

function createOcrResult({
  image,
  imageId,
  reviewJobId,
  timestamp,
}: {
  image: ReviewImageInput;
  imageId: string;
  reviewJobId: string;
  timestamp: string;
}): OcrResult {
  const ocrResult = image.ocrResult;
  const regions = mapOcrRegions({
    imageId,
    regions: ocrResult?.regions ?? [],
    text: ocrResult?.text ?? "",
  });

  return {
    confidence: ocrResult?.confidence ?? 0,
    createdAt: timestamp,
    fullText: ocrResult?.text ?? "",
    id: `${imageId}-ocr`,
    imageId,
    imageUrl: image.dataUrl,
    language: "kor+eng",
    regions,
    reviewJobId,
    status: ocrResult?.status ?? "not_requested",
  };
}

function mapOcrRegions({
  imageId,
  regions,
  text,
}: {
  imageId: string;
  regions: OcrImageRegion[];
  text: string;
}): OcrTextRegion[] {
  return regions.map((region, index) => ({
    confidence: region.confidence,
    height: region.height,
    id: region.id,
    imageId,
    lineNumber: index + 1,
    text: text || region.label,
    width: region.width,
    x: region.x,
    y: region.y,
  }));
}

function createOcrTextSegments({
  result,
  reviewJobId,
}: {
  result: OcrResult;
  reviewJobId: string;
}) {
  const segments = splitTextIntoSegments({
    reviewJobId,
    source: "image_ocr",
    text: result.fullText,
  });
  const regionId = result.regions[0]?.id;

  return segments.map((segment): TextSegment => ({
    ...segment,
    imageId: result.imageId,
    regionId,
  }));
}

function countBySeverity(findings: PolicyFinding[]) {
  return {
    critical: findings.filter((finding) => finding.severity === "critical").length,
    high: findings.filter((finding) => finding.severity === "high").length,
    low: findings.filter((finding) => finding.severity === "low").length,
    medium: findings.filter((finding) => finding.severity === "medium").length,
  };
}

function countBySource(findings: PolicyFinding[]) {
  const initial: Record<FindingSource, number> = {
    image_ocr: 0,
    pasted_text: 0,
    vision_ai: 0,
  };

  return findings.reduce((counts, finding) => {
    counts[finding.source] += 1;
    return counts;
  }, initial);
}
