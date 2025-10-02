import React, { useState } from "react";

interface ModuleSidebarProps {
  onSelectElement: (elementId: string) => void;
}

interface Module {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: string;
}

const ModuleSidebar: React.FC<ModuleSidebarProps> = ({ onSelectElement }) => {
  const [activeTab, setActiveTab] = useState<"modules" | "sections">("modules");
  const [searchTerm, setSearchTerm] = useState("");

  const modules: Module[] = [
    // Base modules
    {
      id: "text",
      name: "Text",
      category: "Base",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      ),
    },
    {
      id: "button",
      name: "Button",
      category: "Base",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1h4a1 1 0 011 1v18a1 1 0 01-1 1H3a1 1 0 01-1-1V2a1 1 0 011-1h4v3"
          />
        </svg>
      ),
    },
    {
      id: "social",
      name: "Social",
      category: "Base",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
      ),
    },
    {
      id: "html",
      name: "HTML",
      category: "Base",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      ),
    },

    // Media modules
    {
      id: "image",
      name: "Image",
      category: "Media",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      id: "video",
      name: "Video",
      category: "Media",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 4h1a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h1m15 0V2a1 1 0 00-1-1H5a1 1 0 00-1 1v2m15 0H5"
          />
        </svg>
      ),
    },

    // Structure modules
    {
      id: "divider",
      name: "Divider",
      category: "Structure",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      ),
    },
  ];

  const sections = [
    { id: "1", name: "1", layout: "single" },
    { id: "2", name: "2", layout: "double" },
    { id: "3", name: "3", layout: "triple" },
    { id: "1-2-3", name: "1/4 - 2/4", layout: "asymmetric" },
    { id: "2-1-3", name: "2/5 - 1/5", layout: "asymmetric-alt" },
    { id: "4", name: "4", layout: "quad" },
  ];

  const filteredModules = modules.filter((module) => module.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const groupedModules = filteredModules.reduce(
    (acc, module) => {
      if (!acc[module.category]) {
        acc[module.category] = [];
      }
      acc[module.category].push(module);
      return acc;
    },
    {} as Record<string, Module[]>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab("modules")}
            className={`flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 ${
              activeTab === "modules"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Modules
          </button>
          <button
            onClick={() => setActiveTab("sections")}
            className={`flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 ${
              activeTab === "sections"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Sections
          </button>
        </nav>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "modules" && (
          <div className="p-4 space-y-6">
            {Object.entries(groupedModules).map(([category, categoryModules]) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-gray-900 mb-3">{category}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {categoryModules.map((module) => (
                    <button
                      key={module.id}
                      onClick={() => onSelectElement(module.id)}
                      className="group flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200"
                    >
                      <div className="text-gray-600 group-hover:text-blue-600 mb-2">{module.icon}</div>
                      <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700">{module.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "sections" && (
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Default sections</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => onSelectElement(`section-${section.id}`)}
                  className="group flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200"
                >
                  <div className="w-12 h-8 bg-gray-100 rounded mb-2 flex items-center justify-center">
                    <div className="text-xs text-gray-600 font-mono">{section.name}</div>
                  </div>
                  <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700">{section.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleSidebar;
