import React from 'react';

interface SidebarSkeletonProps {
  isExpanded?: boolean;
  isMobileOpen?: boolean;
  isHovered?: boolean;
}

const SidebarSkeleton: React.FC<SidebarSkeletonProps> = ({
  isExpanded = true,
  isMobileOpen = false,
  isHovered = false
}) => {
  const showExpanded = isExpanded || isHovered || isMobileOpen;

  return (
    <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
      <nav className="mb-6">
        <div className="flex flex-col gap-4">
          <div>
            {/* Menu Header Skeleton */}
            <div className={`mb-4 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
              {showExpanded ? (
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12"></div>
              ) : (
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              )}
            </div>

            {/* Menu Items Skeleton */}
            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  {/* Icon Skeleton */}
                  <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-shrink-0"></div>
                  
                  {/* Text Skeleton - only show when expanded */}
                  {showExpanded && (
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-1 max-w-[120px]"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Others Section Skeleton */}
          <div className="mt-8">
            {/* Others Header Skeleton */}
            <div className={`mb-4 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
              {showExpanded ? (
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
              ) : (
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              )}
            </div>

            {/* Others Items Skeleton */}
            <div className="flex flex-col gap-4">
              {[1, 2].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  {/* Icon Skeleton */}
                  <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-shrink-0"></div>
                  
                  {/* Text Skeleton - only show when expanded */}
                  {showExpanded && (
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-1 max-w-[100px]"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default SidebarSkeleton;
