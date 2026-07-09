const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}
