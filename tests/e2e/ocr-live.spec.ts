import { expect, test } from "@playwright/test";

test("uploaded image runs through Tesseract and produces OCR policy findings", async ({
  page,
}) => {
  await page.setViewportSize({ height: 500, width: 1200 });
  await page.setContent(`
    <main style="display:flex;align-items:center;justify-content:center;width:1200px;height:500px;background:#fff;">
      <p style="margin:0;color:#000;font:700 112px/1 Arial,sans-serif;letter-spacing:2px;">FREE GUARANTEE</p>
    </main>
  `);
  const imageBuffer = await page.screenshot();

  await page.goto("/dictionaries");
  await page.getByRole("button", { name: "정책 추가" }).click();
  await page
    .getByRole("textbox", { exact: true, name: "표현" })
    .fill("FREE GUARANTEE");
  await page
    .getByLabel("검출 사유")
    .fill("영문 보장성 표현은 조건 확인이 필요합니다.");
  await page.getByRole("button", { exact: true, name: "추가" }).click();

  await page.goto("/reviews/new");
  await page.getByLabel("검수 제목").fill("실제 OCR 검수");
  await page.getByLabel("브랜드명").fill("노스스타");
  await page.getByRole("textbox", { name: "대본 또는 광고 문구" }).fill("");
  await page.locator('input[type="file"]').setInputFiles({
    buffer: imageBuffer,
    mimeType: "image/png",
    name: "ocr-live.png",
  });
  await expect(
    page.getByRole("img", { name: "ocr-live.png 미리보기" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "콘텐츠 검수 시작" }).click();

  await page.waitForURL(/\/reviews\/review-local-.+$/, { timeout: 45_000 });
  await expect(
    page.getByRole("heading", { name: "콘텐츠 검수 리포트" }),
  ).toBeVisible();

  const storedResult = await page.evaluate(() => {
    const payload = JSON.parse(
      window.localStorage.getItem("brandguard.review-workspaces.v1") ?? "{}",
    ) as {
      reviews?: Array<{
        ocrResults: Array<{
          fullText: string;
          regions: unknown[];
          status: string;
        }>;
        sourceCounts: { image_ocr: number };
      }>;
    };
    const workspace = payload.reviews?.[0];

    return {
      findingCount: workspace?.sourceCounts.image_ocr ?? 0,
      fullText: workspace?.ocrResults[0]?.fullText ?? "",
      regionCount: workspace?.ocrResults[0]?.regions.length ?? 0,
      status: workspace?.ocrResults[0]?.status ?? "missing",
    };
  });

  expect(storedResult.status).toBe("succeeded");
  expect(storedResult.fullText.replace(/\s+/g, " ")).toContain(
    "FREE GUARANTEE",
  );
  expect(storedResult.regionCount).toBeGreaterThan(0);
  expect(storedResult.findingCount).toBeGreaterThan(0);

  const localStoragePayload = await page.evaluate(
    () => window.localStorage.getItem("brandguard.review-workspaces.v1") ?? "",
  );
  expect(localStoragePayload).not.toContain("data:image");

  await page.reload();
  const restoredImage = page.getByRole("img", {
    name: "ocr-live.png OCR 검수 이미지",
  });
  await expect(restoredImage).toBeVisible();
  await expect
    .poll(() =>
      restoredImage.evaluate((image) => (image as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
});
