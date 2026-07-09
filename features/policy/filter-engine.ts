import {
  normalizeForLooseMatch,
  normalizeText,
} from "@/features/policy/normalize-text";
import type {
  PolicyFilterInput,
  PolicyFilterResult,
  PolicyFinding,
  PolicyTerm,
  TextSegment,
} from "@/features/policy/types";

export function runPolicyFilter(input: PolicyFilterInput): PolicyFilterResult {
  const findings: PolicyFinding[] = [];

  input.textSegments.forEach((segment) => {
    input.policyTerms.forEach((term) => {
      if (!term.enabled) {
        return;
      }

      const matched = matchPolicyTerm(segment, term);

      if (!matched) {
        return;
      }

      findings.push({
        category: term.category,
        confidence: input.source === "image_ocr" ? 0.88 : undefined,
        createdAt: new Date().toISOString(),
        highlightedText: highlightMatchedTerm(segment.text, matched.displayTerm),
        id: `${segment.id}-${term.id}`,
        imageId: segment.imageId,
        lineNumber: segment.lineNumber,
        matchedTerm: matched.displayTerm,
        originalText: segment.text,
        policyTermId: term.id,
        reason: term.reason,
        regionId: segment.regionId,
        replacementSuggestion: term.replacementSuggestion,
        reviewJobId: input.reviewJobId,
        sentenceIndex: segment.sentenceIndex,
        severity: term.severity,
        source: input.source,
      });
    });
  });

  return { findings };
}

function matchPolicyTerm(segment: TextSegment, term: PolicyTerm) {
  const normalizedTerm = normalizeText(term.term);
  const normalizedSegment = segment.normalizedText;

  if (term.matchType === "contains") {
    return normalizedSegment.includes(normalizedTerm)
      ? { displayTerm: term.term }
      : null;
  }

  if (term.matchType === "exact") {
    return normalizedSegment === normalizedTerm ? { displayTerm: term.term } : null;
  }

  if (term.matchType === "normalized") {
    return normalizeForLooseMatch(segment.text).includes(
      normalizeForLooseMatch(term.term),
    )
      ? { displayTerm: term.term }
      : null;
  }

  try {
    const regex = new RegExp(term.term, "iu");
    const result = regex.exec(segment.text);

    return result?.[0] ? { displayTerm: result[0] } : null;
  } catch {
    return null;
  }
}

function highlightMatchedTerm(text: string, matchedTerm: string) {
  const escaped = escapeRegExp(matchedTerm.trim());

  if (!escaped) {
    return text;
  }

  const regex = new RegExp(escaped, "iu");
  return text.replace(regex, (match) => `<mark>${match}</mark>`);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
