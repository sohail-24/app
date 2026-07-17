export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP";

export const DEFAULT_LOCALE = "en-IN";
export const DEFAULT_CURRENCY: CurrencyCode = "INR";

const currencyLocale: Record<CurrencyCode, string> = {
  INR: "en-IN",
  USD: "en-US",
  EUR: "en-IE",
  GBP: "en-GB",
};

export function toNumber(value: unknown, fallback = 0) {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

export function formatCurrency(
  value: unknown,
  currency: CurrencyCode = DEFAULT_CURRENCY,
  options?: Intl.NumberFormatOptions,
) {
  return new Intl.NumberFormat(currencyLocale[currency] ?? DEFAULT_LOCALE, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    ...options,
  }).format(toNumber(value));
}

export function formatNumber(value: unknown, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(DEFAULT_LOCALE, options).format(toNumber(value));
}

export function formatDate(value: unknown) {
  if (!value) return "Not set";
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "Not set";
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export const unitLabels: Record<string, string> = {
  kg: "kg",
  lb: "lb",
  case: "case",
  pallet: "pallet",
  each: "each",
  bunch: "bunch",
  box: "box",
  bag: "bag",
};

export function getProductMeta(product: { tags?: string | null }) {
  if (!product.tags) return {};
  try {
    return JSON.parse(product.tags) as { sku?: string; barcode?: string };
  } catch {
    return {};
  }
}

export function getSku(product: { id: number; slug?: string | null; categoryName?: string | null; tags?: string | null }) {
  const meta = getProductMeta(product);
  if (meta.sku) return meta.sku;
  const categoryPrefix = (product.categoryName ?? "FF").slice(0, 3).toUpperCase();
  const slugCode = (product.slug ?? "ITEM").replace(/[^a-z0-9]/gi, "").slice(0, 4).toUpperCase();
  return `${categoryPrefix}-${slugCode}-${String(product.id).padStart(4, "0")}`;
}

export function getPurchasePrice(sellingPrice: unknown) {
  return Math.max(0, Math.round(toNumber(sellingPrice) * 0.72));
}
