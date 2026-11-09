import { describe, expect, it } from "vitest";
import { DEFAULT_PREFERENCES, parsePreferences, serializePreferences } from "./preferences";

describe("application preferences", () => {
  it("uses Mongolian and light mode by default for unknown input", () => {
    expect(parsePreferences(null)).toEqual(DEFAULT_PREFERENCES);
    expect(parsePreferences("invalid")).toEqual(DEFAULT_PREFERENCES);
  });

  it("accepts only supported locale and theme values", () => {
    expect(parsePreferences({ locale: "en", theme: "dark" })).toEqual({ locale: "en", theme: "dark" });
    expect(parsePreferences({ locale: "fr", theme: "system" })).toEqual(DEFAULT_PREFERENCES);
  });

  it("serializes a normalized preference object", () => {
    expect(serializePreferences({ locale: "en", theme: "dark" })).toBe('{"locale":"en","theme":"dark"}');
  });
});
