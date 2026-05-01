import { useState, useEffect } from "react";
import { authUtils } from "@/services/utils/authUtils";

export const useAuthStorage = () => {
  const [authData, setAuthData] = useState({
    user: null as ReturnType<typeof authUtils.getUser>,
    displayName: "",
    userInitials: "",
    isAuthenticated: false,
  });

  useEffect(() => {
    const updateAuthData = () => {
      setAuthData({
        user: authUtils.getUser(),
        displayName: authUtils.getUserDisplayName(),
        userInitials: authUtils.getUserInitials(),
        isAuthenticated: authUtils.isAuthenticated(),
      });
    };

    // Populate from storage on mount
    updateAuthData();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "jobfinder_auth") {
        updateAuthData();
      }
    };

    const handleAuthUpdate = () => {
      updateAuthData();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authUpdate", handleAuthUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authUpdate", handleAuthUpdate);
    };
  }, []);

  return authData;
};

export const triggerAuthUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("authUpdate"));
  }
};
