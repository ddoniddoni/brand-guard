"use client";

import {
  CheckCircle2,
  FileImage,
  FileText,
  LoaderCircle,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getCurrentUserServerSnapshot,
  getCurrentUserSnapshot,
  subscribeCurrentUser,
} from "@/features/auth/mock-users";
import {
  campaignCreateSchema,
  type CampaignCreateInput,
} from "@/features/campaign/schema";
import {
  extractImageTextWithTesseract,
  type OcrExtractionResult,
} from "@/features/risk-analysis/ocr";
import {
  createDraftCampaignWorkspace,
  createCampaignWorkspace,
  saveCampaignWorkspace,
} from "@/features/campaign/local-workspace";
import { AdaptiveSelect } from "@/components/ui/AdaptiveSelect";
import { DatePicker } from "@/components/ui/DatePicker";
import { cx } from "@/lib/utils";

const channels = [
  { value: "instagram", label: "인스타그램" },
  { value: "youtube", label: "유튜브" },
  { value: "tiktok", label: "틱톡" },
  { value: "web_banner", label: "웹 배너" },
  { value: "push", label: "푸시" },
  { value: "offline", label: "오프라인" },
] as const;

const channelSelectOptions = channels.map((channel) => ({
  label: channel.label,
  value: channel.value,
}));

const analysisSteps = [
  {
    title: "소재 보안 처리",
    description: "업로드된 이미지와 문구를 내부 검토용 자산으로 준비합니다.",
  },
  {
    title: "이미지 OCR 준비",
    description: "업로드 이미지를 OCR 처리할 수 있는 내부 검토 자산으로 준비합니다.",
  },
  {
    title: "OCR 문구 후보 추출",
    description: "Tesseract.js로 이미지 안의 한글/영문 문구 후보를 추출합니다.",
  },
  {
    title: "검토 기준 후보 정리",
    description: "게시일, 채널, 타깃 맥락을 바탕으로 확인할 후보를 정리합니다.",
  },
  {
    title: "작성자 검토용 요약 생성",
    description: "근거, 오탐 가능성, 수정 제안을 작성자 검토 화면에 전달합니다.",
  },
];

type AnalysisState = "idle" | "running" | "complete";

