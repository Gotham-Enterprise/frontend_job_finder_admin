import React from 'react';
import Button from '@/components/ui/button/Button';

interface CareersHeaderProps {
  onCreateJob: () => void;
}

const CareersHeader: React.FC<CareersHeaderProps> = ({ onCreateJob }) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Jobs
      </h1>
      <Button 
        onClick={onCreateJob}
        variant="default"
        className="bg-blue-500 hover:bg-blue-600"
      >
        Create Jobs
      </Button>
    </div>
  );
};

export default CareersHeader;
