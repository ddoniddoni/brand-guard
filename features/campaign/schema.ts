import { z } from "zod";

const supportedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const maxImageSize = 2 * 1024 * 1024;

const hasFiles = (value: unknown) =>
  typeof FileList !== "undefined" &&
  value instanceof FileList &&
  value.length > 0;

const requiredText = (message: string) =>
  z.string({ error: message }).trim().min(1, message);

export const campaignCreateSchema = z
  .object({
    name: requiredText("검토 요청명을 입력하세요."),
    brandName: requiredText("브랜드명을 입력하세요."),
    channel: z.enum(
      ["instagram", "youtube", "tiktok", "web_banner", "push", "offline"],
      { message: "게시 채널을 선택하세요." },
    ),
    publishDate: requiredText("게시 예정일을 선택하세요.").refine(
      (value) => !Number.isNaN(Date.parse(value)),
      {
        message: "유효한 날짜를 선택하세요.",
      },
    ),
    targetAudience: requiredText("타깃을 입력하세요."),
    industry: requiredText("업종을 입력하세요."),
    copy: z.string().trim().optional(),
    image: z.custom<FileList>().optional(),
  })
  .superRefine((value, context) => {
    const hasCopy = Boolean(value.copy?.trim());
    const hasImage = hasFiles(value.image);

    if (!hasCopy && !hasImage) {
      context.addIssue({
        code: "custom",
        message: "이미지 또는 광고 카피 중 하나 이상을 입력하세요.",
        path: ["copy"],
      });
    }

    if (hasImage) {
      const file = value.image?.[0];

      if (file && !supportedImageTypes.includes(file.type)) {
        context.addIssue({
          code: "custom",
          message: "jpg, png, webp 이미지만 업로드할 수 있습니다.",
          path: ["image"],
        });
      }

      if (file && file.size > maxImageSize) {
        context.addIssue({
          code: "custom",
          message: "이미지 파일은 2MB 이하로 업로드하세요.",
          path: ["image"],
        });
      }
    }
  });

export type CampaignCreateInput = z.infer<typeof campaignCreateSchema>;
