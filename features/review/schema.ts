import { z } from "zod";

export const reviewCreateSchema = z.object({
  brandName: z.string().trim().min(1, "브랜드명을 입력하세요."),
  channel: z.enum([
    "instagram",
    "youtube",
    "tiktok",
    "web_banner",
    "push",
    "offline",
    "homepage",
    "newsletter",
  ]),
  contentType: z.enum([
    "video_script",
    "ad_copy",
    "sns_caption",
    "web_banner",
    "image_only",
    "mixed",
  ]),
  dictionaryId: z.string().trim().min(1, "적용할 정책 사전을 선택하세요."),
  originalText: z.string().optional(),
  title: z.string().trim().min(1, "검수 제목을 입력하세요."),
});

export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>;
