import React from "react";
import { NewsletterTemplate } from "../types";

interface SimpleTemplateThumbnailProps {
  template: NewsletterTemplate;
  onSelect: () => void;
  onPreview: () => void;
}

const SimpleTemplateThumbnail: React.FC<SimpleTemplateThumbnailProps> = ({ template, onSelect, onPreview }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-200 group">
      <div className="h-80 overflow-hidden bg-gray-50 relative">
        {template.id === "start-from-scratch" ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="text-sm text-gray-500 mb-4">Blank Canvas</p>
              <button
                onClick={onSelect}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Start Building
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              className="h-full w-full transform scale-75 origin-top-left"
              dangerouslySetInnerHTML={{ __html: template.content }}
              style={{ width: "133%", height: "133%", fontSize: "12px", lineHeight: "1.2" }}
            />

            {/* Hover overlay with both buttons */}
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="flex space-x-3">
                <button
                  onClick={onSelect}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors transform translate-y-2 group-hover:translate-y-0 duration-200"
                >
                  Use Template
                </button>
                <button
                  onClick={onPreview}
                  className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors transform translate-y-2 group-hover:translate-y-0 duration-200"
                >
                  Preview
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Template info - always visible */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm mb-1">{template.name}</h3>
        <p className="text-xs text-gray-600">{template.description}</p>
      </div>
    </div>
  );
};

export default SimpleTemplateThumbnail;
