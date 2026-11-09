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
