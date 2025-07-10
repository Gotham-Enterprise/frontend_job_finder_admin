import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UsePreservedNavigationOptions {
  enabled?: boolean;
  statePath: string;
  scrollPath: string; 
  listPagePath: string; 
}

export const usePreservedNavigation = (options: UsePreservedNavigationOptions) => {
  const { enabled = true, statePath, scrollPath, listPagePath } = options;
  const router = useRouter();

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handlePopState = (event: PopStateEvent) => {
      const currentPath = window.location.pathname;
      
      if (currentPath === listPagePath) {
        setTimeout(() => {
          const savedPosition = localStorage.getItem(scrollPath);
          if (savedPosition) {
            const position = parseInt(savedPosition, 10);
            window.scrollTo({ top: position, behavior: 'smooth' });
          }
        }, 100);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [enabled, scrollPath, listPagePath]);

  const saveNavigationState = (filters: any) => {
    if (!enabled || typeof window === 'undefined') return;
    localStorage.setItem(statePath, JSON.stringify(filters));
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
