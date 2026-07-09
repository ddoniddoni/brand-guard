"use client";

import { CirclePlus, Search } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useMemo, useState } from "react";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import {
  getMatchTypeLabel,
  getPolicyCategoryLabel,
  getPolicyTermTypeLabel,
} from "@/features/policy/labels";
import { mockPolicyTerms } from "@/features/policy/mock-terms";
import type { PolicyTerm } from "@/features/policy/types";

export function PolicyTermTable() {
  const [terms, setTerms] = useState(mockPolicyTerms);
  const [query, setQuery] = useState("");
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
            type="button"
          >
            <CirclePlus aria-hidden="true" size={16} strokeWidth={1.8} />
            정책 추가
          </button>
        </div>

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
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-[var(--color-surface-soft)] text-[var(--color-muted)]">
              <tr>
                <th className="px-5 py-3 font-medium">표현</th>
                <th className="px-4 py-3 font-medium">유형</th>
                <th className="px-4 py-3 font-medium">카테고리</th>
                <th className="px-4 py-3 font-medium">심각도</th>
                <th className="px-4 py-3 font-medium">매칭</th>
                <th className="px-4 py-3 font-medium">대체 표현</th>
                <th className="px-4 py-3 font-medium">상태</th>
              </tr>
            </thead>
            <tbody>
              {filteredTerms.map((term) => (
                <PolicyTermRow key={term.id} term={term} setTerms={setTerms} />
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

function PolicyTermRow({
  setTerms,
  term,
}: {
  setTerms: Dispatch<SetStateAction<PolicyTerm[]>>;
  term: PolicyTerm;
}) {
  return (
    <tr className="border-t border-[var(--color-hairline)] align-top">
      <td className="px-5 py-4">
        <p className="font-medium text-[var(--color-ink)]">{term.term}</p>
        <p className="mt-1 max-w-sm text-xs leading-5 text-[var(--color-muted)]">
          {term.reason}
        </p>
      </td>
      <td className="px-4 py-4">{getPolicyTermTypeLabel(term.type)}</td>
      <td className="px-4 py-4">{getPolicyCategoryLabel(term.category)}</td>
      <td className="px-4 py-4">
        <SeverityBadge severity={term.severity} />
      </td>
      <td className="px-4 py-4">{getMatchTypeLabel(term.matchType)}</td>
      <td className="px-4 py-4">
        {term.replacementSuggestion ?? "대체 표현 없음"}
      </td>
      <td className="px-4 py-4">
        <button
          aria-pressed={term.enabled}
          className="inline-flex min-h-9 items-center rounded-full border border-[var(--color-hairline)] px-3 text-xs font-medium hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
          onClick={() => {
            setTerms((currentTerms) =>
              currentTerms.map((currentTerm) =>
                currentTerm.id === term.id
                  ? { ...currentTerm, enabled: !currentTerm.enabled }
                  : currentTerm,
              ),
            );
          }}
          type="button"
        >
          {term.enabled ? "활성" : "비활성"}
        </button>
      </td>
    </tr>
  );
}
