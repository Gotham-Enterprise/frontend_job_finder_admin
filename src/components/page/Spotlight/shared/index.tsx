import { FC, ReactNode, useEffect, useState } from "react";

import { SearchIcon } from "@/components/ui/icons";
import Input from "@/components/ui/input/Input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export { StatusBadge, WaitingBadge } from "./StatusBadge";
export { default as ReviewDecisionModal } from "./ReviewDecisionModal";
export * from "./utils";

export const Card: FC<{ title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }> = ({
  title,
  actions,
  children,
  className = "",
}) => (
  <div className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
    {(title || actions) && (
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        {title && <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>}
        {actions}
      </div>
    )}
    {children}
  </div>
);

export const StatusTabs: FC<{
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}> = ({ value, options, onChange }) => (
  <Tabs className="w-full" value={value} onValueChange={onChange}>
    <TabsList className="mb-2 flex-wrap">
      {options.map((option) => (
        <TabsTrigger
          key={option.value || "all"}
          value={option.value}
          activeClassName="text-green-700 border-b-3 border-green-700"
        >
          {option.label}
        </TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
);

/** Search box that reports its value 500ms after the admin stops typing. */
export const SearchBox: FC<{ initialValue?: string; placeholder: string; onSearch: (value: string) => void }> = ({
  initialValue = "",
  placeholder,
  onSearch,
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const timeoutId = setTimeout(() => onSearch(value.trim()), 500);
    return () => clearTimeout(timeoutId);
  }, [value, onSearch]);

  return (
    <div className="relative w-full md:max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SearchIcon className="h-4 w-4" />
      </div>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full pl-10"
      />
    </div>
  );
};

export const DetailRow: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <div>
    <dt className="text-xs font-medium uppercase text-gray-500">{label}</dt>
    <dd className="text-sm font-medium text-gray-900 dark:text-white break-words">{children}</dd>
  </div>
);

export const LoadingRow: FC<{ colSpan: number; message?: string }> = ({ colSpan, message = "Loading..." }) => (
  <tr>
    <td className="text-center py-8 px-6" colSpan={colSpan}>
      <div className="flex items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500"></div>
        <p className="text-gray-500 dark:text-gray-400">{message}</p>
      </div>
    </td>
  </tr>
);

export const EmptyRow: FC<{ colSpan: number; message: string }> = ({ colSpan, message }) => (
  <tr>
    <td className="text-center py-8 px-6 text-gray-500 dark:text-gray-400" colSpan={colSpan}>
      {message}
    </td>
  </tr>
);
