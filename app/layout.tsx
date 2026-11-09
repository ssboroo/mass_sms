import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MASS SMS — Business Messaging Platform",
  description: "A professional business SMS platform for campaigns, contacts, billing and delivery reporting."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="mn"><body>{children}</body></html>;
}
