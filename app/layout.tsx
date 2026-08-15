import type { Metadata } from "next";
import { IBM_Plex_Serif, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { MusicShell } from "@/components/music/music-shell";
import "./globals.css";

const primaryFont = Space_Grotesk({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-primary",
});

const editorialFont = IBM_Plex_Serif({
  weight: "700",
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-editorial",
  preload: false,
});

const monoFont = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-mono",
  preload: false,
});

export const metadata: Metadata = {
  title: "FUJIWARA DAIKI | Personal Hub",
  description: "A typographic world of photographs, music, and selected work.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="vi"
      className={`${primaryFont.variable} ${editorialFont.variable} ${monoFont.variable}`}
    >
      <body><MusicShell>{children}</MusicShell></body>
    </html>
  );
}
