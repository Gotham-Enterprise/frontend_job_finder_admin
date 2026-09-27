"use client";
import { usePermissionCheck } from "@/components/guards/PermissionGuard";

export function useAffiliatePermissions() {
  const { checkPermission } = usePermissionCheck();
  return {
    canCreate: checkPermission("affiliates", "create"),
    canUpdate: checkPermission("affiliates", "update"),
    canDelete: checkPermission("affiliates", "delete"),
  };
}
