import React from "react";
import { NewsletterTemplate } from "../types";

interface SimpleTemplateThumbnailProps {
  template: NewsletterTemplate;
  onSelect: () => void;
  onPreview: () => void;
}

const SimpleTemplateThumbnail: React.FC<SimpleTemplateThumbnailProps> = ({ template, onSelect, onPreview }) => {
  const renderThumbnail = () => {
    if (template.id === "blank") {
      return (
        <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-300">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="text-blue-600 font-medium">Blank Canvas</p>
          </div>
        </div>
      );
    }

    // For email templates, show a representative preview
    const getTemplatePreview = () => {
      switch (template.id) {
        case "welcome-template":
          return (
            <div className="h-48 bg-white rounded-lg border-2 border-gray-200 p-4 flex flex-col">
              <div className="text-center mb-3">
                <h3 className="text-lg font-bold text-gray-800">Welcome!</h3>
              </div>
              <div className="flex-1 flex flex-col justify-center items-center space-y-2">
                <p className="text-sm text-gray-600 text-center">Thank you for subscribing!</p>
                <div className="bg-blue-600 text-white px-4 py-1 rounded text-xs">Get Started</div>
              </div>
            </div>
          );
        case "newsletter-template":
          return (
            <div className="h-48 bg-white rounded-lg border-2 border-gray-200 p-4">
              <div className="bg-blue-600 h-8 rounded mb-3"></div>
              <h3 className="text-sm font-bold text-gray-800 mb-2">Monthly Newsletter</h3>
              <div className="space-y-2">
                <div className="h-2 bg-gray-200 rounded"></div>
                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          );
        case "product-template":
          return (
            <div className="h-48 bg-white rounded-lg border-2 border-gray-200 p-4 flex flex-col">
              <h3 className="text-sm font-bold text-gray-800 text-center mb-2">New Product Launch!</h3>
              <div className="bg-gray-200 h-16 rounded mb-2"></div>
              <p className="text-xs text-gray-600 text-center mb-3">Latest product preview</p>
              <div className="space-y-1">
                <div className="bg-green-600 text-white px-2 py-1 rounded text-xs text-center">Learn More</div>
                <div className="bg-red-600 text-white px-2 py-1 rounded text-xs text-center">Buy Now</div>
              </div>
            </div>
          );
        case "macbook-pro-template":
          return (
            <div className="h-48 bg-black rounded-lg border-2 border-gray-800 p-4 flex flex-col">
              <div className="text-center mb-2">
                <div className="w-8 h-8 bg-white rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-black text-xs">🍎</span>
                </div>
                <h3 className="text-sm font-bold text-white">MacBook Pro</h3>
                <p className="text-xs text-gray-300">Mover. Maker. Boundary breaker.</p>
              </div>
              <div className="bg-gray-700 h-16 rounded mb-2"></div>
              <div className="flex space-x-1">
                <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs flex-1 text-center">Buy</div>
                <div className="text-blue-400 px-2 py-1 text-xs flex-1 text-center">Learn more</div>
              </div>
            </div>
          );
        default:
          return (
            <div className="h-48 bg-white rounded-lg border-2 border-gray-200 p-4 flex items-center justify-center">
              <div className="text-center">
                <div className="bg-gray-200 h-8 w-8 rounded mx-auto mb-2"></div>
                <p className="text-xs text-gray-600">Template Preview</p>
              </div>
            </div>
          );
      }
    };

    return getTemplatePreview();
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Template Preview */}
      <div className="p-4">{renderThumbnail()}</div>

      {/* Template Info */}
      <div className="p-4 border-t border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
        <p className="text-gray-600 text-sm mb-4">{template.description}</p>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={onSelect}
            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            {template.id === "blank" ? "Start Building" : "Use Template"}
          </button>
          {template.id !== "blank" && (
            <button
              onClick={onPreview}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Preview
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleTemplateThumbnail;
