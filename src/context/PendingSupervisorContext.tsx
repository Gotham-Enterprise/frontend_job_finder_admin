"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { usePendingSupervisorCount } from "@/hooks/usePendingSupervisorCount";

interface PendingSupervisorContextType {
  /** Pending supervisors excluding Preceptors. */
  pendingCount: number;
  /** Pending Preceptors. */
  pendingPreceptorCount: number;
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

  const pendingCount = data?.supervisors ?? 0;
  const pendingPreceptorCount = data?.preceptors ?? 0;

  return (
    <PendingSupervisorContext.Provider value={{ pendingCount, pendingPreceptorCount, isLoading, refetch }}>
      {children}
    </PendingSupervisorContext.Provider>
  );
};
