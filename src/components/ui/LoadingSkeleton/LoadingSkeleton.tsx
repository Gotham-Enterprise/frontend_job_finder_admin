import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'default' | 'card' | 'jobDetails';
  height?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = "",
  variant = "default",
  height = "h-64"
}) => {
  const renderDefaultSkeleton = () => (
    <div className={`animate-pulse space-y-4 ${className}`}>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
    </div>
  );

  const renderCardSkeleton = () => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4 animate-pulse ${className}`}>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );

  const renderJobDetailsSkeleton = () => (
    <div className={`p-6 ${className}`}>
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );

  switch (variant) {
    case 'card':
      return renderCardSkeleton();
    case 'jobDetails':
      return renderJobDetailsSkeleton();
    default:
      return renderDefaultSkeleton();
  }
};

export default LoadingSkeleton;
