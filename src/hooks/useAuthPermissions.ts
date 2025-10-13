import { useState, useEffect } from "react";
import { UserPermissions } from "@/services/types/permissions";
import { convertApiPermissionsToUserPermissions } from "@/utils/permissionUtils";
import { authUtils } from "@/services/utils/authUtils";

interface ApiUserData {
  adminRoleAccess: {
    id: number;
    roleName: string;
    rolePermissions: Array<{
      id: string;
      roleId: number;
      permissionId: string;
      add: boolean;
      view: boolean;
      edit: boolean;
      delete: boolean;
      permission: {
        id: string;
        name: string;
        description: string;
      };
    }>;
  };
}

interface UseAuthPermissionsReturn {
  permissions: UserPermissions | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  userRole: { id: number; name: string } | null;
}

export const useAuthPermissions = (): UseAuthPermissionsReturn => {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<{ id: number; name: string } | null>(null);

  const [initialLoad, setInitialLoad] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Mark component as mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  const processUserData = (userData: any) => {
    if (userData && userData.adminRoleAccess && userData.adminRoleAccess.rolePermissions) {
      // Convert API permissions to our format
      const userPermissions = convertApiPermissionsToUserPermissions(userData);

      console.log("[useAuthPermissions] Processing user permissions:", userPermissions);

      setPermissions(userPermissions);

      // Set user role information
      setUserRole({
        id: userData.adminRoleAccess.id,
        name: userData.adminRoleAccess.roleName,
      });

      // Force a state update event
      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("permissionsLoaded", { detail: userPermissions }));
        }, 0);
      }

      return true;
    }
    return false;
  };

  const fetchPermissions = async () => {
    try {
      // Only show loading state if we don't already have permissions
      if (initialLoad && !permissions) {
        setLoading(true);
      }
      setError(null);

      // First, try to get user data from localStorage
      const user = authUtils.getUser();
      if (user && processUserData(user)) {
        if (loading) setLoading(false);
        if (initialLoad) setInitialLoad(false);
        return;
      }

      // Only make API call if we're authenticated and don't have permissions
      if (!authUtils.isAuthenticated()) {
        if (loading) setLoading(false);
        if (initialLoad) setInitialLoad(false);
        return;
      }

      // If no user in localStorage or missing permission data, fetch from API
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...authUtils.getAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user permissions: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error("Invalid response format");
      }

      const userData: ApiUserData = result.data;

      if (!processUserData(userData)) {
        throw new Error("Invalid user data format");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch permissions";
      setError(errorMessage);
      console.error("Error fetching user permissions:", err);

      // Don't set fallback permissions - let the component handle the no-permissions state
      // This ensures that if the API call fails, we don't accidentally grant permissions
    } finally {
      setLoading(false);
      if (initialLoad) setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchPermissions();

    // Listen for auth updates
    const handleAuthUpdate = () => {
      fetchPermissions();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("authUpdate", handleAuthUpdate);
      return () => {
        window.removeEventListener("authUpdate", handleAuthUpdate);
      };
    }
  }, []);

  return {
    permissions,
    loading,
    error,
    refetch: fetchPermissions,
    userRole,
  };
};

export default useAuthPermissions;
