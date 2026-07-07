"use client";

import {
  CheckCircle2,
  FileImage,
  FileText,
  LoaderCircle,
  Sparkles,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  campaignCreateSchema,
  type CampaignCreateInput,
} from "@/features/campaign/schema";
import {
  createCampaignWorkspace,
  saveCampaignWorkspace,
} from "@/features/campaign/local-workspace";
import { cx } from "@/lib/utils";

const channels = [
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "web_banner", label: "Web banner" },
  { value: "push", label: "Push" },
  { value: "offline", label: "Offline" },
] as const;

const analysisSteps = [
  {
    title: "소재 보안 처리",
    description: "업로드된 이미지와 문구를 내부 검토용 자산으로 준비합니다.",
  },
  {
    title: "이미지 후보 영역 확인",
    description: "시각 패턴 후보와 오브젝트 영역을 mock 좌표로 구조화합니다.",
  },
  {
    title: "OCR 문구 후보 확인",
    description: "이미지 내 텍스트 후보와 광고 카피를 함께 확인합니다.",
  },
  {
    title: "리스크 사전 대조",
    description: "게시일, 채널, 타깃 맥락과 리스크 사전 항목을 비교합니다.",
  },
  {
    title: "담당자 검토용 요약 생성",
    description: "근거, 오탐 가능성, 수정 제안을 리뷰 화면에 전달합니다.",
  },
];

type AnalysisState = "idle" | "running" | "complete";

