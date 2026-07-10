"use client";

import {
  AlertTriangle,
  Clock3,
  Download,
  FileText,
  Image as ImageIcon,
  ListFilter,
  Loader2,
  RotateCcw,
  Save,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useReducer } from "react";
import { ReviewStatusBadge } from "@/components/review/ReviewStatusBadge";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import {
  getFindingSourceLabel,
  getPolicyCategoryLabel,
  getSeverityLabel,
} from "@/features/policy/labels";
import type {
  FindingSource,
  PolicyFinding,
  Severity,
  TextSegment,
} from "@/features/policy/types";
import { getReviewEventLabel } from "@/features/review/labels";
import {
  getStoredReviewWorkspace,
  retryReviewWorkspace,
  saveReviewReport,
} from "@/features/review/local-review-store";
import { downloadReviewReport } from "@/features/review/report-export";
import { getLatestReviewFailure } from "@/features/review/state-machine";
import type {
  OcrResult,
  ReviewStatusEvent,
  ReviewWorkspace,
} from "@/features/review/types";
import { formatDate } from "@/lib/format";
import { cx } from "@/lib/utils";

const sourceFilters: Array<"all" | FindingSource> = [
  "all",
  "pasted_text",
  "image_ocr",
  "vision_ai",
];

const severityFilters: Array<"all" | Severity> = [
  "all",
  "critical",
  "high",
  "medium",
  "low",
];

type ReviewResultState = {
  isRetrying: boolean;
  memo: string;
  retryProgressLabel: string;
  selectedFindingId: string;
  selectedImageId: string;
  selectedRegionId: string;
  severityFilter: "all" | Severity;
  sourceFilter: "all" | FindingSource;
  storageError: string;
  workspace: ReviewWorkspace | null;
};

type ReviewResultAction =
  | { type: "hydrate"; workspace: ReviewWorkspace | null }
  | { type: "selectFinding"; finding: PolicyFinding }
  | {
      type: "selectImage";
      findingId: string;
      imageId: string;
      regionId: string;
    }
  | {
      type: "selectRegion";
      findingId: string;
      imageId: string;
      regionId: string;
    }
  | { type: "setMemo"; memo: string }
  | { type: "setSeverityFilter"; value: "all" | Severity }
  | { type: "setSourceFilter"; value: "all" | FindingSource }
  | { type: "retryProgress"; label: string }
  | { type: "retryStarted" }
  | { type: "storageFailed"; message: string }
  | { type: "workspaceSaved"; workspace: ReviewWorkspace };

const initialReviewResultState: ReviewResultState = {
  isRetrying: false,
  memo: "",
  retryProgressLabel: "",
  selectedFindingId: "",
  selectedImageId: "",
  selectedRegionId: "",
  severityFilter: "all",
  sourceFilter: "all",
  storageError: "",
  workspace: null,
};

function reviewResultReducer(
  state: ReviewResultState,
  action: ReviewResultAction,
): ReviewResultState {
  if (action.type === "hydrate") {
    const firstOcrFinding = action.workspace?.findings.find(
      (finding) => finding.source === "image_ocr",
    );
    const firstOcrResult = action.workspace?.ocrResults[0];

    return {
      ...initialReviewResultState,
      memo: action.workspace?.report?.reviewerMemo ?? "",
      selectedFindingId: action.workspace?.findings[0]?.id ?? "",
      selectedImageId:
        firstOcrFinding?.imageId ?? firstOcrResult?.imageId ?? "",
      selectedRegionId:
        firstOcrFinding?.regionId ?? firstOcrResult?.regions[0]?.id ?? "",
      storageError: "",
      workspace: action.workspace,
    };
  }

  if (action.type === "selectFinding") {
    const isOcrFinding =
      action.finding.source === "image_ocr" && action.finding.imageId;

    return {
      ...state,
      selectedFindingId: action.finding.id,
      selectedImageId: isOcrFinding
        ? (action.finding.imageId ?? "")
        : state.selectedImageId,
      selectedRegionId: isOcrFinding
        ? (action.finding.regionId ?? "")
        : state.selectedRegionId,
    };
  }

  if (action.type === "selectImage" || action.type === "selectRegion") {
    return {
      ...state,
      selectedFindingId: action.findingId,
      selectedImageId: action.imageId,
      selectedRegionId: action.regionId,
      severityFilter: action.findingId ? "all" : state.severityFilter,
      sourceFilter: action.findingId ? "image_ocr" : state.sourceFilter,
    };
  }

  if (action.type === "setMemo") {
    return { ...state, memo: action.memo };
  }

  if (action.type === "setSeverityFilter") {
    return { ...state, severityFilter: action.value };
  }

  if (action.type === "setSourceFilter") {
    return { ...state, sourceFilter: action.value };
  }

  if (action.type === "retryStarted") {
    return {
      ...state,
      isRetrying: true,
      retryProgressLabel: "이미지 OCR 재시도를 준비하고 있습니다.",
      storageError: "",
    };
  }

  if (action.type === "retryProgress") {
    return { ...state, retryProgressLabel: action.label };
  }

  if (action.type === "storageFailed") {
    return { ...state, isRetrying: false, storageError: action.message };
  }

  return {
    ...state,
    isRetrying: false,
    retryProgressLabel: "",
    storageError: "",
    workspace: action.workspace,
  };
}

