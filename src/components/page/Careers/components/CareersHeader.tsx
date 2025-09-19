import React from 'react';
import Button from '@/components/ui/button/Button';

interface CareersHeaderProps {
  onCreateJob: () => void;
  onSearch?: (query: string) => void;
}

const CareersHeader: React.FC<CareersHeaderProps> = ({ onCreateJob, onSearch }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  // Debounce search to avoid refetching on every keystroke
  React.useEffect(() => {
    if (!onSearch) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(searchQuery);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, onSearch]);

  return (
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Jobs
      </h1>
  <div className="flex-1 max-w-2xl flex items-center gap-2">
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-green-900 focus:outline-none dark:text-gray-100"
        />
        <Button 
          onClick={onCreateJob}
          variant="default"
          className="bg-green-500 hover:bg-green-600"
        >
          Create Jobs
        </Button>
      </div>
      
    </div>
  );
};

export default CareersHeader;
