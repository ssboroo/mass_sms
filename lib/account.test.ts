import { describe, expect, it } from "vitest";
import { matchesAdminIdentifier, normalizeIdentifier, parseCreditAdjustment } from "./account";

describe("account identity", () => {
  it("normalizes email identifiers", () => {
    expect(normalizeIdentifier("  USER@Example.com ")).toEqual({ email: "user@example.com" });
  });
  it("normalizes Mongolian mobile numbers to E.164", () => {
    expect(normalizeIdentifier("9911 2233")).toEqual({ phone: "+97699112233" });
    expect(normalizeIdentifier("+976 9911-2233")).toEqual({ phone: "+97699112233" });
  });
  it("rejects invalid identifiers", () => {
    expect(() => normalizeIdentifier("not-an-identifier")).toThrow();
  });
  it("only promotes an exact configured admin identity", () => {
    expect(matchesAdminIdentifier({ email: "owner@example.com" }, { email: "OWNER@example.com" })).toBe(true);
    expect(matchesAdminIdentifier({ email: "other@example.com" }, { email: "owner@example.com" })).toBe(false);
  });
  it("accepts bounded integer credit adjustments", () => {
    expect(parseCreditAdjustment(500)).toBe(500n);
    expect(() => parseCreditAdjustment(0)).toThrow();
    expect(() => parseCreditAdjustment(1.5)).toThrow();
  });
});
