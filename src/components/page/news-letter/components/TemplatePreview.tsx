"use client";

import React, { useState } from "react";
import { NewsletterTemplate } from "../types";

interface TemplatePreviewProps {
  template: NewsletterTemplate;
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: NewsletterTemplate) => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, isOpen, onClose, onSelectTemplate }) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleUseTemplate = () => {
    setIsLoading(true);
    setTimeout(() => {
      onSelectTemplate(template);
      setIsLoading(false);
    }, 500);
  };

  const openInNewWindow = () => {
    const content = template.content || "<p>No content available for this template.</p>";
    const newWindow = window.open("", "_blank", "width=800,height=600,scrollbars=yes");
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Preview: ${template.name}</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background: #f5f5f5; }
            .preview-container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          </style>
        </head>
        <body>
          <div class="preview-container">
            ${content}
          </div>
        </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">{template.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{template.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={openInNewWindow}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Open in new tab
                </button>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Preview Content */}
          <div className="bg-gray-50 px-4 py-6 sm:px-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Email Client Mockup Header */}
              <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="bg-white rounded px-2 py-1 text-xs text-gray-600 inline-block">Email Preview</div>
                  </div>
                </div>
              </div>

              {/* Email Headers */}
              <div className="bg-white px-4 py-3 border-b border-gray-200 text-sm">
                <div className="space-y-1">
                  <div className="flex">
                    <span className="text-gray-500 w-16">From:</span>
                    <span className="text-gray-900">MyApp Team &lt;newsletter@myapp.com&gt;</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-16">To:</span>
                    <span className="text-gray-900">recipient@example.com</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-16">Subject:</span>
                    <span className="text-gray-900 font-medium">{template.name} Newsletter</span>
                  </div>
                </div>
              </div>

              {/* Email Content Preview */}
              <div className="bg-white max-h-96 overflow-y-auto">
                {template.id === "start-from-scratch" ? (
                  <div className="flex items-center justify-center h-64 bg-gray-50">
                    <div className="text-center">
                      <svg
                        className="mx-auto h-16 w-16 text-gray-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Blank Canvas</h3>
                      <p className="text-gray-600">
                        Start building your newsletter from scratch with complete creative control.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    className="newsletter-preview"
                    dangerouslySetInnerHTML={{ __html: template.content }}
                    style={{
                      transform: "scale(0.8)",
                      transformOrigin: "top left",
                      width: "125%",
                      height: "125%",
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleUseTemplate}
              disabled={isLoading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Using Template...
                </>
              ) : (
                <>{template.id === "start-from-scratch" ? "Start Building" : "Use Template"}</>
              )}
            </button>
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;
