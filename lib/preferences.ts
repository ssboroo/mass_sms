export type AppLocale = "mn" | "en";
export type AppTheme = "light" | "dark";
export interface AppPreferences { locale: AppLocale; theme: AppTheme; }

export const DEFAULT_PREFERENCES: AppPreferences = { locale: "mn", theme: "light" };

export function parsePreferences(value: unknown): AppPreferences {
  if (!value || typeof value !== "object") return DEFAULT_PREFERENCES;
  const candidate = value as Record<string, unknown>;
  return {
    locale: candidate.locale === "en" ? "en" : "mn",
    theme: candidate.theme === "dark" ? "dark" : "light",
  };
}

export function serializePreferences(value: AppPreferences): string {
  return JSON.stringify(parsePreferences(value));
}
