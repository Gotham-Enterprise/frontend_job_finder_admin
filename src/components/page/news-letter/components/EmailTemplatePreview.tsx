"use client";
import React from "react";
import NewsletterThumbnailWrapper from "./NewsletterThumbnailWrapper";

interface EmailTemplatePreviewProps {
  content: string;
  subject: string;
  design?: any;
}

const EmailTemplatePreview: React.FC<EmailTemplatePreviewProps> = ({ content, subject, design }) => {
  return (
    <NewsletterThumbnailWrapper content={content} design={design} subject={subject}>
      {(htmlContent, isLoading) => {
        // Open preview in a new window
        const openPreviewWindow = () => {
          const previewWindow = window.open("", "_blank", "width=800,height=600,scrollbars=yes,resizable=yes");
          if (previewWindow) {
            previewWindow.document.write(`
              <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${subject} - Email Preview</title>
                <style>
                  body {
                    margin: 0;
                    padding: 20px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    background: #f3f4f6;
                  }
                  .preview-header {
                    background: white;
                    padding: 16px 20px;
                    margin: -20px -20px 20px -20px;
                    border-bottom: 1px solid #e5e7eb;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                  }
                  .preview-header h1 {
                    margin: 0;
                    font-size: 18px;
                    color: #111827;
                    font-weight: 600;
                  }
                  .preview-header p {
                    margin: 4px 0 0 0;
                    font-size: 14px;
                    color: #6b7280;
                  }
                  .email-content {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    overflow: hidden;
                  }
                </style>
              </head>
              <body>
                <div class="preview-header">
                  <h1>${subject}</h1>
                  <p>Email Template Preview</p>
                </div>
                <div class="email-content">
                  ${htmlContent || "<p>No content available</p>"}
                </div>
              </body>
              </html>
            `);
            previewWindow.document.close();
          }
        };

        const hasValidContent = htmlContent && htmlContent.trim().length > 0;

        return (
          <div
            className="relative group cursor-pointer bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
            onClick={openPreviewWindow}
          >
            {/* Thumbnail Container */}
            <div className="relative h-48 overflow-hidden bg-white">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-xs text-gray-500">Loading...</p>
                  </div>
                </div>
              ) : hasValidContent ? (
                <div
                  className="w-full h-full transform scale-[0.4] origin-top-left pointer-events-none"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                  style={{
                    width: "250%",
                    height: "250%",
                    transformOrigin: "0 0",
                  }}
                />
              ) : (
                // Fallback for empty content
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 text-gray-400 mx-auto mb-2"
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
                    <p className="text-sm text-gray-500">No preview</p>
                  </div>
                </div>
              )}
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-white rounded-full p-3 shadow-lg">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Info */}
            <div className="p-3 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 truncate">{subject}</h3>
              <p className="text-xs text-gray-500 mt-1">Click to open preview</p>
            </div>
          </div>
        );
      }}
    </NewsletterThumbnailWrapper>
  );
};

export default EmailTemplatePreview;
