'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSidebar } from '../context/SidebarContext';
import { usePermissions } from '@/context/PermissionContext';
import { GLOBAL_PERMISSION_CONFIG, canAccessPath } from '@/config/permissions';
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  PieChartIcon,
  GroupIcon,
  UserCircleIcon,
  TaskIcon,
} from '../icons/index';
import {
  BriefcaseIcon,
  CareerLadderIcon,
  TicketIcon,
  BlogIcon,
  CouponIcon,
} from '../components/ui/icons/index';

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
  requiredModule?: keyof typeof GLOBAL_PERMISSION_CONFIG.modules[0];
};

const iconMap = {
  TicketIcon: <TicketIcon />,
  GroupIcon: <GroupIcon />,
  UserCircleIcon: <UserCircleIcon />,
  TaskIcon: <TaskIcon />,
  CouponIcon: <CouponIcon />,
  BlogIcon: <BlogIcon />,
  CareerLadderIcon: <CareerLadderIcon />,
  BriefcaseIcon: <BriefcaseIcon />,
};

const generateNavItems = (userPermissions: any): NavItem[] => {
  const baseItems: NavItem[] = [
    {
      icon: <GridIcon />,
      name: 'Dashboard',
      path: '/',
    },
  ];

  const moduleItems: NavItem[] = GLOBAL_PERMISSION_CONFIG.modules
    .filter(module => userPermissions[module.key]?.view)
    .map(module => {
      const icon = iconMap[module.icon as keyof typeof iconMap] || <GridIcon />;
      
      return {
        icon,
        name: module.name,
        path: module.path,
        subItems: module.subItems?.filter(subItem => {
          const requiredPermission = subItem.requiredPermission || 'view';
          return userPermissions[module.key]?.[requiredPermission];
        }).map(subItem => ({
          name: subItem.name,
          path: subItem.path,
          pro: false,
          new: false,
        })),
      };
    });

  if (userPermissions.jobSeekers?.view) {
    const jobsIndex = moduleItems.findIndex(item => item.name === 'Job Seekers');
    if (jobsIndex > -1) {
      moduleItems.splice(jobsIndex + 1, 0, {
        icon: <BriefcaseIcon />,
        name: 'Jobs',
        path: '/admin/jobs',
        subItems: [
          { name: 'All Jobs', path: '/admin/jobs', pro: false },
          ...(userPermissions.jobSeekers?.create ? [{ name: 'Add New', path: '/admin/jobs/create-job/', pro: false }] : []),
        ],
      });
    }
  }

  return [...baseItems, ...moduleItems];
};

const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: 'Charts',
    subItems: [
      { name: 'Line Chart', path: '/line-chart', pro: false },
      { name: 'Bar Chart', path: '/bar-chart', pro: false },
    ],
  },
];

const EnhancedAppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { permissions } = usePermissions();
  const pathname = usePathname();

  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [openSubmenu, setOpenSubmenu] = useState<{
    type: 'main' | 'others';
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    const items = generateNavItems(permissions);
    setNavItems(items);
  }, [permissions]);

  const renderMenuItems = (
    items: NavItem[],
    menuType: 'main' | 'others'
  ) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => {
        if (!canAccessPath(permissions, nav.path || '')) {
          return null;
        }

        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => submenuToggle(index, menuType)}
                className={`menu-item group ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? 'menu-item-active'
                    : 'menu-item-inactive'
                } cursor-pointer ${
                  !isExpanded && !isHovered
                    ? 'lg:justify-center'
                    : 'lg:justify-start'
                }`}
              >
                <span
                  className={`${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? 'menu-item-icon-active'
                      : 'menu-item-icon-inactive'
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? 'rotate-180 text-brand-500'
                        : ''
                    }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  href={nav.path}
                  className={`menu-item group ${
                    isActive(nav.path) ? 'menu-item-active' : 'menu-item-inactive'
                  }`}
                >
                  <span
                    className={`${
                      isActive(nav.path)
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive'
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
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
                      : '0px',
                }}
              >
                <ul className="mt-2 space-y-1">
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        href={subItem.path}
                        className={`menu-dropdown-item ${
                          isActive(subItem.path)
                            ? 'menu-dropdown-item-active'
                            : 'menu-dropdown-item-inactive'
                        }`}
                      >
                        {subItem.name}
                        <span className="flex items-center gap-1 ml-auto">
                          {subItem.new && (
                            <span
                              className={`ml-auto ${
                                isActive(subItem.path)
                                  ? 'menu-dropdown-badge-active'
                                  : 'menu-dropdown-badge-inactive'
                              } menu-dropdown-badge`}
                            >
                              new
                            </span>
                          )}
                          {subItem.pro && (
                            <span
                              className={`ml-auto ${
                                isActive(subItem.path)
                                  ? 'menu-dropdown-badge-active'
                                  : 'menu-dropdown-badge-inactive'
                              } menu-dropdown-badge`}
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

  useEffect(() => {
    let submenuMatched = false;
    ['main', 'others'].forEach((menuType) => {
      const items = menuType === 'main' ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as 'main' | 'others',
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
  }, [pathname, isActive, navItems]);

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

  const submenuToggle = (index: number, menuType: 'main' | 'others') => {
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
      className={`fixed flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? 'w-[290px]'
            : isHovered
            ? 'w-[290px]'
            : 'w-[90px]'
        }
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
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
                    ? 'lg:justify-center'
                    : 'justify-start'
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  'Menu'
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(navItems, 'main')}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default EnhancedAppSidebar;