export function CampaignCreateForm() {
  const router = useRouter();
  const currentUser = useSyncExternalStore(
    subscribeCurrentUser,
    getCurrentUserSnapshot,
    getCurrentUserServerSnapshot,
  );
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [activeAnalysisStep, setActiveAnalysisStep] = useState(0);
  const [createdCampaignId, setCreatedCampaignId] = useState("");
  const [draftCampaignId, setDraftCampaignId] = useState("");
  const [draftSavedAt, setDraftSavedAt] = useState("");
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState<OcrExtractionResult | null>(null);
  const {
    formState: { errors, isSubmitting },
    control,
    getValues,
    handleSubmit,
    register,
  } = useForm<CampaignCreateInput>({
    resolver: zodResolver(campaignCreateSchema),
    defaultValues: {
      brandName: "",
      channel: "instagram",
      copy: "",
      industry: "",
      name: "",
      publishDate: "",
      targetAudience: "",
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
    setCreatedCampaignId("");
    setAnalysisState("idle");
    setDraftSavedAt("");
    setOcrProgress(0);
    setOcrResult(null);
  };

  const handleDraftSave = async () => {
    setIsDraftSaving(true);

    try {
      const values = getValues();
      const imageDataUrl = selectedImageFile
        ? await readFileAsDataUrl(selectedImageFile)
        : undefined;
      const workspace = createDraftCampaignWorkspace({
        brandName: values.brandName,
        campaignId: draftCampaignId,
        channel: values.channel,
        copy: values.copy ?? "",
        imageDataUrl,
        imageFileName,
        industry: values.industry,
        name: values.name,
        publishDate: values.publishDate,
        requesterName: currentUser.name,
        targetAudience: values.targetAudience,
      });

      saveCampaignWorkspace(workspace);
      setDraftCampaignId(workspace.campaign.id);
      setDraftSavedAt(new Date().toISOString());
    } finally {
      setIsDraftSaving(false);
    }
  };

  const onSubmit = handleSubmit(async (input) => {
    setAnalysisState("running");
    setActiveAnalysisStep(0);
    setCreatedCampaignId("");
    setOcrProgress(0);
    setOcrResult(null);

    for (let index = 0; index < 2; index += 1) {
      setActiveAnalysisStep(index);
      await new Promise((resolve) => setTimeout(resolve, 420));
    }

    let nextOcrResult: OcrExtractionResult | undefined;

    if (selectedImageFile) {
      setActiveAnalysisStep(2);
      nextOcrResult = await extractImageTextWithTesseract(selectedImageFile, {
        onProgress: setOcrProgress,
      });
      setOcrResult(nextOcrResult);
    }

    for (let index = 3; index < analysisSteps.length; index += 1) {
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
      ocrResult: nextOcrResult,
      publishDate: input.publishDate,
      requesterName: currentUser.name,
      targetAudience: input.targetAudience,
      usesSampleAsset: false,
    });

    saveCampaignWorkspace(workspace);
    setCreatedCampaignId(workspace.campaign.id);
    setAnalysisState("complete");
    await new Promise((resolve) => setTimeout(resolve, 250));
    router.push(`/campaigns/${workspace.campaign.id}/review`);
  });

  return (
    <form className="grid gap-5" onSubmit={onSubmit}>
      <div className="app-panel flex min-w-0 flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--color-muted)]">
          작성자{" "}
          <span className="font-medium text-[var(--color-ink)]">
            {currentUser.name}
          </span>
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <button
            className="min-h-11 w-full whitespace-nowrap rounded-lg border border-[var(--color-hairline)] bg-[var(--color-panel)] px-4 text-sm font-medium hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)] sm:w-auto"
            disabled={isDraftSaving || analysisState === "running"}
            onClick={handleDraftSave}
            type="button"
          >
            {isDraftSaving ? "저장 중..." : "초안 저장"}
          </button>
          <button
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
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
      </div>

      {draftSavedAt ? (
        <div className="flex min-w-0 flex-col gap-2 rounded-lg border border-[var(--color-risk-low-text)] bg-[var(--color-risk-low-bg)] p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="leading-6 text-[var(--color-body)]">
            초안이 저장되었습니다. 내 요청 목록에서 이어서 확인할 수 있습니다.
          </p>
          <Link
            className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-lg bg-[var(--color-panel)] px-3 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
            href="/campaigns?status=DRAFT"
          >
            내 요청에서 보기
          </Link>
        </div>
      ) : null}

      <div className="app-panel grid gap-4 p-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <SectionTitle title="기본 정보" />
        </div>
        <Field
          fieldId="campaign-name"
          label="검토 요청명"
          error={errors.name?.message}
        >
          <input
            className="app-input h-11 w-full min-w-0 px-3 text-sm focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
            id="campaign-name"
            placeholder="예: 여름 신제품 메인 비주얼…"
            {...register("name")}
          />
        </Field>
        <Field
          fieldId="campaign-brand-name"
          label="브랜드명"
          error={errors.brandName?.message}
        >
          <input
            className="app-input h-11 w-full min-w-0 px-3 text-sm focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
            id="campaign-brand-name"
            placeholder="예: 노스스타…"
            {...register("brandName")}
          />
        </Field>
        <Field label="게시 채널" error={errors.channel?.message}>
          <Controller
            control={control}
            name="channel"
            render={({ field }) => (
              <AdaptiveSelect
                label="게시 채널"
                onValueChange={field.onChange}
                options={channelSelectOptions}
                value={field.value}
              />
            )}
          />
        </Field>
        <Field
          fieldId="campaign-publish-date"
          label="게시 예정일"
          error={errors.publishDate?.message}
        >
          <Controller
            control={control}
            name="publishDate"
            render={({ field }) => (
              <DatePicker
                id="campaign-publish-date"
                label="게시 예정일"
                name={field.name}
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value ?? ""}
              />
            )}
          />
        </Field>
        <Field
          fieldId="campaign-target-audience"
          label="타깃"
          error={errors.targetAudience?.message}
        >
          <input
            className="app-input h-11 w-full min-w-0 px-3 text-sm focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
            id="campaign-target-audience"
            placeholder="예: 신규 고객, 멤버십 고객…"
            {...register("targetAudience")}
          />
        </Field>
        <Field
          fieldId="campaign-industry"
          label="업종"
          error={errors.industry?.message}
        >
          <input
            className="app-input h-11 w-full min-w-0 px-3 text-sm focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
            id="campaign-industry"
            placeholder="예: 화장품…"
            {...register("industry")}
          />
        </Field>
      </div>

      <div className="app-panel grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4">
          <div>
            <SectionTitle title="검토 소재" />
          </div>
          <Field
            fieldId="campaign-copy"
            label="광고 카피"
            error={errors.copy?.message}
          >
            <textarea
              className="app-input min-h-36 w-full min-w-0 px-3 py-3 text-sm leading-6 focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
              id="campaign-copy"
              placeholder="검토할 광고 문구를 입력하세요…"
              {...register("copy")}
            />
          </Field>

          <Field
            fieldId="campaign-image"
            label="이미지 파일"
            description="jpg, png, webp 파일을 지원합니다."
            error={errors.image?.message}
          >
            <label
              className="relative flex min-h-32 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-[var(--color-hairline)] bg-[var(--color-surface-soft)] px-4 py-6 text-center transition-colors hover:border-[var(--color-info-border)] hover:bg-[var(--color-info-bg)] focus-within:ring-2 focus-within:ring-[var(--color-info-border)]"
              htmlFor="campaign-image"
            >
              <Upload aria-hidden="true" size={22} strokeWidth={1.8} />
              <span className="mt-3 text-sm font-medium">이미지 선택</span>
              <span className="mt-1 text-xs text-[var(--color-muted)]">
                내부 검토용 소재로 취급됩니다.
              </span>
              <input
                accept="image/jpeg,image/png,image/webp"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                id="campaign-image"
                type="file"
                {...register("image", { onChange: handleImageChange })}
              />
            </label>
          </Field>
        </div>

        <AssetPreview
          imageFileName={imageFileName}
          imagePreviewUrl={imagePreviewUrl}
        />
      </div>

      {analysisState !== "idle" ? (
        <AnalysisProgress
          activeStep={activeAnalysisStep}
          createdCampaignId={createdCampaignId}
          ocrProgress={ocrProgress}
          ocrResult={ocrResult}
          state={analysisState}
        />
      ) : null}
    </form>
  );
}

