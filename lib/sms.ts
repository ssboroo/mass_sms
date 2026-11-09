export type SmsEstimate = {
  normalizedNumbers: string[];
  validNumbers: string[];
  invalidNumbers: string[];
  duplicateCount: number;
  parts: number;
  charactersPerPart: number;
  isUnicode: boolean;
};

export function normalizePhone(value: string): string {
  return value.replace(/[^0-9]/g, "").replace(/^976/, "");
}

export function estimateSms(numbersText: string, message: string): SmsEstimate {
  const raw = numbersText.split(/[\\n,;]+/).map(normalizePhone).filter(Boolean);
  const normalizedNumbers = [...new Set(raw)];
  const validNumbers = normalizedNumbers.filter((number) => /^\\d{8}$/.test(number));
  const invalidNumbers = normalizedNumbers.filter((number) => !/^\\d{8}$/.test(number));
  const isUnicode = /[^\\x00-\\x7F]/.test(message);
  const charactersPerPart = isUnicode ? 65 : 155;
  const parts = Math.max(1, Math.ceil(message.length / charactersPerPart));

  return {
    normalizedNumbers,
    validNumbers,
    invalidNumbers,
    duplicateCount: raw.length - normalizedNumbers.length,
    parts,
    charactersPerPart,
    isUnicode
  };
}
