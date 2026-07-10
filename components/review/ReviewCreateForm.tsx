"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileImage, Loader2, Play, UploadCloud } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { AdaptiveSelect } from "@/components/ui/AdaptiveSelect";
import {
  defaultDictionaryId,
} from "@/features/policy/mock-terms";
import { getStoredPolicyTerms } from "@/features/policy/local-policy-store";
import {
  getContentTypeLabel,
  getReviewChannelLabel,
} from "@/features/policy/labels";
import {
  createReviewWorkspace,
  type ReviewImageInput,
} from "@/features/review/local-review-store";
import {
  reviewCreateSchema,
  type ReviewCreateInput,
} from "@/features/review/schema";
import type { Channel, ContentType } from "@/features/review/types";
import { extractImageTextWithTesseract } from "@/features/ocr/tesseract-client";

const contentTypes: ContentType[] = [
  "video_script",
  "ad_copy",
  "sns_caption",
  "web_banner",
  "image_only",
  "mixed",
];

const channels: Channel[] = [
  "instagram",
  "youtube",
  "tiktok",
  "web_banner",
  "push",
  "offline",
  "homepage",
  "newsletter",
];

const maxImageCount = 10;
const maxImageSizeBytes = 10 * 1024 * 1024;
const maxTotalImageSizeBytes = 30 * 1024 * 1024;

