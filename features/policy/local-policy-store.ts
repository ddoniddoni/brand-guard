import { mockPolicyTerms } from "@/features/policy/mock-terms";
import type { PolicyTerm } from "@/features/policy/types";

const storageKey = "brandguard.policy-terms.v1";

type StoredPolicyTermsPayload = {
  terms: PolicyTerm[];
  version: number;
};

export function getStoredPolicyTerms() {
  if (typeof window === "undefined") {
    return mockPolicyTerms;
  }

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(storageKey) ?? "",
    ) as StoredPolicyTermsPayload;

    return Array.isArray(parsed.terms) ? parsed.terms : mockPolicyTerms;
  } catch {
    return mockPolicyTerms;
  }
}

export function savePolicyTerms(terms: PolicyTerm[]) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: StoredPolicyTermsPayload = {
    terms,
    version: 1,
  };

  window.localStorage.setItem(storageKey, JSON.stringify(payload));
}
