"use client";

import React, { useRef, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EmailEditor, { EditorRef, EmailEditorProps } from "react-email-editor";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setContent,
  setDesign,
  completeStep,
  setCurrentStep,
  updateNewsletterData,
} from "@/store/slices/newsletterSlice";
import { Modal } from "@/components/ui/modal";
import { blogApi } from "@/services/api/blog";
import { createNewsletter, updateNewsletter } from "@/services/api/newsLetter";
import { useToast } from "@/context/ToastContext";
import FullScreenSpinner from "@/components/ui/FullScreenSpinner";

interface ReactEmailEditorProps {
  onDesignLoad?: (design: any) => void;
  onLoad?: () => void;
}

const ReactEmailEditor: React.FC<ReactEmailEditorProps> = ({ onDesignLoad, onLoad }) => {
  const emailEditorRef = useRef<EditorRef>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const newsletterData = useAppSelector((state) => state.newsletter.data);
  const isEditMode = useAppSelector((state) => state.newsletter.isEditMode);
  const editingNewsletterId = useAppSelector((state) => state.newsletter.editingNewsletterId);
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newsletterId, setNewsletterId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  const saveDesign = useCallback(async () => {
    const unlayer = emailEditorRef.current?.editor;

    if (!unlayer) return;

    setIsSaving(true);
    setSaveMessage(null);

    unlayer.exportHtml(async (data) => {
      const { design, html } = data;

      try {
        // Update Redux state first
        dispatch(setContent(html));
        dispatch(setDesign(design));

        // Prepare newsletter data with fresh content and design
        const newsletterPayload = {
          selectedTemplateId: newsletterData.selectedTemplateId,
          subject: newsletterData.subject || "Untitled Newsletter",
          fromName: newsletterData.fromName || "",
          fromAddress: newsletterData.fromAddress || "",
          sendTo: newsletterData.sendTo || [],
          dontSendTo: newsletterData.dontSendTo || [],
          scheduledAt: newsletterData.scheduledAt,
          scheduledTimezone: newsletterData.scheduledTimezone || "America/New_York",
          isTemplate: newsletterData.isTemplate || false,
          status: "DRAFT" as const,
          // Use the fresh values from the editor
          content: html,
          design: design,
        };

        console.log("📦 Newsletter Payload:", {
          ...newsletterPayload,
          content: `${html.substring(0, 100)}... (${html.length} chars)`,
          design: "{ design object }",
        });

        // Validate content is not empty
        if (!html || html.trim().length === 0) {
          console.warn("⚠️ Warning: HTML content is empty!");
          addToast({
            variant: "error",
            title: "Content Required",
            message: "Cannot save: Newsletter content is empty. Please add some content to the email editor.",
          });
          setIsSaving(false);
          return;
        }

        let response;
        if (newsletterId) {
          // Update existing newsletter
          console.log("📝 Updating newsletter:", newsletterId);
          response = await updateNewsletter(newsletterId, newsletterPayload);
          console.log("✅ Newsletter updated successfully");
        } else {
          // Create new newsletter
          console.log("📝 Creating new newsletter...");
          response = await createNewsletter(newsletterPayload);
          console.log("✅ Newsletter created successfully");

          // Store the newsletter ID for future updates
          if (response.data?.id) {
            setNewsletterId(response.data.id);
          }
        }

        addToast({
          variant: "success",
          title: "Success",
          message: "Draft saved successfully!",
        });

        // Clear message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000);
      } catch (error) {
        console.error("❌ Error saving newsletter:", error);

        const errorMessage = error instanceof Error ? error.message : "Failed to save draft";

        addToast({
          variant: "error",
          title: "Save Failed",
          message: errorMessage,
        });

        // Clear error message after 5 seconds
        setTimeout(() => setSaveMessage(null), 5000);
      } finally {
        setIsSaving(false);
      }
    });
  }, [dispatch, newsletterData, newsletterId]);

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
          return;
        }

        // Show loading indicator
        setIsUploadingImage(true);

        try {
          // Upload to your server using blog media API
          const response = await blogApi.uploadMedia({
            mediaUpload: file,
            type: "IMAGE",
          });

          if (response.success && response.data.url) {
            done({ url: response.data.url });
          } else {
            alert("Failed to upload image. Please try again.");
          }
        } catch (error) {
          alert("Failed to upload image. Please try again.");
        } finally {
          // Hide loading indicator
          setIsUploadingImage(false);
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

  const handleSaveAndContinue = () => {
    const unlayer = emailEditorRef.current?.editor;

    if (!unlayer) {
      addToast({
        variant: "error",
        title: "Error",
        message: "Email editor is not ready",
      });
      return;
    }

    unlayer.exportHtml((data) => {
      const { design, html } = data;

      console.log("📤 Exporting before navigation:", {
        htmlLength: html?.length || 0,
        hasDesign: !!design,
        designType: typeof design,
        designKeys: design ? Object.keys(design) : [],
        isEditMode,
        editingNewsletterId,
      });

      // Validate content before continuing
      if (!html || html.trim().length === 0) {
        addToast({
          variant: "error",
          title: "Content Required",
          message: "Please add some content to the email before continuing",
        });
        return;
      }

      // Save to Redux
      dispatch(setContent(html));
      dispatch(setDesign(design));

      // If in edit mode, update the newsletter and redirect back to list
      if (isEditMode && editingNewsletterId) {
        handleUpdateNewsletter(html, design);
      } else {
        // Create mode: Mark step as completed and navigate to next step
        dispatch(completeStep(2));
        dispatch(setCurrentStep(3));

        addToast({
          variant: "success",
          title: "Success",
          message: "Email content saved! Moving to next step.",
        });
      }
    });
  };

  const handleUpdateNewsletter = async (html: string, design: any) => {
    if (!editingNewsletterId) return;

    try {
      setIsSaving(true);

      // Prepare payload matching the create newsletter structure
      const updatePayload = {
        subject: newsletterData.subject || "Untitled Newsletter",
        fromName: newsletterData.fromName || "",
        fromAddress: newsletterData.fromAddress || "",
        sendTo: newsletterData.sendTo || [],
        dontSendTo: newsletterData.dontSendTo || [],
        scheduledAt: newsletterData.scheduledAt,
        scheduledTimezone: newsletterData.scheduledTimezone || "America/New_York",
        isTemplate: newsletterData.isTemplate || false,
        status: "DRAFT" as const, // Force DRAFT status for editing
        content: html,
        design: design,
      };

      await updateNewsletter(editingNewsletterId, updatePayload);

      addToast({
        variant: "success",
        title: "Success",
        message: "Newsletter updated successfully!",
      });

      // Redirect back to newsletter list
      setTimeout(() => {
        router.push("/admin/news-letter");
      }, 500);
    } catch (error) {
      console.error("Error updating newsletter:", error);
      addToast({
        variant: "error",
        title: "Error",
        message: "Failed to update newsletter",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTemplate = () => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.exportHtml((data) => {
      const { design, html } = data;

      // Save as template
      dispatch(setContent(html));
      dispatch(setDesign(design));
      dispatch(updateNewsletterData({ isTemplate: true }));
    });
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

  // Navigate back helper (create flow vs edit flow)
  const navigateBack = () => {
    if (isEditMode) {
      router.push("/admin/news-letter");
    } else {
      dispatch(setCurrentStep(1));
    }
  };

  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);

  // Compare current editor content/design with Redux state to detect unsaved changes
  const checkEditorForUnsavedChanges = async (): Promise<boolean> => {
    const unlayer = emailEditorRef.current?.editor;
    if (!unlayer) return false;

    try {
      const data: any = await new Promise((resolve) => {
        unlayer.exportHtml((d: any) => resolve(d));
      });

      const currentHtml = (data?.html || "").trim();
      const currentDesign = data?.design || null;

      const savedHtml = (newsletterData.content || "").trim();
      const savedDesign = newsletterData.design || null;

      // Check if both are essentially empty (no real content)
      const currentIsEmpty = !currentHtml || currentHtml.length === 0;
      const savedIsEmpty = !savedHtml || savedHtml.length === 0;

      // If both are empty, no changes
      if (currentIsEmpty && savedIsEmpty) {
        return false;
      }

      // Check if current design has any rows (actual content)
      const currentHasContent = currentDesign?.body?.rows?.length > 0;
      const savedHasContent = savedDesign?.body?.rows?.length > 0;

      // If neither has content, no changes
      if (!currentHasContent && !savedHasContent) {
        return false;
      }

      // Now check for actual changes
      const htmlChanged = currentHtml !== savedHtml;
      const designChanged = JSON.stringify(currentDesign) !== JSON.stringify(savedDesign);

      return htmlChanged || designChanged;
    } catch (err) {
      // If anything goes wrong, assume no unsaved changes to avoid blocking navigation
      console.error("Error checking editor for unsaved changes:", err);
      return false;
    }
  };

  const handleBackClick = async () => {
    const hasChanges = await checkEditorForUnsavedChanges();
    if (hasChanges) {
      setShowUnsavedConfirm(true);
    } else {
      navigateBack();
    }
  };

  return (
    <>
      {/* Image Upload Loading Overlay */}
      <FullScreenSpinner isVisible={isUploadingImage} message="Uploading Image..." />

      <div className="h-screen w-full flex flex-col" style={{ height: "100vh", width: "100vw" }}>
        {/* Compact Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0" style={{ height: "60px" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackClick}
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
              {/* Save Status Message */}
              {saveMessage && (
                <div
                  className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm ${
                    saveMessage.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  {saveMessage.type === "success" ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span>{saveMessage.text}</span>
                </div>
              )}

              <button
                onClick={handlePreview}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Preview
              </button>

              <button
                onClick={handleSaveAndContinue}
                disabled={isSaving}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
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
                    <span>{isEditMode ? "Updating..." : "Saving..."}</span>
                  </>
                ) : (
                  <span>{isEditMode ? "Update" : "Save & Continue"}</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Email Editor - Full Height with scroll */}
        <div className="flex-1 overflow-auto" style={{ height: "calc(100vh - 60px)", width: "100%" }}>
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
                      value: "Type here...",
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
      {/* Unsaved changes confirmation modal for Back action */}
      <Modal
        isOpen={showUnsavedConfirm}
        onClose={() => setShowUnsavedConfirm(false)}
        isFullscreen={false}
        className="max-w-md"
      >
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-yellow-100">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Unsaved Changes</h3>

          <p className="text-sm text-gray-600 text-center mb-6">
            You have unsaved changes in the editor. If you go back, these changes will be lost. Do you want to discard
            them?
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setShowUnsavedConfirm(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Stay and Continue Editing
            </button>
            <button
              onClick={() => {
                setShowUnsavedConfirm(false);
                navigateBack();
              }}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Discard Changes
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ReactEmailEditor;
