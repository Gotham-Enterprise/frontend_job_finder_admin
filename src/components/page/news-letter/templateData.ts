import { NewsletterTemplate } from "./types";

export const newsletterTemplates: NewsletterTemplate[] = [
  {
    id: "start-from-scratch",
    name: "Start from scratch",
    category: "newsletter",
    thumbnail: "/images/templates/blank-template.svg",
    description: "Build your newsletter from a blank canvas with complete creative control.",
    content: "",
    isCustom: true,
  },
  {
    id: "company-newsletter",
    name: "Company Newsletter",
    category: "newsletter",
    thumbnail: "/images/templates/company-newsletter.jpg",
    description: "Professional newsletter template for company updates and announcements.",
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <title>Company Newsletter</title>
</head>
<body style='margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;'>
  <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color:#f4f4f4; padding:20px;'>
    <tr>
      <td align='center'>
        <table width='600' border='0' cellspacing='0' cellpadding='0' style='background:#ffffff; border-radius:8px; overflow:hidden;'>
          <tr>
            <td style='background:#007bff; padding:20px; text-align:center;'>
              <img src='https://gotham-job-finder-app-bucket.s3.us-east-2.amazonaws.com/blog-media/8a1bd5da-2343-4524-b006-2c4ac9b0259a-514373869_122154613046590299_4659870919253531256_n.jpg' alt='Company Logo' style='display:block; margin:0 auto; max-width:150px;'>
            </td>
          </tr>
          <tr>
            <td style='padding:30px; text-align:left; color:#333;'>
              <h1 style='color:#007bff; font-size:24px; margin:0 0 15px;'>Company Newsletter</h1>
              <p style='font-size:16px; line-height:1.5;'>Stay updated with the latest news and updates from our company.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    id: "job-opportunities",
    name: "Job Opportunities",
    category: "newsletter",
    thumbnail: "/images/templates/job-opportunities.jpg",
    description: "Perfect for sharing weekly job listings and career opportunities.",
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <title>Weekly Job Opportunities</title>
</head>
<body style='margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f8f9fa;'>
  <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color:#f8f9fa; padding:20px;'>
    <tr>
      <td align='center'>
        <table width='600' border='0' cellspacing='0' cellpadding='0' style='background:#ffffff; border-radius:8px; overflow:hidden;'>
          <tr>
            <td style='background:#28a745; padding:20px; text-align:center;'>
              <h1 style='color:#ffffff; font-size:28px; margin:0;'>Weekly Job Opportunities</h1>
            </td>
          </tr>
          <tr>
            <td style='padding:30px; text-align:left; color:#333;'>
              <h2 style='color:#28a745; font-size:20px; margin:0 0 15px;'>Latest Job Openings</h2>
              <p style='font-size:16px; line-height:1.5;'>Discover exciting career opportunities tailored for you.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    id: "welcome-email",
    name: "Welcome Email",
    category: "welcome",
    thumbnail: "/images/templates/welcome-email.jpg",
    description: "Warm welcome message for new users and subscribers.",
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <title>Welcome!</title>
</head>
<body style='margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;'>
  <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color:#f4f4f4; padding:20px;'>
    <tr>
      <td align='center'>
        <table width='600' border='0' cellspacing='0' cellpadding='0' style='background:#ffffff; border-radius:8px; overflow:hidden;'>
          <tr>
            <td style='background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding:40px; text-align:center;'>
              <h1 style='color:#ffffff; font-size:32px; margin:0;'>Welcome!</h1>
              <p style='color:#ffffff; font-size:18px; margin:10px 0 0;'>We're excited to have you join us</p>
            </td>
          </tr>
          <tr>
            <td style='padding:40px; text-align:center; color:#333;'>
              <p style='font-size:16px; line-height:1.5;'>Thank you for joining our community. We're here to help you succeed!</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    id: "event-invitation",
    name: "Event Invitation",
    category: "event",
    thumbnail: "/images/templates/event-invitation.jpg",
    description: "Professional event invitation template for corporate events.",
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <title>Event Invitation</title>
</head>
<body style='margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;'>
  <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color:#f4f4f4; padding:20px;'>
    <tr>
      <td align='center'>
        <table width='600' border='0' cellspacing='0' cellpadding='0' style='background:#ffffff; border-radius:8px; overflow:hidden;'>
          <tr>
            <td style='background:#ff6b35; padding:30px; text-align:center;'>
              <h1 style='color:#ffffff; font-size:28px; margin:0;'>You're Invited!</h1>
            </td>
          </tr>
          <tr>
            <td style='padding:30px; text-align:center; color:#333;'>
              <h2 style='color:#ff6b35; font-size:22px; margin:0 0 15px;'>Join us for an exclusive event</h2>
              <p style='font-size:16px; line-height:1.5;'>We would love to have you attend our upcoming event.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    id: "product-announcement",
    name: "Product Announcement",
    category: "product",
    thumbnail: "/images/templates/product-announcement.jpg",
    description: "Showcase new products and features to your audience.",
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <title>New Product Launch</title>
</head>
<body style='margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;'>
  <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color:#f4f4f4; padding:20px;'>
    <tr>
      <td align='center'>
        <table width='600' border='0' cellspacing='0' cellpadding='0' style='background:#ffffff; border-radius:8px; overflow:hidden;'>
          <tr>
            <td style='background:#17a2b8; padding:30px; text-align:center;'>
              <h1 style='color:#ffffff; font-size:28px; margin:0;'>New Product Launch</h1>
            </td>
          </tr>
          <tr>
            <td style='padding:30px; text-align:center; color:#333;'>
              <h2 style='color:#17a2b8; font-size:22px; margin:0 0 15px;'>Introducing our latest innovation</h2>
              <p style='font-size:16px; line-height:1.5;'>Discover what makes our new product special.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    id: "ecommerce-reengagement",
    name: "Ecommerce Re-Engagement",
    category: "ecommerce",
    thumbnail: "/images/templates/ecommerce-reengagement.jpg",
    description: "Re-engage customers with special offers and product highlights.",
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <title>Special Offer</title>
</head>
<body style='margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;'>
  <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color:#f4f4f4; padding:20px;'>
    <tr>
      <td align='center'>
        <table width='600' border='0' cellspacing='0' cellpadding='0' style='background:#ffffff; border-radius:8px; overflow:hidden;'>
          <tr>
            <td style='background:#e74c3c; padding:30px; text-align:center;'>
              <h1 style='color:#ffffff; font-size:28px; margin:0;'>Special Offer!</h1>
              <p style='color:#ffffff; font-size:18px; margin:10px 0 0;'>Limited time only</p>
            </td>
          </tr>
          <tr>
            <td style='padding:30px; text-align:center; color:#333;'>
              <h2 style='color:#e74c3c; font-size:22px; margin:0 0 15px;'>We miss you!</h2>
              <p style='font-size:16px; line-height:1.5;'>Come back and enjoy exclusive discounts on your favorite items.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
];

export const templateCategories = [
  { id: "all", name: "All Templates", count: newsletterTemplates.length },
  {
    id: "newsletter",
    name: "Newsletter",
    count: newsletterTemplates.filter((t) => t.category === "newsletter").length,
  },
  { id: "welcome", name: "Welcome", count: newsletterTemplates.filter((t) => t.category === "welcome").length },
  { id: "event", name: "Event", count: newsletterTemplates.filter((t) => t.category === "event").length },
  { id: "product", name: "Product", count: newsletterTemplates.filter((t) => t.category === "product").length },
  { id: "ecommerce", name: "Ecommerce", count: newsletterTemplates.filter((t) => t.category === "ecommerce").length },
  {
    id: "engagement",
    name: "Engagement",
    count: newsletterTemplates.filter((t) => t.category === "engagement").length,
  },
];
