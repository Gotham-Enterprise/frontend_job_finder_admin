"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { usePendingSupervisorCount } from "@/hooks/usePendingSupervisorCount";

interface PendingSupervisorContextType {
  pendingCount: number;
  isLoading: boolean;
  refetch: () => void;
}

const PendingSupervisorContext = createContext<PendingSupervisorContextType | undefined>(undefined);

export const usePendingSupervisorContext = () => {
  const context = useContext(PendingSupervisorContext);
  if (!context) {
    throw new Error("usePendingSupervisorContext must be used within PendingSupervisorProvider");
  }
  return context;
};

interface PendingSupervisorProviderProps {
  children: ReactNode;
}

export const PendingSupervisorProvider: React.FC<PendingSupervisorProviderProps> = ({ children }) => {
  const { data, isLoading, refetch } = usePendingSupervisorCount();

  const pendingCount = typeof data === "number" ? data : 0;

  return (
    <PendingSupervisorContext.Provider value={{ pendingCount, isLoading, refetch }}>
      {children}
    </PendingSupervisorContext.Provider>
  );
};
