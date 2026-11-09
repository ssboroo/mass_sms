import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mass SMS — Бизнес мессежийн платформ",
  description: "Монголын бүх оператор руу нэг дор SMS илгээх платформ."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="mn"><body>{children}</body></html>;
}
