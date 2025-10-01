"use client";

import { useSidebar } from "@/context/SidebarContext";
import { AutoLogoutProvider } from "@/context/AutoLogoutContext";
import { InactivityStatus } from "@/components/InactivityStatus";
import AppHeader from "@/layout/AppHeader";
import PermissionAwareSidebar from "@/layout/PermissionAwareSidebar";
import Backdrop from "@/layout/Backdrop";
import AuthInitializer from "@/components/auth/AuthInitializer";
import PermissionGuard from "@/components/guards/PermissionGuard";
import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authUtils } from "@/services/utils/authUtils";
import { useCurrentUser } from "@/services/hooks/useAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const router = useRouter();
  const pathname = usePathname();

  // Hide Sidebar and Header on specific newsletter create pages
  const hideSidebarAndHeader =
    pathname?.startsWith("/admin/news-letter/create") ||
    pathname?.startsWith("/admin/news-letter/job-seekers/create") ||
    pathname?.startsWith("/admin/news-letter/employers/create");

  // Fetch current user data to keep auth state fresh
  useCurrentUser();

  const mainContentMargin = hideSidebarAndHeader
    ? "ml-0"
    : isMobileOpen
      ? "ml-0"
      : isExpanded || isHovered
        ? "lg:ml-[290px]"
        : "lg:ml-[90px]";

  useEffect(() => {
    if (typeof window !== "undefined" && !authUtils.isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);
  return (
    <AuthInitializer>
      <AutoLogoutProvider>
        <div className="min-h-screen xl:flex">
          {!hideSidebarAndHeader && <PermissionAwareSidebar />}
          <Backdrop />
          <div className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}>
            {!hideSidebarAndHeader && <AppHeader />}
            {!hideSidebarAndHeader && (
              <InactivityStatus className="mx-4 mb-4 md:mx-6 md:mb-6" showWarning={true} warningThreshold={0.25} />
            )}
            <div className={hideSidebarAndHeader ? "" : "p-4 mx-auto md:p-6"}>
              <PermissionGuard showFallback={true}>{children}</PermissionGuard>
            </div>
          </div>
        </div>
      </AutoLogoutProvider>
    </AuthInitializer>
  );
}
