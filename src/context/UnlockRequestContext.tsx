"use client";

import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useUnlockRequestCount } from "@/hooks/useUnlockRequestCount";

interface UnlockRequestContextType {
  pendingCount: number;
  isLoading: boolean;
  refetch: () => void;
}

const UnlockRequestContext = createContext<UnlockRequestContextType | undefined>(undefined);

export const useUnlockRequestContext = () => {
  const context = useContext(UnlockRequestContext);
  if (!context) {
    throw new Error("useUnlockRequestContext must be used within UnlockRequestProvider");
  }
  return context;
};

interface UnlockRequestProviderProps {
  children: ReactNode;
}

export const UnlockRequestProvider: React.FC<UnlockRequestProviderProps> = ({ children }) => {
  const { data, isLoading, refetch } = useUnlockRequestCount();

  // Ensure we always have a valid number, not undefined
  const pendingCount = typeof data === "number" ? data : 0;

  return (
    <UnlockRequestContext.Provider value={{ pendingCount, isLoading, refetch }}>
      {children}
    </UnlockRequestContext.Provider>
  );
};
