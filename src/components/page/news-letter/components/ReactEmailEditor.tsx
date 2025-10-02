"use client";

import React, { useRef, useCallback, useEffect, useState } from "react";
import EmailEditor, { EditorRef, EmailEditorProps } from "react-email-editor";
import { useNewsletter } from "../NewsletterContext";

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
    const sampleDesign = {
      counters: {
        u_column: 13,
        u_row: 8,
        u_content_text: 24,
        u_content_image: 8,
        u_content_button: 2,
        u_content_divider: 1,
        u_content_heading: 3,
        u_content_menu: 1,
      },
      body: {
        id: "macbook_pro_template",
        rows: [
          {
            id: "row_header",
            cells: [1],
            columns: [
              {
                id: "column_header",
                contents: [
                  {
                    id: "apple_logo",
                    type: "image",
                    values: {
                      containerPadding: "10px 10px 0px",
                      src: {
                        url: "https://assets.unlayer.com/projects/139/1676495528722-apple_logo_circle_f5f5f7-000_2x.png",
                        width: 116,
                        height: 116,
                        maxWidth: "15%",
                      },
                      textAlign: "center",
                      altText: "Apple Logo",
                    },
                  },
                  {
                    id: "main_heading",
                    type: "heading",
                    values: {
                      containerPadding: "0px",
                      text: "MacBook Pro",
                      color: "#ffffff",
                      textAlign: "center",
                      fontSize: "48px",
                      fontFamily: "helvetica,sans-serif",
                      fontWeight: 400,
                      lineHeight: "140%",
                    },
                  },
                  {
                    id: "sub_heading",
                    type: "heading",
                    values: {
                      containerPadding: "0px",
                      text: "Mover. Maker. Boundary breaker.",
                      color: "#ffffff",
                      textAlign: "center",
                      fontSize: "28px",
                      fontFamily: "helvetica,sans-serif",
                      lineHeight: "140%",
                    },
                  },
                  {
                    id: "price_text",
                    type: "text",
                    values: {
                      containerPadding: "10px",
                      text: "<p>From $1999 or $166.58/mo. for 12 mo.</p>",
                      color: "#ffffff",
                      textAlign: "center",
                      fontSize: "17px",
                      fontFamily: "helvetica,sans-serif",
                      lineHeight: "140%",
                    },
                  },
                ],
                values: {
                  backgroundColor: "#000000",
                  padding: "0px",
                },
              },
            ],
            values: {
              backgroundColor: "#000000",
              padding: "0px",
            },
          },
          {
            id: "row_buttons",
            cells: [1, 1],
            columns: [
              {
                id: "column_buy",
                contents: [
                  {
                    id: "buy_button",
                    type: "button",
                    values: {
                      containerPadding: "10px",
                      text: "Buy",
                      color: "#FFFFFF",
                      backgroundColor: "#0071e3",
                      textAlign: "right",
                      fontSize: "17px",
                      fontFamily: "helvetica,sans-serif",
                      borderRadius: "25px",
                      padding: "10px 20px",
                    },
                  },
                ],
                values: {
                  backgroundColor: "#000000",
                },
              },
              {
                id: "column_learn",
                contents: [
                  {
                    id: "learn_text",
                    type: "text",
                    values: {
                      containerPadding: "20px",
                      text: "<p>Learn more</p>",
                      color: "#0071e3",
                      textAlign: "left",
                      fontSize: "17px",
                      fontFamily: "helvetica,sans-serif",
                      lineHeight: "140%",
                    },
                  },
                ],
                values: {
                  backgroundColor: "#000000",
                },
              },
            ],
            values: {
              backgroundColor: "#000000",
              padding: "0px",
            },
          },
          {
            id: "row_hero",
            cells: [1],
            columns: [
              {
                id: "column_hero",
                contents: [
                  {
                    id: "hero_image",
                    type: "image",
                    values: {
                      containerPadding: "0px",
                      src: {
                        url: "https://assets.unlayer.com/projects/139/1676495949571-hero_2x.jpg",
                        width: 1424,
                        height: 880,
                      },
                      textAlign: "center",
                      altText: "MacBook Pro Hero",
                    },
                  },
                  {
                    id: "feature_1",
                    type: "text",
                    values: {
                      containerPadding: "10px",
                      text: "<p>Supercharged by M2 Pro and M2 Max.</p>",
                      color: "#9d9d9d",
                      textAlign: "center",
                      fontSize: "21px",
                      fontFamily: "helvetica,sans-serif",
                      fontWeight: 700,
                      lineHeight: "140%",
                    },
                  },
                  {
                    id: "feature_2",
                    type: "text",
                    values: {
                      containerPadding: "10px",
                      text: "<p>Up to 22 hours of battery life.</p>",
                      color: "#9d9d9d",
                      textAlign: "center",
                      fontSize: "21px",
                      fontFamily: "helvetica,sans-serif",
                      fontWeight: 700,
                      lineHeight: "140%",
                    },
                  },
                  {
                    id: "feature_3",
                    type: "text",
                    values: {
                      containerPadding: "10px",
                      text: "<p>Stunning Liquid Retina XDR display.</p>",
                      color: "#9d9d9d",
                      textAlign: "center",
                      fontSize: "21px",
                      fontFamily: "helvetica,sans-serif",
                      fontWeight: 700,
                      lineHeight: "140%",
                    },
                  },
                  {
                    id: "feature_4",
                    type: "text",
                    values: {
                      containerPadding: "10px",
                      text: "<p>All the ports you need and faster Wi-Fi 6E.</p>",
                      color: "#9d9d9d",
                      textAlign: "center",
                      fontSize: "21px",
                      fontFamily: "helvetica,sans-serif",
                      fontWeight: 700,
                      lineHeight: "140%",
                    },
                  },
                ],
                values: {
                  backgroundColor: "#000000",
                },
              },
            ],
            values: {
              backgroundColor: "#000000",
              padding: "15px 15px 70px",
            },
          },
          {
            id: "row_why_apple",
            cells: [1],
            columns: [
              {
                id: "column_why_apple",
                contents: [
                  {
                    id: "why_apple_heading",
                    type: "heading",
                    values: {
                      containerPadding: "10px",
                      text: "Why Apple is the best place<br />to buy your new Mac.",
                      color: "#ffffff",
                      textAlign: "center",
                      fontSize: "32px",
                      fontFamily: "helvetica,sans-serif",
                      lineHeight: "120%",
                    },
                  },
                ],
                values: {
                  backgroundColor: "#1d1d1f",
                },
              },
            ],
            values: {
              backgroundColor: "#1d1d1f",
              padding: "50px",
            },
          },
        ],
        headers: [],
        footers: [],
        values: {
          contentWidth: 700,
          fontFamily: {
            label: "Helvetica",
            value: "helvetica,sans-serif",
          },
          textColor: "#ffffff",
          backgroundColor: "#000000",
          linkStyle: {
            linkColor: "#0071e3",
            linkHoverColor: "#0000ee",
            linkUnderline: true,
            linkHoverUnderline: true,
          },
        },
      },
    };

    const unlayer = emailEditorRef.current?.editor;
    unlayer?.loadDesign(sampleDesign);
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
                theme: "light",
                panels: {
                  tools: {
                    dock: "left",
                  },
                },
              },
              // Custom CSS to hide Send Email action and related options
              customCSS: `
                .unlayer-button-action-option[data-value="email"] {
                  display: none !important;
                }
                .unlayer-button-action-option[title*="Send Email"],
                .unlayer-button-action-option[title*="send email"],
                .unlayer-action-email,
                [data-action="email"],
                .email-action-button {
                  display: none !important;
                }
              `,
              features: {
                preview: true,
                imageEditor: true,
                stockImages: true,
                undoRedo: true,
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
                  enabled: true,
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
