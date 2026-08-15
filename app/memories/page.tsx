import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MemoryArchivePage } from "@/components/memories/memory-archive-page";

export const metadata: Metadata = {
  title: "MEMORIES / ARCHIVE | FUJIWARA DAIKI",
  description: "A personal visual archive of virtual worlds, ordinary days, and quiet light.",
  alternates: {
    canonical: "/memories",
  },
};

export default function MemoriesPage() {
  return (
    <>
      <SiteHeader active="memories" />
      <main className="inner-page inner-page--memories">
        <MemoryArchivePage />
      </main>
      <SiteFooter />
    </>
  );
}