export function ReviewCreateForm() {
  const router = useRouter();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageError, setImageError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [policyTerms] = useState(() => getStoredPolicyTerms());
  const [progressLabel, setProgressLabel] = useState("");
  const [ocrProgress, setOcrProgress] = useState(0);
  const form = useForm<ReviewCreateInput>({
    defaultValues: {
      brandName: "노스스타",
      channel: "instagram",
      contentType: "video_script",
      dictionaryId: defaultDictionaryId,
      originalText:
        "이번 이벤트에 참여하면 누구나 무료 보장 혜택을 받을 수 있습니다.\n업계 1위 확정 이벤트라는 문구는 공개 전 근거를 확인해 주세요.",
      title: "",
    },
    resolver: zodResolver(reviewCreateSchema),
  });
  const originalText =
    useWatch({ control: form.control, name: "originalText" }) ?? "";
  const selectedContentType =
    useWatch({ control: form.control, name: "contentType" }) ?? "video_script";
  const selectedChannel =
    useWatch({ control: form.control, name: "channel" }) ?? "instagram";
  const canStart = useMemo(
    () => originalText.trim().length > 0 || imageFiles.length > 0,
    [imageFiles.length, originalText],
  );

  const handleImageChange = (files: FileList | null) => {
    const nextFiles = Array.from(files ?? []);
    const invalidFile = nextFiles.find(
      (file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type),
    );

    if (invalidFile) {
      setImageError("이미지는 jpg, png, webp 파일만 업로드할 수 있습니다.");
      setImageFiles([]);
      return;
    }

    if (nextFiles.length > maxImageCount) {
      setImageError(`이미지는 최대 ${maxImageCount}개까지 업로드할 수 있습니다.`);
      setImageFiles([]);
      return;
    }

    const oversizedFile = nextFiles.find(
      (file) => file.size > maxImageSizeBytes,
    );

    if (oversizedFile) {
      setImageError("이미지 한 개의 크기는 10MB 이하여야 합니다.");
      setImageFiles([]);
      return;
    }

    const totalSize = nextFiles.reduce((sum, file) => sum + file.size, 0);

    if (totalSize > maxTotalImageSizeBytes) {
      setImageError("이미지 전체 용량은 30MB 이하여야 합니다.");
      setImageFiles([]);
      return;
    }

    setImageError("");
    setSubmitError("");
    setImageFiles(nextFiles);
  };

  const setContentRequiredError = () => {
    form.setError("originalText", {
      message: "대본/문구를 입력하거나 이미지를 하나 이상 업로드하세요.",
      type: "manual",
    });
  };

  const handleSubmit = form.handleSubmit(
    async (input) => {
      if (!canStart) {
        setContentRequiredError();
        return;
      }

      setIsAnalyzing(true);
      setProgressLabel("콘텐츠 접수");
      setSubmitError("");

      try {
        await wait(250);
        setProgressLabel("대본/문구 문장 분리");
        await wait(250);
        setProgressLabel("브랜드 금지어 사전 매칭");

        const images = await Promise.all(
          imageFiles.map(async (file, index): Promise<ReviewImageInput> => {
            setProgressLabel(
              `이미지 OCR 문구 추출 ${index + 1}/${imageFiles.length}`,
            );
            const [dataUrl, ocrResult] = await Promise.all([
              readFileAsDataUrl(file),
              extractImageTextWithTesseract(file, {
                onProgress: (progress) => setOcrProgress(progress),
                timeoutMs: 30_000,
              }),
            ]);

            return {
              dataUrl,
              fileName: file.name,
              ocrResult,
            };
          }),
        );

        setProgressLabel("OCR 문구 정책 검사");
        await wait(250);
        setProgressLabel("검수 리포트 생성");

        const workspace = await createReviewWorkspace({
          images,
          input,
          reviewerName: "김민서",
        });

        router.push(`/reviews/${workspace.reviewJob.id}`);
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "검수 결과를 저장하지 못했습니다. 다시 시도해 주세요.",
        );
      } finally {
        setIsAnalyzing(false);
      }
    },
    () => {
      if (!canStart) {
        setContentRequiredError();
      }
    },
  );

  return (
    <form className="mx-auto grid w-full max-w-[1500px] gap-6 px-5 py-6 sm:px-6 lg:min-h-0 lg:flex-1 lg:px-8" onSubmit={handleSubmit}>
      <section className="grid min-h-0 gap-6 lg:h-full lg:grid-rows-[minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid min-h-0 gap-6 lg:grid-rows-[auto_minmax(0,1fr)]">
          <section className="app-panel p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="검수 제목" error={form.formState.errors.title?.message}>
                <input
                  className="app-input h-11 w-full px-3 text-sm"
                  placeholder="예: 여름 프로모션 대본 사전 검수"
                  {...form.register("title")}
                />
              </Field>
              <Field
                label="브랜드명"
                error={form.formState.errors.brandName?.message}
              >
                <input
                  className="app-input h-11 w-full px-3 text-sm"
                  {...form.register("brandName")}
                />
              </Field>
              <Field label="콘텐츠 유형">
                <AdaptiveSelect
                  label="콘텐츠 유형"
                  onValueChange={(value) =>
                    form.setValue("contentType", value as ContentType)
                  }
                  options={contentTypes.map((contentType) => ({
                    label: getContentTypeLabel(contentType),
                    value: contentType,
                  }))}
                  value={selectedContentType}
                />
              </Field>
              <Field label="채널">
                <AdaptiveSelect
                  label="채널"
                  onValueChange={(value) => form.setValue("channel", value as Channel)}
                  options={channels.map((channel) => ({
                    label: getReviewChannelLabel(channel),
                    value: channel,
                  }))}
                  value={selectedChannel}
                />
              </Field>
            </div>
          </section>

          <section className="app-panel flex min-h-0 flex-col p-5">
            <div className="flex shrink-0 flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--color-muted)]">
                  대본/문구 검사
                </p>
                <h2 className="mt-2 text-2xl font-normal">검수할 텍스트</h2>
              </div>
              <span className="rounded-full bg-[var(--color-surface-soft)] px-3 py-1 text-xs font-medium">
                {policyTerms.filter((term) => term.enabled).length}개 정책 적용
              </span>
            </div>
            <label className="mt-5 flex min-h-0 flex-1">
              <span className="sr-only">대본 또는 광고 문구</span>
              <textarea
                className="app-input min-h-72 w-full resize-y px-4 py-3 text-sm leading-6 lg:h-full lg:min-h-0"
                placeholder="영상 대본, 광고 문구, SNS 캡션을 붙여넣으세요."
                {...form.register("originalText")}
              />
            </label>
            {form.formState.errors.originalText?.message ? (
              <p className="mt-2 text-sm text-[var(--color-risk-high-text)]">
                {form.formState.errors.originalText.message}
              </p>
            ) : null}
          </section>
        </div>

        <aside className="grid min-h-0 gap-5 lg:h-full lg:grid-rows-[minmax(0,1fr)_auto_auto]">
          <ImageUploadPanel
            imageError={imageError}
            imageFiles={imageFiles}
            onImageChange={handleImageChange}
          />

          <section className="app-panel-muted p-5">
            <p className="text-sm font-semibold">AI 이미지 분석 미연결</p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">
              현재는 대본/문구 검사와 Tesseract.js OCR 기반 이미지 문구 검사가
              가능합니다. API Key를 연결하면 시각 요소 분석을 확장할 수 있습니다.
            </p>
          </section>

          <ReviewSubmitState
            isAnalyzing={isAnalyzing}
            ocrProgress={ocrProgress}
            progressLabel={progressLabel}
            submitError={submitError}
          />
        </aside>
      </section>
    </form>
  );
}

