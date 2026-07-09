"use client";

import { Check, CirclePlus, Search, X } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { AdaptiveSelect } from "@/components/ui/AdaptiveSelect";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import {
  getMatchTypeLabel,
  getPolicyCategoryLabel,
  getPolicyTermTypeLabel,
} from "@/features/policy/labels";
import {
  getStoredPolicyTerms,
  savePolicyTerms,
} from "@/features/policy/local-policy-store";
import type {
  MatchType,
  PolicyCategory,
  PolicyTerm,
  PolicyTermType,
  Severity,
} from "@/features/policy/types";
import { cx } from "@/lib/utils";

const categoryOptions: PolicyCategory[] = [
  "guarantee_claim",
  "exaggerated_claim",
  "comparative_rank",
  "sensitive_industry",
  "brand_tone_mismatch",
  "legal_review_required",
  "event_condition_missing",
  "community_slang",
  "custom_forbidden_term",
];

const severityOptions: Severity[] = ["critical", "high", "medium", "low"];
const matchTypeOptions: MatchType[] = [
  "contains",
  "exact",
  "normalized",
  "regex",
];

type DraftPolicyTerm = {
  category: PolicyCategory;
  matchType: MatchType;
  reason: string;
  replacementSuggestion: string;
  severity: Severity;
  term: string;
  type: PolicyTermType;
};

const emptyDraft: DraftPolicyTerm = {
  category: "custom_forbidden_term",
  matchType: "contains",
  reason: "",
  replacementSuggestion: "",
  severity: "medium",
  term: "",
  type: "forbidden",
};

export function PolicyTermTable() {
  const [terms, setTerms] = useState(() => getStoredPolicyTerms());
  const [query, setQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState<DraftPolicyTerm>(emptyDraft);
  const [formError, setFormError] = useState("");
  const filteredTerms = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");

    if (!normalizedQuery) {
      return terms;
    }

    return terms.filter((term) =>
      [term.term, term.reason, term.replacementSuggestion ?? ""]
        .join(" ")
        .toLocaleLowerCase("ko-KR")
        .includes(normalizedQuery),
    );
  }, [query, terms]);

  const commitTerms = (nextTerms: PolicyTerm[]) => {
    setTerms(nextTerms);
    savePolicyTerms(nextTerms);
  };

  const handleAddPolicy = () => {
    const term = draft.term.trim();
    const reason = draft.reason.trim();

    if (!term) {
      setFormError("표현을 입력하세요.");
      return;
    }

    if (!reason) {
      setFormError("검출 사유를 입력하세요.");
      return;
    }

    if (draft.matchType === "regex") {
      try {
        new RegExp(term);
      } catch {
        setFormError("유효한 정규식을 입력하세요.");
        return;
      }
    }

    const timestamp = new Date().toISOString();
    const nextTerm: PolicyTerm = {
      brandId: "brand-northstar",
      category: draft.category,
      createdAt: timestamp,
      enabled: true,
      id: `term-local-${Date.now().toString(36)}`,
      matchType: draft.matchType,
      reason,
      replacementSuggestion: draft.replacementSuggestion.trim() || undefined,
      severity: draft.severity,
      term,
      type: draft.type,
      updatedAt: timestamp,
    };

    commitTerms([nextTerm, ...terms]);
    setDraft(emptyDraft);
    setFormError("");
    setIsAdding(false);
  };

  return (
    <div className="grid gap-5">
      <section className="app-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--color-muted)]">
              기본 브랜드 정책 세트
            </p>
            <h2 className="mt-2 text-2xl font-normal">금지어·주의어</h2>
          </div>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-on-primary)] hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
            onClick={() => {
              setIsAdding((current) => !current);
              setFormError("");
            }}
            type="button"
          >
            <CirclePlus aria-hidden="true" size={16} strokeWidth={1.8} />
            정책 추가
          </button>
        </div>

        {isAdding ? (
          <PolicyTermForm
            draft={draft}
            error={formError}
            onCancel={() => {
              setDraft(emptyDraft);
              setFormError("");
              setIsAdding(false);
            }}
            onChange={setDraft}
            onSubmit={handleAddPolicy}
          />
        ) : null}

        <label className="mt-5 block">
          <span className="text-sm font-medium">정책 검색</span>
          <span className="relative mt-2 block">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
              size={16}
              strokeWidth={1.8}
            />
            <input
              className="app-input h-11 w-full pl-10 pr-3 text-sm"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="표현, 사유, 대체 표현 검색"
              type="search"
              value={query}
            />
          </span>
        </label>
      </section>

      <section className="overflow-hidden rounded-xl border border-[var(--color-hairline)] bg-[var(--color-panel)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] table-fixed border-collapse text-left text-sm">
            <colgroup>
              <col className="w-[240px]" />
              <col className="w-[78px]" />
              <col className="w-[158px]" />
              <col className="w-[92px]" />
              <col className="w-[92px]" />
              <col className="w-[216px]" />
              <col className="w-[82px]" />
            </colgroup>
            <thead className="bg-[var(--color-surface-soft)] text-[var(--color-muted)]">
              <tr>
                <TableHead>표현</TableHead>
                <TableHead>유형</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>심각도</TableHead>
                <TableHead>매칭</TableHead>
                <TableHead>대체 표현</TableHead>
                <TableHead>상태</TableHead>
              </tr>
            </thead>
            <tbody>
              {filteredTerms.map((term) => (
                <PolicyTermRow
                  key={term.id}
                  onToggle={(nextTerm) => {
                    commitTerms(
                      terms.map((currentTerm) =>
                        currentTerm.id === nextTerm.id ? nextTerm : currentTerm,
                      ),
                    );
                  }}
                  term={term}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filteredTerms.length === 0 ? (
          <p className="border-t border-[var(--color-hairline)] p-6 text-sm text-[var(--color-muted)]">
            검색 조건에 맞는 정책이 없습니다.
          </p>
        ) : null}
      </section>
    </div>
  );
}

