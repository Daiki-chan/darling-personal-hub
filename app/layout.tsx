import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { MusicShell } from "@/components/music/music-shell";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Darling | Personal Hub",
  description: "A private world of photographs, music, and selected work.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={outfit.variable}>
      <body><MusicShell>{children}</MusicShell></body>
    </html>
  );
}
