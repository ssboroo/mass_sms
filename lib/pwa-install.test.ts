import { describe, expect, it } from "vitest";
import { getInstallPlatform } from "./pwa-install";

describe("getInstallPlatform", () => {
  it("returns null for desktop browsers", () => {
    expect(getInstallPlatform("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0", false)).toBeNull();
  });

  it("identifies iPhone Safari and other iOS browsers as iOS guidance", () => {
    expect(getInstallPlatform("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1", false)).toBe("ios");
  });

  it("identifies Android phones for browser install guidance", () => {
    expect(getInstallPlatform("Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36", false)).toBe("android");
  });

  it("does not prompt when the site is already installed", () => {
    expect(getInstallPlatform("Mozilla/5.0 (Linux; Android 15) Chrome/130.0 Mobile", true)).toBeNull();
  });
});
