"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { authUtils } from "@/services/utils/authUtils";
import {
  ChevronDownIcon,
  GridIcon,
  GroupIcon,
  HorizontaLDots,
  PieChartIcon,
  UserCircleIcon,
  TaskIcon,
} from "../icons/index";
import {
  BriefcaseIcon,
  CareerLadderIcon,
  TicketIcon,
  BlogIcon,
  CouponIcon,
} from "../components/ui/icons/index";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  permission?: string;
  subItems?: { 
    name: string; 
    path: string; 
    pro?: boolean; 
    new?: boolean;
    permission?: string;
    action?: 'view' | 'add' | 'edit' | 'delete';
  }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/admin/dashboard",
  },
  {
    icon: <GroupIcon />,
    name: "Job Seekers", 
    path: "/admin/job-seekers",
    permission: "Job Seekers",
  },
  {
    icon: <UserCircleIcon />,
    name: "Employers",
    path: "/admin/employers", 
    permission: "Employers",
  },
  {
    icon: <BriefcaseIcon />,
    name: "Jobs",
    path: "/admin/jobs-admin",
    permission: "Jobs",
    subItems: [
      { name: "All Jobs", path: "/admin/jobs-admin", permission: "Jobs" },
      { name: "Add New", path: "/admin/jobs-admin/create-job/", permission: "Jobs", action: "add" }
    ],
  },
  {
    icon: <TaskIcon />,
    name: "Applications",
    path: "/admin/applications",
    permission: "Applications",
  },
  {
    icon: <CareerLadderIcon />,
    name: "Careers",
    path: "/admin/careers",
    permission: "Careers",
  },
  {
    icon: <TicketIcon />,
    name: "Tickets",
    path: "/admin/comming-soon", // Will be /admin/tickets when ready
    permission: "Tickets",
  },
  {
    icon: <CouponIcon />,
    name: "Coupons",
    path: "/admin/coupons",
    permission: "Coupons",
  },
  {
    icon: <BlogIcon />,
    name: "Blog",
    path: "/admin/blog",
    permission: "Blog",
    subItems: [
      { name: "All Posts", path: "/admin/blog" }, // No specific permission needed beyond parent
      { name: "Add New", path: "/admin/blog/add-new", permission: "Blog", action: "add" },
      { name: "Categories", path: "/admin/blog/categories" },
      { name: "Tags", path: "/admin/blog/tags" },
      { name: "Archives", path: "/admin/blog/archives" },
    ],
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

const PermissionAwareSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  
  // Helper function to check permission from user data
  const hasPermission = useCallback((permissionName: string, action: 'view' | 'add' | 'edit' | 'delete' = 'view'): boolean => {
    try {
      console.log('Checking permission for:', permissionName, 'action:', action);
      
      // Get user data inside the callback to avoid dependency issues
      const user = authUtils.getUser();
      
      if (!user || !user.adminRoleAccess || !user.adminRoleAccess.rolePermissions) {
        console.log('No user or role permissions found');
        return false;
      }

      const rolePermissions = user.adminRoleAccess.rolePermissions;
      console.log('Available permissions:', rolePermissions.map((p: any) => p.permission.name));
      
      // Direct match first (case sensitive)
      let permission = rolePermissions.find((p: any) => 
        p.permission.name === permissionName
      );
      
      // If no direct match, try case-insensitive match
      if (!permission) {
        permission = rolePermissions.find((p: any) => 
          p.permission.name.toLowerCase() === permissionName.toLowerCase()
        );
      }

      console.log('Found permission for', permissionName, ':', permission);

      if (!permission) return false;

      const hasAccess = permission[action];
      console.log('Has', action, 'access:', hasAccess);
      
      return hasAccess;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }, []); // Empty dependency array since we get user data inside the function

  const filterItemsByPermission = useCallback((items: NavItem[]): NavItem[] => {
    console.log('Filtering nav items. Total items:', items.length);
    
    return items.filter(item => {
      console.log('Checking item:', item.name, 'permission:', item.permission);
      
      // If no permission is specified, show the item (like Dashboard, Charts)
      if (!item.permission) {
        console.log('No permission required for', item.name, '- showing');
        return true;
      }
      
      // Check if user has view permission for this module
      const hasAccess = hasPermission(item.permission, 'view');
      console.log('Item', item.name, 'has access:', hasAccess);
      
      if (!hasAccess) return false;
      
      // If item has subitems, filter them too
      if (item.subItems) {
        item.subItems = item.subItems.filter(subItem => {
          // If no permission specified for subitem, show it (like "All Posts")
          if (!subItem.permission) return true;
          
          // Check specific action if specified, otherwise default to 'view'
          const requiredAction = subItem.action || 'view';
          return hasPermission(subItem.permission, requiredAction);
        });
      }
      
      return true;
    });
  }, [hasPermission]);

  // Get filtered navigation items based on permissions
  const filteredNavItems = filterItemsByPermission(navItems);
  const filteredOthersItems = filterItemsByPermission(othersItems);

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => submenuToggle(index, menuType)}
              className={`menu-item group  ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
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
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
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
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
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
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? filteredNavItems : filteredOthersItems;
      items.forEach((nav, index) => {
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
  }, [pathname, isActive, filteredNavItems, filteredOthersItems]);

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
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed lex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/main-logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(filteredNavItems, "main")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default PermissionAwareSidebar;
