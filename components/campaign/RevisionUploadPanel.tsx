"use client";

import { CheckCircle2, FileImage, LoaderCircle, Upload } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { CampaignStatus } from "@/features/campaign/types";
import type {
  CampaignAsset,
  RevisionUploadInput,
} from "@/features/campaign/local-workspace";

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const maxImageSize = 2 * 1024 * 1024;

export function RevisionUploadPanel({
  asset,
  canUpload = true,
  campaignId,
  hasVersionComparison = false,
  onRevisionSubmit,
  status,
}: {
  asset: CampaignAsset;
  canUpload?: boolean;
  campaignId: string;
  hasVersionComparison?: boolean;
  onRevisionSubmit?: (input: RevisionUploadInput) => void;
  status: CampaignStatus;
}) {
  const [copyDraft, setCopyDraft] = useState(asset.copy);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const isEnabled = status === "NEEDS_REVISION" && canUpload;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;

    setFileError("");

    if (!nextFile) {
      setFile(null);
      return;
    }

    if (!allowedImageTypes.includes(nextFile.type)) {
      setFile(null);
      setFileError("jpg, png, webp 이미지만 업로드할 수 있습니다.");
      return;
    }

    if (nextFile.size > maxImageSize) {
      setFile(null);
      setFileError("이미지 파일은 2MB 이하로 업로드하세요.");
      return;
    }

    setFile(nextFile);
  };

  const handleSubmit = async () => {
    if (!isEnabled || !onRevisionSubmit) {
      return;
    }

    setIsAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 700));

    onRevisionSubmit({
      copy: copyDraft,
      imageDataUrl: file ? await readFileAsDataUrl(file) : undefined,
      imageFileName: file?.name,
    });
    setIsAnalyzing(false);
    setIsComplete(true);
  };

  return (
    <section className="rounded-xl border border-[var(--color-hairline)] bg-white">
      <div className="border-b border-[var(--color-hairline)] p-5">
        <p className="text-sm font-medium text-[var(--color-muted)]">
          수정본 업로드
        </p>
        <h2 className="mt-2 text-xl font-normal">수정 버전 업로드</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">
          수정 요청 상태에서 2차 소재를 올리면 모의 AI 재분석 후 버전 비교가
          생성됩니다.
        </p>
      </div>

      <div className="grid gap-4 p-4">
        {status !== "NEEDS_REVISION" ? (
          <div className="rounded-lg bg-[var(--color-surface-soft)] p-4 text-sm leading-6 text-[var(--color-body)]">
            먼저 검토 액션에서 `수정 요청`을 선택하면 2차 업로드를 진행할 수
            있습니다.
          </div>
        ) : null}
        {status === "NEEDS_REVISION" && !canUpload ? (
          <div className="rounded-lg bg-[var(--color-surface-soft)] p-4 text-sm leading-6 text-[var(--color-body)]">
            이 요청의 작성자만 수정본을 업로드할 수 있습니다.
          </div>
        ) : null}

        <label className="grid min-w-0 gap-2 text-sm font-medium">
          수정 문구
          <textarea
            className="min-h-28 w-full min-w-0 rounded-md border border-[var(--color-hairline)] px-3 py-3 text-sm leading-6 outline-none focus:border-[var(--color-info-border)] focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)] disabled:bg-[var(--color-surface-soft)]"
            disabled={!isEnabled || isAnalyzing}
            onChange={(event) => setCopyDraft(event.target.value)}
            value={copyDraft}
          />
        </label>

        <label className="grid min-w-0 gap-2 text-sm font-medium">
          수정 이미지
          <span className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-hairline)] bg-[var(--color-surface-soft)] px-4 py-5 text-center hover:border-[var(--color-info-border)] focus-within:ring-2 focus-within:ring-[var(--color-info-border)]">
            {file ? (
              <CheckCircle2 aria-hidden="true" size={22} strokeWidth={1.8} />
            ) : (
              <Upload aria-hidden="true" size={22} strokeWidth={1.8} />
            )}
            <span className="mt-3 max-w-full truncate text-sm font-medium">
              {file ? file.name : "대체 이미지 선택"}
            </span>
            <span className="mt-1 text-xs text-[var(--color-muted)]">
              선택하지 않으면 기존 이미지를 유지합니다.
            </span>
            <input
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={!isEnabled || isAnalyzing}
              onChange={handleFileChange}
              type="file"
            />
          </span>
          {fileError ? (
            <span className="text-xs font-normal text-[var(--color-risk-high-text)]">
              {fileError}
            </span>
          ) : null}
        </label>

        <div className="rounded-lg bg-[var(--color-surface-soft)] p-4">
          <div className="flex items-start gap-3">
            <FileImage
              aria-hidden="true"
              className="mt-0.5 shrink-0"
              size={18}
              strokeWidth={1.8}
            />
            <p className="min-w-0 break-words text-sm leading-6 text-[var(--color-body)]">
              현재 이미지: {asset.imageFileName ?? "샘플 또는 모의 이미지"}
            </p>
          </div>
        </div>

        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!isEnabled || isAnalyzing || Boolean(fileError)}
          onClick={handleSubmit}
          type="button"
        >
          {isAnalyzing ? (
            <LoaderCircle
              aria-hidden="true"
              className="animate-spin"
              size={16}
              strokeWidth={1.8}
            />
          ) : null}
          2차 재분석
        </button>

        {isComplete || hasVersionComparison ? (
          <Link
            className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-xl border border-[var(--color-hairline)] px-4 text-sm font-medium hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
            href={`/campaigns/${campaignId}/versions`}
          >
            버전 비교 보기
          </Link>
        ) : null}
      </div>
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
