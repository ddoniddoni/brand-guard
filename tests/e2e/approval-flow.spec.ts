import { expect, test, type Page } from "@playwright/test";

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64",
);

test.describe("BrandGuard approval workflow", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test("shows Korean field errors when a requester submits an empty review request", async ({
    page,
  }) => {
    await page.goto("/campaigns/new");

    await page.getByRole("button", { name: "AI 1차 검토 시작" }).click();

    await expect(page.getByText("검토 요청명을 입력하세요.")).toBeVisible();
    await expect(page.getByText("브랜드명을 입력하세요.")).toBeVisible();
    await expect(page.getByText("게시 예정일을 선택하세요.")).toBeVisible();
    await expect(page.getByText("타깃을 입력하세요.")).toBeVisible();
    await expect(page.getByText("업종을 입력하세요.")).toBeVisible();
    await expect(
      page.getByText("이미지 또는 광고 카피 중 하나 이상을 입력하세요."),
    ).toBeVisible();
    await expect(page.getByText(/Invalid input/i)).toHaveCount(0);
  });

  test("requester submits an AI-reviewed asset and approvers publish it", async ({
    page,
  }) => {
    const campaignName = "E2E 게시 가능 플로우";

    await createAiReviewedCampaign(page, campaignName);

    await expect(page.getByText("이미지 OCR 확인 결과")).toBeVisible();
    await expect(page.getByText("손동작 후보 검토 필요")).toHaveCount(0);

    await saveRequesterOpinionAndSubmit(page);

    await page.getByLabel("역할 전환").selectOption("user-final-jisu");
    await page.getByRole("link", { name: /^결재 검토$/ }).click();
    await expect(page.getByText("다른 결재자 검토 대기")).toBeVisible();
    await expect(page.getByRole("button", { name: "승인" })).toBeDisabled();

    await page.getByLabel("역할 전환").selectOption("user-marketing-junho");
    await page.getByRole("link", { name: /내 결재함/ }).click();
    await expect(
      page.getByRole("heading", { exact: true, name: "내 결재 대기 건" }),
    ).toBeVisible();
    await expect(page.getByText(campaignName)).toBeVisible();

    await page
      .getByRole("row", { name: new RegExp(campaignName) })
      .getByRole("link", { name: /확인/ })
      .click();
    await expect(
      page.getByRole("heading", { name: `${campaignName} 결재 검토` }),
    ).toBeVisible();

    await fillApprovalComment(
      page,
      "저도 확인한 바 이상 없습니다. 최종 승인 검토 부탁드립니다.",
      "승인",
    );
    await page.getByRole("button", { name: "승인" }).click();
    await expect(page.getByText("결재 단계 승인")).toBeVisible();
    await expect(page.getByText("최종 결재").first()).toBeVisible();

    await page.getByLabel("역할 전환").selectOption("user-final-jisu");
    await fillApprovalComment(
      page,
      "작성자 의견과 이전 결재 의견을 확인했습니다. 최종 승인합니다.",
      "최종 승인",
    );
    await page.getByRole("button", { name: "최종 승인" }).click();

    await expect(page.getByText("게시 가능 처리 대기")).toBeVisible();
    await expect(page.getByText("윤지수").first()).toBeVisible();
    await expect(page.getByText("결재 상신").first()).toBeVisible();
    await expect(page.getByText("작성자 의견 작성")).toBeVisible();

    await page.getByRole("button", { name: "게시 가능 처리" }).click();
    await expect(page.getByText("게시 가능").first()).toBeVisible();
    await expect(page.getByText("게시 가능 처리").first()).toBeVisible();
  });

  test("approver requests revision and requester can submit a revised asset", async ({
    page,
  }) => {
    const campaignName = "E2E 수정 요청 플로우";

    await createAiReviewedCampaign(page, campaignName);
    await saveRequesterOpinionAndSubmit(page);
    await openMarketingApproval(page);

    await fillApprovalComment(
      page,
      "제품 컷이 모호하게 보일 수 있어 대체 이미지나 문구 보강이 필요합니다.",
      "수정 요청",
    );
    await page.getByRole("button", { name: "수정 요청" }).click();
    await expect(page.getByText("작성자 수정 대기")).toBeVisible();
    await expect(page.getByText("수정 요청").first()).toBeVisible();

    await page.getByLabel("역할 전환").selectOption("user-requester-minseo");
    await page.getByRole("link", { name: "리뷰 화면" }).click();
    await expect(
      page.getByRole("heading", { name: "수정본 업로드 필요" }),
    ).toBeVisible();

    await page
      .getByLabel("수정 문구")
      .fill("수정본입니다. 제품 혜택과 사용 장면을 더 명확하게 설명합니다.");
    await page.getByRole("button", { name: "수정본 검토 시작" }).click();

    await expect(page.getByText("작성자 검토 의견을 남겨주세요")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "수정 문구 최종 확인 권장" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "버전 비교" }).first()).toBeVisible();
  });

  test("approver rejection locks the current campaign version", async ({
    page,
  }) => {
    const campaignName = "E2E 반려 플로우";

    await createAiReviewedCampaign(page, campaignName);
    await saveRequesterOpinionAndSubmit(page);
    await openMarketingApproval(page);

    await fillApprovalComment(
      page,
      "현재 소재는 브랜드 맥락과 맞지 않아 이번 버전은 반려합니다.",
      "반려",
    );
    await page.getByRole("button", { name: "반려" }).click();

    await expect(page.getByText("반려 완료")).toBeVisible();
    await expect(
      page.getByText("현재 버전은 반려되어 추가 결재 액션을 실행할 수 없습니다."),
    ).toBeVisible();
    await expect(page.getByText("반려").first()).toBeVisible();
  });
});

async function createAiReviewedCampaign(page: Page, campaignName: string) {
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
    buffer: tinyPng,
  });
  await page.getByRole("button", { name: "AI 1차 검토 시작" }).click();

  await page.waitForURL(/\/campaigns\/.+\/review$/);
  await expect(page.getByRole("heading", { name: campaignName })).toBeVisible();
  await expect(page.getByText("OCR 검토 영역")).toBeVisible();
  await expect(page.getByText("소재 등록")).toHaveCount(0);
}

async function saveRequesterOpinionAndSubmit(page: Page) {
  await page
    .getByRole("textbox", { exact: true, name: "의견" })
    .fill(
      "제품을 집는 장면으로 보이며, AI 1차 검토 후보는 결재자가 함께 확인하면 충분하다고 판단합니다.",
    );
  await page.getByRole("button", { name: "의견 저장" }).click();
  await expect(page.getByText("작성자 의견 작성")).toBeVisible();

  await page.getByRole("button", { name: "결재 상신" }).click();
  await expect(page.getByText("결재 진행").first()).toBeVisible();
  await expect(page.getByText("결재자 검토 대기")).toBeVisible();
}

async function openMarketingApproval(page: Page) {
  await page.getByLabel("역할 전환").selectOption("user-marketing-junho");
  await page.getByRole("link", { name: /^결재 검토$/ }).click();
  await expect(page.getByText("내 결재 차례입니다")).toBeVisible();
}

async function fillApprovalComment(
  page: Page,
  comment: string,
  actionLabel: string,
) {
  const commentBox = page.getByRole("textbox", { name: "새 결재 의견" });
  const readyText = "입력 준비";

  await expect
    .poll(async () => {
      await commentBox.fill(readyText);
      return commentBox.inputValue();
    })
    .toBe(readyText);
  await commentBox.fill(comment);
  await expect(commentBox).toHaveValue(comment);
  await expect(page.getByRole("button", { name: actionLabel })).toBeEnabled();
}
