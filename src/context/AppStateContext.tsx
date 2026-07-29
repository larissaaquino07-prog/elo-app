import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { friendActivityData } from "../data/mockData";
import type { FriendActivity, SportKey } from "../types";

interface AppState {
  premium: boolean;
  showPaywall: boolean;
  toast: string | null;
  activity: FriendActivity[];
  instagramOptIn: boolean;
  locationOptIn: boolean;
  expandedSport: SportKey | null;
  setShowPaywall: (v: boolean) => void;
  setPremium: (v: boolean) => void;
  showToast: (message: string) => void;
  toggleKudos: (id: number) => void;
  setInstagramOptIn: (v: boolean) => void;
  setLocationOptIn: (v: boolean) => void;
  setExpandedSport: (v: SportKey | null) => void;
}

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [premium, setPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activity, setActivity] = useState<FriendActivity[]>(friendActivityData);
  const [instagramOptIn, setInstagramOptIn] = useState(true);
  const [locationOptIn, setLocationOptIn] = useState(true);
  const [expandedSport, setExpandedSport] = useState<SportKey | null>("corrida");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }, []);

  const toggleKudos = useCallback((id: number) => {
    setActivity((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, kudoed: !a.kudoed, kudos: a.kudoed ? a.kudos - 1 : a.kudos + 1 } : a
      )
    );
  }, []);

  const value = useMemo<AppState>(
    () => ({
      premium,
      showPaywall,
      toast,
      activity,
      instagramOptIn,
      locationOptIn,
      expandedSport,
      setShowPaywall,
      setPremium,
      showToast,
      toggleKudos,
      setInstagramOptIn,
      setLocationOptIn,
      setExpandedSport,
    }),
    [premium, showPaywall, toast, activity, instagramOptIn, locationOptIn, expandedSport, showToast, toggleKudos]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
