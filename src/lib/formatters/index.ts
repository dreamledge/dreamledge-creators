export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatTimeRemaining(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  const hours = Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
  return `${hours}h left`;
}
