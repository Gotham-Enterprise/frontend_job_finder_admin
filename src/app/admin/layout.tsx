"use client";

import { useSidebar } from "@/context/SidebarContext";
import { AutoLogoutProvider } from "@/context/AutoLogoutContext";
import { InactivityStatus } from "@/components/InactivityStatus";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authUtils } from "@/services/utils/authUtils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined" && !authUtils.isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);
  return (
    <AutoLogoutProvider>
      <div className="min-h-screen xl:flex">
        <AppSidebar />
        <Backdrop />       
         <div
          className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
        >
          <AppHeader />
          <InactivityStatus 
            className="mx-4 mb-4 md:mx-6 md:mb-6" 
            showWarning={true}
            warningThreshold={0.25}
          />
          <div className="p-4 mx-auto md:p-6">
            {children}
          </div>
        </div>
      </div>
    </AutoLogoutProvider>
  );
}
