"use client";
import React, { useRef, useEffect } from "react";

interface EmailTemplateThumbnailProps {
  content: string;
  subject: string;
  onClick?: () => void;
}

const EmailTemplateThumbnail: React.FC<EmailTemplateThumbnailProps> = ({ content, subject, onClick }) => {
  const thumbnailRef = useRef<HTMLIFrameElement>(null);

  // Set iframe content when component mounts or content changes
  useEffect(() => {
    if (thumbnailRef.current) {
      const iframeDoc = thumbnailRef.current.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(content);
        iframeDoc.close();
      }
    }
  }, [content]);

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
            ${content}
          </div>
        </body>
        </html>
      `);
      previewWindow.document.close();
    }
    if (onClick) onClick();
  };

  return (
    <div
      className="relative group cursor-pointer bg-white border border-gray-200 rounded overflow-hidden hover:shadow-md transition-shadow duration-200 w-20 h-16"
      onClick={openPreviewWindow}
      title="Click to preview in new window"
    >
      {/* Thumbnail Container */}
      <div className="relative w-full h-full overflow-hidden bg-gray-50">
        <iframe
          ref={thumbnailRef}
          title={`Thumbnail: ${subject}`}
          className="w-full h-full pointer-events-none transform scale-[0.25] origin-top-left"
          style={{
            width: "400%",
            height: "400%",
          }}
          sandbox="allow-same-origin"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  );
};

export default EmailTemplateThumbnail;
