// Unlayer API Service
// Temporary API for demo purposes - will be replaced with custom backend API

interface UnlayerTemplate {
  id: string;
  name: string;
  design: any;
  displayMode: string;
  thumbnail?: string; // Preview image URL
  updatedAt: string;
  createdAt: string;
}

interface UnlayerTemplatesResponse {
  success: boolean;
  data: UnlayerTemplate[];
}

const UNLAYER_API_BASE_URL = "https://api.unlayer.com/v2";
const UNLAYER_API_KEY = "MPp7YAPlxvqw2wnzzDjKbWvbDYJPPtoeAypkgFmXBoH5yCeILDgREQmWQ5vjHl7B";

function getAuthHeaders(): Record<string, string> {
  if (!UNLAYER_API_KEY) return {};

  const credentials = `${UNLAYER_API_KEY}:`;
  const base64Credentials = btoa(credentials);

  return {
    Authorization: `Basic ${base64Credentials}`,
  };
}

export const unlayerApi = {
  async getTemplates(): Promise<UnlayerTemplatesResponse> {
    try {
      console.log("🔄 Fetching templates from Unlayer API...");

      const response = await fetch(`${UNLAYER_API_BASE_URL}/templates`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(`Failed to fetch templates: ${response.status} ${response.statusText}`);
      }

      const data: UnlayerTemplatesResponse = await response.json();

      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.error("CORS or Network Error - The Unlayer API might require authentication or have CORS restrictions");
      }

      return {
        success: false,
        data: [],
      };
    }
  },

  getMockTemplates(): UnlayerTemplatesResponse {
    return {
      success: true,
      data: [
        {
          id: "welcome-email",
          name: "Welcome Email",
          displayMode: "email",
          design: {
            counters: {},
            body: {
              rows: [
                {
                  cells: [1],
                  columns: [
                    {
                      contents: [
                        {
                          type: "text",
                          values: {
                            text: "<h1>Welcome!</h1><p>Thank you for joining us.</p>",
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
              values: {
                backgroundColor: "#ffffff",
                contentWidth: "600px",
                fontFamily: { label: "Arial", value: "arial,helvetica,sans-serif" },
              },
            },
          },
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: "newsletter-basic",
          name: "Basic Newsletter",
          displayMode: "email",
          design: {
            counters: {},
            body: {
              rows: [
                {
                  cells: [1],
                  columns: [
                    {
                      contents: [
                        {
                          type: "text",
                          values: {
                            text: "<h2>Monthly Newsletter</h2><p>Here's what's new this month...</p>",
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
              values: {
                backgroundColor: "#f4f4f4",
                contentWidth: "600px",
                fontFamily: { label: "Arial", value: "arial,helvetica,sans-serif" },
              },
            },
          },
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: "product-announcement",
          name: "Product Announcement",
          displayMode: "email",
          design: {
            counters: {},
            body: {
              rows: [
                {
                  cells: [1],
                  columns: [
                    {
                      contents: [
                        {
                          type: "text",
                          values: {
                            text: "<h1>New Product Launch</h1><p>Introducing our latest innovation...</p>",
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
              values: {
                backgroundColor: "#ffffff",
                contentWidth: "600px",
                fontFamily: { label: "Arial", value: "arial,helvetica,sans-serif" },
              },
            },
          },
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ],
    };
  } /**
   * Get a single template by ID from Unlayer API
   * This fetches the full template details including the complete design
   */,
  async getTemplateById(id: string): Promise<UnlayerTemplate | null> {
    try {
      console.log(`🔄 Fetching template by ID: ${id}`);

      const response = await fetch(`${UNLAYER_API_BASE_URL}/templates/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      console.log("📡 Template API Response Status:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Template API Error Response:", errorText);
        throw new Error(`Failed to fetch template: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log("✅ Template fetched successfully:", {
        id: result.data?.id,
        name: result.data?.name,
        hasDesign: !!result.data?.design,
      });

      if (result.success && result.data) {
        return result.data;
      }

      console.warn("⚠️ Template API returned unsuccessful response");
      return null;
    } catch (error) {
      console.error("❌ Error fetching template by ID:", error);

      // Fallback: try to get from list
      console.log("🔄 Falling back to getting template from list...");
      try {
        const response = await this.getTemplates();
        if (response.success) {
          const template = response.data.find((t) => t.id === id);
          if (template) {
            console.log("✅ Found template in list as fallback");
            return template;
          }
        }
      } catch (fallbackError) {
        console.error("❌ Fallback also failed:", fallbackError);
      }

      return null;
    }
  },

  /**
   * Export template design to HTML
   * This uses Unlayer's export API to convert design JSON to HTML
   */
  async exportHtml(design: any): Promise<{ html: string } | null> {
    try {
      console.log("🔄 Exporting design to HTML...");

      const response = await fetch(`${UNLAYER_API_BASE_URL}/export/html`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          displayMode: "email",
          design: design,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to export HTML: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        return { html: result.data.html };
      }

      return null;
    } catch (error) {
      console.error("Error exporting HTML:", error);
      return null;
    }
  },
};

export type { UnlayerTemplate, UnlayerTemplatesResponse };