function PolicyTermForm({
  draft,
  error,
  onCancel,
  onChange,
  onSubmit,
}: {
  draft: DraftPolicyTerm;
  error: string;
  onCancel: () => void;
  onChange: (draft: DraftPolicyTerm) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="mt-5 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-soft)] p-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(180px,1fr)_120px_180px_130px_130px]">
        <label className="block min-w-0">
          <span className="text-xs font-medium text-[var(--color-muted)]">
            표현
          </span>
          <input
            className="app-input mt-1 h-10 w-full px-3 text-sm"
            onChange={(event) =>
              onChange({ ...draft, term: event.target.value })
            }
            placeholder="예: 무료 보장"
            value={draft.term}
          />
        </label>
        <FormSelect
          label="유형"
          onValueChange={(value) =>
            onChange({ ...draft, type: value as PolicyTermType })
          }
          options={[
            { label: "금지어", value: "forbidden" },
            { label: "주의어", value: "caution" },
          ]}
          value={draft.type}
        />
        <FormSelect
          label="카테고리"
          onValueChange={(value) =>
            onChange({ ...draft, category: value as PolicyCategory })
          }
          options={categoryOptions.map((category) => ({
            label: getPolicyCategoryLabel(category),
            value: category,
          }))}
          value={draft.category}
        />
        <FormSelect
          label="심각도"
          onValueChange={(value) =>
            onChange({ ...draft, severity: value as Severity })
          }
          options={severityOptions.map((severity) => ({
            label:
              severity === "critical"
                ? "긴급"
                : severity === "high"
                  ? "높음"
                  : severity === "medium"
                    ? "보통"
                    : "낮음",
            value: severity,
          }))}
          value={draft.severity}
        />
        <FormSelect
          label="매칭"
          onValueChange={(value) =>
            onChange({ ...draft, matchType: value as MatchType })
          }
          options={matchTypeOptions.map((matchType) => ({
            label: getMatchTypeLabel(matchType),
            value: matchType,
          }))}
          value={draft.matchType}
        />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,360px)]">
        <label className="block min-w-0">
          <span className="text-xs font-medium text-[var(--color-muted)]">
            검출 사유
          </span>
          <input
            className="app-input mt-1 h-10 w-full px-3 text-sm"
            onChange={(event) =>
              onChange({ ...draft, reason: event.target.value })
            }
            placeholder="정책상 검토가 필요한 이유"
            value={draft.reason}
          />
        </label>
        <label className="block min-w-0">
          <span className="text-xs font-medium text-[var(--color-muted)]">
            대체 표현
          </span>
          <input
            className="app-input mt-1 h-10 w-full px-3 text-sm"
            onChange={(event) =>
              onChange({ ...draft, replacementSuggestion: event.target.value })
            }
            placeholder="예: 조건 충족 시 제공"
            value={draft.replacementSuggestion}
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="min-h-5 text-sm text-[var(--color-risk-high-text)]">
          {error}
        </p>
        <div className="flex gap-2">
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--color-hairline)] px-4 text-sm font-medium hover:bg-[var(--color-panel)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
            onClick={onCancel}
            type="button"
          >
            <X aria-hidden="true" size={15} strokeWidth={1.8} />
            취소
          </button>
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-on-primary)] hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
            onClick={onSubmit}
            type="button"
          >
            <Check aria-hidden="true" size={15} strokeWidth={1.8} />
            추가
          </button>
        </div>
      </div>
    </div>
  );
}

