import type { Metadata } from "next";
import "./globals.css";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";

export const metadata: Metadata = {
  title: "MASS SMS — Business Messaging Platform",
  description: "Business SMS campaigns, consent-based contacts, delivery reporting and credit management for Mongolia.",
  applicationName: "MASS SMS",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/mass-sms-mark.svg", shortcut: "/mass-sms-mark.svg", apple: "/apple-icon.png" },
  themeColor: "#2563eb",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="mn" suppressHydrationWarning><body>{children}<PwaInstallPrompt /></body></html>;
}
