import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type BusinessContextType = "LOCAL" | "CONSULTORIO";

type BusinessContextValue = {
  context: BusinessContextType | null;
  setContext: (value: BusinessContextType | null) => void;
  clearContext: () => void;
};

const STORAGE_KEY = "business-context";

const BusinessContext = createContext<BusinessContextValue | undefined>(undefined);

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [context, setContextState] = useState<BusinessContextType | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === "LOCAL" || saved === "CONSULTORIO") {
      setContextState(saved);
    }

    setHydrated(true);
  }, []);

  const setContext = (value: BusinessContextType | null) => {
    setContextState(value);

    if (value) {
      localStorage.setItem(STORAGE_KEY, value);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const clearContext = () => {
    setContextState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      context,
      setContext,
      clearContext,
    }),
    [context]
  );

  if (!hydrated) return null;

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinessContext() {
  const ctx = useContext(BusinessContext);

  if (!ctx) {
    throw new Error("useBusinessContext debe usarse dentro de BusinessProvider");
  }

  return ctx;
}