"use client";

import {
  FileText,
  Image as ImageIcon,
  ListFilter,
  Save,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import {
  getStoredReviewWorkspace,
  saveReviewReport,
} from "@/features/review/local-review-store";
import type {
  OcrResult,
  OcrTextRegion,
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

export function ReviewResultClient({ reviewId }: { reviewId: string }) {
  const [workspace, setWorkspace] = useState<ReviewWorkspace | null>(null);
  const [sourceFilter, setSourceFilter] = useState<"all" | FindingSource>("all");
  const [severityFilter, setSeverityFilter] = useState<"all" | Severity>("all");
  const [selectedFindingId, setSelectedFindingId] = useState("");
  const [memo, setMemo] = useState("");

  useEffect(() => {
    queueMicrotask(() => {
      const nextWorkspace = getStoredReviewWorkspace(reviewId) ?? null;
      setWorkspace(nextWorkspace);
      setSelectedFindingId(nextWorkspace?.findings[0]?.id ?? "");
      setMemo(nextWorkspace?.report?.reviewerMemo ?? "");
    });
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
    filteredFindings.find((finding) => finding.id === selectedFindingId) ??
    filteredFindings[0] ??
    null;

  if (!workspace) {
    return <MissingReviewState />;
  }

  const firstOcrResult = workspace.ocrResults[0];
  const selectedRegion = selectedFinding?.regionId
    ? firstOcrResult?.regions.find((region) => region.id === selectedFinding.regionId)
    : firstOcrResult?.regions[0];

  return (
    <div className="mx-auto grid w-full max-w-[1500px] gap-5 px-5 py-6 sm:px-6 lg:px-8">
      <ReportHeader workspace={workspace} />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <main className="grid min-w-0 gap-5">
          <TextEvidencePanel
            findings={workspace.findings}
            onSelectFinding={setSelectedFindingId}
            segments={pastedTextSegments}
            selectedFindingId={selectedFinding?.id ?? ""}
          />

          <OcrEvidencePanel
            ocrResult={firstOcrResult}
            selectedRegion={selectedRegion}
          />
        </main>

        <aside className="grid h-fit gap-4 xl:sticky xl:top-6">
          <FindingInspector
            filteredFindings={filteredFindings}
            onSelectFinding={setSelectedFindingId}
            selectedFinding={selectedFinding}
            setSeverityFilter={setSeverityFilter}
            setSourceFilter={setSourceFilter}
            severityFilter={severityFilter}
            sourceFilter={sourceFilter}
          />

          <ReportMemoPanel
            memo={memo}
            onMemoChange={setMemo}
            onSave={() => {
              const nextWorkspace = saveReviewReport(workspace.reviewJob.id, memo);
              if (nextWorkspace) {
                setWorkspace(nextWorkspace);
              }
            }}
            saved={Boolean(workspace.report)}
          />
        </aside>
      </section>
    </div>
  );
}

function MissingReviewState() {
  return (
    <div className="mx-auto grid w-full max-w-[1100px] gap-4 px-5 py-12 sm:px-6 lg:px-8">
      <section className="app-panel p-8">
        <p className="text-sm font-medium text-[var(--color-muted)]">
          검수 결과
        </p>
        <h2 className="mt-2 text-2xl font-normal">검수 리포트를 찾을 수 없습니다</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--color-body)]">
          브라우저 저장소에 해당 검수 결과가 없습니다. 새 콘텐츠 검수를 다시
          시작해 주세요.
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
            {workspace.report ? (
              <span className="inline-flex min-h-7 items-center rounded-full bg-[var(--color-risk-low-bg)] px-3 text-xs font-medium text-[var(--color-risk-low-text)]">
                리포트 저장됨
              </span>
            ) : null}
          </div>
          <h2 className="mt-4 truncate text-3xl font-semibold leading-tight">
            {workspace.reviewJob.title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-body)]">
            정책 사전 기준으로 검토 후보를 정리했습니다. 결과는 확정 판정이
            아니며, 담당자가 실제 콘텐츠 맥락과 표현 의도를 확인해야 합니다.
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
  ocrResult,
  selectedRegion,
}: {
  ocrResult?: OcrResult;
  selectedRegion?: OcrTextRegion;
}) {
  return (
    <section className="app-panel overflow-hidden">
      <PanelTitle
        countLabel={
          ocrResult ? `신뢰도 ${Math.round(ocrResult.confidence * 100)}%` : "이미지 없음"
        }
        icon={<ImageIcon aria-hidden="true" size={18} strokeWidth={1.8} />}
        kicker="이미지 OCR 검사"
        title="OCR 문구와 위치"
      />

      {ocrResult ? (
        <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="relative overflow-hidden rounded-xl bg-[var(--color-review-canvas)]">
            <img
              alt="OCR 검수 이미지"
              className="h-auto w-full object-contain"
              src={ocrResult.imageUrl}
            />
            {selectedRegion ? (
              <button
                aria-label="선택된 OCR 영역"
                className="absolute border-2 border-[var(--color-review-overlay-ocr)] bg-[var(--color-review-overlay-ocr)]/20"
                style={{
                  height: `${selectedRegion.height * 100}%`,
                  left: `${selectedRegion.x * 100}%`,
                  top: `${selectedRegion.y * 100}%`,
                  width: `${selectedRegion.width * 100}%`,
                }}
                type="button"
              />
            ) : null}
          </div>
          <div className="rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-soft)] p-4">
            <p className="text-sm font-semibold">OCR 추출 텍스트</p>
            {ocrResult.fullText ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
                {ocrResult.fullText}
              </p>
            ) : (
              <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                이미지에서 텍스트를 찾지 못했거나 OCR을 완료하지 못했습니다.
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="p-5 text-sm leading-6 text-[var(--color-muted)]">
          업로드된 이미지가 없습니다. 이미지가 있으면 OCR 문구와 위치가 이곳에
          표시됩니다.
        </p>
      )}
    </section>
  );
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
  onSave,
  saved,
}: {
  memo: string;
  onMemoChange: (value: string) => void;
  onSave: () => void;
  saved: boolean;
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
      <button
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-on-primary)] hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
        onClick={onSave}
        type="button"
      >
        <Save aria-hidden="true" size={16} strokeWidth={1.8} />
        검수 리포트 저장
      </button>
      {saved ? (
        <p className="mt-3 text-sm text-[var(--color-semantic-success)]">
          검수 리포트가 저장되었습니다.
        </p>
      ) : null}
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
