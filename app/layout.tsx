import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MASS SMS — Business Messaging Platform",
  description: "Business SMS campaigns, consent-based contacts, delivery reporting and credit management for Mongolia.",
  applicationName: "MASS SMS",
  icons: { icon: "/mass-sms-mark.svg", shortcut: "/mass-sms-mark.svg" },
  themeColor: "#2563eb",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="mn" suppressHydrationWarning><body>{children}</body></html>;
}
