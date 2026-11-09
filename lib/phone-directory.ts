export type NumberPrefix = {
  prefix: string;
  nationalLength: number;
  operatorCode?: string;
  verifiedAt?: Date | null;
  validFrom?: Date | null;
  validUntil?: Date | null;
};

export type PhoneCheck = {
  normalized: string | null;
  validFormat: boolean;
  prefixKnown: boolean;
  operatorCode: string | null;
};

/**
 * Normalize a Mongolian national number to +976XXXXXXXX.
 * This validates format only; it does not prove that a number is assigned,
 * reachable, owned by the user, or currently served by a specific operator.
 */
export function normalizeMongolianPhone(input: string): string | null {
  const digits = input.replace(/[^0-9]/g, "");
  const national = digits.startsWith("976") && digits.length === 11
    ? digits.slice(3)
    : digits;

  if (!/^\d{8}$/.test(national)) return null;
  return `+976${national}`;
}

export function lookupMongolianPhone(
  input: string,
  ranges: NumberPrefix[]
): PhoneCheck {
  const normalized = normalizeMongolianPhone(input);
  if (!normalized) {
    return {
      normalized: null,
      validFormat: false,
      prefixKnown: false,
      operatorCode: null
    };
  }

  const national = normalized.slice(4);
  const now = Date.now();
  const candidates = ranges
    .filter((range) => national.startsWith(range.prefix))
    .filter((range) => range.nationalLength === national.length)
    .filter((range) => !range.validFrom || range.validFrom.getTime() <= now)
    .filter((range) => !range.validUntil || range.validUntil.getTime() > now)
    .sort((a, b) => b.prefix.length - a.prefix.length);

  const match = candidates[0];
  return {
    normalized,
    validFormat: true,
    prefixKnown: Boolean(match),
    operatorCode: match?.operatorCode ?? null
  };
}
