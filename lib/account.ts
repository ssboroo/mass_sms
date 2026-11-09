export function normalizeIdentifier(input: string): { email?: string; phone?: string } {
  const value = input.trim();
  if (value.includes("@")) {
    const email = value.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      throw new Error("Enter a valid email address");
    }
    return { email };
  }
  const digits = value.replace(/[\s()-]/g, "");
  const phone = /^\+?976\d{8}$/.test(digits)
    ? (digits.startsWith("+") ? digits : `+${digits}`)
    : /^\d{8}$/.test(digits) ? `+976${digits}` : "";
  if (!phone) throw new Error("Enter a valid Mongolian phone number or email");
  return { phone };
}

export function matchesAdminIdentifier(identifier: { email?: string; phone?: string }, config: { email?: string; phone?: string }): boolean {
  return Boolean(
    (identifier.email && config.email && identifier.email === config.email.trim().toLowerCase()) ||
    (identifier.phone && config.phone && identifier.phone === config.phone.replace(/\s/g, ""))
  );
}

export function parseCreditAdjustment(value: unknown): bigint {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value === 0 || Math.abs(value) > 10_000_000) {
    throw new Error("Credit adjustment must be a non-zero safe integer within 10,000,000");
  }
  return BigInt(value);
}
