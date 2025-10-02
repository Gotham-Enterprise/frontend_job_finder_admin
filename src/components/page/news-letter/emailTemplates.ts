// Pre-built email templates for react-email-editor
export const emailTemplates = [
  {
    id: "welcome-template",
    name: "Welcome Email",
    category: "welcome" as const,
    thumbnail: "/images/templates/welcome-template.png",
    description: "Perfect for welcoming new subscribers",
    content: `
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td align="center" style="padding: 40px 20px; background-color: #f8f9fa;">
            <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <h1 style="margin: 0; font-family: arial,helvetica,sans-serif; font-size: 32px; font-weight: bold; color: #000000; text-align: center;">
                    Welcome to Our Newsletter!
                  </h1>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding: 20px;">
                  <p style="margin: 0; font-family: arial,helvetica,sans-serif; font-size: 16px; color: #000000; text-align: center; line-height: 1.5;">
                    Thank you for subscribing! We're excited to have you on board.
                  </p>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding: 30px 20px;">
                  <a href="#" style="display: inline-block; padding: 12px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; font-family: arial,helvetica,sans-serif; font-size: 16px; font-weight: bold;">
                    Get Started
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
    design: {
      counters: {
        u_column: 1,
        u_row: 1,
        u_content_text: 1,
        u_content_heading: 1,
        u_content_button: 1,
      },
      body: {
        id: "template_1",
        rows: [
          {
            id: "row_1",
            cells: [1],
            columns: [
              {
                id: "column_1",
                contents: [
                  {
                    id: "heading_1",
                    type: "heading",
                    values: {
                      containerPadding: "10px",
                      anchor: "",
                      text: "Welcome to Our Newsletter!",
                      color: "#000000",
                      textAlign: "center",
                      fontSize: "32px",
                      fontFamily: "arial,helvetica,sans-serif",
                      fontWeight: "bold",
                    },
                  },
                  {
                    id: "text_1",
                    type: "text",
                    values: {
                      containerPadding: "10px",
                      anchor: "",
                      text: "Thank you for subscribing! We're excited to have you on board.",
                      color: "#000000",
                      textAlign: "center",
                      fontSize: "16px",
                      fontFamily: "arial,helvetica,sans-serif",
                    },
                  },
                  {
                    id: "button_1",
                    type: "button",
                    values: {
                      containerPadding: "10px",
                      anchor: "",
                      href: {
                        name: "web",
                        values: {
                          href: "https://example.com",
                          target: "_blank",
                        },
                      },
                      buttonColors: {
                        color: "#FFFFFF",
                        backgroundColor: "#3182ce",
                        hoverColor: "#FFFFFF",
                        hoverBackgroundColor: "#2c5aa0",
                      },
                      size: {
                        autoWidth: true,
                        width: "100%",
                      },
                      fontSize: "16px",
                      textAlign: "center",
                      lineHeight: "120%",
                      padding: "12px 20px",
                      text: "Get Started",
                    },
                  },
                ],
                values: {
                  backgroundColor: "",
                  padding: "0px",
                  border: {},
                  borderRadius: "0px",
                },
              },
            ],
            values: {
              displayCondition: null,
              columns: false,
              backgroundColor: "",
              columnsBackgroundColor: "#ffffff",
              backgroundImage: {
                url: "",
                fullWidth: true,
                repeat: "no-repeat",
                size: "custom",
                position: "center",
              },
              padding: "20px",
              anchor: "",
              hideDesktop: false,
            },
          },
        ],
        values: {
          popupPosition: "center",
          popupWidth: "600px",
          popupHeight: "auto",
          borderRadius: "10px",
          contentAlign: "center",
          contentVerticalAlign: "center",
          contentWidth: "600px",
          fontFamily: {
            label: "Arial",
            value: "arial,helvetica,sans-serif",
          },
          preheaderText: "",
          textColor: "#000000",
          backgroundColor: "#e7e7e7",
          backgroundImage: {
            url: "",
            fullWidth: true,
            repeat: "no-repeat",
            size: "custom",
            position: "center",
          },
          linkStyle: {
            body: true,
            linkColor: "#0000ee",
            linkHoverColor: "#0000ee",
            linkUnderline: true,
            linkHoverUnderline: true,
          },
          popupBackgroundColor: "#FFFFFF",
          popupOverlay_backgroundColor: "rgba(0, 0, 0, 0.1)",
          popupCloseButton_position: "top-right",
          popupCloseButton_backgroundColor: "#DDDDDD",
          popupCloseButton_iconColor: "#000000",
          popupCloseButton_borderRadius: "0px",
          popupCloseButton_margin: "0px",
          popupCloseButton_action: {
            name: "close_popup",
            values: {},
          },
        },
      },
      schemaVersion: 16,
    },
  },
  {
    id: "newsletter-template",
    name: "Newsletter",
    category: "newsletter" as const,
    thumbnail: "/images/templates/newsletter-template.png",
    description: "Great for regular newsletter updates",
    content: `
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td align="center" style="padding: 40px 20px; background-color: #f8f9fa;">
            <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td align="center" style="padding: 40px 20px; background-color: #28a745; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; font-family: arial,helvetica,sans-serif; font-size: 28px; font-weight: bold; color: white; text-align: center;">
                    Gotham Enterprises Newsletter
                  </h1>
                  <p style="margin: 10px 0 0 0; font-family: arial,helvetica,sans-serif; font-size: 16px; color: #e8f5e8; text-align: center;">
                    Stay updated with our latest news and insights
                  </p>
                </td>
              </tr>
              <!-- Main Content -->
              <tr>
                <td style="padding: 40px 20px;">
                  <h2 style="margin: 0 0 20px 0; font-family: arial,helvetica,sans-serif; font-size: 24px; font-weight: bold; color: #333333;">
                    This Month's Highlights
                  </h2>
                  <p style="margin: 0 0 20px 0; font-family: arial,helvetica,sans-serif; font-size: 16px; color: #666666; line-height: 1.6;">
                    We're excited to share our latest achievements and upcoming initiatives. From new product launches to community partnerships, there's a lot happening at Gotham Enterprises.
                  </p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="#" style="display: inline-block; padding: 12px 30px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px; font-family: arial,helvetica,sans-serif; font-size: 16px; font-weight: bold;">
                      Read More
                    </a>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
    design: {
      counters: {
        u_column: 2,
        u_row: 2,
        u_content_text: 2,
        u_content_heading: 2,
        u_content_image: 1,
      },
      body: {
        id: "template_2",
        rows: [
          {
            id: "row_1",
            cells: [1],
            columns: [
              {
                id: "column_1",
                contents: [
                  {
                    id: "image_1",
                    type: "image",
                    values: {
                      containerPadding: "20px",
                      anchor: "",
                      src: {
                        url: "https://via.placeholder.com/600x200/3182ce/ffffff?text=Newsletter+Header",
                        width: 600,
                        height: 200,
                      },
                      textAlign: "center",
                      altText: "Newsletter Header",
                      action: {
                        name: "web",
                        values: {
                          href: "",
                          target: "_blank",
                        },
                      },
                    },
                  },
                  {
                    id: "heading_1",
                    type: "heading",
                    values: {
                      containerPadding: "40px 20px",
                      backgroundColor: "#28a745",
                      anchor: "",
                      text: "Gotham Enterprises Newsletter",
                      color: "#ffffff",
                      textAlign: "center",
                      fontSize: "28px",
                      fontFamily: "arial,helvetica,sans-serif",
                      fontWeight: "bold",
                    },
                  },
                  {
                    id: "text_subtitle",
                    type: "text",
                    values: {
                      containerPadding: "10px 20px 40px 20px",
                      backgroundColor: "#28a745",
                      anchor: "",
                      text: "Stay updated with our latest news and insights",
                      color: "#e8f5e8",
                      textAlign: "center",
                      fontSize: "16px",
                      fontFamily: "arial,helvetica,sans-serif",
                    },
                  },
                ],
                values: {
                  backgroundColor: "",
                  padding: "0px",
                  border: {},
                  borderRadius: "0px",
                },
              },
            ],
            values: {
              displayCondition: null,
              columns: false,
              backgroundColor: "",
              columnsBackgroundColor: "#ffffff",
              backgroundImage: {
                url: "",
                fullWidth: true,
                repeat: "no-repeat",
                size: "custom",
                position: "center",
              },
              padding: "0px",
              anchor: "",
              hideDesktop: false,
            },
          },
          {
            id: "row_2",
            cells: [1],
            columns: [
              {
                id: "column_2",
                contents: [
                  {
                    id: "heading_2",
                    type: "heading",
                    values: {
                      containerPadding: "10px",
                      anchor: "",
                      text: "This Month's Highlights",
                      color: "#000000",
                      textAlign: "left",
                      fontSize: "22px",
                      fontFamily: "arial,helvetica,sans-serif",
                      fontWeight: "bold",
                    },
                  },
                  {
                    id: "text_1",
                    type: "text",
                    values: {
                      containerPadding: "10px",
                      anchor: "",
                      text: "We're excited to share our latest achievements and upcoming initiatives. From new product launches to community partnerships, there's a lot happening at Gotham Enterprises.",
                      color: "#666666",
                      textAlign: "left",
                      fontSize: "16px",
                      fontFamily: "arial,helvetica,sans-serif",
                      lineHeight: "140%",
                    },
                  },
                  {
                    id: "button_1",
                    type: "button",
                    values: {
                      containerPadding: "30px 20px",
                      anchor: "",
                      text: "Read More",
                      color: "#ffffff",
                      backgroundColor: "#28a745",
                      textAlign: "center",
                      fontSize: "16px",
                      fontFamily: "arial,helvetica,sans-serif",
                      fontWeight: "bold",
                      borderRadius: "4px",
                      padding: "12px 30px",
                      href: {
                        name: "web",
                        values: {
                          href: "#",
                          target: "_blank",
                        },
                      },
                    },
                  },
                ],
                values: {
                  backgroundColor: "",
                  padding: "0px",
                  border: {},
                  borderRadius: "0px",
                },
              },
            ],
            values: {
              displayCondition: null,
              columns: false,
              backgroundColor: "",
              columnsBackgroundColor: "#ffffff",
              backgroundImage: {
                url: "",
                fullWidth: true,
                repeat: "no-repeat",
                size: "custom",
                position: "center",
              },
              padding: "20px",
              anchor: "",
              hideDesktop: false,
            },
          },
        ],
        values: {
          popupPosition: "center",
          popupWidth: "600px",
          popupHeight: "auto",
          borderRadius: "10px",
          contentAlign: "center",
          contentVerticalAlign: "center",
          contentWidth: "600px",
          fontFamily: {
            label: "Arial",
            value: "arial,helvetica,sans-serif",
          },
          preheaderText: "",
          textColor: "#000000",
          backgroundColor: "#e7e7e7",
          backgroundImage: {
            url: "",
            fullWidth: true,
            repeat: "no-repeat",
            size: "custom",
            position: "center",
          },
          linkStyle: {
            body: true,
            linkColor: "#0000ee",
            linkHoverColor: "#0000ee",
            linkUnderline: true,
            linkHoverUnderline: true,
          },
          popupBackgroundColor: "#FFFFFF",
          popupOverlay_backgroundColor: "rgba(0, 0, 0, 0.1)",
          popupCloseButton_position: "top-right",
          popupCloseButton_backgroundColor: "#DDDDDD",
          popupCloseButton_iconColor: "#000000",
          popupCloseButton_borderRadius: "0px",
          popupCloseButton_margin: "0px",
          popupCloseButton_action: {
            name: "close_popup",
            values: {},
          },
        },
      },
      schemaVersion: 16,
    },
  },
  {
    id: "product-template",
    name: "Product Update",
    category: "product" as const,
    thumbnail: "/images/templates/product-template.png",
    description: "Showcase your latest products or features",
    content: `
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td align="center" style="padding: 40px 20px; background-color: #f8f9fa;">
            <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <h1 style="margin: 0; font-family: arial,helvetica,sans-serif; font-size: 32px; font-weight: bold; color: #000000; text-align: center;">
                    New Product Launch!
                  </h1>
                </td>
              </tr>
              <!-- Product Image -->
              <tr>
                <td align="center" style="padding: 20px;">
                  <img src="https://via.placeholder.com/400x300/f0f0f0/333333?text=Product+Image" alt="Product Image" width="400" height="300" style="max-width: 100%; height: auto; border-radius: 8px;" />
                </td>
              </tr>
              <!-- Product Description -->
              <tr>
                <td style="padding: 20px 40px;">
                  <p style="margin: 0; font-family: arial,helvetica,sans-serif; font-size: 16px; color: #666666; line-height: 1.6; text-align: center;">
                    We're excited to introduce our latest product that will revolutionize your workflow. Get early access now!
                  </p>
                </td>
              </tr>
              <!-- CTA Button -->
              <tr>
                <td align="center" style="padding: 30px 20px;">
                  <a href="https://example.com/product" style="display: inline-block; padding: 15px 40px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; font-family: arial,helvetica,sans-serif; font-size: 16px; font-weight: bold;">
                    Learn More
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
    design: {
      counters: {
        u_column: 1,
        u_row: 1,
        u_content_text: 1,
        u_content_heading: 1,
        u_content_button: 2,
        u_content_image: 1,
      },
      body: {
        id: "template_3",
        rows: [
          {
            id: "row_1",
            cells: [1],
            columns: [
              {
                id: "column_1",
                contents: [
                  {
                    id: "heading_1",
                    type: "heading",
                    values: {
                      containerPadding: "10px",
                      anchor: "",
                      text: "New Product Launch!",
                      color: "#000000",
                      textAlign: "center",
                      fontSize: "32px",
                      fontFamily: "arial,helvetica,sans-serif",
                      fontWeight: "bold",
                    },
                  },
                  {
                    id: "image_1",
                    type: "image",
                    values: {
                      containerPadding: "20px",
                      anchor: "",
                      src: {
                        url: "https://via.placeholder.com/400x300/f0f0f0/333333?text=Product+Image",
                        width: 400,
                        height: 300,
                      },
                      textAlign: "center",
                      altText: "Product Image",
                      action: {
                        name: "web",
                        values: {
                          href: "",
                          target: "_blank",
                        },
                      },
                    },
                  },
                  {
                    id: "text_1",
                    type: "text",
                    values: {
                      containerPadding: "10px",
                      anchor: "",
                      text: "We're excited to introduce our latest product that will revolutionize your workflow. Get early access now!",
                      color: "#000000",
                      textAlign: "center",
                      fontSize: "18px",
                      fontFamily: "arial,helvetica,sans-serif",
                      lineHeight: "140%",
                    },
                  },
                  {
                    id: "button_1",
                    type: "button",
                    values: {
                      containerPadding: "10px",
                      anchor: "",
                      href: {
                        name: "web",
                        values: {
                          href: "https://example.com/product",
                          target: "_blank",
                        },
                      },
                      buttonColors: {
                        color: "#FFFFFF",
                        backgroundColor: "#28a745",
                        hoverColor: "#FFFFFF",
                        hoverBackgroundColor: "#218838",
                      },
                      size: {
                        autoWidth: true,
                        width: "100%",
                      },
                      fontSize: "16px",
                      textAlign: "center",
                      lineHeight: "120%",
                      padding: "12px 24px",
                      text: "Learn More",
                    },
                  },
                  {
                    id: "button_2",
                    type: "button",
                    values: {
                      containerPadding: "10px",
                      anchor: "",
                      href: {
                        name: "web",
                        values: {
                          href: "https://example.com/buy",
                          target: "_blank",
                        },
                      },
                      buttonColors: {
                        color: "#FFFFFF",
                        backgroundColor: "#dc3545",
                        hoverColor: "#FFFFFF",
                        hoverBackgroundColor: "#c82333",
                      },
                      size: {
                        autoWidth: true,
                        width: "100%",
                      },
                      fontSize: "16px",
                      textAlign: "center",
                      lineHeight: "120%",
                      padding: "12px 24px",
                      text: "Buy Now",
                    },
                  },
                ],
                values: {
                  backgroundColor: "",
                  padding: "0px",
                  border: {},
                  borderRadius: "0px",
                },
              },
            ],
            values: {
              displayCondition: null,
              columns: false,
              backgroundColor: "",
              columnsBackgroundColor: "#ffffff",
              backgroundImage: {
                url: "",
                fullWidth: true,
                repeat: "no-repeat",
                size: "custom",
                position: "center",
              },
              padding: "20px",
              anchor: "",
              hideDesktop: false,
            },
          },
        ],
        values: {
          popupPosition: "center",
          popupWidth: "600px",
          popupHeight: "auto",
          borderRadius: "10px",
          contentAlign: "center",
          contentVerticalAlign: "center",
          contentWidth: "600px",
          fontFamily: {
            label: "Arial",
            value: "arial,helvetica,sans-serif",
          },
          preheaderText: "",
          textColor: "#000000",
          backgroundColor: "#e7e7e7",
          backgroundImage: {
            url: "",
            fullWidth: true,
            repeat: "no-repeat",
            size: "custom",
            position: "center",
          },
          linkStyle: {
            body: true,
            linkColor: "#0000ee",
            linkHoverColor: "#0000ee",
            linkUnderline: true,
            linkHoverUnderline: true,
          },
          popupBackgroundColor: "#FFFFFF",
          popupOverlay_backgroundColor: "rgba(0, 0, 0, 0.1)",
          popupCloseButton_position: "top-right",
          popupCloseButton_backgroundColor: "#DDDDDD",
          popupCloseButton_iconColor: "#000000",
          popupCloseButton_borderRadius: "0px",
          popupCloseButton_margin: "0px",
          popupCloseButton_action: {
            name: "close_popup",
            values: {},
          },
        },
      },
      schemaVersion: 16,
    },
  },
  {
    id: "macbook-pro-template",
    name: "MacBook Pro",
    category: "product" as const,
    thumbnail: "/images/templates/macbook-template.png",
    description: "Apple MacBook Pro style product showcase",
    content: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #000000;">
        <!-- Apple Logo -->
        <div style="text-align: center; padding: 40px 20px 20px;">
          <img src="https://logos-world.net/wp-content/uploads/2020/04/Apple-Logo.png" alt="Apple" width="50" height="61" style="width: 50px; height: auto;" />
        </div>
        
        <!-- Hero Section -->
        <div style="text-align: center; padding: 20px;">
          <h1 style="color: #FFFFFF; font-size: 48px; font-weight: 600; margin: 20px 0; letter-spacing: -1px;">MacBook Pro</h1>
          <p style="color: #86868B; font-size: 24px; margin: 10px 0; font-weight: 400;">Supercharged for pros.</p>
        </div>
        
        <!-- Product Image -->
        <div style="text-align: center; padding: 40px 20px;">
          <img src="https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202110?wid=904&hei=840&fmt=jpeg&qlt=80&.v=1632788574000" alt="MacBook Pro" style="max-width: 100%; height: auto;" />
        </div>
        
        <!-- Features -->
        <div style="padding: 40px 20px; text-align: center;">
          <h2 style="color: #FFFFFF; font-size: 32px; font-weight: 600; margin: 0 0 30px; letter-spacing: -0.5px;">Mind-blowing. Head-turning.</h2>
          
          <div style="margin: 40px 0;">
            <h3 style="color: #F5F5F7; font-size: 24px; font-weight: 600; margin: 0 0 10px;">M2 Pro and M2 Max</h3>
            <p style="color: #86868B; font-size: 17px; line-height: 1.5; margin: 0;">Next-generation Apple silicon delivers incredible performance and amazing battery life.</p>
          </div>
          
          <div style="margin: 40px 0;">
            <h3 style="color: #F5F5F7; font-size: 24px; font-weight: 600; margin: 0 0 10px;">Liquid Retina XDR display</h3>
            <p style="color: #86868B; font-size: 17px; line-height: 1.5; margin: 0;">Extreme Dynamic Range brings HDR content to life with true-to-life detail.</p>
          </div>
        </div>
        
        <!-- CTA -->
        <div style="text-align: center; padding: 40px 20px 60px;">
          <a href="#" style="display: inline-block; background-color: #0071E3; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 980px; font-size: 17px; font-weight: 400; min-width: 60px;">Learn more</a>
          <span style="color: #86868B; margin: 0 20px; font-size: 17px;">or</span>
          <a href="#" style="display: inline-block; background-color: transparent; color: #0071E3; text-decoration: none; padding: 12px 24px; border: 1px solid #0071E3; border-radius: 980px; font-size: 17px; font-weight: 400; min-width: 60px;">Buy</a>
        </div>
      </div>
    `,
    design: {
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
                      href: {
                        name: "web",
                        values: {
                          href: "#",
                          target: "_blank",
                        },
                      },
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
          popupPosition: "center",
          popupWidth: "600px",
          popupHeight: "auto",
          borderRadius: "10px",
          contentAlign: "center",
          contentVerticalAlign: "center",
          preheaderText: "",
          backgroundImage: {
            url: "",
            fullWidth: true,
            repeat: "no-repeat",
            size: "custom",
            position: "center",
          },
          popupBackgroundColor: "#FFFFFF",
          popupOverlay_backgroundColor: "rgba(0, 0, 0, 0.1)",
          popupCloseButton_position: "top-right",
          popupCloseButton_backgroundColor: "#DDDDDD",
          popupCloseButton_iconColor: "#000000",
          popupCloseButton_borderRadius: "0px",
          popupCloseButton_margin: "0px",
          popupCloseButton_action: {
            name: "close_popup",
            values: {},
          },
        },
      },
      schemaVersion: 16,
    },
  },
  {
    id: "healthcare-template",
    name: "Healthcare Promotion",
    category: "engagement" as const,
    thumbnail: "/images/templates/healthcare-template.png",
    description: "Professional healthcare services and wellness promotion",
    content: `
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td align="center" style="padding: 0; background-color: #f8f9fa;">
            <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: white;">
              <!-- Header Image -->
              <tr>
                <td align="center" style="padding: 0;">
                  <img src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=200&q=80" alt="Healthcare Header" width="600" height="200" style="width: 100%; height: auto; display: block;" />
                </td>
              </tr>
              
              <!-- Title -->
              <tr>
                <td align="center" style="padding: 40px 20px 20px;">
                  <h1 style="margin: 0; font-family: arial,helvetica,sans-serif; font-size: 32px; font-weight: bold; color: #2c5aa0; text-align: center;">
                    Your Health, Our Priority
                  </h1>
                </td>
              </tr>
              
              <!-- Two Column Content -->
              <tr>
                <td style="padding: 0 20px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <!-- Left Column - Text Content -->
                      <td width="60%" style="vertical-align: top; padding: 20px;">
                        <h2 style="margin: 0 0 20px 0; font-family: arial,helvetica,sans-serif; font-size: 24px; font-weight: bold; color: #333333;">
                          Comprehensive Care for You & Your Family
                        </h2>
                        <p style="margin: 0 0 15px 0; font-family: arial,helvetica,sans-serif; font-size: 16px; color: #666666; line-height: 1.6;">
                          Experience world-class healthcare services with our team of experienced professionals. From preventive care to specialized treatments, we're here to support your wellness journey.
                        </p>
                        <ul style="margin: 0; padding-left: 20px; font-family: arial,helvetica,sans-serif; font-size: 16px; color: #666666; line-height: 1.6;">
                          <li>24/7 Emergency Care</li>
                          <li>Specialized Medical Services</li>
                          <li>Preventive Health Screenings</li>
                          <li>Telemedicine Consultations</li>
                        </ul>
                      </td>
                      
                      <!-- Right Column - Doctor Image -->
                      <td width="40%" style="vertical-align: top; padding: 20px; text-align: center;">
                        <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80" alt="Healthcare Professional" width="200" height="150" style="width: 100%; max-width: 200px; height: auto; border-radius: 8px;" />
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- CTA Button -->
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <a href="#" style="display: inline-block; padding: 15px 30px; background-color: #333333; color: white; text-decoration: none; border-radius: 4px; font-family: arial,helvetica,sans-serif; font-size: 16px; font-weight: bold;">
                    Schedule Appointment
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
    design: {
      counters: {
        u_column: 3,
        u_row: 4,
        u_content_text: 6,
        u_content_heading: 4,
        u_content_image: 3,
        u_content_button: 2,
      },
      body: {
        id: "healthcare_template",
        rows: [
          {
            id: "row_header",
            cells: [1],
            columns: [
              {
                id: "column_header",
                contents: [
                  {
                    id: "header_image",
                    type: "image",
                    values: {
                      containerPadding: "0px",
                      src: {
                        url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=200&fit=crop",
                        width: 600,
                        height: 200,
                      },
                      textAlign: "center",
                      altText: "Healthcare Header",
                    },
                  },
                  {
                    id: "main_heading",
                    type: "heading",
                    values: {
                      containerPadding: "20px",
                      text: "Your Health, Our Priority",
                      color: "#2c5aa0",
                      textAlign: "center",
                      fontSize: "32px",
                      fontFamily: "arial,helvetica,sans-serif",
                      fontWeight: "bold",
                      lineHeight: "140%",
                    },
                  },
                ],
                values: {
                  backgroundColor: "#ffffff",
                  padding: "0px",
                },
              },
            ],
            values: {
              backgroundColor: "#f8f9fa",
              padding: "0px",
            },
          },
          {
            id: "row_content",
            cells: [1, 1],
            columns: [
              {
                id: "column_text",
                contents: [
                  {
                    id: "sub_heading",
                    type: "heading",
                    values: {
                      containerPadding: "20px 20px 10px 20px",
                      text: "Comprehensive Care for You & Your Family",
                      color: "#2c5aa0",
                      textAlign: "left",
                      fontSize: "24px",
                      fontFamily: "arial,helvetica,sans-serif",
                      fontWeight: "bold",
                      lineHeight: "130%",
                    },
                  },
                  {
                    id: "content_text",
                    type: "text",
                    values: {
                      containerPadding: "10px 20px",
                      text: "<p>Experience world-class healthcare services with our team of experienced professionals. From preventive care to specialized treatments, we're here to support your wellness journey.</p><ul><li>24/7 Emergency Care</li><li>Specialized Medical Services</li><li>Preventive Health Screenings</li><li>Telemedicine Consultations</li></ul>",
                      color: "#333333",
                      textAlign: "left",
                      fontSize: "16px",
                      fontFamily: "arial,helvetica,sans-serif",
                      lineHeight: "150%",
                    },
                  },
                  {
                    id: "cta_button",
                    type: "button",
                    values: {
                      containerPadding: "20px",
                      text: "Schedule Appointment",
                      color: "#ffffff",
                      backgroundColor: "#28a745",
                      textAlign: "center",
                      fontSize: "16px",
                      fontFamily: "arial,helvetica,sans-serif",
                      fontWeight: "bold",
                      borderRadius: "6px",
                      padding: "14px 30px",
                      href: {
                        name: "web",
                        values: {
                          href: "#",
                          target: "_blank",
                        },
                      },
                    },
                  },
                ],
                values: {
                  backgroundColor: "#ffffff",
                  padding: "0px",
                },
              },
              {
                id: "column_image",
                contents: [
                  {
                    id: "doctor_image",
                    type: "image",
                    values: {
                      containerPadding: "20px",
                      src: {
                        url: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=300&fit=crop",
                        width: 400,
                        height: 300,
                      },
                      textAlign: "center",
                      altText: "Healthcare Professional",
                    },
                  },
                ],
                values: {
                  backgroundColor: "#ffffff",
                  padding: "0px",
                },
              },
            ],
            values: {
              backgroundColor: "#ffffff",
              padding: "20px",
            },
          },
          {
            id: "row_services",
            cells: [1],
            columns: [
              {
                id: "column_services",
                contents: [
                  {
                    id: "services_heading",
                    type: "heading",
                    values: {
                      containerPadding: "20px 20px 10px 20px",
                      text: "Special Health Promotion",
                      color: "#ffffff",
                      textAlign: "center",
                      fontSize: "28px",
                      fontFamily: "arial,helvetica,sans-serif",
                      fontWeight: "bold",
                      lineHeight: "130%",
                    },
                  },
                  {
                    id: "promotion_text",
                    type: "text",
                    values: {
                      containerPadding: "10px 20px",
                      text: "<p style='text-align: center;'><strong>Limited Time Offer: 20% OFF</strong><br/>Annual Health Check-up Package<br/>Includes comprehensive screenings, lab tests, and consultation</p>",
                      color: "#ffffff",
                      textAlign: "center",
                      fontSize: "18px",
                      fontFamily: "arial,helvetica,sans-serif",
                      lineHeight: "140%",
                    },
                  },
                  {
                    id: "promo_button",
                    type: "button",
                    values: {
                      containerPadding: "20px",
                      text: "Claim Your Discount",
                      color: "#2c5aa0",
                      backgroundColor: "#ffffff",
                      textAlign: "center",
                      fontSize: "16px",
                      fontFamily: "arial,helvetica,sans-serif",
                      fontWeight: "bold",
                      borderRadius: "6px",
                      padding: "14px 30px",
                      href: {
                        name: "web",
                        values: {
                          href: "#",
                          target: "_blank",
                        },
                      },
                    },
                  },
                ],
                values: {
                  backgroundColor: "#2c5aa0",
                  padding: "0px",
                },
              },
            ],
            values: {
              backgroundColor: "#2c5aa0",
              padding: "20px",
            },
          },
        ],
        headers: [],
        footers: [],
        values: {
          contentWidth: 600,
          fontFamily: {
            label: "Arial",
            value: "arial,helvetica,sans-serif",
          },
          textColor: "#333333",
          backgroundColor: "#f8f9fa",
          linkStyle: {
            linkColor: "#2c5aa0",
            linkHoverColor: "#1e3a5f",
            linkUnderline: true,
            linkHoverUnderline: true,
          },
          popupPosition: "center",
          popupWidth: "600px",
          popupHeight: "auto",
          borderRadius: "10px",
          contentAlign: "center",
          contentVerticalAlign: "center",
          preheaderText: "",
          backgroundImage: {
            url: "",
            fullWidth: true,
            repeat: "no-repeat",
            size: "custom",
            position: "center",
          },
          popupBackgroundColor: "#FFFFFF",
          popupOverlay_backgroundColor: "rgba(0, 0, 0, 0.1)",
          popupCloseButton_position: "top-right",
          popupCloseButton_backgroundColor: "#DDDDDD",
          popupCloseButton_iconColor: "#000000",
          popupCloseButton_borderRadius: "0px",
          popupCloseButton_margin: "0px",
          popupCloseButton_action: {
            name: "close_popup",
            values: {},
          },
        },
      },
      schemaVersion: 16,
    },
  },
];

export const getTemplateById = (id: string) => {
  return emailTemplates.find((template) => template.id === id);
};

export const getTemplatesByCategory = (category: string) => {
  return emailTemplates.filter((template) => template.category === category);
};
