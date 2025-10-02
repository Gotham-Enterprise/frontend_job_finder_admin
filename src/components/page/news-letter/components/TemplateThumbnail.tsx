"use client";

import React, { useRef, useEffect, useState } from "react";
import { NewsletterTemplate } from "../types";

interface TemplateThumbnailProps {
  template: NewsletterTemplate;
  onClick?: () => void;
  onPreview?: () => void;
  onSelect?: () => void;
}

const TemplateThumbnail: React.FC<TemplateThumbnailProps> = ({ template, onClick, onPreview, onSelect }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);

  useEffect(() => {
    if (template.content && iframeRef.current && template.id !== "start-from-scratch" && template.id !== "blank") {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;

      if (doc) {
        let htmlContent = template.content;

        // If content is JSON (from new email templates), create a simple preview
        try {
          const designData = JSON.parse(template.content);
          if (designData.body) {
            // Create a simple HTML preview from the design data
            htmlContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
                <h2 style="color: #333; text-align: center; margin-bottom: 20px;">${template.name}</h2>
                <p style="color: #666; text-align: center; line-height: 1.6;">${template.description}</p>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: center;">
                  <p style="color: #666; margin: 0;">Click "Use Template" to edit this design</p>
                </div>
              </div>
            `;
          }
        } catch (e) {
          // If it's not JSON, treat as HTML
        }

        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                margin: 0;
                padding: 0;
                transform-origin: 0 0;
                overflow: hidden;
                width: 600px;
                font-family: Arial, sans-serif;
              }
              table {
                font-family: Arial, sans-serif;
              }
              img {
                max-width: 100%;
                height: auto;
              }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
          </html>
        `);
        doc.close();

        setTimeout(() => {
          setThumbnailLoaded(true);
        }, 500);
      }
    }
  }, [template.content, template.id, template.name, template.description]);

  const renderThumbnailContent = () => {
    if (template.id === "start-from-scratch" || template.id === "blank") {
      return (
        <div className="flex items-center justify-center h-96 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-lg">
          <div className="text-center">
            <svg className="mx-auto h-20 w-20 text-blue-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="text-blue-600 font-medium text-lg">Start from scratch</p>
          </div>
        </div>
      );
    }

    // For templates with HTML content, render the iframe preview
    return (
      <div className="h-96 bg-white relative overflow-hidden border border-gray-200 rounded-t-lg">
        {!thumbnailLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0 pointer-events-none"
          style={{
            transform: "scale(0.6)",
            transformOrigin: "0 0",
            width: "166.67%",
            height: "166.67%",
          }}
          sandbox="allow-same-origin"
          title={`Preview of ${template.name}`}
        />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Template Thumbnail */}
      <div className="relative group cursor-pointer" onClick={onClick}>
        {renderThumbnailContent()}

        {/* Overlay with action buttons */}
        {template.id !== "start-from-scratch" && template.id !== "blank" && (
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.();
              }}
              className="bg-white text-gray-900 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Choose template
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview?.();
              }}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Preview
            </button>
          </div>
        )}
      </div>

      {/* Template Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
        <p className="text-gray-600 text-sm mb-4">{template.description}</p>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={onSelect}
            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            {template.id === "start-from-scratch" || template.id === "blank" ? "Start Building" : "Use Template"}
          </button>
          {template.id !== "start-from-scratch" && template.id !== "blank" && (
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

export default TemplateThumbnail;
