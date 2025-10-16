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
            <div className="absolute inset-0 bg-black bg-opacity-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <button
                onClick={onSelect}
                className="bg-primary text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors transform translate-y-2 group-hover:translate-y-0 duration-200"
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
            <div className="absolute inset-0 bg-black bg-opacity-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
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
