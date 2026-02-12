"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useAuthPermissions } from "../hooks/useAuthPermissions";
import { useUnlockRequestContext } from "../context/UnlockRequestContext";
import { hasAnyModulePermission, hasPermission } from "../utils/permissionUtils";
import { authUtils } from "../services/utils/authUtils";
import SidebarSkeleton from "../components/common/SidebarSkeleton";
import {
  ChevronDownIcon,
  GridIcon,
  GroupIcon,
  HorizontaLDots,
  PieChartIcon,
  UserCircleIcon,
  TaskIcon,
  IdCardIcon,
  HandShake
} from "../icons/index";
import { BriefcaseIcon, CareerLadderIcon, TicketIcon, BlogIcon, CouponIcon } from "../components/ui/icons/index";


type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: {
    name: string;
    path: string;
    pro?: boolean;
    new?: boolean;
    requiredAction?: "view" | "add" | "edit" | "delete";
  }[];
  permissionKey?:
    | "jobSeekers"
    | "employers"
    | "jobs"
    | "applications"
    | "careers"
    | "tickets"
    | "coupons"
    | "blog"
    // | "forum"
    | "unlockRequest";
  isAccessible?: boolean;
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
    isAccessible: true, // Dashboard is always accessible
    //subItems: [{ name: "Ecommerce", path: "/", pro: false }],
  },
  {
    icon: <GroupIcon />,
    name: "Job Seekers",
    path: "/admin/job-seekers",
    permissionKey: "jobSeekers",
  },
  {
    icon: <UserCircleIcon />,
    name: "Employers",
    path: "/admin/employers",
    permissionKey: "employers",
  },
  {
    icon: <TaskIcon />,
    name: "Applications",
    path: "/admin/applications",
    permissionKey: "applications",
    //subItems: [{ name: "Form Elements", path: "/form-elements", pro: false }],
  },
  {
    icon: <HandShake />,
    name: "Affiliate Partners",
    path: "/admin/affiliates"
  },
   {
    icon: <PieChartIcon />,
    name: "Forum Moderation",
    path: "/admin/forum-moderation",
    // permissionKey: "forum",
  },
  {
    icon: <BriefcaseIcon />,
    name: "Jobs",
    path: "/admin/jobs",
    permissionKey: "jobs",
    subItems: [
      { name: "All Jobs", path: "/admin/jobs", requiredAction: "view" },
      { name: "Add New", path: "/admin/jobs/create-job/", requiredAction: "add" },
    ],
  },
  {
    icon: <BlogIcon />,
    name: "Blog",
    path: "/admin/blog",
    permissionKey: "blog",
    subItems: [
      { name: "All Posts", path: "/admin/blog", requiredAction: "view" },
      { name: "Add New", path: "/admin/blog/add-new", requiredAction: "add" },
      { name: "Categories", path: "/admin/blog/categories", requiredAction: "view" },
      { name: "Tags", path: "/admin/blog/tags", requiredAction: "view" },
      { name: "Archives", path: "/admin/blog/archives", requiredAction: "view" },
    ],
  },
  {
    icon: <PieChartIcon />,
    name: "Analytics",
    subItems: [
      { name: "Traffic Analytics", path: "/admin/analytics/page-visits", pro: false },
    ],
  },
  {
    icon: <CareerLadderIcon />,
    name: "Careers",
    path: "/admin/careers", // /admin/careers
    permissionKey: "careers",
    //subItems: [{ name: "Form Elements", path: "/form-elements", pro: false }],
  },
  {
    icon: <TicketIcon />,
    name: "Tickets",
    path: "/admin/comming-soon", // /admin/tickets
    permissionKey: "tickets",
    //subItems: [{ name: "Form Elements", path: "/form-elements", pro: false }],
  },
  {
    icon: <CouponIcon />,
    name: "Coupons",
    path: "/admin/coupons",
    permissionKey: "coupons",
    //subItems: [{ name: "Form Elements", path: "/form-elements", pro: false }],
  },
  {
    icon: <IdCardIcon />,
    name: "Unlock Requests",
    path: "/admin/unlock-requests",
    permissionKey: "unlockRequest",
    //subItems: [{ name: "Form Elements", path: "/form-elements", pro: false }],
  },
  
];

