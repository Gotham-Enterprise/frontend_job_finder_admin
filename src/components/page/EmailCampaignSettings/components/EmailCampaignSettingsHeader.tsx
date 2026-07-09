import React from "react";

interface Props {
  onSearch?: (query: string) => void;
}

const EmailCampaignSettingsHeader: React.FC<Props> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  React.useEffect(() => {
    if (!onSearch) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onSearch(searchQuery);
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, onSearch]);

  return (
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-2xl font-bold">Email Campaigns</h1>

      <input
        type="text"
        placeholder="Search campaigns..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="flex-1 max-w-md px-4 py-2 border rounded-lg"
      />
    </div>
  );
};

export default EmailCampaignSettingsHeader;
