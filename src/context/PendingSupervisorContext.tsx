"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { usePendingSupervisorCount } from "@/hooks/usePendingSupervisorCount";

interface PendingSupervisorContextType {
  /** Supervisors + Medical Directors awaiting verification. */
  pendingCount: number;
  pendingSupervisorCount: number;
  pendingMedicalDirectorCount: number;
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

  const pendingSupervisorCount = data?.supervisors ?? 0;
  const pendingMedicalDirectorCount = data?.medicalDirectors ?? 0;
  const pendingCount = pendingSupervisorCount + pendingMedicalDirectorCount;

  return (
    <PendingSupervisorContext.Provider
      value={{ pendingCount, pendingSupervisorCount, pendingMedicalDirectorCount, isLoading, refetch }}
    >
      {children}
    </PendingSupervisorContext.Provider>
  );
};
