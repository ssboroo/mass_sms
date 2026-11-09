import { describe, expect, it } from "vitest";
import { lookupMongolianPhone, normalizeMongolianPhone } from "./phone-directory";

describe("normalizeMongolianPhone", () => {
  it("normalizes national and international formats", () => {
    expect(normalizeMongolianPhone("9911-2233")).toBe("+97699112233");
    expect(normalizeMongolianPhone("+976 9911 2233")).toBe("+97699112233");
  });

  it("rejects non-eight-digit national numbers", () => {
    expect(normalizeMongolianPhone("1234567")).toBeNull();
    expect(normalizeMongolianPhone("123456789")).toBeNull();
  });
});

describe("lookupMongolianPhone", () => {
  it("uses the longest currently valid prefix and reports unknown prefixes separately", () => {
    const ranges = [
      { prefix: "99", nationalLength: 8, operatorCode: "OP-A" },
      { prefix: "991", nationalLength: 8, operatorCode: "OP-B" }
    ];

    expect(lookupMongolianPhone("99112233", ranges)).toEqual({
      normalized: "+97699112233",
      validFormat: true,
      prefixKnown: true,
      operatorCode: "OP-B"
    });

    expect(lookupMongolianPhone("88112233", ranges)).toEqual({
      normalized: "+97688112233",
      validFormat: true,
      prefixKnown: false,
      operatorCode: null
    });
  });

  it("does not match expired prefix allocations", () => {
    const ranges = [{
      prefix: "99",
      nationalLength: 8,
      operatorCode: "OLD",
      validUntil: new Date(Date.now() - 1000)
    }];
    expect(lookupMongolianPhone("99112233", ranges).prefixKnown).toBe(false);
  });
});
