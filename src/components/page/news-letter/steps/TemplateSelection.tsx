import React, { useState, useMemo, useEffect } from "react";
import { NewsletterTemplate } from "../types";
import { unlayerApi, UnlayerTemplate } from "@/services/api/unlayer";
import { getNewsletters } from "@/services/api/newsletterService";
import { useAppDispatch } from "@/store";
import {
  setSelectedTemplate,
  setContent,
  setDesign,
  completeStep,
  setCurrentStep,
} from "@/store/slices/newsletterSlice";
import SimpleTemplateThumbnail from "../components/SimpleTemplateThumbnail";

// Template categories for the new email templates
const templateCategories = [
  { id: "all", name: "All Templates" },
  { id: "saved", name: "Saved Templates" },
  { id: "welcome", name: "Welcome" },
  { id: "newsletter", name: "Newsletter" },
  { id: "product", name: "Product" },
  { id: "engagement", name: "Engagement" },
  { id: "event", name: "Event" },
  { id: "ecommerce", name: "E-commerce" },
];

const TemplateSelection: React.FC = () => {
  const dispatch = useAppDispatch();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [apiTemplates, setApiTemplates] = useState<UnlayerTemplate[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [templateError, setTemplateError] = useState<string | null>(null);

  // Fetch templates from both Unlayer API and saved templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoadingTemplates(true);
      setTemplateError(null);
      try {
        console.log("🔄 Starting to fetch templates...");

        // Fetch Unlayer templates
        const unlayerResponse = await unlayerApi.getTemplates();
        console.log("📦 Unlayer API Response received:", unlayerResponse);

        if (unlayerResponse.success && unlayerResponse.data && unlayerResponse.data.length > 0) {
          console.log(`✅ Setting ${unlayerResponse.data.length} templates from Unlayer API`);
          setApiTemplates(unlayerResponse.data);
        } else {
          console.warn("⚠️ Unlayer API returned no templates, using mock templates as fallback");
          const mockResponse = unlayerApi.getMockTemplates();
          setApiTemplates(mockResponse.data);
        }

        // Fetch saved templates (those with isTemplate === true)
        try {
          const newsletterResponse = await getNewsletters();
          console.log("📧 All newsletters from API:", newsletterResponse);
          const templates = newsletterResponse.data.filter((n: any) => n.isTemplate === true);
          console.log(`✅ Found ${templates.length} saved templates`);
          setSavedTemplates(templates);
        } catch (error) {
          console.error("❌ Error fetching saved templates:", error);
        }
      } catch (error) {
        console.error("❌ Error fetching templates, using mock templates:", error);
        const mockResponse = unlayerApi.getMockTemplates();
        setApiTemplates(mockResponse.data);
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  // Convert API templates to newsletter template format
  const newsletterTemplates: NewsletterTemplate[] = useMemo(() => {
    console.log(
      `🔄 Building newsletterTemplates with ${apiTemplates.length} Unlayer templates and ${savedTemplates.length} saved templates`
    );

    const templates = [
      {
        id: "blank",
        name: "Start from scratch",
        category: "newsletter" as const,
        thumbnail: "/images/templates/blank-template.png",
        description: "Create your own design from scratch",
        content: "",
        isCustom: true,
      },
      // Add saved templates first
      ...savedTemplates.map((template) => ({
        id: `saved-${template.id}`,
        name: template.subject || "Untitled Template",
        category: "saved" as const,
        thumbnail: "/images/templates/blank-template.png",
        description: `Saved template: ${template.subject}`,
        content: template.content || "",
        design: template.design,
        isCustom: false,
        isSaved: true,
      })),
      // Add Unlayer API templates
      ...apiTemplates.map((template) => ({
        id: template.id,
        name: template.name,
        category: "newsletter" as const,
        thumbnail: "/images/templates/blank-template.png",
        description: `Template: ${template.name}`,
        content: "",
        design: template.design,
        isCustom: false,
        isSaved: false,
      })),
    ];

    console.log(
      `✅ Built ${templates.length} total templates (1 blank + ${savedTemplates.length} saved + ${apiTemplates.length} Unlayer)`
    );
    return templates;
  }, [apiTemplates, savedTemplates]);

  const filteredTemplates = useMemo(() => {
    let filtered = newsletterTemplates;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((template: NewsletterTemplate) => template.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (template: NewsletterTemplate) =>
          template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    console.log(`🔍 Filtered to ${filtered.length} templates (category: ${selectedCategory}, search: "${searchTerm}")`);
    return filtered;
  }, [newsletterTemplates, selectedCategory, searchTerm]);

  const onSelectTemplate = React.useCallback(
    (template: NewsletterTemplate) => {
      console.log("🎯 Template selected:", template.id);

      dispatch(setSelectedTemplate(template.id));
      console.log("✅ Redux: setSelectedTemplate dispatched");

      if (template.id === "blank") {
        // For blank template, set empty content and basic design
        dispatch(setContent(""));
        dispatch(
          setDesign({
            counters: {},
            body: {
              rows: [],
              values: {
                backgroundColor: "#ffffff",
                backgroundImage: { url: "", fullWidth: true, repeat: false, center: true, cover: false },
                contentWidth: "600px",
                fontFamily: { label: "Arial", value: "arial,helvetica,sans-serif" },
                textColor: "#000000",
              },
            },
          })
        );
        console.log("✅ Redux: Blank template design dispatched");
      } else if (template.design) {
        // For API templates with design JSON
        dispatch(setDesign(template.design));
        console.log("✅ Redux: setDesign dispatched with API template design JSON");
      }

      dispatch(completeStep(1));
      console.log("✅ Redux: completeStep(1) dispatched");

      dispatch(setCurrentStep(2));
      console.log("✅ Redux: setCurrentStep(2) dispatched - Should navigate to Edit step now!");
    },
    [dispatch]
  );

  const onPreviewTemplate = React.useCallback(async (template: NewsletterTemplate) => {
    // Open preview in a new window directly
    let previewContent = "";

    // If template has content, use it
    if (template.content) {
      previewContent = template.content;
    } else if (template.design) {
      // If template has design JSON, try to export HTML
      try {
        const result = await unlayerApi.exportHtml(template.design);
        if (result && result.html) {
          previewContent = result.html;
        }
      } catch (error) {
        console.error("Error generating preview:", error);
        previewContent = "<p>Unable to generate preview for this template.</p>";
      }
    } else if (template.id === "blank") {
      previewContent = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif;">
          <div style="text-align: center;">
            <h2>Blank Canvas</h2>
            <p>Start building your newsletter from scratch with complete creative control.</p>
          </div>
        </div>
      `;
    }

    // Open in new window
    const previewWindow = window.open("", "_blank", "width=800,height=600,scrollbars=yes,resizable=yes");
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${template.name} - Email Preview</title>
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
            <h1>${template.name}</h1>
            <p>Email Template Preview</p>
          </div>
          <div class="email-content">
            ${previewContent}
          </div>
        </body>
        </html>
      `);
      previewWindow.document.close();
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Select a Template</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose from our professionally designed templates or start from scratch to create your perfect newsletter.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-8">
        <div className="flex flex-wrap justify-center gap-2">
          {templateCategories.map((category: any) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                selectedCategory === category.id
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {isLoadingTemplates ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Skeleton loaders */}
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              {/* Thumbnail skeleton */}
              <div className="w-full h-64 bg-gray-200"></div>

              {/* Content skeleton */}
              <div className="p-4 space-y-3">
                {/* Title skeleton */}
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>

                {/* Description skeleton */}
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>

                {/* Buttons skeleton */}
                <div className="flex gap-2 pt-2">
                  <div className="h-9 bg-gray-200 rounded flex-1"></div>
                  <div className="h-9 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : templateError ? (
        <div className="text-center py-12 max-w-md mx-auto">
          <svg className="w-16 h-16 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-gray-700 font-medium mb-2">Templates Not Available</p>
          <p className="text-sm text-gray-500 mb-4">{templateError}</p>
          <p className="text-xs text-gray-400">You can still use "Start from scratch" option.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Removed xl:grid-cols-4 for larger thumbnails */}
          {filteredTemplates.map((template: NewsletterTemplate) => (
            <SimpleTemplateThumbnail
              key={template.id}
              template={template}
              onSelect={() => onSelectTemplate(template)}
              onPreview={() => onPreviewTemplate(template)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">Try adjusting your search or category filter.</p>
        </div>
      )}
    </div>
  );
};

export default TemplateSelection;
