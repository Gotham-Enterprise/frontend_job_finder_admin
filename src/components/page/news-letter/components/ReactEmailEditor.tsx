"use client";

import React, { useRef, useCallback, useEffect, useState } from "react";
import EmailEditor, { EditorRef, EmailEditorProps } from "react-email-editor";
import { useNewsletter } from "../NewsletterContext";
import { getTemplateById } from "../emailTemplates";

interface ReactEmailEditorProps {
  onDesignLoad?: (design: any) => void;
  onLoad?: () => void;
}

const ReactEmailEditor: React.FC<ReactEmailEditorProps> = ({ onDesignLoad, onLoad }) => {
  const emailEditorRef = useRef<EditorRef>(null);
  const { state, updateNewsletterData, goToStep, completeStep } = useNewsletter();
  const [isLoading, setIsLoading] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  const exportHtml = useCallback(() => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.exportHtml((data) => {
      const { design, html } = data;

      // Update newsletter data with the HTML content and design
      updateNewsletterData({
        content: html,
        design: design, // Store the design JSON for future editing
      });

      console.log("Exported HTML:", html);
      console.log("Design JSON:", design);
    });
  }, [updateNewsletterData]);

  // Function to get current content for demonstration
  const getCurrentContent = useCallback(() => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.exportHtml((data) => {
      const { design, html } = data;

      console.log("=== CURRENT CONTENT ===");
      console.log("HTML Email Content:", html);
      console.log("Design JSON:", design);
      console.log("Content Length:", html.length);

      // Show a preview in a new window
      const preview = window.open("", "_blank", "width=800,height=600");
      if (preview) {
        preview.document.write(`
          <html>
            <head>
              <title>Email Preview</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .content { border: 1px solid #ddd; padding: 20px; margin: 20px 0; }
                .json { background: #f5f5f5; padding: 10px; margin: 10px 0; font-family: monospace; white-space: pre-wrap; max-height: 300px; overflow-y: auto; }
              </style>
            </head>
            <body>
              <h2>Email HTML Content</h2>
              <div class="content">${html}</div>
              <h2>Design JSON (for editing)</h2>
              <div class="json">${JSON.stringify(design, null, 2)}</div>
            </body>
          </html>
        `);
        preview.document.close();
      }

      // Also update the newsletter state
      updateNewsletterData({
        content: html,
        design: design,
      });
    });
  }, [updateNewsletterData]);

  const exportDesign = useCallback(() => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.exportHtml((data) => {
      const { design } = data;
      onDesignLoad?.(design);
    });
  }, [onDesignLoad]);

  const saveDesign = useCallback(() => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.saveDesign((design: any) => {
      updateNewsletterData({
        design: design,
      });

      console.log("Design saved:", design);
    });
  }, [updateNewsletterData]);

  const onEditorLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();

    // Load existing design if available
    if (state.newsletterData.design) {
      const unlayer = emailEditorRef.current?.editor;
      unlayer?.loadDesign(state.newsletterData.design);
    }

    // Additional script to hide Smart Buttons after editor loads
    setTimeout(() => {
      // Try to find and hide Smart Buttons elements using JavaScript
      const hideSmartButtons = () => {
        const iframe = document.querySelector('iframe[id*="unlayer"]') as HTMLIFrameElement;
        if (iframe && iframe.contentDocument) {
          const doc = iframe.contentDocument;
          // Find all elements containing "Smart Buttons" text
          const allElements = doc.querySelectorAll("*");
          allElements.forEach((el: any) => {
            if (el.textContent?.includes("Smart Buttons") || el.textContent?.includes("Get Suggestions")) {
              let parent = el;
              // Go up 5 levels to find the container
              for (let i = 0; i < 5; i++) {
                if (parent.parentElement) {
                  parent = parent.parentElement;
                }
              }
              if (parent) {
                (parent as HTMLElement).style.display = "none";
              }
            }
          });
        }
      };

      // Run multiple times to catch dynamically loaded content
      hideSmartButtons();
      setTimeout(hideSmartButtons, 500);
      setTimeout(hideSmartButtons, 1000);
      setTimeout(hideSmartButtons, 2000);

      // Also hide Send Email option
      const hideSendEmail = () => {
        const iframe = document.querySelector('iframe[id*="unlayer"]') as HTMLIFrameElement;
        if (iframe && iframe.contentDocument) {
          const doc = iframe.contentDocument;
          // Find all elements containing "Send Email" text
          const allElements = doc.querySelectorAll("*");
          allElements.forEach((el: any) => {
            if (el.textContent?.trim() === "Send Email" || el.getAttribute?.("data-value") === "email") {
              (el as HTMLElement).style.display = "none";
              (el as HTMLElement).style.visibility = "hidden";
              // Hide parent list item if it exists
              const parentLi = el.closest("li");
              if (parentLi) {
                (parentLi as HTMLElement).style.display = "none";
              }
            }
          });
        }
      };

      // Run multiple times to catch dynamically loaded content
      setTimeout(hideSendEmail, 500);
      setTimeout(hideSendEmail, 1000);
      setTimeout(hideSendEmail, 2000);
    }, 500);
  }, [onLoad, state.newsletterData.design]);

  // Auto-save functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        saveDesign();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, [saveDesign, isLoading]);

  const handleSaveAndContinue = () => {
    exportHtml();
    completeStep(2); // Mark edit step as completed
    goToStep(3); // Go to inbox step
  };

  const handleSaveTemplate = () => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.exportHtml((data) => {
      const { design, html } = data;

      // Save as template
      updateNewsletterData({
        content: html,
        design: design,
        isTemplate: true,
      });

      // You can add API call here to save template to backend
      console.log("Template saved:", { design, html });
    });
  };

  const handleLoadSampleTemplate = () => {
    // Load the MacBook Pro template from emailTemplates.ts
    const macbookTemplate = getTemplateById("macbook-pro-template");

    if (macbookTemplate?.design) {
      const unlayer = emailEditorRef.current?.editor;
      unlayer?.loadDesign(macbookTemplate.design as any);
    } else {
      console.error("MacBook Pro template design not found");
    }
  };

  const handlePreview = () => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.exportHtml((data) => {
      const { html } = data;

      // Open preview in new window
      const previewWindow = window.open("", "_blank", "width=800,height=600");
      if (previewWindow) {
        previewWindow.document.write(html);
        previewWindow.document.close();
      }
    });
  };

  // Preview Modal Component
  const PreviewModal = () => {
    if (!showPreviewModal) return null;

    return (
      <div className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sample Template Preview</h3>
              <p className="text-sm text-gray-500 mt-1">Welcome Newsletter Template</p>
            </div>
            <button
              onClick={() => setShowPreviewModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Preview Content */}
          <div className="p-6">
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <div className="bg-white rounded shadow-sm border" style={{ maxHeight: "450px", overflow: "auto" }}>
                <iframe srcDoc={previewHtml} className="w-full h-96 border-0" title="Email Preview" />
              </div>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex-1 mr-4">
                <h4 className="font-medium text-gray-900 mb-2">Apple MacBook Pro Template Features:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Authentic Apple logo and branding</li>
                  <li>• Professional black background with Apple aesthetics</li>
                  <li>• MacBook Pro hero image showcase</li>
                  <li>• Feature highlights with Apple's signature style</li>
                  <li>• Two-column layout sections for services</li>
                  <li>• Apple Card and education pricing sections</li>
                  <li>• Mac Specialist consultation area</li>
                  <li>• Complete footer with Apple links and legal text</li>
                  <li>• Mobile-responsive design optimized for all devices</li>
                  <li>• Premium product launch newsletter layout</li>
                </ul>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleLoadSampleTemplate();
                    setShowPreviewModal(false);
                  }}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Use This Template
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <PreviewModal />
      <div className="h-screen w-full flex flex-col" style={{ height: "100vh", width: "100vw" }}>
        {/* Compact Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0" style={{ height: "60px" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => goToStep(1)}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </button>
              <h2 className="text-lg font-semibold text-gray-900">Email Editor</h2>
              {isLoading && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Loading...</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handlePreview}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Preview
              </button>

              <button
                onClick={saveDesign}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Draft
              </button>

              <button
                onClick={handleSaveAndContinue}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary"
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>

        {/* Email Editor - Full Height */}
        <div className="flex-1 overflow-hidden" style={{ height: "calc(100vh - 60px)", width: "100%" }}>
          <EmailEditor
            ref={emailEditorRef}
            onLoad={onEditorLoad}
            style={{
              height: "100%",
              width: "100%",
              minHeight: "calc(100vh - 60px)",
            }}
            options={{
              id: "newsletter-editor",
              displayMode: "email",
              appearance: {
                theme: "modern_light",
                panels: {
                  tools: {
                    dock: "left",
                  },
                },
              },
              projectId: 1, // Add project ID to disable dev mode
              // Custom CSS to hide Send Email action and related options
              customCSS: `
                /* Hide Browser and Inbox tabs */
                .unlayer-display-mode-tabs,
                .display-mode-tabs,
                [class*="display-mode"],
                [class*="DisplayMode"],
                .unlayer-tabs-container,
                [data-testid="display-mode-tabs"],
                button[aria-label*="Browser"],
                button[aria-label*="Inbox"],
                .tab-browser,
                .tab-inbox,
                [class*="browser-tab"],
                [class*="inbox-tab"] {
                  display: none !important;
                }
                /* Hide Send Email action option */
                .unlayer-button-action-option[data-value="email"],
                button[data-value="email"],
                [data-value="email"],
                option[value="email"],
                li[data-value="email"],
                div[data-value="email"],
                /* Hide Send Email in dropdown */
                [class*="action-option"]:has([data-value="email"]),
                [class*="dropdown-item"]:has(*:contains("Send Email")),
                li:has(*:contains("Send Email")),
                button:has(*:contains("Send Email")),
                div:has(> *:contains("Send Email")),
                /* Additional selectors for Send Email option */
                [aria-label*="Send Email"],
                [title*="Send Email"],
                *:contains("Send Email") {
                  display: none !important;
                  visibility: hidden !important;
                  opacity: 0 !important;
                  pointer-events: none !important;
                }
                /* Hide audit panel */
                .unlayer-audit,
                .audit-panel,
                [data-testid="audit-panel"],
                .unlayer-audit-tab,
                .audit-tab,
                [class*="audit"]:not(.unlayer-button-action-option) {
                  display: none !important;
                }
                /* Hide sparkles/AI indicators */
                .sparkle,
                .sparkles,
                [class*="sparkle"],
                .ai-indicator,
                .ai-badge,
                .enhancement-indicator,
                .unlayer-sparkle,
                .tool-sparkle,
                [data-testid*="sparkle"],
                [aria-label*="sparkle" i],
                .block-sparkle,
                .tool-enhancement-badge {
                  display: none !important;
                }
                /* Hide Smart Buttons / AI Magic feature */
                .smart-buttons,
                .ai-magic,
                [class*="smart-button"],
                [class*="ai-magic"],
                [class*="Smart"],
                [class*="smart"],
                .unlayer-smart-buttons,
                .button-suggestions,
                [data-testid*="smart-button"],
                [aria-label*="smart button" i],
                [aria-label*="ai magic" i],
                .get-suggestions,
                .magic-button,
                .ai-suggestions-panel,
                .smart-button-panel,
                /* Specific selectors from DOM inspection */
                .blockbuilder-suggestions-widget,
                .blockbuilder-widget,
                [class*="suggestions-widget"],
                [class*="blockbuilder-suggestions"],
                .sc-gntHiG,
                .sc-fEhPMx,
                .sc-dnta0f,
                .sc-bntaOI,
                [class*="smart_buttons_panel"],
                .collapsible-content,
                .collapsible-inner-content,
                .ai-introduction,
                [data-variant="ai"],
                button[aria-label*="Get Suggestions"],
                span:contains("Get Suggestions"),
                div:contains("Try out our AI magic"),
                /* Additional selectors for AI button features */
                .ai-button-suggestions,
                .button-ai-magic,
                .unlayer-ai-suggestions,
                .ai-enhancement-panel,
                [class*="ai-suggestion"],
                [class*="button-magic"],
                .suggestion-panel,
                .ai-powered,
                [data-ai="true"],
                [data-suggestion="true"],
                .enhancement-suggestions,
                .button-enhancement,
                .ai-powered-suggestions,
                /* Try to hide the specific panel shown in screenshot */
                div[class*="suggestion"],
                div[class*="ai"],
                .panel-suggestion,
                .suggestion-container,
                .ai-container,
                /* Target Smart Buttons section directly */
                section[class*="smart"],
                section[class*="Smart"],
                div[class*="SmartButtons"],
                [id*="smart-button"],
                [id*="Smart"],
                .smart_buttons_panel,
                #smart_buttons_panel,
                /* Hide any collapsible panel with Smart Buttons */
                .unlayer-panel[class*="smart"],
                .unlayer-section[class*="smart"],
                div[data-testid*="smart"],
                div[data-cy*="smart"],
                /* Hide NEW badge and Smart Buttons header */
                div:has(> span:contains("Smart Buttons")),
                div:has(> *:contains("Smart Buttons")),
                /* Universal approach - hide any direct parent of Smart Buttons text */
                *:has(> *:contains("Get Suggestions")) {
                  display: none !important;
                  visibility: hidden !important;
                  opacity: 0 !important;
                  height: 0 !important;
                  overflow: hidden !important;
                }
                
              `,
              features: {
                preview: true,
                imageEditor: true,
                stockImages: false, // Disable stock images to hide image picker
                undoRedo: true,
                audit: false, // Disable audit feature
                textEditor: {
                  spellChecker: true,
                  emojis: true,
                },
              },
              tools: {
                // Customize available tools
                image: {
                  enabled: true,
                  properties: {
                    src: {
                      value: {
                        url: "https://via.placeholder.com/600x400",
                      },
                    },
                  },
                },
                button: {
                  enabled: true,
                  properties: {
                    buttonColors: {
                      value: {
                        color: "#FFFFFF",
                        backgroundColor: "#3182ce",
                        hoverColor: "#FFFFFF",
                        hoverBackgroundColor: "#2c5aa0",
                      },
                    },
                    action: {
                      value: {
                        url: "https://example.com",
                        target: "_blank",
                      },
                    },
                  },
                },
                text: {
                  enabled: true,
                  properties: {
                    text: {
                      value: "Enter your text here...",
                    },
                  },
                },
                heading: {
                  enabled: true,
                },
                divider: {
                  enabled: true,
                },
                spacer: {
                  enabled: true,
                },
                social: {
                  enabled: true,
                },
                video: {
                  enabled: true,
                },
                html: {
                  enabled: false, // Disabled HTML tool
                },
                menu: {
                  enabled: false, // Disabled Menu tool
                },
                timer: {
                  enabled: false, // Disabled Timer tool
                },
              },
              blocks: [],
              editor: {
                minRows: 1,
                maxRows: 20,
              },
              mergeTags: {
                first_name: {
                  name: "First Name",
                  value: "{{first_name}}",
                  sample: "John",
                },
                last_name: {
                  name: "Last Name",
                  value: "{{last_name}}",
                  sample: "Doe",
                },
                email: {
                  name: "Email",
                  value: "{{email}}",
                  sample: "john.doe@example.com",
                },
                company: {
                  name: "Company",
                  value: "{{company}}",
                  sample: "Acme Corp",
                },
              },
            }}
          />
        </div>
      </div>
    </>
  );
};

export default ReactEmailEditor;
