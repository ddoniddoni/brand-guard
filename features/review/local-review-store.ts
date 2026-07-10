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
import {
  deleteReviewAssets,
  getReviewAssetDataUrls,
  ReviewStorageError,
  saveReviewAssets,
} from "@/features/review/local-asset-store";

const storageKey = "brandguard.review-workspaces.v1";
const maxStoredReviewCount = 20;

type StoredReviewPayload = {
  reviews: ReviewWorkspace[];
  version: number;
};

export type ReviewImageInput = {
  dataUrl: string;
  fileName: string;
  ocrResult?: OcrExtractionResult;
};

export async function createReviewWorkspace({
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

  const imageIds = ocrResults.map((result) => result.imageId);

  try {
    await saveReviewAssets(
      ocrResults.map((result, index) => ({
        dataUrl: images[index]?.dataUrl ?? "",
        imageId: result.imageId,
        reviewJobId,
      })),
    );
    await saveReviewWorkspace(workspace);
  } catch (error) {
    await deleteReviewAssets(imageIds);
    throw toReviewStorageError(error);
  }

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

export async function getStoredReviewWorkspace(id: string) {
  const workspace = getStoredReviewWorkspaces().find(
    (item) => item.reviewJob.id === id,
  );

  if (!workspace || workspace.ocrResults.length === 0) {
    return workspace;
  }

  if (workspace.ocrResults.every((result) => result.imageUrl)) {
    return workspace;
  }

  const assetDataUrls = await getReviewAssetDataUrls(
    workspace.ocrResults.map((result) => result.imageId),
  );
  const ocrResults = workspace.ocrResults.map((result) => ({
    ...result,
    imageUrl: result.imageUrl || assetDataUrls.get(result.imageId) || "",
  }));

  return {
    ...workspace,
    ocrResults,
    reviewJob: {
      ...workspace.reviewJob,
      imageUrls: ocrResults.flatMap((result) =>
        result.imageUrl ? [result.imageUrl] : [],
      ),
    },
  };
}

export async function saveReviewReport(reviewJobId: string, reviewerMemo: string) {
  const reviews = getStoredReviewWorkspaces();
  const currentWorkspace = reviews.find(
    (workspace) => workspace.reviewJob.id === reviewJobId,
  );

  if (currentWorkspace) {
    await persistInlineReviewAssets(currentWorkspace);
  }

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

  try {
    persistReviewWorkspaces(nextReviews);
    return await getStoredReviewWorkspace(reviewJobId);
  } catch (error) {
    throw toReviewStorageError(error);
  }
}

async function saveReviewWorkspace(workspace: ReviewWorkspace) {
  const reviews = [
    workspace,
    ...getStoredReviewWorkspaces().filter(
      (current) => current.reviewJob.id !== workspace.reviewJob.id,
    ),
  ];
  const retainedReviews = reviews.slice(0, maxStoredReviewCount);
  const prunedImageIds = reviews
    .slice(maxStoredReviewCount)
    .flatMap((review) => review.ocrResults.map((result) => result.imageId));

  persistReviewWorkspaces(retainedReviews);
  await deleteReviewAssets(prunedImageIds);
}

function persistReviewWorkspaces(reviews: ReviewWorkspace[]) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: StoredReviewPayload = {
    reviews: reviews.slice(0, maxStoredReviewCount).map(stripInlineAssets),
    version: 2,
  };

  window.localStorage.setItem(storageKey, JSON.stringify(payload));
}

function stripInlineAssets(workspace: ReviewWorkspace): ReviewWorkspace {
  return {
    ...workspace,
    ocrResults: workspace.ocrResults.map((result) => ({
      ...result,
      imageUrl: "",
    })),
    reviewJob: {
      ...workspace.reviewJob,
      imageUrls: [],
    },
  };
}

async function persistInlineReviewAssets(workspace: ReviewWorkspace) {
  const assets = workspace.ocrResults.flatMap((result) =>
    result.imageUrl
      ? [
          {
            dataUrl: result.imageUrl,
            imageId: result.imageId,
            reviewJobId: workspace.reviewJob.id,
          },
        ]
      : [],
  );

  await saveReviewAssets(assets);
}

function toReviewStorageError(error: unknown) {
  if (error instanceof ReviewStorageError) {
    return error;
  }

  return new ReviewStorageError(
    "검수 결과를 저장하지 못했습니다. 브라우저 저장 공간을 확인해 주세요.",
  );
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
  });

  return {
    confidence: ocrResult?.confidence ?? 0,
    createdAt: timestamp,
    errorMessage: ocrResult?.errorMessage,
    fileName: image.fileName,
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
}: {
  imageId: string;
  regions: OcrImageRegion[];
}): OcrTextRegion[] {
  return regions.map((region, index) => ({
    confidence: region.confidence,
    height: region.height,
    id: region.id,
    imageId,
    lineNumber: index + 1,
    text: region.label,
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
  if (result.regions.length > 0) {
    return result.regions.flatMap((region) =>
      splitTextIntoSegments({
        reviewJobId,
        source: "image_ocr",
        text: region.text,
      }).map(
        (segment): TextSegment => ({
          ...segment,
          id: `${segment.id}-${result.imageId}-${region.id}`,
          imageId: result.imageId,
          lineNumber: region.lineNumber,
          regionId: region.id,
        }),
      ),
    );
  }

  const segments = splitTextIntoSegments({
    reviewJobId,
    source: "image_ocr",
    text: result.fullText,
  });

  return segments.map((segment): TextSegment => ({
    ...segment,
    imageId: result.imageId,
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
