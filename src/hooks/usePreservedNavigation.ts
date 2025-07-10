import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UsePreservedNavigationOptions {
  enabled?: boolean;
  statePath: string; // e.g., 'jobseeker-search-state'
  scrollPath: string; // e.g., 'jobseeker-scroll-position'
  listPagePath: string; // e.g., '/admin/job-seekers'
}

export const usePreservedNavigation = (options: UsePreservedNavigationOptions) => {
  const { enabled = true, statePath, scrollPath, listPagePath } = options;
  const router = useRouter();

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handlePopState = (event: PopStateEvent) => {
      // Check if we're navigating back to the list page
      const currentPath = window.location.pathname;
      
      if (currentPath === listPagePath) {
        // Small delay to ensure the page has loaded
        setTimeout(() => {
          const savedPosition = localStorage.getItem(scrollPath);
          if (savedPosition) {
            const position = parseInt(savedPosition, 10);
            window.scrollTo({ top: position, behavior: 'smooth' });
          }
        }, 100);
      }
    };

    // Listen for browser back/forward button
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [enabled, scrollPath, listPagePath]);

  const saveNavigationState = (filters: any) => {
    if (!enabled || typeof window === 'undefined') return;
    
    // Save filters
    localStorage.setItem(statePath, JSON.stringify(filters));
    
    // Save scroll position
    const position = window.scrollY;
    localStorage.setItem(scrollPath, position.toString());
  };

  const clearNavigationState = () => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(statePath);
    localStorage.removeItem(scrollPath);
  };

  return {
    saveNavigationState,
    clearNavigationState,
  };
};