export function ReviewResultClient({ reviewId }: { reviewId: string }) {
  const [state, dispatch] = useReducer(
    reviewResultReducer,
    initialReviewResultState,
  );
  const {
    isRetrying,
    memo,
    retryProgressLabel,
    selectedFindingId,
    selectedImageId,
    selectedRegionId,
    severityFilter,
    sourceFilter,
    storageError,
    workspace,
  } = state;

  useEffect(() => {
    let cancelled = false;

    void getStoredReviewWorkspace(reviewId)
      .then((nextWorkspace) => {
        if (!cancelled) {
          dispatch({ type: "hydrate", workspace: nextWorkspace ?? null });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          dispatch({
            message:
              error instanceof Error
                ? error.message
                : "저장된 검수 결과를 불러오지 못했습니다.",
            type: "storageFailed",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reviewId]);

  const filteredFindings = useMemo(() => {
    return (workspace?.findings ?? []).filter((finding) => {
      const sourceMatched =
        sourceFilter === "all" || finding.source === sourceFilter;
      const severityMatched =
        severityFilter === "all" || finding.severity === severityFilter;

      return sourceMatched && severityMatched;
    });
  }, [severityFilter, sourceFilter, workspace?.findings]);
  const pastedTextSegments = useMemo(
    () =>
      (workspace?.segments ?? []).filter(
        (segment) => segment.source === "pasted_text",
      ),
    [workspace?.segments],
  );
  const selectedFinding =
    filteredFindings.find((finding) => finding.id === selectedFindingId) ?? null;

  if (!workspace) {
    return <MissingReviewState storageError={storageError} />;
  }

  const selectFinding = (findingId: string) => {
    const finding = workspace.findings.find((item) => item.id === findingId);

    if (finding) {
      dispatch({ finding, type: "selectFinding" });
    }
  };

  const selectOcrImage = (imageId: string) => {
    const result = workspace.ocrResults.find((item) => item.imageId === imageId);
    const firstRegionId = result?.regions[0]?.id ?? "";
    const firstFinding = workspace.findings.find(
      (finding) =>
        finding.source === "image_ocr" &&
        finding.imageId === imageId &&
        (!firstRegionId || finding.regionId === firstRegionId),
    );

    dispatch({
      findingId: firstFinding?.id ?? "",
      imageId,
      regionId: firstRegionId,
      type: "selectImage",
    });
  };

  const selectOcrRegion = (imageId: string, regionId: string) => {
    const finding = workspace.findings.find(
      (item) =>
        item.source === "image_ocr" &&
        item.imageId === imageId &&
        item.regionId === regionId,
    );

    dispatch({
      findingId: finding?.id ?? "",
      imageId,
      regionId,
      type: "selectRegion",
    });
  };

  const retryReview = async () => {
    dispatch({ type: "retryStarted" });

    try {
      const nextWorkspace = await retryReviewWorkspace(
        workspace.reviewJob.id,
        {
          onProgress: ({ label, progress }) =>
            dispatch({
              label: `${label} · ${Math.round(progress * 100)}%`,
              type: "retryProgress",
            }),
        },
      );
      dispatch({ type: "hydrate", workspace: nextWorkspace });
    } catch (error) {
      dispatch({
        message:
          error instanceof Error
            ? error.message
            : "이미지 OCR 재시도를 완료하지 못했습니다.",
        type: "storageFailed",
      });
    }
  };

  const latestFailure = getLatestReviewFailure(workspace);
  const isAnalysisBlocked = ["ANALYZING", "FAILED"].includes(
    workspace.reviewJob.status,
  );

  return (
    <div className="mx-auto grid w-full max-w-[1500px] gap-5 px-5 py-6 sm:px-6 lg:px-8">
      <ReportHeader workspace={workspace} />

      {isAnalysisBlocked ? (
        <ReviewStatusPanel
          failureMessage={latestFailure?.message}
          isRetrying={isRetrying}
          onRetry={retryReview}
          progressLabel={retryProgressLabel}
          status={workspace.reviewJob.status}
          storageError={storageError}
        />
      ) : (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
          <main className="grid min-w-0 gap-5">
            <TextEvidencePanel
              findings={workspace.findings}
              onSelectFinding={selectFinding}
              segments={pastedTextSegments}
              selectedFindingId={selectedFinding?.id ?? ""}
            />

            <OcrEvidencePanel
              ocrResults={workspace.ocrResults}
              onSelectImage={selectOcrImage}
              onSelectRegion={selectOcrRegion}
              selectedImageId={selectedImageId}
              selectedRegionId={selectedRegionId}
            />
          </main>

          <aside className="grid h-fit gap-4 xl:sticky xl:top-6">
            <FindingInspector
              filteredFindings={filteredFindings}
              onSelectFinding={selectFinding}
              selectedFinding={selectedFinding}
              setSeverityFilter={(value) =>
                dispatch({ type: "setSeverityFilter", value })
              }
              setSourceFilter={(value) =>
                dispatch({ type: "setSourceFilter", value })
              }
              severityFilter={severityFilter}
              sourceFilter={sourceFilter}
            />

            <ReportMemoPanel
              memo={memo}
              onMemoChange={(value) =>
                dispatch({ memo: value, type: "setMemo" })
              }
              onExport={() => {
                try {
                  downloadReviewReport(workspace);
                } catch (error) {
                  dispatch({
                    message:
                      error instanceof Error
                        ? error.message
                        : "검수 리포트를 내보내지 못했습니다.",
                    type: "storageFailed",
                  });
                }
              }}
              onSave={async () => {
                try {
                  const nextWorkspace = await saveReviewReport(
                    workspace.reviewJob.id,
                    memo,
                  );
                  if (nextWorkspace) {
                    dispatch({
                      type: "workspaceSaved",
                      workspace: nextWorkspace,
                    });
                  }
                } catch (error) {
                  dispatch({
                    message:
                      error instanceof Error
                        ? error.message
                        : "검수 리포트를 저장하지 못했습니다.",
                    type: "storageFailed",
                  });
                }
              }}
              saved={Boolean(workspace.report)}
              storageError={storageError}
            />
          </aside>
        </section>
      )}

      <ReviewEventTimeline events={workspace.events ?? []} />
    </div>
  );
}

function MissingReviewState({ storageError }: { storageError: string }) {
  return (
    <div className="mx-auto grid w-full max-w-[1100px] gap-4 px-5 py-12 sm:px-6 lg:px-8">
      <section className="app-panel p-8">
        <p className="text-sm font-medium text-[var(--color-muted)]">
          검수 결과
        </p>
        <h2 className="mt-2 text-2xl font-normal">검수 리포트를 찾을 수 없습니다</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--color-body)]">
          {storageError ||
            "브라우저 저장소에 해당 검수 결과가 없습니다. 새 콘텐츠 검수를 다시 시작해 주세요."}
        </p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-on-primary)]"
          href="/reviews/new"
        >
          콘텐츠 검수 시작
        </Link>
      </section>
    </div>
  );
}

function ReviewStatusPanel({
  failureMessage,
  isRetrying,
  onRetry,
  progressLabel,
  status,
  storageError,
}: {
  failureMessage?: string;
  isRetrying: boolean;
  onRetry: () => void;
  progressLabel: string;
  status: ReviewWorkspace["reviewJob"]["status"];
  storageError: string;
}) {
  const isAnalyzing = status === "ANALYZING" || isRetrying;

  return (
    <section className="app-panel p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-risk-high-bg)] text-[var(--color-risk-high-text)]">
          {isAnalyzing ? (
            <Loader2
              aria-hidden="true"
              className="animate-spin"
              size={20}
              strokeWidth={1.8}
            />
          ) : (
            <AlertTriangle aria-hidden="true" size={20} strokeWidth={1.8} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--color-muted)]">
            {isAnalyzing ? "콘텐츠 재분석" : "검수 처리 실패"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            {isAnalyzing
              ? "이미지 OCR 검수를 다시 진행하고 있습니다"
              : "이미지 OCR을 완료하지 못했습니다"}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-body)]">
            {isAnalyzing
              ? progressLabel || "저장된 이미지를 불러와 OCR을 다시 실행합니다."
              : failureMessage ||
                "업로드한 이미지의 문구를 추출하지 못했습니다. 이미지를 확인한 뒤 다시 시도해 주세요."}
          </p>

          {!isAnalyzing ? (
            <button
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 text-sm font-medium text-[var(--color-on-primary)] hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
              onClick={onRetry}
              type="button"
            >
              <RotateCcw aria-hidden="true" size={16} strokeWidth={1.8} />
              이미지 OCR 다시 시도
            </button>
          ) : null}

          {storageError ? (
            <p
              className="mt-4 text-sm text-[var(--color-risk-high-text)]"
              role="alert"
            >
              {storageError}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ReportHeader({ workspace }: { workspace: ReviewWorkspace }) {
  const highPriorityCount =
    workspace.severityCounts.critical + workspace.severityCounts.high;

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-panel)]">
      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex min-h-7 items-center rounded-full bg-[var(--color-surface-soft)] px-3 text-xs font-medium">
              {workspace.reviewJob.brandName}
            </span>
            <span className="text-xs text-[var(--color-muted)]">
              {formatDate(workspace.reviewJob.updatedAt)}
            </span>
            <ReviewStatusBadge status={workspace.reviewJob.status} />
          </div>
          <h2 className="mt-4 truncate text-3xl font-semibold leading-tight">
            {workspace.reviewJob.title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-body)]">
            {workspace.reviewJob.status === "FAILED"
              ? "이미지 OCR 처리 중 문제가 발생했습니다. 실패 원인을 확인하고 다시 시도할 수 있습니다."
              : "정책 사전 기준으로 검토 후보를 정리했습니다. 결과는 확정 판정이 아니며, 담당자가 실제 콘텐츠 맥락과 표현 의도를 확인해야 합니다."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
          <SummaryCell label="전체 후보" value={workspace.findings.length} />
          <SummaryCell label="우선 검토" value={highPriorityCount} />
          <SummaryCell
            label="텍스트"
            value={workspace.sourceCounts.pasted_text}
          />
          <SummaryCell label="OCR" value={workspace.sourceCounts.image_ocr} />
        </div>
      </div>
    </section>
  );
}

function SummaryCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-soft)] px-4 py-3">
      <p className="text-xs font-medium text-[var(--color-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold leading-none tabular-nums">
        {value}
      </p>
    </div>
  );
}

