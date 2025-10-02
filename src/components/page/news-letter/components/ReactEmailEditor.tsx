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

  const showSamplePreview = () => {
    // Generate preview HTML for the Apple MacBook Pro style template
    const sampleHtml = `
<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>MacBook Pro Newsletter</title>
  <style type="text/css">
    @media only screen and (min-width: 720px) {
      .u-row { width: 700px !important; }
      .u-row .u-col { vertical-align: top; }
      .u-row .u-col-50 { width: 350px !important; }
      .u-row .u-col-100 { width: 700px !important; }
    }
    
    @media only screen and (max-width: 720px) {
      .u-row-container { max-width: 100% !important; padding-left: 0px !important; padding-right: 0px !important; }
      .u-row { width: 100% !important; }
      .u-row .u-col { display: block !important; width: 100% !important; min-width: 320px !important; max-width: 100% !important; }
      .u-row .u-col > div { margin: 0 auto; }
      .u-row .u-col img { max-width: 100% !important; }
    }
    
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #000000; color: #ffffff; }
    table, td { color: #ffffff; border-collapse: collapse; vertical-align: top; }
    p { margin: 0; }
    a { color: #0071e3; text-decoration: underline; }
    
    .hero-section { text-align: center; padding: 40px 20px; }
    .logo-image { max-width: 15%; height: auto; margin-bottom: 20px; }
    .main-title { font-size: 48px; font-weight: 400; color: #ffffff; margin: 0 0 10px 0; line-height: 1.2; }
    .subtitle { font-size: 28px; color: #ffffff; margin: 10px 0; line-height: 1.2; }
    .price-text { font-size: 17px; color: #ffffff; margin: 10px 0; }
    .cta-buttons { margin: 20px 0; }
    .buy-button { display: inline-block; background-color: #0071e3; color: #ffffff; padding: 10px 20px; border-radius: 25px; text-decoration: none; font-size: 17px; margin-right: 20px; }
    .learn-more { color: #0071e3; font-size: 17px; text-decoration: none; }
    .hero-image { width: 100%; height: auto; margin: 20px 0; }
    .feature-text { font-size: 21px; font-weight: 700; color: #9d9d9d; margin: 10px 0; text-align: center; }
    .section-title { font-size: 32px; color: #ffffff; text-align: center; margin: 50px 0; line-height: 1.2; }
    .two-column { display: table; width: 100%; background-color: #1d1d1f; }
    .column { display: table-cell; width: 50%; vertical-align: top; padding: 33px; }
    .column-title { font-size: 24px; color: #ffffff; text-align: center; margin-bottom: 15px; line-height: 1.2; }
    .column-text { font-size: 14px; color: #ffffff; text-align: center; line-height: 1.5; margin-bottom: 15px; }
    .column-link { color: #0071e3; font-size: 14px; text-decoration: none; }
    .column-image { width: 100%; height: auto; }
    .footer-section { background-color: #1d1d1f; padding: 30px; text-align: center; }
    .footer-menu { font-size: 14px; color: #d2d2d7; margin-bottom: 20px; }
    .footer-menu a { color: #d2d2d7; text-decoration: none; margin: 0 10px; }
    .footer-text { font-size: 12px; color: #86868b; line-height: 2; text-align: left; }
    .footer-text a { color: #d2d2d7; text-decoration: none; }
    
    @media (max-width: 600px) {
      .main-title { font-size: 36px; }
      .subtitle { font-size: 20px; }
      .two-column, .column { display: block; width: 100%; }
      .cta-buttons { text-align: center; }
      .buy-button { display: block; margin: 10px auto; }
      .learn-more { display: block; margin-top: 10px; }
    }
  </style>
</head>

<body>
  <table role="presentation" style="border-collapse: collapse; table-layout: fixed; border-spacing: 0; vertical-align: top; min-width: 320px; margin: 0 auto; background-color: #000000; width: 100%;" cellpadding="0" cellspacing="0">
    <tbody>
      <tr style="vertical-align: top">
        <td style="word-break: break-word; border-collapse: collapse !important; vertical-align: top">
          
          <!-- Header Section -->
          <div class="hero-section">
            <img src="https://assets.unlayer.com/projects/139/1676495528722-apple_logo_circle_f5f5f7-000_2x.png" alt="Apple Logo" class="logo-image" />
            <h1 class="main-title">MacBook Pro</h1>
            <h2 class="subtitle">Mover. Maker. Boundary breaker.</h2>
            <p class="price-text">From $1999 or $166.58/mo. for 12 mo.</p>
            
            <div class="cta-buttons">
              <a href="#" class="buy-button">Buy</a>
              <a href="#" class="learn-more">Learn more</a>
            </div>
          </div>
          
          <!-- Hero Image -->
          <div style="text-align: center; margin: 0;">
            <img src="https://assets.unlayer.com/projects/139/1676495949571-hero_2x.jpg?w=1400px" alt="MacBook Pro" class="hero-image" />
          </div>
          
          <!-- Feature Highlights -->
          <div style="padding: 15px 15px 70px; text-align: center;">
            <p class="feature-text">Supercharged by M2 Pro and M2 Max.</p>
            <p class="feature-text">Up to 22 hours of battery life.</p>
            <p class="feature-text">Stunning Liquid Retina XDR display.</p>
            <p class="feature-text">All the ports you need and faster Wi-Fi 6E.</p>
          </div>
          
          <!-- Why Apple Section -->
          <div style="background-color: #1d1d1f; padding: 50px;">
            <h2 class="section-title">Why Apple is the best place<br />to buy your new Mac.</h2>
          </div>
          
          <!-- Trade In Section -->
          <div class="two-column">
            <div class="column">
              <h3 class="column-title">Get credit toward<br />a new Mac.</h3>
              <p class="column-text">With Apple Trade In, just give us your eligible Mac and get credit for a new one. It's good for you and the planet.</p>
              <a href="#" class="column-link">Find your trade-in value</a>
            </div>
            <div class="column" style="padding: 0;">
              <img src="https://assets.unlayer.com/projects/139/1676496418898-credit_mac_2x.jpg?w=700px" alt="Trade In" class="column-image" />
            </div>
          </div>
          
          <!-- Apple Card & Education Section -->
          <div class="two-column">
            <div class="column" style="border-right: 5px solid #1d1d1f;">
              <h3 class="column-title">Apple Card Monthly Installments.</h3>
              <p class="column-text">Pay over time, interest-free when you choose to check out with Apple Card Monthly Installments.</p>
              <a href="#" class="column-link">Learn more</a>
              <div style="margin-top: 21px;">
                <img src="https://assets.unlayer.com/projects/139/1676497065877-apple_card_2x.jpg" alt="Apple Card" class="column-image" />
              </div>
            </div>
            <div class="column" style="border-left: 5px solid #1d1d1f;">
              <h3 class="column-title">Save on a new<br />Mac with Apple<br />education pricing.</h3>
              <a href="#" class="column-link">Shop</a>
              <div style="margin-top: 21px;">
                <img src="https://assets.unlayer.com/projects/139/1676497143860-edu_mac_2x.jpg" alt="Education" class="column-image" />
              </div>
            </div>
          </div>
          
          <!-- Specialist Section -->
          <div class="two-column">
            <div class="column" style="padding: 0;">
              <img src="https://assets.unlayer.com/projects/139/1676496501021-specialist_2x.jpg?w=700px" alt="Mac Specialist" class="column-image" />
            </div>
            <div class="column">
              <h3 class="column-title">Shop one on one with<br />a Mac Specialist.</h3>
              <p class="column-text">Our Specialists can help you choose, configure, and buy the perfect Mac.</p>
              <a href="#" class="column-link">Find a store</a>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer-section">
            <div class="footer-menu">
              <a href="#">Shop Online</a> |
              <a href="#">Find a Store</a> |
              <a href="#">1-800-MY-APPLE</a> |
              <a href="#">Get the Apple Store App</a>
            </div>
            
            <hr style="border: 1px solid #424245; margin: 20px 0;" />
            
            <div class="footer-text">
              <p>If you reside in the U.S. territories, please call Goldman Sachs at 877-255-5923 with questions about Apple Card.</p>
              <p>TM and © 2023 Apple Inc. One Apple Park Way, MS 96-DM, Cupertino, CA 95014.</p>
              <p><a href="#">All Rights Reserved</a> | <a href="#">Privacy Policy</a> | <a href="#">My Apple ID</a></p>
              <p>If you prefer not to receive commercial email from Apple, or if you've changed your email address, please <a href="#">click here</a>.</p>
            </div>
          </div>
          
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;

    setPreviewHtml(sampleHtml);
    setShowPreviewModal(true);
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
