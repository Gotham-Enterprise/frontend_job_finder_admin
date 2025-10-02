import React, { useState } from "react";
import DesignSidebar from "./DesignSidebar";
import EmailCanvas from "./EmailCanvas";
import ModuleSidebar from "./ModuleSidebar";

type SidebarMode = "modules" | "design" | null;

const NewsletterEditor: React.FC = () => {
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("modules");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Toggle */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSidebarMode(sidebarMode === "modules" ? null : "modules")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                sidebarMode === "modules" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add</span>
            </button>

            <button
              onClick={() => setSidebarMode(sidebarMode === "design" ? null : "design")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                sidebarMode === "design" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4"
                />
              </svg>
              <span>Template design</span>
            </button>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto">
          {sidebarMode === "modules" && <ModuleSidebar onSelectElement={setSelectedElement} />}
          {sidebarMode === "design" && <DesignSidebar selectedElement={selectedElement} />}
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 bg-gray-100 overflow-hidden">
        <EmailCanvas selectedElement={selectedElement} onSelectElement={setSelectedElement} />
      </div>
    </div>
  );
};

export default NewsletterEditor;
