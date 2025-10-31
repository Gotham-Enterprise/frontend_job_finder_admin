"use client";

import React, { createContext, useContext, ReactNode } from "react";
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
  const { data: pendingCount = 0, isLoading, refetch } = useUnlockRequestCount();

  return (
    <UnlockRequestContext.Provider value={{ pendingCount, isLoading, refetch }}>
      {children}
    </UnlockRequestContext.Provider>
  );
};
