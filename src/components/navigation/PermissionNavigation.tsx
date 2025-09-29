// import React, { memo, useMemo } from 'react';
// import { usePermissions } from '@/hooks/usePermissions';
// import { PERMISSION_MODULES, PERMISSION_ACTIONS, PROTECTED_ROUTES } from '@/constants/permissions';

// interface NavigationItem {
//   id: string;
//   label: string;
//   href: string;
//   icon?: React.ComponentType<any>;
//   children?: NavigationItem[];
//   requiredModule?: keyof typeof PERMISSION_MODULES;
// }

// interface PermissionNavigationProps {
//   items: NavigationItem[];
//   children: (filteredItems: NavigationItem[]) => React.ReactNode;
// }

// const PermissionNavigation: React.FC<PermissionNavigationProps> = memo(({ items, children }) => {
//   const { canAccess, accessibleModules } = usePermissions();

//   const filteredItems = useMemo(() => {
//     const filterItems = (navItems: NavigationItem[]): NavigationItem[] => {
//       return navItems.filter(item => {
//         if (!item.requiredModule) {
//           return true;
//         }

//         const module = PERMISSION_MODULES[item.requiredModule];
//         const hasAccess = canAccess(module, PERMISSION_ACTIONS.VIEW);

//         if (item.children) {
//           const filteredChildren = filterItems(item.children);
//           return hasAccess && filteredChildren.length > 0;
//         }

//         return hasAccess;
//       }).map(item => ({
//         ...item,
//         children: item.children ? filterItems(item.children) : undefined
//       }));
//     };

//     return filterItems(items);
//   }, [items, canAccess]);

//   return <>{children(filteredItems)}</>;
// });

// PermissionNavigation.displayName = 'PermissionNavigation';

// export default PermissionNavigation;

// Temporary placeholder component
import React from 'react';
const PermissionNavigation = () => null;
export default PermissionNavigation;