const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Charts",
    subItems: [
      { name: "Line Chart", path: "/line-chart", pro: false },
      { name: "Bar Chart", path: "/bar-chart", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { permissions, loading } = useAuthPermissions();

  // Safely get unlock request context (may not be available during initial render)
  let pendingCount = 0;
  try {
    const unlockContext = useUnlockRequestContext();
    pendingCount = unlockContext.pendingCount;
  } catch (error) {
    // Context not available, use default value
    console.debug("[Sidebar] UnlockRequestContext not available");
  }

  const pathname = usePathname();
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Check if user is authenticated to show sidebar immediately
  // Use state to avoid hydration mismatch
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasUserData, setHasUserData] = useState(false);

  // Initialize auth state on client side only
  useEffect(() => {
    setIsAuthenticated(authUtils.isAuthenticated());
    setHasUserData(!!authUtils.getUser());
  }, []);

  // Handle initial mount timing
  useEffect(() => {
    if (permissions && isInitialMount) {
      // Small delay to ensure everything is properly initialized
      setTimeout(() => {
        setIsInitialMount(false);
      }, 100);
    }
  }, [permissions, isInitialMount]);

  // Force re-render when permissions change
  useEffect(() => {
    if (permissions) {
      setForceUpdate((prev) => prev + 1);
    }
  }, [permissions]);

  // Listen for permissions loaded event
  useEffect(() => {
    const handlePermissionsLoaded = (event: CustomEvent) => {
      console.log("[Sidebar] Permissions loaded event received:", event.detail);
      setForceUpdate((prev) => prev + 1);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("permissionsLoaded" as any, handlePermissionsLoaded);
      window.addEventListener("authUpdate", () => {
        console.log("[Sidebar] Auth update event received");
        setForceUpdate((prev) => prev + 1);
      });

      return () => {
        window.removeEventListener("permissionsLoaded" as any, handlePermissionsLoaded);
        window.removeEventListener("authUpdate", () => {});
      };
    }
  }, []);

  // Check if item is accessible based on permissions
  const isItemAccessible = (item: NavItem): boolean => {
    // If item has explicit isAccessible, use that
    if (item.isAccessible !== undefined) {
      return item.isAccessible;
    }

    // If item has permissionKey and we have permissions, check permissions
    if (item.permissionKey && permissions) {
      const hasPermission = hasAnyModulePermission(permissions, item.permissionKey);

      // Special handling for Unlock Requests - show if user is Super Admin
      if (item.permissionKey === "unlockRequest" && !hasPermission) {
        const user = typeof window !== "undefined" ? authUtils.getUser() : null;
        const isSuperAdmin = user?.adminRoleAccess?.roleName?.toLowerCase() === "super admin";
        console.log(
          `[Sidebar] Special check for Unlock Requests - isSuperAdmin: ${isSuperAdmin}, roleName: ${user?.adminRoleAccess?.roleName}`
        );
        if (isSuperAdmin) {
          return true;
        }
      }

      console.log(
        `[Sidebar] Checking accessibility for "${item.name}" (${item.permissionKey}):`,
        hasPermission,
        permissions[item.permissionKey]
      );
      return hasPermission;
    }

    // If we're authenticated but still loading permissions, show loading state instead of showing all items
    if (isAuthenticated && hasUserData && loading) {
      return false; // Don't show items while loading to avoid false positive access
    }

    // If we're authenticated but don't have permissions yet, don't show items
    if (isAuthenticated && hasUserData && !permissions) {
      return false; // Don't show items if we don't have permission data
    }

    // Only default to accessible if no permission key is required
    return !item.permissionKey;
  };

  const renderMenuItems = (allNavItems: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {allNavItems.map((nav, index) => {
        // Skip rendering if not accessible
        const accessible = isItemAccessible(nav);
        if (!accessible) {
          return null;
        }

        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => submenuToggle(index, menuType)}
                className={`menu-item group  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
              >
                <span
                  className={` ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && <span className={`menu-item-text`}>{nav.name}</span>}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                      openSubmenu?.type === menuType && openSubmenu?.index === index ? "rotate-180 text-brand-500" : ""
                    }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  href={nav.path}
                  className={`menu-item group relative ${
                    isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  } ${
                    nav.permissionKey === "unlockRequest" && pendingCount > 0
                      ? "!bg-[#006D36]/10 dark:!bg-[#006D36]/20 border-l-4 !border-[#006D36]"
                      : ""
                  }`}
                >
                  <span
                    className={`${isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"} ${
                      nav.permissionKey === "unlockRequest" && pendingCount > 0 ? "!text-[#006D36]" : ""
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span
                      className={`menu-item-text ${
                        nav.permissionKey === "unlockRequest" && pendingCount > 0
                          ? "!text-[#006D36] !font-semibold"
                          : ""
                      }`}
                    >
                      {nav.name}
                    </span>
                  )}
                  {nav.permissionKey === "unlockRequest" &&
                    pendingCount > 0 &&
                    (isExpanded || isHovered || isMobileOpen) && (
                      <span className="ml-auto bg-[#006D36] text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[24px] text-center">
                        {pendingCount}
                      </span>
                    )}
                  {nav.permissionKey === "unlockRequest" &&
                    pendingCount > 0 &&
                    !isExpanded &&
                    !isHovered &&
                    !isMobileOpen && (
                      <span className="absolute -top-1 -right-1 bg-[#006D36] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {pendingCount > 9 ? "9+" : pendingCount}
                      </span>
                    )}
                </Link>
              )
            )}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? `${subMenuHeight[`${menuType}-${index}`]}px`
                      : "0px",
                }}
              >
                <ul className="mt-2 space-y-1">
                  {nav.subItems
                    .filter((subItem) => {
                      // Filter submenu items based on required permissions
                      if (subItem.requiredAction && nav.permissionKey && permissions) {
                        const actionMap: Record<string, keyof (typeof permissions)[keyof typeof permissions]> = {
                          view: "view",
                          add: "create",
                          edit: "update",
                          delete: "delete",
                        };
                        const mappedAction = actionMap[subItem.requiredAction];
                        const hasRequiredPermission = hasPermission(permissions, nav.permissionKey, mappedAction);
                        return hasRequiredPermission;
                      }

                      // If we have permissions loaded but no specific permission requirement, show the item
                      if (permissions && !subItem.requiredAction) {
                        return true;
                      }

                      // If we don't have permissions or are loading, don't show submenu items
                      return false;
                    })
                    .map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          href={subItem.path}
                          className={`menu-dropdown-item ${
                            isActive(subItem.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"
                          }`}
                        >
                          {subItem.name}
                          <span className="flex items-center gap-1 ml-auto">
                            {subItem.new && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge `}
                              >
                                new
                              </span>
                            )}
                            {subItem.pro && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge `}
                              >
                                pro
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        // Only check accessible items
        if (!isItemAccessible(nav)) return;

        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive, permissions]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const submenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu && prevOpenSubmenu.type === menuType && prevOpenSubmenu.index === index) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  // Show skeleton if we're loading and don't have permissions yet, but only if authenticated
  if (loading && !permissions && isAuthenticated && hasUserData) {
    return (
      <aside
        className={`fixed flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
          ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0`}
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`py-8 flex flex-shrink-0 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
          <Link href="/">
            {isExpanded || isHovered || isMobileOpen ? (
              <>
                <Image className="dark:hidden" src="/images/logo/main-logo.svg" alt="Logo" width={150} height={40} />
                <Image
                  className="hidden dark:block"
                  src="/images/logo/logo-dark.svg"
                  alt="Logo"
                  width={150}
                  height={40}
                />
              </>
            ) : (
              <Image src="/images/logo/logo-icon.svg" alt="Logo" width={32} height={32} />
            )}
          </Link>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto duration-300 ease-linear min-h-0">
          <SidebarSkeleton isExpanded={isExpanded || isMobileOpen} isMobileOpen={isMobileOpen} isHovered={isHovered} />
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`fixed flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-8 flex flex-shrink-0 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image className="dark:hidden" src="/images/logo/main-logo.svg" alt="Logo" width={150} height={40} />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image src="/images/logo/logo-icon.svg" alt="Logo" width={32} height={32} />
          )}
        </Link>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto duration-300 ease-linear min-h-0">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
