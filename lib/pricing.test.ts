import { describe, expect, it } from "vitest";
import { calculateRetailPrice, SMS_PRICE_PER_PART_MNT } from "./pricing";

describe("SMS retail pricing", () => {
  it("applies a 100% markup to the provider's 80 MNT unit cost", () => {
    expect(calculateRetailPrice(80, 100)).toBe(160);
  });

  it("rounds up fractional MNT prices so the configured markup is not undercut", () => {
    expect(calculateRetailPrice(81, 100)).toBe(162);
    expect(calculateRetailPrice(80, 50)).toBe(120);
  });

  it("sets the current customer-facing unit price to 160 MNT per SMS part", () => {
    expect(SMS_PRICE_PER_PART_MNT).toBe(160);
  });
});
