export function formatNotificationDate(timestamp: string): string {
  const d = Date.parse(timestamp);
  if (Number.isNaN(d)) return timestamp;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}
