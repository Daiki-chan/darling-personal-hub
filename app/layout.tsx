import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import { MusicShell } from "@/components/music/music-shell";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

const syne = Syne({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: "FUJIWARA DAIKI | Personal Hub",
  description: "A typographic world of photographs, music, and selected work.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${outfit.variable} ${syne.variable}`}>
      <body><MusicShell>{children}</MusicShell></body>
    </html>
  );
}

