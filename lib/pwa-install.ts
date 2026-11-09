export type InstallPlatform = "ios" | "android";

export function getInstallPlatform(userAgent: string, isStandalone: boolean): InstallPlatform | null {
  if (isStandalone) return null;
  if (/iPad|iPhone|iPod/i.test(userAgent)) return "ios";
  if (/Android/i.test(userAgent) && /Mobile/i.test(userAgent)) return "android";
  return null;
}