export function CampaignCreateForm() {
  const router = useRouter();
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [activeAnalysisStep, setActiveAnalysisStep] = useState(0);
  const [createdCampaignId, setCreatedCampaignId] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [usesSampleAsset, setUsesSampleAsset] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setValue,
  } = useForm<CampaignCreateInput>({
    resolver: zodResolver(campaignCreateSchema),
    defaultValues: {
      channel: "instagram",
      copy: "",
    },
  });
  useEffect(
    () => () => {
      if (imagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    },
    [imagePreviewUrl],
  );

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setImagePreviewUrl(null);
      setImageFileName("");
      setSelectedImageFile(null);
      return;
    }

    setImagePreviewUrl(URL.createObjectURL(file));
    setImageFileName(file.name);
    setSelectedImageFile(file);
    setUsesSampleAsset(false);
    setCreatedCampaignId("");
    setAnalysisState("idle");
  };

  const fillSampleAsset = () => {
    setValue("name", "Summer launch visual", { shouldValidate: true });
    setValue("brandName", "Northstar", { shouldValidate: true });
    setValue("channel", "instagram", { shouldValidate: true });
    setValue("publishDate", "2026-07-18", { shouldValidate: true });
    setValue("targetAudience", "20대 여성, 신규 제품 관심군", {
      shouldValidate: true,
    });
    setValue("industry", "cosmetics", { shouldValidate: true });
    setValue(
      "copy",
      "Summer calm, reviewed first.\n신제품 공개 전 브랜드 리스크를 함께 확인합니다.",
      { shouldValidate: true },
    );
    setImagePreviewUrl(null);
    setImageFileName("BrandGuard sample visual");
    setSelectedImageFile(null);
    setUsesSampleAsset(true);
    setCreatedCampaignId("");
    setAnalysisState("idle");
  };

  const onSubmit = handleSubmit(async (input) => {
    setAnalysisState("running");
    setActiveAnalysisStep(0);
    setCreatedCampaignId("");

    for (let index = 0; index < analysisSteps.length; index += 1) {
      setActiveAnalysisStep(index);
      await new Promise((resolve) => setTimeout(resolve, 420));
    }

    const imageDataUrl = selectedImageFile
      ? await readFileAsDataUrl(selectedImageFile)
      : undefined;
    const workspace = createCampaignWorkspace({
      brandName: input.brandName,
      channel: input.channel,
      copy: input.copy ?? "",
      imageDataUrl,
      imageFileName,
      industry: input.industry,
      name: input.name,
      publishDate: input.publishDate,
      targetAudience: input.targetAudience,
      usesSampleAsset,
    });

    saveCampaignWorkspace(workspace);
    setCreatedCampaignId(workspace.campaign.id);
    setAnalysisState("complete");
    await new Promise((resolve) => setTimeout(resolve, 250));
    router.push(`/campaigns/${workspace.campaign.id}/review`);
  });

  return (
    <form className="grid gap-6" onSubmit={onSubmit}>
      <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-soft)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium">데모 소재 빠른 시작</p>
          <p className="mt-1 text-sm leading-6 text-[var(--color-body)]">
            샘플 홍보 소재를 채운 뒤 AI 1차 검토 흐름을 바로 확인할 수 있습니다.
          </p>
        </div>
        <button
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[var(--color-hairline)] bg-white px-4 text-sm font-medium hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
          onClick={fillSampleAsset}
          type="button"
        >
          <Sparkles aria-hidden="true" size={16} strokeWidth={1.8} />
          샘플 소재 사용
        </button>
      </div>

      <div className="grid gap-4 rounded-xl border border-[var(--color-hairline)] bg-white p-6 md:grid-cols-2">
        <Field label="캠페인명" error={errors.name?.message}>
          <input
            className="h-11 w-full min-w-0 rounded-md border border-[var(--color-hairline)] px-3 text-sm outline-none focus:border-[var(--color-info-border)] focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
            placeholder="예: Summer launch visual…"
            {...register("name")}
          />
        </Field>
        <Field label="브랜드명" error={errors.brandName?.message}>
          <input
            className="h-11 w-full min-w-0 rounded-md border border-[var(--color-hairline)] px-3 text-sm outline-none focus:border-[var(--color-info-border)] focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
            placeholder="예: Northstar…"
            {...register("brandName")}
          />
        </Field>
        <Field label="게시 채널" error={errors.channel?.message}>
          <select
            className="h-11 w-full min-w-0 rounded-md border border-[var(--color-hairline)] bg-white px-3 text-sm outline-none focus:border-[var(--color-info-border)] focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
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
            className="h-11 w-full min-w-0 rounded-md border border-[var(--color-hairline)] px-3 text-sm outline-none focus:border-[var(--color-info-border)] focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
            type="date"
            {...register("publishDate")}
          />
        </Field>
        <Field label="타깃" error={errors.targetAudience?.message}>
          <input
            className="h-11 w-full min-w-0 rounded-md border border-[var(--color-hairline)] px-3 text-sm outline-none focus:border-[var(--color-info-border)] focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
            placeholder="예: 신규 고객, 멤버십 고객…"
            {...register("targetAudience")}
          />
        </Field>
        <Field label="업종" error={errors.industry?.message}>
          <input
            className="h-11 w-full min-w-0 rounded-md border border-[var(--color-hairline)] px-3 text-sm outline-none focus:border-[var(--color-info-border)] focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
            placeholder="예: cosmetics…"
            {...register("industry")}
          />
        </Field>
      </div>

      <div className="grid gap-4 rounded-xl border border-[var(--color-hairline)] bg-white p-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4">
          <Field label="광고 카피" error={errors.copy?.message}>
            <textarea
              className="min-h-36 w-full min-w-0 rounded-md border border-[var(--color-hairline)] px-3 py-3 text-sm leading-6 outline-none focus:border-[var(--color-info-border)] focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
              placeholder="검토할 광고 문구를 입력하세요…"
              {...register("copy")}
            />
          </Field>

          <Field
            label="이미지 파일"
            description="jpg, png, webp 파일을 지원합니다. mock 단계에서는 브라우저 미리보기만 사용합니다."
            error={errors.image?.message}
          >
            <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-hairline)] bg-[var(--color-surface-soft)] px-4 py-6 text-center hover:bg-white focus-within:ring-2 focus-within:ring-[var(--color-info-border)]">
              <Upload aria-hidden="true" size={22} strokeWidth={1.8} />
              <span className="mt-3 text-sm font-medium">이미지 선택</span>
              <span className="mt-1 text-xs text-[var(--color-muted)]">
                내부 검토용 소재로 취급됩니다.
              </span>
              <input
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                type="file"
                {...register("image", { onChange: handleImageChange })}
              />
            </label>
          </Field>
        </div>

        <AssetPreview
          imageFileName={imageFileName}
          imagePreviewUrl={imagePreviewUrl}
          usesSampleAsset={usesSampleAsset}
        />
      </div>

      <AnalysisProgress
        activeStep={activeAnalysisStep}
        createdCampaignId={createdCampaignId}
        state={analysisState}
      />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          className="min-h-12 w-full whitespace-nowrap rounded-xl border border-[var(--color-hairline)] px-5 text-sm font-medium hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)] sm:w-auto"
          type="button"
        >
          초안 저장
        </button>
        <button
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[var(--color-primary)] px-5 text-sm font-medium text-white hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          disabled={isSubmitting || analysisState === "running"}
          type="submit"
        >
          {isSubmitting || analysisState === "running" ? (
            <LoaderCircle
              aria-hidden="true"
              className="animate-spin"
              size={16}
              strokeWidth={1.8}
            />
          ) : null}
          AI 1차 검토 시작
        </button>
      </div>
    </form>
  );
}

