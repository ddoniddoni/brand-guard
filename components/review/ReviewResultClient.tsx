"use client";

import { Save, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MetricCard } from "@/components/ui/MetricCard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import {
  getFindingSourceLabel,
  getPolicyCategoryLabel,
  getSeverityLabel,
} from "@/features/policy/labels";
import type {
  FindingSource,
  Severity,
} from "@/features/policy/types";
import {
  getStoredReviewWorkspace,
  saveReviewReport,
} from "@/features/review/local-review-store";
import type { ReviewWorkspace } from "@/features/review/types";

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

  const firstOcrResult = workspace.ocrResults[0];
  const selectedRegion = selectedFinding?.regionId
    ? firstOcrResult?.regions.find((region) => region.id === selectedFinding.regionId)
    : firstOcrResult?.regions[0];

  return (
    <div className="mx-auto grid w-full max-w-[1500px] gap-6 px-5 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          description="정책 사전과 매칭된 전체 후보"
          icon={SlidersHorizontal}
          title="전체 후보"
          value={`${workspace.findings.length}`}
        />
        <MetricCard
          description="붙여넣은 문구에서 확인된 후보"
          icon={SlidersHorizontal}
          title="텍스트 후보"
          value={`${workspace.sourceCounts.pasted_text}`}
        />
        <MetricCard
          description="이미지 OCR 문구에서 확인된 후보"
          icon={SlidersHorizontal}
          title="OCR 후보"
          value={`${workspace.sourceCounts.image_ocr}`}
        />
        <MetricCard
          description="API Key 연결 전까지 비활성 상태"
          icon={SlidersHorizontal}
          title="AI 이미지 분석"
          value="미연결"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
        <div className="grid gap-6">
          <section className="app-panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--color-muted)]">
                  대본/문구 검사
                </p>
                <h2 className="mt-2 text-2xl font-normal">원문 텍스트</h2>
              </div>
              <span className="rounded-full bg-[var(--color-surface-soft)] px-3 py-1 text-xs font-medium">
                {pastedTextSegments.length}개 문장
              </span>
            </div>
            <div className="mt-5 grid gap-3">
              {pastedTextSegments.map((segment) => {
                const finding = workspace.findings.find(
                  (item) =>
                    item.source === "pasted_text" &&
                    item.originalText === segment.text,
                );

                return (
                  <button
                    className="min-w-0 rounded-lg border border-[var(--color-hairline)] px-4 py-3 text-left text-sm leading-6 hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
                    key={segment.id}
                    onClick={() => finding && setSelectedFindingId(finding.id)}
                    type="button"
                  >
                    <span className="mr-2 text-xs text-[var(--color-muted)]">
                      {segment.lineNumber}번째 줄
                    </span>
                    {finding ? (
                      <HighlightedText
                        matchedTerm={finding.matchedTerm}
                        text={segment.text}
                      />
                    ) : (
                      segment.text
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="app-panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--color-muted)]">
                  이미지 OCR 검사
                </p>
                <h2 className="mt-2 text-2xl font-normal">OCR 문구와 위치</h2>
              </div>
              <span className="rounded-full bg-[var(--color-surface-soft)] px-3 py-1 text-xs font-medium">
                신뢰도 {Math.round((firstOcrResult?.confidence ?? 0) * 100)}%
              </span>
            </div>

            {firstOcrResult ? (
              <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="relative overflow-hidden rounded-xl bg-[var(--color-review-canvas)]">
                  <img
                    alt="OCR 검수 이미지"
                    className="h-auto w-full object-contain"
                    src={firstOcrResult.imageUrl}
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
                  {firstOcrResult.fullText ? (
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
                      {firstOcrResult.fullText}
                    </p>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                      이미지에서 텍스트를 찾지 못했거나 OCR을 완료하지 못했습니다.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-[var(--color-muted)]">
                업로드된 이미지가 없습니다. 이미지가 있으면 OCR 문구와 위치가
                이곳에 표시됩니다.
              </p>
            )}
          </section>
        </div>

        <aside className="grid h-fit gap-5">
          <section className="app-panel p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[var(--color-muted)]">
                  검토 후보
                </p>
                <h2 className="mt-2 text-2xl font-normal">정책 매칭 결과</h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <FilterButtons
                labels={(value) =>
                  value === "all" ? "전체" : getFindingSourceLabel(value)
                }
                onChange={setSourceFilter}
                options={sourceFilters}
                value={sourceFilter}
              />
              <FilterButtons
                labels={(value) =>
                  value === "all" ? "전체" : getSeverityLabel(value)
                }
                onChange={setSeverityFilter}
                options={severityFilters}
                value={severityFilter}
              />
            </div>

            <div className="mt-5 grid max-h-[520px] gap-3 overflow-y-auto pr-1">
              {filteredFindings.length > 0 ? (
                filteredFindings.map((finding) => (
                  <button
                    className={[
                      "rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]",
                      selectedFinding?.id === finding.id
                        ? "border-[var(--color-primary)] bg-[var(--color-surface-soft)]"
                        : "border-[var(--color-hairline)] hover:bg-[var(--color-surface-soft)]",
                    ].join(" ")}
                    key={finding.id}
                    onClick={() => setSelectedFindingId(finding.id)}
                    type="button"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge severity={finding.severity} />
                      <span className="text-xs text-[var(--color-muted)]">
                        {getFindingSourceLabel(finding.source)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-medium">
                      {finding.matchedTerm}
                    </p>
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
          </section>

          <section className="app-panel-muted p-5">
            <p className="text-sm font-semibold">후보 상세</p>
            {selectedFinding ? (
              <div className="mt-4 grid gap-3 text-sm leading-6">
                <div className="flex flex-wrap gap-2">
                  <SeverityBadge severity={selectedFinding.severity} />
                  <span className="rounded-md bg-[var(--color-panel)] px-2.5 py-1 text-xs font-medium">
                    {getPolicyCategoryLabel(selectedFinding.category)}
                  </span>
                </div>
                <p>
                  <span className="font-medium">검출 표현: </span>
                  {selectedFinding.matchedTerm}
                </p>
                <p>
                  <span className="font-medium">검출 위치: </span>
                  {selectedFinding.source === "pasted_text"
                    ? `${selectedFinding.lineNumber ?? "-"}번째 줄`
                    : "이미지 OCR 문구"}
                </p>
                <p>{selectedFinding.reason}</p>
                {selectedFinding.replacementSuggestion ? (
                  <p>
                    <span className="font-medium">수정 제안: </span>
                    {selectedFinding.replacementSuggestion}
                  </p>
                ) : null}
                <p className="text-xs leading-5 text-[var(--color-muted)]">
                  이 결과는 자동 확정 판정이 아니며, 실제 캠페인 맥락에 따라
                  담당자 검토가 필요합니다.
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-[var(--color-muted)]">
                검토 후보를 선택하면 상세 근거가 표시됩니다.
              </p>
            )}
          </section>

          <section className="app-panel p-5">
            <label className="block">
              <span className="text-sm font-semibold">검수 메모</span>
              <textarea
                className="app-input mt-3 min-h-28 w-full resize-y px-3 py-2 text-sm leading-6"
                onChange={(event) => setMemo(event.target.value)}
                placeholder="담당자 확인 내용과 수정 여부를 남기세요."
                value={memo}
              />
            </label>
            <button
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-on-primary)] hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
              onClick={() => {
                const nextWorkspace = saveReviewReport(workspace.reviewJob.id, memo);
                if (nextWorkspace) {
                  setWorkspace(nextWorkspace);
                }
              }}
              type="button"
            >
              <Save aria-hidden="true" size={16} strokeWidth={1.8} />
              검수 리포트 저장
            </button>
            {workspace.report ? (
              <p className="mt-3 text-sm text-[var(--color-semantic-success)]">
                검수 리포트가 저장되었습니다.
              </p>
            ) : null}
          </section>
        </aside>
      </section>
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
          className={[
            "min-h-9 rounded-full border px-3 text-xs font-medium",
            option === value
              ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]"
              : "border-[var(--color-hairline)] hover:bg-[var(--color-surface-soft)]",
          ].join(" ")}
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
      <mark className="rounded bg-[var(--color-block-lime)] px-1 text-[var(--color-ink)]">
        {text.slice(index, index + matchedTerm.length)}
      </mark>
      {text.slice(index + matchedTerm.length)}
    </>
  );
}
