/**
 * Customer-facing SMS price calculation.
 * Provider unit cost is currently 80 MNT per SMS part.
 * A 100% markup means a retail price of 160 MNT per part.
 */
export function calculateRetailPrice(providerCostMnt: number, markupPercent: number): number {
  if (!Number.isFinite(providerCostMnt) || providerCostMnt < 0) {
    throw new Error("Provider cost must be a finite non-negative amount");
  }
  if (!Number.isFinite(markupPercent) || markupPercent < 0) {
    throw new Error("Markup must be a finite non-negative percentage");
  }

  return Math.ceil(providerCostMnt * (1 + markupPercent / 100));
}

export const SMS_PROVIDER_COST_MNT = 80;
export const SMS_MARKUP_PERCENT = 100;
export const SMS_PRICE_PER_PART_MNT = calculateRetailPrice(
  SMS_PROVIDER_COST_MNT,
  SMS_MARKUP_PERCENT
);

export type SmsPackageId = "starter" | "basic" | "standard" | "business" | "enterprise";

export interface SmsCreditPackage {
  id: SmsPackageId;
  name: string;
  credits: number;
  priceMnt: number;
  featured?: boolean;
}

/** Public catalogue. Checkout must re-read this catalogue on the server. */
export const SMS_PACKAGES: readonly SmsCreditPackage[] = [
  { id: "starter", name: "Starter", credits: 100, priceMnt: 16000 },
  { id: "basic", name: "Basic", credits: 500, priceMnt: 80000 },
  { id: "standard", name: "Standard", credits: 1000, priceMnt: 160000, featured: true },
  { id: "business", name: "Business", credits: 5000, priceMnt: 800000 },
  { id: "enterprise", name: "Enterprise", credits: 10000, priceMnt: 1600000 },
] as const;

export function getSmsPackage(id: string): SmsCreditPackage | undefined {
  return SMS_PACKAGES.find((item) => item.id === id);
}