function AssetPreview({
  imageFileName,
  imagePreviewUrl,
  usesSampleAsset,
}: {
  imageFileName: string;
  imagePreviewUrl: string | null;
  usesSampleAsset: boolean;
}) {
  return (
    <aside className="grid min-w-0 content-start gap-3">
      <p className="text-sm font-medium">소재 미리보기</p>
      <div
        className={cx(
          "relative aspect-[4/5] overflow-hidden rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-soft)]",
          imagePreviewUrl && "bg-cover bg-center",
        )}
        style={
          imagePreviewUrl
            ? { backgroundImage: `url(${imagePreviewUrl})` }
            : undefined
        }
      >
        {imagePreviewUrl ? (
          <div className="absolute inset-x-0 bottom-0 truncate bg-white/90 p-3 text-xs font-medium text-[var(--color-ink)]">
            {imageFileName}
          </div>
        ) : usesSampleAsset ? (
          <SampleVisual />
        ) : (
          <div className="grid h-full place-items-center p-6 text-center">
            <div>
              <FileImage
                aria-hidden="true"
                className="mx-auto text-[var(--color-muted)]"
                size={28}
                strokeWidth={1.8}
              />
              <p className="mt-3 text-sm font-medium">이미지 대기 중</p>
              <p className="mt-2 text-xs leading-5 text-[var(--color-muted)]">
                업로드한 소재 또는 샘플 소재가 여기에 표시됩니다.
              </p>
            </div>
          </div>
        )}
      </div>
      {imageFileName ? (
        <p className="truncate text-xs leading-5 text-[var(--color-muted)]">
          선택된 소재: {imageFileName}
        </p>
      ) : null}
    </aside>
  );
}

function SampleVisual() {
  return (
    <div className="relative h-full bg-[var(--color-signature-cream)] p-5">
      <div className="absolute right-6 top-8 size-28 rounded-full bg-[var(--color-signature-peach)]" />
      <div className="relative grid h-full content-between">
        <div>
          <p className="text-sm font-medium text-[var(--color-muted)]">
            Northstar
          </p>
          <h3 className="mt-5 text-4xl font-normal leading-tight">
            Summer calm,
            <br />
            reviewed first.
          </h3>
        </div>
        <div className="rounded-xl bg-white/85 p-4">
          <p className="text-sm leading-6 text-[var(--color-body)]">
            신제품 공개 전 이미지와 문구의 검토 후보를 확인하는 샘플 홍보
            소재입니다.
          </p>
        </div>
      </div>
    </div>
  );
}

function AnalysisProgress({
  activeStep,
  createdCampaignId,
  state,
}: {
  activeStep: number;
  createdCampaignId: string;
  state: AnalysisState;
}) {
  const reviewHref = createdCampaignId
    ? `/campaigns/${createdCampaignId}/review`
    : "/campaigns";

  return (
    <section className="rounded-xl border border-[var(--color-hairline)] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--color-muted)]">
            AI first-pass review
          </p>
          <h2 className="mt-2 text-xl font-normal">AI 1차 검토 진행</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">
            분석은 mock 데이터로 진행되며, 결과는 담당자 검토를 위한 후보로만
            표시됩니다.
          </p>
        </div>
        {state === "complete" ? (
          <Link
            className="hidden min-h-11 items-center justify-center whitespace-nowrap rounded-xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)] sm:inline-flex"
            href={reviewHref}
          >
            리뷰 화면 열기
          </Link>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-5">
        {analysisSteps.map((step, index) => {
          const isComplete = state === "complete" || index < activeStep;
          const isActive = state === "running" && index === activeStep;

          return (
            <article
              className={cx(
                "rounded-lg border border-[var(--color-hairline)] p-4",
                isActive && "border-[var(--color-info-border)] bg-[var(--color-info-bg)]",
                isComplete &&
                  "border-[var(--color-risk-low-text)] bg-[var(--color-risk-low-bg)]",
              )}
              key={step.title}
            >
              <div className="flex items-center gap-2">
                {isComplete ? (
                  <CheckCircle2
                    aria-hidden="true"
                    size={16}
                    strokeWidth={1.8}
                  />
                ) : isActive ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="animate-spin"
                    size={16}
                    strokeWidth={1.8}
                  />
                ) : (
                  <FileText aria-hidden="true" size={16} strokeWidth={1.8} />
                )}
                <p className="text-sm font-medium">{step.title}</p>
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--color-body)]">
                {step.description}
              </p>
            </article>
          );
        })}
      </div>

      {state === "complete" ? (
        <div className="mt-5 rounded-lg border border-[var(--color-risk-low-text)] bg-[var(--color-risk-low-bg)] p-4">
          <p className="text-sm font-medium text-[var(--color-risk-low-text)]">
            AI 1차 검토가 완료되었습니다.
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">
            mock 결과가 생성되었습니다. 이제 담당자가 이미지, 문구, AI 의견을
            다시 확인하고 의견을 남길 수 있습니다.
          </p>
          <Link
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center whitespace-nowrap rounded-xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)] sm:hidden"
            href={reviewHref}
          >
            리뷰 화면 열기
          </Link>
        </div>
      ) : null}
    </section>
  );
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Image preview could not be read."));
    });
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
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
    <div className="grid min-w-0 gap-2 text-sm font-medium text-[var(--color-ink)]">
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
    </div>
  );
}
