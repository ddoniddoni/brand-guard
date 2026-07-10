import {
  getFindingSourceLabel,
  getSeverityLabel,
} from "@/features/policy/labels";
import {
  getReviewEventLabel,
  getReviewStatusLabel,
} from "@/features/review/labels";
import type { ReviewWorkspace } from "@/features/review/types";
import { formatDate } from "@/lib/format";

export function downloadReviewReport(workspace: ReviewWorkspace) {
  if (!workspace.report) {
    throw new Error("저장된 검수 리포트가 없습니다.");
  }

  const content = createReviewReportMarkdown(workspace);
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `${sanitizeFileName(workspace.reviewJob.title)}-검수리포트.md`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function createReviewReportMarkdown(workspace: ReviewWorkspace) {
  const { report, reviewJob } = workspace;

  if (!report) {
    throw new Error("저장된 검수 리포트가 없습니다.");
  }

  const findings = workspace.findings.length
    ? workspace.findings
        .map((finding, index) => {
          const replacement = finding.replacementSuggestion
            ? `\n   - 수정 제안: ${finding.replacementSuggestion}`
            : "";

          return `${index + 1}. **${finding.matchedTerm}** · ${getSeverityLabel(finding.severity)} · ${getFindingSourceLabel(finding.source)}\n   - 근거: ${finding.originalText}\n   - 사유: ${finding.reason}${replacement}`;
        })
        .join("\n")
    : "정책 사전과 일치한 검토 후보가 없습니다.";
  const events = (workspace.events ?? []).length
    ? workspace.events
        .map(
          (event) =>
            `- ${formatDate(event.createdAt)} · ${getReviewEventLabel(event.type)}${event.message ? ` · ${event.message}` : ""}`,
        )
        .join("\n")
    : "- 저장된 상태 변경 기록이 없습니다.";

  return `# ${reviewJob.title} 검수 리포트

## 검수 정보

- 브랜드: ${reviewJob.brandName}
- 담당자: ${reviewJob.reviewerName}
- 상태: ${getReviewStatusLabel(reviewJob.status)}
- 검수 생성: ${formatDate(reviewJob.createdAt)}
- 리포트 저장: ${formatDate(report.createdAt)}
- 전체 검토 후보: ${report.totalFindingCount}개
- 붙여넣은 문구 후보: ${report.pastedTextFindingCount}개
- 이미지 OCR 후보: ${report.ocrFindingCount}개

## 담당자 메모

${report.reviewerMemo || "작성된 검수 메모가 없습니다."}

## 검토 후보

${findings}

## 상태 변경 기록

${events}

---

이 결과는 자동 확정 판정이 아니며, 실제 콘텐츠 맥락에 따라 담당자 검토가 필요합니다.
`;
}

function sanitizeFileName(value: string) {
  return (
    value.trim().replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ") ||
    "BrandGuard"
  );
}
