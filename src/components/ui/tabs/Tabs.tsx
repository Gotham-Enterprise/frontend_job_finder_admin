import React, { createContext, useContext, ReactNode } from "react";

interface TabsContextType {
  activeTab: string;
  changeTab: (tabId: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ defaultValue = "account", value, onValueChange, children, className = "" }) => {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue);

  const changeTab = React.useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
      onValueChange?.(tabId);
    },
    [onValueChange]
  );

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  return (
    <TabsContext.Provider value={{ activeTab, changeTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

const TabsList: React.FC<TabsListProps> = ({ children, className = "" }) => {
  return <div className={`flex space-x-0 border-b border-gray-200 dark:border-gray-700 ${className}`}>{children}</div>;
};

const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className = "", activeClassName = "" }) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("TabsTrigger must be used within a Tabs component");
  }

  const { activeTab, changeTab } = context;
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => changeTab(value)}
      className={`
        px-6 py-4 text-sm font-medium transition-colors relative
        ${
          isActive
            ? activeClassName ||
              "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
};

const TabsContent: React.FC<TabsContentProps> = ({ value, children, className = "" }) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("TabsContent must be used within a Tabs component");
  }

  const { activeTab } = context;

  if (activeTab !== value) {
    return null;
  }

  return <div className={`pt-6 ${className}`}>{children}</div>;
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
