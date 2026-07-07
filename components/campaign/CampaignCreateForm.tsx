"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Upload } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  campaignCreateSchema,
  type CampaignCreateInput,
} from "@/features/campaign/schema";

const channels = [
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "web_banner", label: "Web banner" },
  { value: "push", label: "Push" },
  { value: "offline", label: "Offline" },
] as const;

export function CampaignCreateForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<CampaignCreateInput>({
    resolver: zodResolver(campaignCreateSchema),
    defaultValues: {
      channel: "instagram",
      copy: "",
    },
  });

  const onSubmit = handleSubmit(async () => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubmitted(true);
  });

  return (
    <form className="grid gap-6" onSubmit={onSubmit}>
      {submitted ? (
        <div className="rounded-xl border border-[var(--color-hairline)] bg-[var(--color-risk-low-bg)] p-4 text-sm text-[var(--color-risk-low-text)]">
          캠페인 초안이 준비되었습니다. 다음 단계에서 mock AI 분석 결과와
          리뷰 화면으로 연결됩니다.
        </div>
      ) : null}

      <div className="grid gap-4 rounded-xl border border-[var(--color-hairline)] bg-white p-6 md:grid-cols-2">
        <Field label="캠페인명" error={errors.name?.message}>
          <input
            className="h-11 rounded-md border border-[var(--color-hairline)] px-3 text-sm outline-none focus:border-[var(--color-info-border)]"
            placeholder="예: Summer launch visual"
            {...register("name")}
          />
        </Field>
        <Field label="브랜드명" error={errors.brandName?.message}>
          <input
            className="h-11 rounded-md border border-[var(--color-hairline)] px-3 text-sm outline-none focus:border-[var(--color-info-border)]"
            placeholder="예: Northstar"
            {...register("brandName")}
          />
        </Field>
        <Field label="게시 채널" error={errors.channel?.message}>
          <select
            className="h-11 rounded-md border border-[var(--color-hairline)] bg-white px-3 text-sm outline-none focus:border-[var(--color-info-border)]"
            {...register("channel")}
          >
            {channels.map((channel) => (
              <option key={channel.value} value={channel.value}>
                {channel.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="게시 예정일" error={errors.publishDate?.message}>
          <input
            className="h-11 rounded-md border border-[var(--color-hairline)] px-3 text-sm outline-none focus:border-[var(--color-info-border)]"
            type="date"
            {...register("publishDate")}
          />
        </Field>
        <Field label="타깃" error={errors.targetAudience?.message}>
          <input
            className="h-11 rounded-md border border-[var(--color-hairline)] px-3 text-sm outline-none focus:border-[var(--color-info-border)]"
            placeholder="예: 신규 고객, 멤버십 고객"
            {...register("targetAudience")}
          />
        </Field>
        <Field label="업종" error={errors.industry?.message}>
          <input
            className="h-11 rounded-md border border-[var(--color-hairline)] px-3 text-sm outline-none focus:border-[var(--color-info-border)]"
            placeholder="예: cosmetics"
            {...register("industry")}
          />
        </Field>
      </div>

      <div className="grid gap-4 rounded-xl border border-[var(--color-hairline)] bg-white p-6">
        <Field label="광고 카피" error={errors.copy?.message}>
          <textarea
            className="min-h-36 rounded-md border border-[var(--color-hairline)] px-3 py-3 text-sm leading-6 outline-none focus:border-[var(--color-info-border)]"
            placeholder="검토할 광고 문구를 입력하세요."
            {...register("copy")}
          />
        </Field>

        <Field
          label="이미지 파일"
          description="jpg, png, webp 파일을 지원합니다. 실제 업로드는 mock 단계에서 로컬 미리보기로 대체됩니다."
          error={errors.image?.message}
        >
          <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-hairline)] bg-[var(--color-surface-soft)] px-4 py-6 text-center">
            <Upload aria-hidden="true" size={22} strokeWidth={1.8} />
            <span className="mt-3 text-sm font-medium">이미지 선택</span>
            <span className="mt-1 text-xs text-[var(--color-muted)]">
              내부 검토용 소재로 취급됩니다.
            </span>
            <input
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              type="file"
              {...register("image")}
            />
          </label>
        </Field>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          className="min-h-12 rounded-xl border border-[var(--color-hairline)] px-5 text-sm font-medium"
          type="button"
        >
          초안 저장
        </button>
        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <LoaderCircle
              aria-hidden="true"
              className="animate-spin"
              size={16}
              strokeWidth={1.8}
            />
          ) : null}
          분석 요청
        </button>
      </div>
    </form>
  );
}

function Field({
  children,
  description,
  error,
  label,
}: {
  children: React.ReactNode;
  description?: string;
  error?: string;
  label: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-[var(--color-ink)]">
      <span>{label}</span>
      {children}
      {description ? (
        <span className="text-xs font-normal leading-5 text-[var(--color-muted)]">
          {description}
        </span>
      ) : null}
      {error ? (
        <span className="text-xs font-normal leading-5 text-[var(--color-risk-high-text)]">
          {error}
        </span>
      ) : null}
    </label>
  );
}
