import React, { useState, useEffect, useCallback } from 'react';

interface ProgressLoaderProps {
  isVisible: boolean;
  onComplete?: () => void;
  duration?: number;
  title?: string;
  subtitle?: string;
  showPercentage?: boolean;
  showProgress?: boolean;
  brandColor?: string;
  backgroundColor?: string;
  textColor?: string;
  autoStart?: boolean;
  className?: string;
}

const ProgressLoader: React.FC<ProgressLoaderProps> = ({
  isVisible,
  onComplete,
  duration = 3000,
  title = 'Processing...',
  subtitle = 'Please wait while we process your request',
  showPercentage = true,
  showProgress = true,
  brandColor = '#006D36',
  backgroundColor = '#ffffff',
  textColor = '#1a2231',
  autoStart = true,
  className = ''
}) => {
  const [progress, setProgress] = useState(1);
  const [isActive, setIsActive] = useState(false);
  const [displayStatus, setDisplayStatus] = useState('Initializing...');

  const generateProgressStatus = useCallback((percentage: number) => {
    if (percentage < 20) return 'Initializing...';
    if (percentage < 40) return 'Preparing content...';
    if (percentage < 60) return 'Processing data...';
    if (percentage < 80) return 'Finalizing...';
    if (percentage < 95) return 'Almost done...';
    return 'Completing...';
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setProgress(1);
      setIsActive(false);
      setDisplayStatus('Initializing...');
      return;
    }

    if (autoStart) {
      setIsActive(true);
    }
  }, [isVisible, autoStart]);

  useEffect(() => {
    if (!isActive || !isVisible) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percentage = Math.min((elapsed / duration) * 100, 100);
      
      const easedPercentage = easeInOutCubic(percentage / 100) * 100;
      const finalProgress = Math.max(1, Math.floor(easedPercentage));
      
      setProgress(finalProgress);
      setDisplayStatus(generateProgressStatus(easedPercentage));

      if (percentage >= 100) {
        clearInterval(interval);
        setProgress(100);
        setDisplayStatus('Completing...');
        setTimeout(() => {
          onComplete?.();
        }, 500);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isActive, isVisible, duration, onComplete, generateProgressStatus]);

  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const startProgress = useCallback(() => {
    setIsActive(true);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center ${className}`}
      style={{
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(0, 0, 0, 0.4)'
      }}
    >
      <div className="w-full max-w-md mx-4">
        {showProgress && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span 
                className="text-sm font-medium text-white"
              >
                {displayStatus}
              </span>
              {showPercentage && (
                <span 
                  className="text-sm font-medium"
                  style={{ color: brandColor }}
                >
                  {progress}%
                </span>
              )}
            </div>
            
            <div 
              className="w-full rounded-full h-3 overflow-hidden"
              style={{ backgroundColor: '#f2f4f7' }}
            >
              <div 
                className="h-full rounded-full transition-all duration-200 ease-out relative overflow-hidden"
                style={{ 
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${brandColor} 0%, #4ade80 50%, ${brandColor} 100%)`,
                  boxShadow: `0 0 10px ${brandColor}40`
                }}
              >
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                    animation: 'shimmer 2s infinite'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <div className="flex space-x-1">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ 
                  backgroundColor: brandColor,
                  animationDelay: `${index * 0.15}s`,
                  animationDuration: '1.5s',
                  opacity: 0.8
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default ProgressLoader;
