import { describe, expect, it } from "vitest";
import { SMS_PACKAGES, getSmsPackage } from "./pricing";

describe("SMS credit packages", () => {
  it("exposes the five agreed packages at 160 MNT per credit", () => {
    expect(SMS_PACKAGES.map(({ credits, priceMnt }) => [credits, priceMnt])).toEqual([
      [100, 16000],
      [500, 80000],
      [1000, 160000],
      [5000, 800000],
      [10000, 1600000],
    ]);
  });

  it("returns a package by stable identifier", () => {
    expect(getSmsPackage("business")?.credits).toBe(5000);
  });

  it("returns undefined for an unknown package", () => {
    expect(getSmsPackage("unknown")).toBeUndefined();
  });
});
