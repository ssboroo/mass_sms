import { describe, expect, it } from "vitest";
import { messages, type Locale, translate } from "./i18n";

describe("bilingual interface copy", () => {
  it("provides matching Mongolian and English keys", () => {
    expect(Object.keys(messages.en).sort()).toEqual(Object.keys(messages.mn).sort());
  });

  it("returns Mongolian copy by default and English copy when selected", () => {
    expect(translate("mn", "dashboard.title")).toBe("Хянах самбар");
    expect(translate("en", "dashboard.title")).toBe("Dashboard");
  });

  it("falls back to the key when a translation is missing", () => {
    expect(translate("en" as Locale, "missing.key")).toBe("missing.key");
  });
});
