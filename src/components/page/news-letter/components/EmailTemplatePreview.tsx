"use client";
import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface EmailTemplatePreviewProps {
  content: string;
  subject: string;
}

const EmailTemplatePreview: React.FC<EmailTemplatePreviewProps> = ({ content, subject }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
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

  // Set modal iframe content when modal opens
  useEffect(() => {
    if (isModalOpen && iframeRef.current) {
      const iframeDoc = iframeRef.current.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(content);
        iframeDoc.close();
      }
    }
  }, [isModalOpen, content]);

  return (
    <>
      {/* Thumbnail Preview */}
      <div
        className="relative group cursor-pointer bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
        onClick={() => setIsModalOpen(true)}
      >
        {/* Thumbnail Container */}
        <div className="relative h-48 overflow-hidden bg-gray-50">
          <iframe
            ref={thumbnailRef}
            title={`Preview: ${subject}`}
            className="w-full h-full pointer-events-none transform scale-50 origin-top-left"
            style={{
              width: "200%",
              height: "200%",
            }}
            sandbox="allow-same-origin"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-white rounded-full p-3 shadow-lg">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Template Info */}
        <div className="p-3 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 truncate">{subject}</h3>
          <p className="text-xs text-gray-500 mt-1">Click to preview</p>
        </div>
      </div>

      {/* Full Preview Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{subject}</h2>
                <p className="text-sm text-gray-500 mt-1">Email Template Preview</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden p-4 bg-gray-50">
              <div className="h-full bg-white rounded-lg shadow-inner overflow-hidden">
                <iframe
                  ref={iframeRef}
                  title={`Full Preview: ${subject}`}
                  className="w-full h-full"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmailTemplatePreview;