function ImageUploadPanel({
  imageError,
  imageFiles,
  onImageChange,
}: {
  imageError: string;
  imageFiles: File[];
  onImageChange: (files: FileList | null) => void;
}) {
  return (
    <section className="app-panel flex min-h-0 flex-col p-5">
      <p className="text-sm font-medium text-[var(--color-muted)]">
        이미지 OCR 검사
      </p>
      <h2 className="mt-2 text-2xl font-normal">이미지 업로드</h2>
      <label className="mt-5 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-hairline)] bg-[var(--color-surface-soft)] px-4 py-6 text-center hover:bg-[var(--color-surface-strong)] lg:min-h-28">
        <UploadCloud aria-hidden="true" size={24} strokeWidth={1.8} />
        <span className="mt-3 text-sm font-medium">이미지 선택</span>
        <span className="mt-1 text-xs text-[var(--color-muted)]">
          jpg, png, webp · 최대 10개 · 개별 10MB · 전체 30MB
        </span>
        <input
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          multiple
          onChange={(event) => onImageChange(event.target.files)}
          type="file"
        />
      </label>
      {imageError ? (
        <p className="mt-2 text-sm text-[var(--color-risk-high-text)]">
          {imageError}
        </p>
      ) : null}
      <div className="mt-4 grid min-h-0 flex-1 gap-2 overflow-y-auto">
        {imageFiles.length > 0 ? (
          imageFiles.map((file) => (
            <div
              className="flex min-w-0 items-center gap-3 rounded-lg border border-[var(--color-hairline)] px-3 py-2 text-sm"
              key={`${file.name}-${file.lastModified}`}
            >
              <FileImage
                aria-hidden="true"
                className="shrink-0 text-[var(--color-muted)]"
                size={16}
                strokeWidth={1.8}
              />
              <span className="truncate">{file.name}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-[var(--color-muted)]">
            이미지는 선택 사항입니다. 업로드하면 OCR로 이미지 속 문구를
            추출합니다.
          </p>
        )}
      </div>
    </section>
  );
}

function ReviewSubmitState({
  isAnalyzing,
  ocrProgress,
  progressLabel,
  submitError,
}: {
  isAnalyzing: boolean;
  ocrProgress: number;
  progressLabel: string;
  submitError: string;
}) {
  return (
    <>
      <button
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 text-sm font-medium text-[var(--color-on-primary)] hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)] disabled:cursor-not-allowed disabled:bg-[var(--color-primary-disabled)]"
        disabled={isAnalyzing}
        type="submit"
      >
        {isAnalyzing ? (
          <Loader2
            aria-hidden="true"
            className="animate-spin"
            size={16}
            strokeWidth={1.8}
          />
        ) : (
          <Play aria-hidden="true" size={16} strokeWidth={1.8} />
        )}
        콘텐츠 검수 시작
      </button>

      {submitError ? (
        <p
          className="text-sm leading-6 text-[var(--color-risk-high-text)]"
          role="alert"
        >
          {submitError}
        </p>
      ) : null}

      {isAnalyzing ? (
        <div className="app-panel p-4" role="status">
          <p className="text-sm font-medium">{progressLabel}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-surface-soft)]">
            <div
              className="h-full rounded-full bg-[var(--color-primary)] transition-all"
              style={{
                width: `${Math.max(12, Math.round(ocrProgress * 100))}%`,
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

function Field({
  children,
  error,
  label,
}: {
  children: ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <span className="mt-2 block">{children}</span>
      {error ? (
        <span className="mt-2 block text-sm text-[var(--color-risk-high-text)]">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result ?? "")));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
