export function normalizeText(value: string) {
  return value
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("ko-KR");
}

export function normalizeForLooseMatch(value: string) {
  return normalizeText(value).replace(/\s+/g, "");
}
