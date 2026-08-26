import React from "react";
import { Building2 } from "lucide-react";

interface OfficeSpaceEmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

const OfficeSpaceEmptyState: React.FC<OfficeSpaceEmptyStateProps> = ({
  title = "No office spaces found",
  description = "Try adjusting your search criteria or check back later for new listings.",
  icon,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 ${className}`}
    >
      <div className="flex flex-col items-center space-y-4">
        {icon ? (
          <div className="text-gray-300">{icon}</div>
        ) : (
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <div className="space-y-2 text-center">
          <p className="text-gray-500 text-base sm:text-lg font-medium">
            {title}
          </p>
          {description && (
            <p className="text-gray-400 text-sm max-w-md">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfficeSpaceEmptyState;
