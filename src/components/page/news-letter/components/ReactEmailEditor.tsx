"use client";

import React, { useRef, useCallback, useEffect, useState } from 'react';
import EmailEditor, { EditorRef, EmailEditorProps } from 'react-email-editor';
import { useNewsletter } from '../NewsletterContext';

interface ReactEmailEditorProps {
  onDesignLoad?: (design: any) => void;
  onLoad?: () => void;
}

const ReactEmailEditor: React.FC<ReactEmailEditorProps> = ({ 
  onDesignLoad, 
  onLoad 
}) => {
  const emailEditorRef = useRef<EditorRef>(null);
  const { state, updateNewsletterData, goToStep, completeStep } = useNewsletter();
  const [isLoading, setIsLoading] = useState(true);

  const exportHtml = useCallback(() => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.exportHtml((data) => {
      const { design, html } = data;
      
      // Update newsletter data with the HTML content and design
      updateNewsletterData({
        content: html,
        design: design, // Store the design JSON for future editing
      });
      
      console.log('Exported HTML:', html);
      console.log('Design JSON:', design);
    });
  }, [updateNewsletterData]);

  // Function to get current content for demonstration
  const getCurrentContent = useCallback(() => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.exportHtml((data) => {
      const { design, html } = data;
      
      console.log('=== CURRENT CONTENT ===');
      console.log('HTML Email Content:', html);
      console.log('Design JSON:', design);
      console.log('Content Length:', html.length);
      
      // Show a preview in a new window
      const preview = window.open('', '_blank', 'width=800,height=600');
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
      
      console.log('Design saved:', design);
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
      console.log('Template saved:', { design, html });
    });
  };

  const handleLoadSampleTemplate = () => {
    const sampleDesign = {
      "counters": {
        "u_column": 1,
        "u_row": 1,
        "u_content_text": 1,
        "u_content_heading": 1
      },
      "body": {
        "id": "sample_template",
        "rows": [
          {
            "id": "row_1",
            "cells": [1],
            "columns": [
              {
                "id": "column_1",
                "contents": [
                  {
                    "id": "heading_1",
                    "type": "heading",
                    "values": {
                      "containerPadding": "10px",
                      "text": "Welcome to Our Newsletter!",
                      "color": "#000000",
                      "textAlign": "center",
                      "fontSize": "32px",
                      "fontFamily": "arial,helvetica,sans-serif",
                      "fontWeight": "bold"
                    }
                  },
                  {
                    "id": "text_1",
                    "type": "text",
                    "values": {
                      "containerPadding": "10px",
                      "text": "This is a sample newsletter template. You can edit this content and add more elements.",
                      "color": "#000000",
                      "textAlign": "center",
                      "fontSize": "16px",
                      "fontFamily": "arial,helvetica,sans-serif"
                    }
                  }
                ],
                "values": {
                  "backgroundColor": "",
                  "padding": "0px",
                  "border": {},
                  "borderRadius": "0px"
                }
              }
            ],
            "values": {
              "columns": false,
              "backgroundColor": "",
              "columnsBackgroundColor": "#ffffff",
              "backgroundImage": {
                "url": "",
                "fullWidth": true,
                "repeat": false,
                "size": "cover",
                "position": "center"
              },
              "padding": "0px",
              "hideDesktop": false
            }
          }
        ],
        "headers": [],
        "footers": [],
        "values": {
          "popupPosition": "center",
          "popupWidth": "600px",
          "popupHeight": "auto",
          "borderRadius": "10px",
          "contentWidth": "600px",
          "contentAlign": "center",
          "fontFamily": {
            "label": "Arial",
            "value": "arial,helvetica,sans-serif"
          },
          "textColor": "#000000",
          "backgroundColor": "#ffffff",
          "backgroundImage": {
            "url": "",
            "fullWidth": true,
            "repeat": false,
            "size": "cover",
            "position": "center"
          },
          "preheaderText": "",
          "linkStyle": {
            "body": true,
            "linkColor": "#0000ee",
            "linkHoverColor": "#0000ee",
            "linkUnderline": true,
            "linkHoverUnderline": true
          },
          "customCSS": ""
        }
      }
    };
    
    const unlayer = emailEditorRef.current?.editor;
    unlayer?.loadDesign(sampleDesign);
  };

  const handlePreview = () => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.exportHtml((data) => {
      const { html } = data;
      
      // Open preview in new window
      const previewWindow = window.open('', '_blank', 'width=800,height=600');
      if (previewWindow) {
        previewWindow.document.write(html);
        previewWindow.document.close();
      }
    });
  };

  return (
    <div className="h-screen w-full flex flex-col" style={{ height: '100vh', width: '100vw' }}>
      {/* Compact Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0" style={{ height: '60px' }}>
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
              onClick={getCurrentContent}
              className="px-3 py-1 border border-green-300 text-xs font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Get Content
            </button>
            
            <button
              onClick={handleLoadSampleTemplate}
              className="px-3 py-1 border border-blue-300 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Load Sample
            </button>
            
            <button
              onClick={handleSaveTemplate}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save as Template
            </button>
            
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
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save & Continue
            </button>
          </div>
        </div>
      </div>

      {/* Email Editor - Full Height */}
      <div className="flex-1 overflow-hidden" style={{ height: 'calc(100vh - 60px)', width: '100%' }}>
        <EmailEditor
          ref={emailEditorRef}
          onLoad={onEditorLoad}
          style={{ 
            height: '100%', 
            width: '100%',
            minHeight: 'calc(100vh - 60px)'
          }}
          options={{
            id: 'newsletter-editor',
            displayMode: 'email',
            appearance: {
              theme: 'light',
              panels: {
                tools: {
                  dock: 'left'
                }
              }
            },
            features: {
              preview: true,
              imageEditor: true,
              stockImages: true,
              undoRedo: true,
              textEditor: {
                spellChecker: true,
                emojis: true
              }
            },
            tools: {
              // Customize available tools
              image: {
                enabled: true,
                properties: {
                  src: {
                    value: {
                      url: 'https://via.placeholder.com/600x400'
                    }
                  }
                }
              },
              button: {
                enabled: true,
                properties: {
                  buttonColors: {
                    value: {
                      color: '#FFFFFF',
                      backgroundColor: '#3182ce',
                      hoverColor: '#FFFFFF',
                      hoverBackgroundColor: '#2c5aa0'
                    }
                  }
                }
              },
              text: {
                enabled: true,
                properties: {
                  text: {
                    value: 'Enter your text here...'
                  }
                }
              },
              heading: {
                enabled: true
              },
              divider: {
                enabled: true
              },
              spacer: {
                enabled: true
              },
              social: {
                enabled: true
              },
              video: {
                enabled: true
              },
              html: {
                enabled: true
              }
            },
            blocks: [],
            editor: {
              minRows: 1,
              maxRows: 20
            },
            mergeTags: {
              first_name: {
                name: 'First Name',
                value: '{{first_name}}',
                sample: 'John'
              },
              last_name: {
                name: 'Last Name', 
                value: '{{last_name}}',
                sample: 'Doe'
              },
              email: {
                name: 'Email',
                value: '{{email}}',
                sample: 'john.doe@example.com'
              },
              company: {
                name: 'Company',
                value: '{{company}}',
                sample: 'Acme Corp'
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default ReactEmailEditor;