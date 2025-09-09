import { useState, useCallback } from 'react';

interface UseProgressLoaderOptions {
  duration?: number;
  autoStart?: boolean;
  onComplete?: () => void;
}

interface UseProgressLoaderReturn {
  isVisible: boolean;
  progress: number;
  showLoader: (options?: {
    title?: string;
    subtitle?: string;
    duration?: number;
  }) => void;
  hideLoader: () => void;
  setProgress: (value: number) => void;
}

export const useProgressLoader = (
  options: UseProgressLoaderOptions = {}
): UseProgressLoaderReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgressState] = useState(1);
  const [currentOptions, setCurrentOptions] = useState(options);

  const showLoader = useCallback((loaderOptions?: {
    title?: string;
    subtitle?: string;
    duration?: number;
  }) => {
    setCurrentOptions(prev => ({ ...prev, ...loaderOptions }));
    setIsVisible(true);
    setProgressState(1);
  }, []);

  const hideLoader = useCallback(() => {
    setIsVisible(false);
    setProgressState(1);
  }, []);

  const setProgress = useCallback((value: number) => {
    setProgressState(Math.min(Math.max(value, 1), 100));
  }, []);

  return {
    isVisible,
    progress,
    showLoader,
    hideLoader,
    setProgress
  };
};
