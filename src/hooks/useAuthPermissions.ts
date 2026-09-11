import { useState, useEffect, useRef, useCallback } from "react";
import { UserPermissions } from "@/services/types/permissions";
import { convertApiPermissionsToUserPermissions } from "@/utils/permissionUtils";
import { authUtils } from "@/services/utils/authUtils";
import { authApi } from "@/services/api/auth";

interface UseAuthPermissionsReturn {
  permissions: UserPermissions | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  userRole: { id: number; name: string } | null;
}

function extractUserData(response: unknown): any {
  const result = response as { data?: unknown; user?: unknown };
  return result?.data || result?.user || response;
}

export const useAuthPermissions = (): UseAuthPermissionsReturn => {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<{ id: number; name: string } | null>(null);
  const requestIdRef = useRef(0);

  const applyUserData = useCallback((userData: any): boolean => {
    if (userData?.adminRoleAccess?.rolePermissions) {
      const userPermissions = convertApiPermissionsToUserPermissions(userData);

      setPermissions(userPermissions);
      setUserRole({
        id: userData.adminRoleAccess.id,
        name: userData.adminRoleAccess.roleName,
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("permissionsLoaded", { detail: userPermissions }));
      }

      return true;
    }
    return false;
  }, []);

  const persistUserData = useCallback((userData: any) => {
    const authState = authUtils.getAuthState();
    if (authState?.user) {
      authUtils.saveAuthState({
        ...authState,
        user: {
          ...authState.user,
          ...userData,
        },
      });
    }
  }, []);

  const fetchPermissions = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    try {
      setError(null);

      const localUser = authUtils.getUser();
      if (localUser && applyUserData(localUser)) {
        setLoading(false);
      } else if (!authUtils.isAuthenticated()) {
        setLoading(false);
        return;
      }

      if (!authUtils.isAuthenticated()) {
        return;
      }

      const response = await authApi.getCurrentUser();
      if (requestId !== requestIdRef.current) {
        return;
      }

      const userData = extractUserData(response);
      if (!applyUserData(userData)) {
        throw new Error("Invalid user data format");
      }
      persistUserData(userData);
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      const hasLocalPermissions = !!authUtils.getUser()?.adminRoleAccess?.rolePermissions;
      if (!hasLocalPermissions) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch permissions";
        setError(errorMessage);
      }
      console.error("Error fetching user permissions:", err);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [applyUserData, persistUserData]);

  useEffect(() => {
    fetchPermissions();

    const handleAuthUpdate = () => {
      fetchPermissions();
    };

    window.addEventListener("authUpdate", handleAuthUpdate);
    return () => {
      requestIdRef.current += 1;
      window.removeEventListener("authUpdate", handleAuthUpdate);
    };
  }, [fetchPermissions]);

  return {
    permissions,
    loading,
    error,
    refetch: fetchPermissions,
    userRole,
  };
};

export default useAuthPermissions;
