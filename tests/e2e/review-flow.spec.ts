import { expect, test } from "@playwright/test";

test.describe("BrandGuard policy review flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test("user reviews pasted copy with the policy dictionary and saves a report", async ({
    page,
  }) => {
    await page.goto("/dictionaries");
    await expect(
      page.getByRole("heading", { name: "정책 사전 관리" }),
    ).toBeVisible();
    await expect(page.getByText("무료 보장").first()).toBeVisible();
    await expect(page.getByText("업계 1위").first()).toBeVisible();

    await page.getByRole("button", { name: "정책 추가" }).click();
    await page.getByRole("textbox", { exact: true, name: "표현" }).fill("테스트 금지어");
    await page.getByLabel("검출 사유").fill("브랜드 정책상 테스트 문구는 검토가 필요합니다.");
    await page.getByLabel("대체 표현").fill("검토 완료 문구");
    await page.getByRole("button", { exact: true, name: "추가" }).click();
    await expect(page.getByText("테스트 금지어").first()).toBeVisible();

    await page.getByRole("button", { name: "테스트 금지어 수정" }).click();
    await page
      .getByRole("textbox", { exact: true, name: "표현" })
      .fill("테스트 주의어");
    await page.getByRole("button", { name: "수정 저장" }).click();
    await expect(page.getByText("테스트 주의어").first()).toBeVisible();

    await page.getByRole("link", { name: /콘텐츠 검수/ }).click();
    await expect(
      page.getByRole("heading", { name: "새 콘텐츠 검수" }),
    ).toBeVisible();

    await page.getByLabel("검수 제목").fill("E2E 정책 사전 검수");
    await page.getByLabel("브랜드명").fill("노스스타");
    await page
      .getByRole("textbox", { name: "대본 또는 광고 문구" })
      .fill(
        "이번 이벤트에 참여하면 누구나 무료 보장 혜택을 받을 수 있습니다.\n업계 1위 확정 이벤트 문구는 공개 전 근거를 확인합니다.\n테스트 주의어는 수정한 정책으로 확인합니다.",
      );
    await page.getByRole("button", { name: "콘텐츠 검수 시작" }).click();

    await page.waitForURL(/\/reviews\/review-local-.+$/);
    await expect(
      page.getByRole("heading", { name: "콘텐츠 검수 리포트" }),
    ).toBeVisible();
    await expect(page.getByText("무료 보장").first()).toBeVisible();
    await expect(page.getByText("업계 1위").first()).toBeVisible();
    await expect(page.getByText("테스트 주의어").first()).toBeVisible();
    await expect(page.getByText("AI 이미지 분석").first()).toBeVisible();

    await page
      .getByPlaceholder("담당자 확인 내용과 수정 여부를 남기세요.")
      .fill("금지어는 조건부 표현으로 수정하고, 순위 표현은 근거 확인 후 사용합니다.");
    await page.getByRole("button", { name: "검수 리포트 저장" }).click();
    await expect(page.getByText("검수 리포트가 저장되었습니다.")).toBeVisible();

    await page.getByRole("link", { name: /검수 기록/ }).click();
    await expect(page.getByText("E2E 정책 사전 검수")).toBeVisible();
    await expect(page.getByText("검토 후보 3개")).toBeVisible();
  });

  test("review creation shows Korean validation errors", async ({ page }) => {
    await page.goto("/reviews/new");

    await expect(page.getByLabel("브랜드명")).toHaveValue("");
    await expect(
      page.getByRole("textbox", { name: "대본 또는 광고 문구" }),
    ).toHaveValue("");
    await page.getByLabel("검수 제목").fill("");
    await page.getByRole("textbox", { name: "대본 또는 광고 문구" }).fill("");
    await page.getByRole("button", { name: "콘텐츠 검수 시작" }).click();

    await expect(page.getByText("검수 제목을 입력하세요.")).toBeVisible();
    await expect(page.getByText("브랜드명을 입력하세요.")).toBeVisible();
    await expect(
      page.getByText("대본/문구를 입력하거나 이미지를 하나 이상 업로드하세요."),
    ).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles({
      buffer: Buffer.alloc(10 * 1024 * 1024 + 1),
      mimeType: "image/png",
      name: "too-large.png",
    });
    await expect(
      page.getByText("이미지 한 개의 크기는 10MB 이하여야 합니다."),
    ).toBeVisible();
  });

  test("AI settings disclose only the disabled provider state", async ({ page }) => {
    await page.goto("/settings/ai");

    await expect(
      page.getByRole("heading", { name: "AI 이미지 분석 연결" }),
    ).toBeVisible();
    await expect(page.getByText("AI 이미지 분석 미연결")).toBeVisible();
    await expect(page.getByLabel("Provider")).toHaveValue(
      "disabledVisionProvider",
    );
    await expect(page.getByLabel("API Key")).toHaveValue(
      "클라이언트에 저장하지 않음",
    );
  });

  test("dictionary hydrates persisted policies without a mismatch", async ({
    page,
  }) => {
    const hydrationErrors: string[] = [];

    page.on("pageerror", (error) => {
      if (error.message.includes("Hydration failed")) {
        hydrationErrors.push(error.message);
      }
    });
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "brandguard.policy-terms.v1",
        JSON.stringify({
          terms: [
            {
              brandId: "brand-test",
              category: "custom_forbidden_term",
              createdAt: "2026-07-10T00:00:00.000Z",
              enabled: true,
              id: "term-persisted",
              matchType: "contains",
              reason: "저장된 정책 사유",
              severity: "medium",
              term: "저장된 테스트 정책",
              type: "forbidden",
              updatedAt: "2026-07-10T00:00:00.000Z",
            },
          ],
          version: 1,
        }),
      );
    });

    await page.goto("/dictionaries");

    await expect(page.getByText("저장된 테스트 정책")).toBeVisible();
    expect(hydrationErrors).toEqual([]);
  });

  test("theme selector clearly exposes both appearance modes", async ({
    page,
  }) => {
    await page.goto("/dictionaries");

    const lightMode = page.getByRole("button", { name: "라이트 모드" });
    const darkMode = page.getByRole("button", { name: "다크 모드" });

    await expect(lightMode).toHaveAttribute("aria-pressed", "true");
    await darkMode.click();
    await expect(darkMode).toHaveAttribute("aria-pressed", "true");
    await expect(lightMode).toHaveAttribute("aria-pressed", "false");
  });

  test("new review hydrates the persisted policy count without a mismatch", async ({
    page,
  }) => {
    const hydrationErrors: string[] = [];

    page.on("pageerror", (error) => {
      if (error.message.includes("Hydration failed")) {
        hydrationErrors.push(error.message);
      }
    });
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "brandguard.policy-terms.v1",
        JSON.stringify({
          terms: [
            {
              brandId: "brand-test",
              category: "custom_forbidden_term",
              createdAt: "2026-07-10T00:00:00.000Z",
              enabled: true,
              id: "term-persisted",
              matchType: "contains",
              reason: "저장된 정책 사유",
              severity: "medium",
              term: "저장된 테스트 정책",
              type: "forbidden",
              updatedAt: "2026-07-10T00:00:00.000Z",
            },
          ],
          version: 1,
        }),
      );
    });

    await page.goto("/reviews/new");

    await expect(page.getByText("1개 정책 적용")).toBeVisible();
    expect(hydrationErrors).toEqual([]);
  });
});
