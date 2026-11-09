import { describe, expect, it } from "vitest";
import { estimateSms, normalizePhone } from "./sms";

describe("normalizePhone", () => {
  it("normalizes Mongolian country code and formatting", () => {
    expect(normalizePhone("+976 9911-2233")).toBe("99112233");
  });
});

describe("estimateSms", () => {
  it("deduplicates recipients and separates invalid numbers", () => {
    const result = estimateSms("99112233, +976 9911 2233, 123", "Hello");
    expect(result.validNumbers).toEqual(["99112233"]);
    expect(result.invalidNumbers).toEqual(["123"]);
    expect(result.duplicateCount).toBe(1);
  });

  it("uses 65-character segments for Cyrillic messages", () => {
    const result = estimateSms("99112233", "а".repeat(66));
    expect(result.isUnicode).toBe(true);
    expect(result.parts).toBe(2);
    expect(result.charactersPerPart).toBe(65);
  });

  it("uses 155-character segments for Latin messages", () => {
    const result = estimateSms("99112233", "a".repeat(156));
    expect(result.isUnicode).toBe(false);
    expect(result.parts).toBe(2);
    expect(result.charactersPerPart).toBe(155);
  });
});
