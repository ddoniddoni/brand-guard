import { mockPolicyTerms } from "@/features/policy/mock-terms";
import type { PolicyTerm } from "@/features/policy/types";

const storageKey = "brandguard.policy-terms.v1";
const storageChangeEvent = "brandguard.policy-terms.changed";

let cachedStorageValue: string | null | undefined;
let cachedTerms = mockPolicyTerms;

type StoredPolicyTermsPayload = {
  terms: PolicyTerm[];
  version: number;
};

export function getStoredPolicyTerms() {
  if (typeof window === "undefined") {
    return mockPolicyTerms;
  }

  const storageValue = window.localStorage.getItem(storageKey);

  if (storageValue === cachedStorageValue) {
    return cachedTerms;
  }

  try {
    const parsed = JSON.parse(storageValue ?? "") as StoredPolicyTermsPayload;

    cachedTerms = Array.isArray(parsed.terms) ? parsed.terms : mockPolicyTerms;
  } catch {
    cachedTerms = mockPolicyTerms;
  }

  cachedStorageValue = storageValue;
  return cachedTerms;
}

export function getDefaultPolicyTerms() {
  return mockPolicyTerms;
}

export function subscribeToPolicyTerms(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === storageKey) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", handleStorageChange);
  window.addEventListener(storageChangeEvent, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener(storageChangeEvent, onStoreChange);
  };
}

export function savePolicyTerms(terms: PolicyTerm[]) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: StoredPolicyTermsPayload = {
    terms,
    version: 1,
  };

  const storageValue = JSON.stringify(payload);

  cachedStorageValue = storageValue;
  cachedTerms = terms;
  window.localStorage.setItem(storageKey, storageValue);
  window.dispatchEvent(new Event(storageChangeEvent));
}
