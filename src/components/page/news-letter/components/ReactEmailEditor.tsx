"use client";

import React, { useRef, useCallback, useEffect, useState } from "react";
import EmailEditor, { EditorRef, EmailEditorProps } from "react-email-editor";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setContent,
  setDesign,
  completeStep,
  setCurrentStep,
  updateNewsletterData,
} from "@/store/slices/newsletterSlice";
import { getTemplateById } from "../emailTemplates";
import { blogApi } from "@/services/api/blog";

interface ReactEmailEditorProps {
  onDesignLoad?: (design: any) => void;
  onLoad?: () => void;
}

const ReactEmailEditor: React.FC<ReactEmailEditorProps> = ({ onDesignLoad, onLoad }) => {
  const emailEditorRef = useRef<EditorRef>(null);
  const dispatch = useAppDispatch();
  const newsletterData = useAppSelector((state) => state.newsletter.data);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  const exportHtml = useCallback(() => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.exportHtml((data) => {
      const { design, html } = data;

      // Update Redux state with the HTML content and design
      dispatch(setContent(html));
      dispatch(setDesign(design));

      console.log("Exported HTML:", html);
      console.log("Design JSON:", design);
    });
  }, [dispatch]);

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

      // Also update Redux state
      dispatch(setContent(html));
      dispatch(setDesign(design));
    });
  }, [dispatch]);

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
      dispatch(setDesign(design));
      console.log("Design saved:", design);
    });
  }, [dispatch]);

  const onEditorLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();

    console.log("📧 Email Editor loaded");
    console.log("📋 Current design in Redux:", newsletterData.design);

    const unlayer = emailEditorRef.current?.editor;

    if (!unlayer) {
      console.error("❌ Email editor not ready");
      return;
    }

    // Register custom image upload callback
    unlayer.registerCallback("selectImage", (data: any, done: (data: { url: string }) => void) => {
      console.log("🖼️ Custom image upload triggered");

      // Create a file input element
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";

      input.onchange = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];

        if (!file) {
          console.log("❌ No file selected");
          return;
        }

        console.log("📤 Uploading image:", file.name);

        try {
          // Upload to your server using blog media API
          const response = await blogApi.uploadMedia({
            mediaUpload: file,
            type: "IMAGE",
          });

          if (response.success && response.data.url) {
            console.log("✅ Image uploaded successfully:", response.data.url);
            // Return the URL to Unlayer
            done({ url: response.data.url });
          } else {
            console.error("❌ Upload failed: No URL in response");
            alert("Failed to upload image. Please try again.");
          }
        } catch (error) {
          console.error("❌ Upload error:", error);
          alert("Failed to upload image. Please try again.");
        }
      };

      // Trigger file selection dialog
      input.click();
    });

    // Load existing design if available
    if (newsletterData.design) {
      console.log("✅ Loading design into editor...");
      unlayer.loadDesign(newsletterData.design);
      console.log("✅ Design loaded successfully!");
    } else {
      console.log("ℹ️ No design to load (starting blank or design not yet set)");
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
  }, [onLoad, newsletterData.design]);

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
    dispatch(completeStep(2)); // Mark edit step as completed
    dispatch(setCurrentStep(3)); // Go to inbox step
  };

  const handleSaveTemplate = () => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.exportHtml((data) => {
      const { design, html } = data;

      // Save as template
      dispatch(setContent(html));
      dispatch(setDesign(design));
      dispatch(updateNewsletterData({ isTemplate: true }));

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
                onClick={() => dispatch(setCurrentStep(1))}
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
               
               
              
                
              `,

              features: {
                preview: true,
                imageEditor: false,
                svgImageUpload: true,
                stockImages: false, // Disable stock images to hide image picker
                undoRedo: true,
                audit: false, // Disable audit feature
                textEditor: {
                  spellChecker: true,
                  emojis: true,
                },
                ai: false, // Disable AI features
              },
              tools: {
                // Customize available tools
                image: {
                  enabled: true,
                  properties: {
                    src: {
                      value: {
                        url: "https://gothamenterprisesltd.com/assets/img/full_logo_dark.svg",
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
                autoSelectOnDrop: true,
              },
            }}
          />
        </div>
      </div>
    </>
  );
};

export default ReactEmailEditor;
