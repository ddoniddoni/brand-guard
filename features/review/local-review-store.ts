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
import { extractImageTextWithTesseract } from "@/features/ocr/tesseract-client";
import {
  deleteReviewAssets,
  getReviewAssetDataUrls,
  ReviewStorageError,
  saveReviewAssets,
} from "@/features/review/local-asset-store";
import {
  initializeReviewWorkspace,
  transitionReviewWorkspace,
} from "@/features/review/state-machine";

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

export type ReviewRetryProgress = {
  label: string;
  progress: number;
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
  const analysis = analyzeReviewContent({
    images,
    input,
    reviewJobId,
    timestamp,
  });
  const draftWorkspace = initializeReviewWorkspace({
    ...analysis,
    events: [],
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
      status: "DRAFT",
      title: input.title.trim(),
      updatedAt: timestamp,
    },
    visionConnectionState: "not_configured",
  });
  const analyzingWorkspace = transitionReviewWorkspace(
    draftWorkspace,
    "ANALYZING",
    "콘텐츠 검수를 시작했습니다.",
  );
  const outcome = getReviewOutcome(input.originalText, analysis.ocrResults);
  const workspace = transitionReviewWorkspace(
    analyzingWorkspace,
    outcome.status,
    outcome.message,
  );

  const imageIds = analysis.ocrResults.map((result) => result.imageId);

  try {
    await saveReviewAssets(
      analysis.ocrResults.map((result, index) => ({
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

export async function retryReviewWorkspace(
  reviewJobId: string,
  {
    onProgress,
  }: {
    onProgress?: (progress: ReviewRetryProgress) => void;
  } = {},
) {
  const workspace = await getStoredReviewWorkspace(reviewJobId);

  if (!workspace) {
    throw new Error("재시도할 검수 결과를 찾을 수 없습니다.");
  }

  if (workspace.reviewJob.status !== "FAILED") {
    throw new Error("실패한 검수만 다시 시도할 수 있습니다.");
  }

  const analyzingWorkspace = transitionReviewWorkspace(
    workspace,
    "ANALYZING",
    "실패한 이미지 OCR 검수를 다시 시작했습니다.",
  );
  await saveReviewWorkspace(analyzingWorkspace);

  try {
    const images = await Promise.all(
      workspace.ocrResults.map(
        async (result, index): Promise<ReviewImageInput> => {
          if (!result.imageUrl) {
            throw new Error("저장된 이미지 원본을 불러오지 못했습니다.");
          }

          onProgress?.({
            label: `이미지 OCR 재시도 ${index + 1}/${workspace.ocrResults.length}`,
            progress: 0,
          });
          const file = await dataUrlToFile(
            result.imageUrl,
            result.fileName ?? `review-image-${index + 1}.png`,
          );
          const ocrResult = await extractImageTextWithTesseract(file, {
            onProgress: (progress) =>
              onProgress?.({
                label: `이미지 OCR 재시도 ${index + 1}/${workspace.ocrResults.length}`,
                progress,
              }),
            timeoutMs: 30_000,
          });

          return {
            dataUrl: result.imageUrl,
            fileName: result.fileName ?? file.name,
            ocrResult,
          };
        },
      ),
    );
    const input: ReviewCreateInput = {
      brandName: workspace.reviewJob.brandName,
      channel: workspace.reviewJob.channel,
      contentType: workspace.reviewJob.contentType,
      dictionaryId: workspace.reviewJob.dictionaryId,
      originalText: workspace.reviewJob.originalText,
      title: workspace.reviewJob.title,
    };
    const timestamp = new Date().toISOString();
    const analysis = analyzeReviewContent({
      images,
      input,
      reviewJobId,
      timestamp,
    });
    const analyzedWorkspace: ReviewWorkspace = {
      ...analyzingWorkspace,
      ...analysis,
      report: undefined,
      reviewJob: {
        ...analyzingWorkspace.reviewJob,
        imageUrls: images.map((image) => image.dataUrl),
        updatedAt: timestamp,
      },
    };
    const outcome = getReviewOutcome(
      workspace.reviewJob.originalText,
      analysis.ocrResults,
    );
    const finalWorkspace = transitionReviewWorkspace(
      analyzedWorkspace,
      outcome.status,
      outcome.message,
    );

    await saveReviewAssets(
      analysis.ocrResults.map((result, index) => ({
        dataUrl: images[index]?.dataUrl ?? "",
        imageId: result.imageId,
        reviewJobId,
      })),
    );
    await saveReviewWorkspace(finalWorkspace);

    return (await getStoredReviewWorkspace(reviewJobId)) ?? finalWorkspace;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "이미지 OCR 재시도 중 오류가 발생했습니다.";
    const failedWorkspace = transitionReviewWorkspace(
      analyzingWorkspace,
      "FAILED",
      message,
    );

    await saveReviewWorkspace(failedWorkspace);
    return (await getStoredReviewWorkspace(reviewJobId)) ?? failedWorkspace;
  }
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

    const workspaceWithReport = {
      ...workspace,
      report,
      reviewJob: {
        ...workspace.reviewJob,
        updatedAt: timestamp,
      },
    };

    return workspace.reviewJob.status === "COMPLETED"
      ? transitionReviewWorkspace(
          workspaceWithReport,
          "REVIEWED",
          "검수 메모와 리포트를 저장했습니다.",
        )
      : workspaceWithReport;
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
    version: 3,
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

function analyzeReviewContent({
  images,
  input,
  reviewJobId,
  timestamp,
}: {
  images: ReviewImageInput[];
  input: ReviewCreateInput;
  reviewJobId: string;
  timestamp: string;
}) {
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

  return {
    findings,
    ocrResults,
    segments,
    severityCounts: countBySeverity(findings),
    sourceCounts: countBySource(findings),
  };
}

function getReviewOutcome(
  originalText: string | undefined,
  ocrResults: OcrResult[],
): {
  message: string;
  status: "COMPLETED" | "FAILED";
} {
  const hasPastedText = Boolean(originalText?.trim());
  const allOcrAttemptsFailed =
    ocrResults.length > 0 &&
    ocrResults.every((result) => result.status === "failed");

  if (!hasPastedText && allOcrAttemptsFailed) {
    return {
      message:
        ocrResults.find((result) => result.errorMessage)?.errorMessage ??
        "업로드한 이미지의 OCR을 완료하지 못했습니다.",
      status: "FAILED",
    };
  }

  const failedImageCount = ocrResults.filter(
    (result) => result.status === "failed",
  ).length;

  return {
    message:
      failedImageCount > 0
        ? `텍스트 검수는 완료했으며, ${failedImageCount}개 이미지의 OCR은 완료하지 못했습니다.`
        : "정책 사전 매칭과 이미지 OCR 검수를 완료했습니다.",
    status: "COMPLETED",
  };
}

async function dataUrlToFile(dataUrl: string, fileName: string) {
  const response = await fetch(dataUrl);

  if (!response.ok) {
    throw new Error("저장된 이미지 데이터를 파일로 복원하지 못했습니다.");
  }

  const blob = await response.blob();
  return new File([blob], fileName, {
    lastModified: Date.now(),
    type: blob.type || "image/png",
  });
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
