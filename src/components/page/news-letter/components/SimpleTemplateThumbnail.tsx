import React from "react";
import { NewsletterTemplate } from "../types";

interface SimpleTemplateThumbnailProps {
  template: NewsletterTemplate;
  onSelect: () => void;
  onPreview: () => void;
}

const SimpleTemplateThumbnail: React.FC<SimpleTemplateThumbnailProps> = ({ 
  template, 
  onSelect, 
  onPreview 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="h-48 overflow-hidden bg-gray-50 border-b border-gray-200">
        {template.id === "start-from-scratch" ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="text-sm text-gray-500">Blank Canvas</p>
            </div>
          </div>
        ) : (
          <div 
            className="h-full w-full transform scale-75 origin-top-left"
            dangerouslySetInnerHTML={{ __html: template.content }}
            style={{ width: '133%', height: '133%', fontSize: '12px', lineHeight: '1.2' }}
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
        <div className="flex space-x-2">
          <button onClick={onSelect} className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors">
            {template.id === "start-from-scratch" ? "Start Building" : "Use Template"}
          </button>
          {template.id !== "start-from-scratch" && (
            <button onClick={onPreview} className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50 transition-colors">
              Preview
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleTemplateThumbnail;
