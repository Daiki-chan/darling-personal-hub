"use client";

import { memo } from "react";

/**
 * PortalBackGuard is retained as a no-op component for backward compatibility.
 * History back navigation is now natively handled by ensuring the portal history
 * entry is `/#portals`, removing the need for synthetic history trapping.
 */
export const PortalBackGuard = memo(function PortalBackGuard() {
  return null;
});

