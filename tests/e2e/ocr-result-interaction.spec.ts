import { expect, test } from "@playwright/test";
import type { ReviewWorkspace } from "@/features/review/types";

const pixelImage =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+3Bq7WQAAAABJRU5ErkJggg==";

const reviewWorkspace: ReviewWorkspace = {
  events: [],
  findings: [
    {
      category: "guarantee_claim",
      confidence: 0.94,
      createdAt: "2026-07-10T00:00:00.000Z",
      highlightedText: "<mark>무료 보장</mark>",
      id: "finding-image-1",
      imageId: "image-1",
      lineNumber: 1,
      matchedTerm: "무료 보장",
      originalText: "무료 보장",
      policyTermId: "term-1",
      reason: "보장성 표현은 조건을 함께 확인해야 합니다.",
      regionId: "region-1",
      replacementSuggestion: "조건 충족 시 제공",
      reviewJobId: "review-ocr-ui",
      severity: "high",
      source: "image_ocr",
    },
    {
      category: "comparative_rank",
      confidence: 0.91,
      createdAt: "2026-07-10T00:00:00.000Z",
      highlightedText: "<mark>업계 1위</mark>",
      id: "finding-image-2",
      imageId: "image-2",
      lineNumber: 1,
      matchedTerm: "업계 1위",
      originalText: "업계 1위",
      policyTermId: "term-2",
      reason: "비교 근거 확인이 필요한 표현입니다.",
      regionId: "region-2",
      replacementSuggestion: "자체 조사 기준 상위권",
      reviewJobId: "review-ocr-ui",
      severity: "medium",
      source: "image_ocr",
    },
  ],
  ocrResults: [
    {
      confidence: 0.94,
      createdAt: "2026-07-10T00:00:00.000Z",
      fileName: "first.png",
      fullText: "무료 보장",
      id: "ocr-1",
      imageId: "image-1",
      imageUrl: pixelImage,
      language: "kor+eng",
      regions: [
        {
          confidence: 0.94,
          height: 0.2,
          id: "region-1",
          imageId: "image-1",
          lineNumber: 1,
          text: "무료 보장",
          width: 0.7,
          x: 0.1,
          y: 0.15,
        },
      ],
      reviewJobId: "review-ocr-ui",
      status: "succeeded",
    },
    {
      confidence: 0.91,
      createdAt: "2026-07-10T00:00:00.000Z",
      fileName: "second.png",
      fullText: "업계 1위",
      id: "ocr-2",
      imageId: "image-2",
      imageUrl: pixelImage,
      language: "kor+eng",
      regions: [
        {
          confidence: 0.91,
          height: 0.18,
          id: "region-2",
          imageId: "image-2",
          lineNumber: 1,
          text: "업계 1위",
          width: 0.64,
          x: 0.18,
          y: 0.42,
        },
      ],
      reviewJobId: "review-ocr-ui",
      status: "succeeded",
    },
  ],
  reviewJob: {
    brandName: "노스스타",
    channel: "instagram",
    contentType: "mixed",
    createdAt: "2026-07-10T00:00:00.000Z",
    dictionaryId: "dict-brandguard-default",
    id: "review-ocr-ui",
    imageUrls: [pixelImage, pixelImage],
    reviewerName: "김민서",
    status: "COMPLETED",
    title: "OCR 결과 상호작용 테스트",
    updatedAt: "2026-07-10T00:00:00.000Z",
  },
  segments: [
    {
      id: "segment-1",
      imageId: "image-1",
      lineNumber: 1,
      normalizedText: "무료 보장",
      regionId: "region-1",
      reviewJobId: "review-ocr-ui",
      source: "image_ocr",
      text: "무료 보장",
    },
    {
      id: "segment-2",
      imageId: "image-2",
      lineNumber: 1,
      normalizedText: "업계 1위",
      regionId: "region-2",
      reviewJobId: "review-ocr-ui",
      source: "image_ocr",
      text: "업계 1위",
    },
  ],
  severityCounts: {
    critical: 0,
    high: 1,
    low: 0,
    medium: 1,
  },
  sourceCounts: {
    image_ocr: 2,
    pasted_text: 0,
    vision_ai: 0,
  },
  visionConnectionState: "not_configured",
};

test("user switches OCR images and keeps regions synchronized with findings", async ({
  page,
}) => {
  await page.addInitScript((workspace) => {
    window.localStorage.setItem(
      "brandguard.review-workspaces.v1",
      JSON.stringify({ reviews: [workspace], version: 1 }),
    );
  }, reviewWorkspace);

  await page.goto("/reviews/review-ocr-ui");

  const secondImageButton = page.getByRole("button", {
    name: "이미지 2 second.png",
  });
  await secondImageButton.click();
  await expect(secondImageButton).toHaveAttribute("aria-pressed", "true");

  const secondRegion = page.getByRole("button", {
    name: "1번째 OCR 영역: 업계 1위",
  });
  await secondRegion.click();
  await expect(secondRegion).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("비교 근거 확인이 필요한 표현입니다.")).toBeVisible();

  await page.getByRole("button", { name: "이미지 1 first.png" }).click();
  await expect(
    page.getByText("보장성 표현은 조건을 함께 확인해야 합니다."),
  ).toBeVisible();
});