function FormSelect({
  label,
  onValueChange,
  options,
  value,
}: {
  label: string;
  onValueChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="text-xs font-medium text-[var(--color-muted)]">
        {label}
      </span>
      <AdaptiveSelect
        className="mt-1"
        label={label}
        onValueChange={onValueChange}
        options={options}
        value={value}
      />
    </label>
  );
}

function TableHead({ children }: { children: ReactNode }) {
  return (
    <th className="whitespace-nowrap px-4 py-3 font-medium first:px-5">
      {children}
    </th>
  );
}

function PolicyTermRow({
  onToggle,
  term,
}: {
  onToggle: (term: PolicyTerm) => void;
  term: PolicyTerm;
}) {
  return (
    <tr className="border-t border-[var(--color-hairline)] align-middle">
      <td className="px-5 py-3">
        <p className="truncate font-medium text-[var(--color-ink)]" title={term.term}>
          {term.term}
        </p>
        <p
          className="mt-1 truncate text-xs text-[var(--color-muted)]"
          title={term.reason}
        >
          {term.reason}
        </p>
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        {getPolicyTermTypeLabel(term.type)}
      </td>
      <td
        className="truncate whitespace-nowrap px-4 py-3"
        title={getPolicyCategoryLabel(term.category)}
      >
        {getPolicyCategoryLabel(term.category)}
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        <SeverityBadge severity={term.severity} />
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        {getMatchTypeLabel(term.matchType)}
      </td>
      <td
        className="truncate whitespace-nowrap px-4 py-3"
        title={term.replacementSuggestion ?? "대체 표현 없음"}
      >
        {term.replacementSuggestion ?? "대체 표현 없음"}
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        <button
          aria-pressed={term.enabled}
          className={cx(
            "inline-flex min-h-8 items-center rounded-full border px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]",
            term.enabled
              ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]"
              : "border-[var(--color-hairline)] hover:bg-[var(--color-surface-soft)]",
          )}
          onClick={() =>
            onToggle({
              ...term,
              enabled: !term.enabled,
              updatedAt: new Date().toISOString(),
            })
          }
          type="button"
        >
          {term.enabled ? "활성" : "비활성"}
        </button>
      </td>
    </tr>
  );
}
