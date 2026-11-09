export function normalizeMongolianPhone(value: string): string {
  const compact = value.trim().replace(/[\s()-]/g, "");
  const national = compact.startsWith("+976")
    ? compact.slice(4)
    : compact.startsWith("976") && compact.length === 11
      ? compact.slice(3)
      : compact;
  if (!/^\d{8}$/.test(national)) {
    throw new Error("Монголын утасны дугаарыг 8 оронтой зөв оруулна уу.");
  }
  return `+976${national}`;
}