function AssetPreview({
  imageFileName,
  imagePreviewUrl,
}: {
  imageFileName: string;
  imagePreviewUrl: string | null;
}) {
  return (
    <aside className="grid min-w-0 content-start gap-3">
      <p className="text-sm font-semibold">소재 미리보기</p>
      <div
        className={cx(
          "app-panel-muted relative aspect-[16/10] overflow-hidden xl:aspect-[4/3]",
          imagePreviewUrl && "bg-cover bg-center",
        )}
        style={
          imagePreviewUrl
            ? { backgroundImage: `url(${imagePreviewUrl})` }
            : undefined
        }
      >
        {imagePreviewUrl ? (
          <div className="absolute inset-x-0 bottom-0 truncate border-t border-[var(--color-hairline)] bg-[var(--color-panel)]/95 p-3 text-xs font-medium text-[var(--color-ink)]">
            {imageFileName}
          </div>
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
                업로드한 이미지가 여기에 표시됩니다.
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

function AnalysisProgress({
  activeStep,
  createdCampaignId,
  ocrProgress,
  ocrResult,
  state,
}: {
  activeStep: number;
  createdCampaignId: string;
  ocrProgress: number;
  ocrResult: OcrExtractionResult | null;
  state: AnalysisState;
}) {
  const reviewHref = createdCampaignId
    ? `/campaigns/${createdCampaignId}/review`
    : "/campaigns";

  return (
    <section className="app-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--color-muted)]">
            AI 1차 검토
          </p>
          <h2 className="mt-2 text-xl font-normal">AI 1차 검토 진행</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">
            결과는 작성자와 결재자 검토를 위한 후보로만 표시됩니다.
          </p>
        </div>
        {state === "complete" ? (
          <Link
            className="hidden min-h-11 items-center justify-center whitespace-nowrap rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)] sm:inline-flex"
            href={reviewHref}
          >
            리뷰 화면 열기
          </Link>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
        {analysisSteps.map((step, index) => {
          const isComplete = state === "complete" || index < activeStep;
          const isActive = state === "running" && index === activeStep;

          return (
            <article
              className={cx(
                "min-w-0 rounded-lg border border-[var(--color-hairline)] p-4",
                isActive && "border-[var(--color-info-border)] bg-[var(--color-info-bg)]",
                isComplete &&
                  "border-[var(--color-risk-low-text)] bg-[var(--color-risk-low-bg)]",
              )}
              key={step.title}
            >
              <div className="flex min-w-0 items-start gap-2">
                {isComplete ? (
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 shrink-0"
                    size={16}
                    strokeWidth={1.8}
                  />
                ) : isActive ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 animate-spin"
                    size={16}
                    strokeWidth={1.8}
                  />
                ) : (
                  <FileText
                    aria-hidden="true"
                    className="mt-0.5 shrink-0"
                    size={16}
                    strokeWidth={1.8}
                  />
                )}
                <p className="min-w-0 text-sm font-medium leading-6">
                  {step.title}
                </p>
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--color-body)]">
                {index === 2 && state === "running" && !isComplete
                  ? `OCR 진행률 ${Math.round(ocrProgress * 100)}%`
                  : step.description}
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
            검토 결과가 생성되었습니다. 이제 작성자가 이미지, 문구, AI 의견을 다시
            확인하고 결재 상신 의견을 남길 수 있습니다.
          </p>
          {ocrResult ? (
            <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">
              OCR 결과:{" "}
              {ocrResult.status === "succeeded"
                ? `이미지 문구 ${ocrResult.text.split(/\s+/).filter(Boolean).length}개 단어 후보가 추출되었습니다.`
                : ocrResult.errorMessage ??
                  "이미지에서 의미 있는 OCR 문구 후보가 추출되지 않았습니다."}
            </p>
          ) : null}
          <Link
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center whitespace-nowrap rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)] sm:hidden"
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

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-5 w-1 rounded-full bg-[var(--color-surface-dark)]" />
      <h2 className="text-base font-semibold text-[var(--color-ink)]">
        {title}
      </h2>
    </div>
  );
}

function Field({
  children,
  description,
  error,
  fieldId,
  label,
}: {
  children: React.ReactNode;
  description?: string;
  error?: string;
  fieldId?: string;
  label: string;
}) {
  return (
    <div className="grid min-w-0 gap-2 text-sm font-medium text-[var(--color-ink)]">
      {fieldId ? <label htmlFor={fieldId}>{label}</label> : <span>{label}</span>}
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
