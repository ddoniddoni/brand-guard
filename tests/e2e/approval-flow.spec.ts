import { expect, test } from "@playwright/test";

test.describe("BrandGuard approval workflow", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test("requester submits an AI-reviewed asset and approvers finalize it", async ({
    page,
  }) => {
    const campaignName = "E2E 권한 승인 플로우";

    await page.goto("/campaigns/new");
    await expect(page.getByRole("heading", { name: "새 검토 요청" })).toBeVisible();

    await page.getByLabel("검토 요청명").fill(campaignName);
    await page.getByLabel("브랜드명").fill("노스스타");
    await page.getByLabel("게시 예정일").fill("2026-07-18");
    await page.getByLabel("타깃").fill("20대 여성, 신규 제품 관심군");
    await page.getByLabel("업종").fill("화장품");
    await page
      .getByLabel("광고 카피")
      .fill(
        "여름의 산뜻함을 먼저 만나보세요.\n신제품 공개 전 브랜드 리스크를 함께 확인합니다.",
      );
    await page.getByLabel("이미지 파일").setInputFiles({
      name: "campaign-asset.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
        "base64",
      ),
    });
    await page.getByRole("button", { name: "AI 1차 검토 시작" }).click();

    await page.waitForURL(/\/campaigns\/.+\/review$/);
    await expect(page.getByRole("heading", { name: campaignName })).toBeVisible();
    await expect(page.getByText("이미지 검토 영역")).toBeVisible();

    await page
      .getByRole("button", {
        name: /이미지 시각 요소 후보 검토 필요 영역 선택/,
      })
      .first()
      .click();
    await expect(
      page
        .locator('button[aria-pressed="true"]')
        .filter({ hasText: "이미지 시각 요소 후보 검토 필요" }),
    ).toBeVisible();

    await page
      .getByRole("textbox", { exact: true, name: "의견" })
      .fill(
        "제품을 집는 장면으로 보이며, AI 1차 검토 후보는 결재자가 함께 확인하면 충분하다고 판단합니다.",
      );
    await page.getByRole("button", { name: "작성자 의견 저장" }).click();
    await expect(page.getByText("작성자 의견 작성")).toBeVisible();

    await page
      .getByRole("button", { name: "검토 의견 작성 후 결재 상신" })
      .click();
    await expect(page.getByText("결재 진행").first()).toBeVisible();

    await page.getByLabel("역할 전환").selectOption("user-marketing-junho");
    await page.getByRole("link", { name: /내 결재함/ }).click();
    await expect(
      page.getByRole("heading", { exact: true, name: "내 결재 대기" }),
    ).toBeVisible();
    await expect(page.getByText(campaignName)).toBeVisible();

    await page
      .getByRole("row", { name: new RegExp(campaignName) })
      .getByRole("link", { name: /확인/ })
      .click();
    await expect(
      page.getByRole("heading", { name: `${campaignName} 결재 검토` }),
    ).toBeVisible();

    await page
      .getByLabel("새 결재 의견")
      .fill("저도 확인한 바 이상 없습니다. 최종 승인 검토 부탁드립니다.");
    await page.getByRole("button", { name: "승인" }).click();
    await expect(page.getByText("결재 단계 승인")).toBeVisible();

    await page.getByLabel("역할 전환").selectOption("user-final-jisu");
    await page
      .getByLabel("새 결재 의견")
      .fill("작성자 의견과 이전 결재 의견을 확인했습니다. 최종 승인합니다.");
    await page.getByRole("button", { name: "최종 승인" }).click();

    await expect(page.getByText("최종 승인").first()).toBeVisible();
    await expect(page.getByText("윤지수").first()).toBeVisible();
    await expect(page.getByText("결재 상신").first()).toBeVisible();
    await expect(page.getByText("작성자 의견 작성")).toBeVisible();
  });
});