function TextEvidencePanel({
  findings,
  onSelectFinding,
  segments,
  selectedFindingId,
}: {
  findings: PolicyFinding[];
  onSelectFinding: (findingId: string) => void;
  segments: TextSegment[];
  selectedFindingId: string;
}) {
  return (
    <section className="app-panel overflow-hidden">
      <PanelTitle
        countLabel={`${segments.length}개 문장`}
        icon={<FileText aria-hidden="true" size={18} strokeWidth={1.8} />}
        kicker="대본/문구 검사"
        title="원문 텍스트"
      />
      <div className="divide-y divide-[var(--color-hairline)]">
        {segments.length > 0 ? (
          segments.map((segment) => {
            const finding = findings.find(
              (item) =>
                item.source === "pasted_text" &&
                item.originalText === segment.text,
            );
            const isSelected = Boolean(finding && finding.id === selectedFindingId);

            return (
              <button
                className={cx(
                  "grid w-full min-w-0 grid-cols-[48px_minmax(0,1fr)] gap-3 px-5 py-4 text-left text-sm leading-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]",
                  isSelected
                    ? "bg-[var(--color-selected-row)]"
                    : "hover:bg-[var(--color-surface-soft)]",
                )}
                key={segment.id}
                onClick={() => finding && onSelectFinding(finding.id)}
                type="button"
              >
                <span className="pt-0.5 text-xs font-medium tabular-nums text-[var(--color-muted)]">
                  {segment.lineNumber ?? "-"}
                </span>
                <span className="min-w-0">
                  {finding ? (
                    <HighlightedText
                      matchedTerm={finding.matchedTerm}
                      text={segment.text}
                    />
                  ) : (
                    segment.text
                  )}
                  {finding ? (
                    <span className="mt-2 flex flex-wrap items-center gap-2">
                      <SeverityBadge severity={finding.severity} />
                      <span className="text-xs text-[var(--color-muted)]">
                        {getPolicyCategoryLabel(finding.category)}
                      </span>
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })
        ) : (
          <p className="p-5 text-sm text-[var(--color-muted)]">
            입력된 원문 텍스트가 없습니다.
          </p>
        )}
      </div>
    </section>
  );
}

function OcrEvidencePanel({
  ocrResults,
  onSelectImage,
  onSelectRegion,
  selectedImageId,
  selectedRegionId,
}: {
  ocrResults: OcrResult[];
  onSelectImage: (imageId: string) => void;
  onSelectRegion: (imageId: string, regionId: string) => void;
  selectedImageId: string;
  selectedRegionId: string;
}) {
  const ocrResult =
    ocrResults.find((result) => result.imageId === selectedImageId) ??
    ocrResults[0];
  const selectedRegion = ocrResult?.regions.find(
    (region) => region.id === selectedRegionId,
  );

  return (
    <section className="app-panel overflow-hidden">
      <PanelTitle
        countLabel={ocrResults.length > 0 ? `${ocrResults.length}개 이미지` : "이미지 없음"}
        icon={<ImageIcon aria-hidden="true" size={18} strokeWidth={1.8} />}
        kicker="이미지 OCR 검사"
        title="OCR 문구와 위치"
      />

      {ocrResult ? (
        <>
          {ocrResults.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto border-b border-[var(--color-hairline)] p-4">
              {ocrResults.map((result, index) => (
                <button
                  aria-pressed={result.imageId === ocrResult.imageId}
                  className={cx(
                    "flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-medium",
                    result.imageId === ocrResult.imageId
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                      : "border-[var(--color-hairline)] hover:bg-[var(--color-surface-soft)]",
                  )}
                  key={result.imageId}
                  onClick={() => onSelectImage(result.imageId)}
                  type="button"
                >
                  <span>이미지 {index + 1}</span>
                  <span className="max-w-40 truncate opacity-75">
                    {result.fileName ?? "파일명 없음"}
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_340px]">
            {ocrResult.imageUrl ? (
              <div className="relative overflow-hidden rounded-xl bg-[var(--color-review-canvas)]">
                <img
                  alt={`${ocrResult.fileName ?? "업로드 이미지"} OCR 검수 이미지`}
                  className="h-auto w-full object-contain"
                  src={ocrResult.imageUrl}
                />
                {ocrResult.regions.map((region, index) => (
                  <button
                    aria-label={`${index + 1}번째 OCR 영역: ${region.text}`}
                    aria-pressed={region.id === selectedRegion?.id}
                    className={cx(
                      "absolute border-2 bg-[var(--color-review-overlay-ocr)]/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                      region.id === selectedRegion?.id
                        ? "border-[var(--color-review-overlay-ocr)] bg-[var(--color-review-overlay-ocr)]/30"
                        : "border-[var(--color-review-overlay-ocr)]/60 hover:bg-[var(--color-review-overlay-ocr)]/25",
                    )}
                    key={region.id}
                    onClick={() => onSelectRegion(ocrResult.imageId, region.id)}
                    style={{
                      height: `${region.height * 100}%`,
                      left: `${region.x * 100}%`,
                      top: `${region.y * 100}%`,
                      width: `${region.width * 100}%`,
                    }}
                    type="button"
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-64 items-center justify-center rounded-xl bg-[var(--color-review-canvas)] px-6 text-center text-sm leading-6 text-white/70">
                저장된 이미지 원본을 불러오지 못했습니다.
              </div>
            )}

            <div className="grid h-fit gap-4 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-soft)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">OCR 추출 텍스트</p>
                <span className="text-xs text-[var(--color-muted)]">
                  {getOcrStatusLabel(ocrResult.status)} · 신뢰도 {Math.round(ocrResult.confidence * 100)}%
                </span>
              </div>

              {ocrResult.status === "failed" ? (
                <p className="text-sm leading-6 text-[var(--color-risk-high-text)]">
                  {ocrResult.errorMessage ?? "OCR을 완료하지 못했습니다."}
                </p>
              ) : null}

              {ocrResult.regions.length > 0 ? (
                <div className="grid max-h-56 gap-2 overflow-y-auto">
                  {ocrResult.regions.map((region, index) => (
                    <button
                      aria-pressed={region.id === selectedRegion?.id}
                      className={cx(
                        "grid grid-cols-[28px_minmax(0,1fr)] gap-2 rounded-lg border px-3 py-2 text-left text-sm leading-5",
                        region.id === selectedRegion?.id
                          ? "border-[var(--color-primary)] bg-[var(--color-panel)]"
                          : "border-[var(--color-hairline)] hover:bg-[var(--color-panel)]",
                      )}
                      key={region.id}
                      onClick={() => onSelectRegion(ocrResult.imageId, region.id)}
                      type="button"
                    >
                      <span className="text-xs tabular-nums text-[var(--color-muted)]">
                        {index + 1}
                      </span>
                      <span>{region.text}</span>
                    </button>
                  ))}
                </div>
              ) : null}

              {ocrResult.fullText ? (
                <div className="border-t border-[var(--color-hairline)] pt-3">
                  <p className="text-xs font-medium text-[var(--color-muted)]">전체 추출 문구</p>
                  <p className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap text-sm leading-6">
                    {ocrResult.fullText}
                  </p>
                </div>
              ) : ocrResult.status !== "failed" ? (
                <p className="text-sm leading-6 text-[var(--color-muted)]">
                  이미지에서 텍스트를 찾지 못했습니다.
                </p>
              ) : null}
            </div>
          </div>
        </>
      ) : (
        <p className="p-5 text-sm leading-6 text-[var(--color-muted)]">
          업로드된 이미지가 없습니다. 이미지가 있으면 OCR 문구와 위치가 이곳에
          표시됩니다.
        </p>
      )}
    </section>
  );
}

function getOcrStatusLabel(status: OcrResult["status"]) {
  if (status === "succeeded") {
    return "추출 완료";
  }

  if (status === "failed") {
    return "추출 실패";
  }

  if (status === "empty") {
    return "문구 없음";
  }

  return "미실행";
}

function FindingInspector({
  filteredFindings,
  onSelectFinding,
  selectedFinding,
  setSeverityFilter,
  setSourceFilter,
  severityFilter,
  sourceFilter,
}: {
  filteredFindings: PolicyFinding[];
  onSelectFinding: (findingId: string) => void;
  selectedFinding: PolicyFinding | null;
  setSeverityFilter: (value: "all" | Severity) => void;
  setSourceFilter: (value: "all" | FindingSource) => void;
  severityFilter: "all" | Severity;
  sourceFilter: "all" | FindingSource;
}) {
  return (
    <section className="app-panel overflow-hidden">
      <PanelTitle
        countLabel={`${filteredFindings.length}개`}
        icon={<ListFilter aria-hidden="true" size={18} strokeWidth={1.8} />}
        kicker="검토 후보"
        title="정책 매칭 결과"
      />

      <div className="grid gap-3 border-b border-[var(--color-hairline)] p-4">
        <FilterButtons
          labels={(value) =>
            value === "all" ? "전체" : getFindingSourceLabel(value)
          }
          onChange={setSourceFilter}
          options={sourceFilters}
          value={sourceFilter}
        />
        <FilterButtons
          labels={(value) => (value === "all" ? "전체" : getSeverityLabel(value))}
          onChange={setSeverityFilter}
          options={severityFilters}
          value={severityFilter}
        />
      </div>

      <div className="grid max-h-[300px] gap-2 overflow-y-auto p-4">
        {filteredFindings.length > 0 ? (
          filteredFindings.map((finding) => (
            <button
              className={cx(
                "rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]",
                selectedFinding?.id === finding.id
                  ? "border-[var(--color-primary)] bg-[var(--color-selected-row)]"
                  : "border-[var(--color-hairline)] hover:bg-[var(--color-surface-soft)]",
              )}
              key={finding.id}
              onClick={() => onSelectFinding(finding.id)}
              type="button"
            >
              <div className="flex flex-wrap items-center gap-2">
                <SeverityBadge severity={finding.severity} />
                <span className="text-xs text-[var(--color-muted)]">
                  {getFindingSourceLabel(finding.source)}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold">{finding.matchedTerm}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--color-muted)]">
                {finding.originalText}
              </p>
            </button>
          ))
        ) : (
          <p className="rounded-xl border border-[var(--color-hairline)] p-4 text-sm text-[var(--color-muted)]">
            조건에 맞는 검토 후보가 없습니다.
          </p>
        )}
      </div>

      <FindingDetail finding={selectedFinding} />
    </section>
  );
}

function FindingDetail({ finding }: { finding: PolicyFinding | null }) {
  return (
    <div className="border-t border-[var(--color-hairline)] bg-[var(--color-surface-soft)] p-4">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <ShieldCheck aria-hidden="true" size={16} strokeWidth={1.8} />
        후보 상세
      </p>
      {finding ? (
        <div className="mt-4 grid gap-3 text-sm leading-6">
          <div className="flex flex-wrap gap-2">
            <SeverityBadge severity={finding.severity} />
            <span className="rounded-md bg-[var(--color-panel)] px-2.5 py-1 text-xs font-medium">
              {getPolicyCategoryLabel(finding.category)}
            </span>
          </div>
          <InfoLine label="검출 표현" value={finding.matchedTerm} />
          <InfoLine
            label="검출 위치"
            value={
              finding.source === "pasted_text"
                ? `${finding.lineNumber ?? "-"}번째 줄`
                : "이미지 OCR 문구"
            }
          />
          <p>{finding.reason}</p>
          {finding.replacementSuggestion ? (
            <InfoLine label="수정 제안" value={finding.replacementSuggestion} />
          ) : null}
          <p className="text-xs leading-5 text-[var(--color-muted)]">
            이 결과는 자동 확정 판정이 아니며, 실제 콘텐츠 맥락에 따라 담당자
            검토가 필요합니다.
          </p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-[var(--color-muted)]">
          검토 후보를 선택하면 상세 근거가 표시됩니다.
        </p>
      )}
    </div>
  );
}

function ReportMemoPanel({
  memo,
  onMemoChange,
  onExport,
  onSave,
  saved,
  storageError,
}: {
  memo: string;
  onMemoChange: (value: string) => void;
  onExport: () => void;
  onSave: () => void;
  saved: boolean;
  storageError: string;
}) {
  return (
    <section className="app-panel p-4">
      <label className="block">
        <span className="text-sm font-semibold">검수 메모</span>
        <textarea
          className="app-input mt-3 min-h-28 w-full resize-y px-3 py-2 text-sm leading-6"
          onChange={(event) => onMemoChange(event.target.value)}
          placeholder="담당자 확인 내용과 수정 여부를 남기세요."
          value={memo}
        />
      </label>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
        <button
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-on-primary)] hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
          onClick={onSave}
          type="button"
        >
          <Save aria-hidden="true" size={16} strokeWidth={1.8} />
          검수 리포트 저장
        </button>
        <button
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--color-hairline)] px-4 text-sm font-medium hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)] disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!saved}
          onClick={onExport}
          type="button"
        >
          <Download aria-hidden="true" size={16} strokeWidth={1.8} />
          리포트 내보내기
        </button>
      </div>
      {saved ? (
        <p className="mt-3 text-sm text-[var(--color-semantic-success)]">
          검수 리포트가 저장되었습니다.
        </p>
      ) : null}
      {storageError ? (
        <p className="mt-3 text-sm text-[var(--color-risk-high-text)]" role="alert">
          {storageError}
        </p>
      ) : null}
    </section>
  );
}

function ReviewEventTimeline({ events }: { events: ReviewStatusEvent[] }) {
  return (
    <section className="app-panel overflow-hidden">
      <PanelTitle
        countLabel={`${events.length}개 이벤트`}
        icon={<Clock3 aria-hidden="true" size={18} strokeWidth={1.8} />}
        kicker="검수 기록"
        title="상태 변경 타임라인"
      />
      {events.length > 0 ? (
        <ol className="grid gap-0 p-5 sm:p-6">
          {events.map((event, index) => (
            <li
              className="relative grid grid-cols-[16px_minmax(0,1fr)] gap-3 pb-6 last:pb-0"
              key={event.id}
            >
              {index < events.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-[7px] top-4 w-px bg-[var(--color-hairline)]"
                />
              ) : null}
              <span
                aria-hidden="true"
                className="relative z-10 mt-1 size-4 rounded-full border-4 border-[var(--color-panel)] bg-[var(--color-primary)] ring-1 ring-[var(--color-hairline)]"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">
                    {getReviewEventLabel(event.type)}
                  </p>
                  <ReviewStatusBadge status={event.toStatus} />
                  <span className="text-xs text-[var(--color-muted)]">
                    {formatDate(event.createdAt)}
                  </span>
                </div>
                {event.message ? (
                  <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">
                    {event.message}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="p-5 text-sm text-[var(--color-muted)] sm:p-6">
          저장된 상태 변경 기록이 없습니다.
        </p>
      )}
    </section>
  );
}

function PanelTitle({
  countLabel,
  icon,
  kicker,
  title,
}: {
  countLabel: string;
  icon: React.ReactNode;
  kicker: string;
  title: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-hairline)] p-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-soft)]">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--color-muted)]">
            {kicker}
          </p>
          <h2 className="mt-1 text-xl font-semibold">{title}</h2>
        </div>
      </div>
      <span className="rounded-full bg-[var(--color-surface-soft)] px-3 py-1 text-xs font-medium">
        {countLabel}
      </span>
    </div>
  );
}

function FilterButtons<T extends string>({
  labels,
  onChange,
  options,
  value,
}: {
  labels: (value: T) => string;
  onChange: (value: T) => void;
  options: T[];
  value: T;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          className={cx(
            "min-h-8 rounded-full border px-3 text-xs font-medium",
            option === value
              ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]"
              : "border-[var(--color-hairline)] hover:bg-[var(--color-surface-soft)]",
          )}
          key={option}
          onClick={() => onChange(option)}
          type="button"
        >
          {labels(option)}
        </button>
      ))}
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-medium">{label}: </span>
      {value}
    </p>
  );
}

function HighlightedText({
  matchedTerm,
  text,
}: {
  matchedTerm: string;
  text: string;
}) {
  const index = text.toLocaleLowerCase("ko-KR").indexOf(
    matchedTerm.toLocaleLowerCase("ko-KR"),
  );

  if (index < 0) {
    return <>{text}</>;
  }

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-[var(--color-highlight-bg)] px-1.5 py-0.5 font-semibold text-[var(--color-highlight-text)]">
        {text.slice(index, index + matchedTerm.length)}
      </mark>
      {text.slice(index + matchedTerm.length)}
    </>
  );
}
