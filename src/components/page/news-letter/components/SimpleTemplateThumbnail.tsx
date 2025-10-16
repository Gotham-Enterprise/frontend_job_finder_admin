import React, { useState, useEffect } from "react";
import { NewsletterTemplate } from "../types";
import { unlayerApi } from "@/services/api/unlayer";

interface SimpleTemplateThumbnailProps {
  template: NewsletterTemplate;
  onSelect: () => void;
  onPreview: () => void;
}

const SimpleTemplateThumbnail: React.FC<SimpleTemplateThumbnailProps> = ({ template, onSelect, onPreview }) => {
  const [thumbnailHtml, setThumbnailHtml] = useState<string>("");
  const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(false);

  // Generate HTML thumbnail when component mounts or template changes
  useEffect(() => {
    const generateThumbnail = async () => {
      // Skip for blank template
      if (template.id === "blank") {
        return;
      }

      // Use existing content if available
      if (template.content) {
        setThumbnailHtml(template.content);
        return;
      }

      // Generate HTML from design JSON
      if (template.design) {
        setIsLoadingThumbnail(true);
        try {
          const result = await unlayerApi.exportHtml(template.design);
          if (result && result.html) {
            setThumbnailHtml(result.html);
          }
        } catch (error) {
          console.error("Error generating thumbnail HTML:", error);
        } finally {
          setIsLoadingThumbnail(false);
        }
      }
    };

    generateThumbnail();
  }, [template.id, template.content, template.design]);
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-200 group">
      <div className="h-80 overflow-hidden bg-gray-50 relative">
        {template.id === "blank" ? (
          <div className="flex items-center justify-center h-full relative">
            <div className="text-center">
              <div className="mx-auto mb-6 flex items-center justify-center">
                <img src="/images/email-empty.svg" alt="Email icon" className="h-20 w-20 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Start from scratch</h3>
              <p className="text-sm text-gray-500 mb-6">Create your own design from scratch</p>
            </div>

            {/* Hover overlay with start building button */}
            <div className="absolute inset-0 bg-red  bg-red opacity-0 group-hover:opacity-25 transition-opacity duration-200 flex items-center justify-center">
              <button
                onClick={onSelect}
                className="bg-primary text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors transform translate-y-2 group-hover:translate-y-0 duration-200"
              >
                Start Building
              </button>
            </div>
          </div>
        ) : isLoadingThumbnail ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-primary mx-auto mb-2"></div>
              <p className="text-xs text-gray-500">Loading preview...</p>
            </div>
          </div>
        ) : thumbnailHtml ? (
          <>
            <div
              className="h-full w-full transform scale-[0.25] origin-top-left"
              dangerouslySetInnerHTML={{ __html: thumbnailHtml }}
              style={{
                width: "400%",
                height: "400%",
                pointerEvents: "none",
              }}
            />

            {/* Hover overlay with both buttons */}
            <div className="absolute inset-0 bg-black/80 bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="flex space-x-3">
                <button
                  onClick={onSelect}
                  className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors transform translate-y-2 group-hover:translate-y-0 duration-200"
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
        ) : (
          <>
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center p-4">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-xs text-gray-500">No preview available</p>
              </div>
            </div>

            {/* Hover overlay with both buttons */}
            <div className="absolute inset-0 bg-red bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="flex space-x-3">
                <button
                  onClick={onSelect}
                  className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors transform translate-y-2 group-hover:translate-y-0 duration-200"
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
