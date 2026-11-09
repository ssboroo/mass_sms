import { describe, expect, it } from "vitest";
import { normalizeMongolianPhone } from "./contacts";

describe("normalizeMongolianPhone", () => {
  it("normalizes a local eight-digit Mongolian number to E.164", () => {
    expect(normalizeMongolianPhone("9911 2233")).toBe("+97699112233");
  });

  it("accepts a number already written with the +976 country code", () => {
    expect(normalizeMongolianPhone("+976 9911-2233")).toBe("+97699112233");
  });

  it("rejects numbers with the wrong national length", () => {
    expect(() => normalizeMongolianPhone("9911223")).toThrow();
    expect(() => normalizeMongolianPhone("+1 415 555 0100")).toThrow();
  });
});
