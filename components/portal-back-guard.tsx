"use client";

import { usePathname, useRouter } from "next/navigation";
import { memo, useEffect, useRef } from "react";
import { consumeInitialDocumentVisit } from "@/lib/document-visit";

const baseStateKey = "__darlingPortalBase";
const guardStateKey = "__darlingPortalGuard";

export const PortalBackGuard = memo(function PortalBackGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const isRestartingIntro = useRef(false);

  useEffect(() => {
    if (isRestartingIntro.current) return;

    if (consumeInitialDocumentVisit()) {
      isRestartingIntro.current = true;
      router.replace("/");
      return;
    }

    const currentState = window.history.state ?? {};

    if (currentState[guardStateKey] !== pathname) {
      window.history.replaceState(
        { ...currentState, [baseStateKey]: pathname, [guardStateKey]: null },
        "",
        window.location.href,
      );
      window.history.pushState(
        { ...currentState, [baseStateKey]: null, [guardStateKey]: pathname },
        "",
        window.location.href,
      );
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.[baseStateKey] === pathname) {
        router.replace("/#portals");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [pathname, router]);

  return null;
});
