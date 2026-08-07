"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type TrackMenuContextType = {
  openMenuInstanceId: string | null;
  setOpenMenuInstanceId: (id: string | null) => void;
};

const TrackMenuContext = createContext<TrackMenuContextType>({
  openMenuInstanceId: null,
  setOpenMenuInstanceId: () => {},
});

export function TrackMenuProvider({ children }: { children: ReactNode }) {
  const [openMenuInstanceId, setOpenMenuInstanceId] = useState<string | null>(null);

  const value = useMemo(
    () => ({ openMenuInstanceId, setOpenMenuInstanceId }),
    [openMenuInstanceId],
  );

  return <TrackMenuContext.Provider value={value}>{children}</TrackMenuContext.Provider>;
}

export function useTrackMenu() {
  return useContext(TrackMenuContext);
}
