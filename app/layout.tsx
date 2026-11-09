import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MASS SMS — Бизнес мессежийн платформ",
  description: "Бизнесийн SMS илгээлт, харилцагчийн жагсаалт, тарифын тооцоог нэг дор удирдах платформ."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="mn"><body>{children}</body></html>;
}
