const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPrice(value: number): string {
  return currencyFormatter.format(value);
}

/** Locale display for API ISO timestamps; "-" when missing or invalid. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value || !value.trim()) {
    return "-";
  }
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return "-";
  }
  return new Date(parsed).toLocaleString();
}
