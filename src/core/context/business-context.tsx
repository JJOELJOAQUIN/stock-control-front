import { createContext, useContext, useState, ReactNode } from "react";

export type BusinessContextType = "LOCAL" | "CONSULTORIO";

interface BusinessContextState {
  context: BusinessContextType | null;
  setContext: (c: BusinessContextType) => void;
}

const BusinessContext = createContext<BusinessContextState | undefined>(
  undefined
);

export const BusinessProvider = ({ children }: { children: ReactNode }) => {
  const [context, setContext] = useState<BusinessContextType | null>(null);

  return (
    <BusinessContext.Provider value={{ context, setContext }}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusinessContext = () => {
  const ctx = useContext(BusinessContext);
  if (!ctx) {
    throw new Error("useBusinessContext must be used inside BusinessProvider");
  }
  return ctx;
};