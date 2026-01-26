"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import {
  clearDemoSession,
  getDemoSession,
  setDemoSession,
  DemoSession,
} from "@/lib/demoAuth";

type DemoAuthContextValue = {
  session: DemoSession | null;
  setSession: (session: DemoSession) => void;
  clearSession: () => void;
};

const DemoAuthContext = createContext<DemoAuthContextValue | null>(null);

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<DemoSession | null>(null);

  useEffect(() => {
    const sync = () => setSessionState(getDemoSession());
    sync();
    window.addEventListener("demoSessionChanged", sync);
    return () => window.removeEventListener("demoSessionChanged", sync);
  }, []);

  const value: DemoAuthContextValue = useMemo(
    () => ({
      session,
      setSession: (s: DemoSession) => setDemoSession(s),
      clearSession: () => clearDemoSession(),
    }),
    [session]
  );

  return (
    <DemoAuthContext.Provider value={value}>
      {children}
    </DemoAuthContext.Provider>
  );
}

export function useDemoAuth(): DemoAuthContextValue {
  const ctx = useContext(DemoAuthContext);
  if (!ctx) throw new Error("useDemoAuth must be used within DemoAuthProvider");
  return ctx;
}

