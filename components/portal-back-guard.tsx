"use client";

import { usePathname, useRouter } from "next/navigation";
import { memo, useEffect } from "react";

const baseStateKey = "__darlingPortalBase";
const guardStateKey = "__darlingPortalGuard";

export const PortalBackGuard = memo(function PortalBackGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
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
