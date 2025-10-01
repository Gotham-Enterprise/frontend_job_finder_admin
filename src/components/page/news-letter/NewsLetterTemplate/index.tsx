import React from "react";
import { NewsletterData } from "../types";

// This represents a sample newsletter data structure
const sampleNewsletterData: NewsletterData = {
  subject: "Newsletter – Exciting Updates!",
  fromName: "MyApp Team",
  fromAddress: "newsletter@myapp.com",
  sendTo: ["employer", "jobseeker", "subscriber1@example.com", "subscriber2@example.com"],
  dontSendTo: [],
  status: "SCHEDULED",
  scheduledAt: "2025-09-26T20:07:00Z",
  scheduledTimezone: "Asia/Manila",
  isTemplate: true,
  content: `<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <title>September Newsletter</title>
</head>
<body style='margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;'>
  <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color:#f4f4f4; padding:20px;'>
    <tr>
      <td align='center'>
        <table width='600' border='0' cellspacing='0' cellpadding='0' style='background:#ffffff; border-radius:8px; overflow:hidden;'>
          <tr>
            <td style='background:#007bff; padding:20px; text-align:center;'>
              <img src='https://gotham-job-finder-app-bucket.s3.us-east-2.amazonaws.com/blog-media/8a1bd5da-2343-4524-b006-2c4ac9b0259a-514373869_122154613046590299_4659870919253531256_n.jpg' alt='MyApp Logo' style='display:block; margin:0 auto; max-width:150px;'>
            </td>
          </tr>
          <tr>
            <td>
              <img src='https://gotham-job-finder-app-bucket.s3.us-east-2.amazonaws.com/blog-media/5be7c0d6-ad79-438f-b907-940bfe477821-Grey Colorful Cartoon Illustration School Book Name Label - 13.jpeg' alt='Newsletter Banner' style='width:100%; display:block;'>
            </td>
          </tr>
          <tr>
            <td style='padding:30px; text-align:left; color:#333;'>
              <h1 style='color:#007bff; font-size:24px; margin:0 0 15px;'>Welcome to Our September Newsletter!</h1>
              <p style='font-size:16px; line-height:1.5;'>We're excited to share the latest updates, new features, and special offers with you. Thank you for being part of our community!</p>
              <p style='font-size:16px; line-height:1.5;'>This month, we've launched a new dashboard, improved performance, and added more integrations you've been asking for.</p>
              <p style='text-align:center; margin:30px 0;'>
                <a href='https://myapp.com' style='background:#007bff; color:#ffffff; padding:12px 24px; border-radius:4px; text-decoration:none; font-weight:bold;'>Explore Updates</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style='padding:20px; text-align:center;'>
              <h2 style='color:#007bff; font-size:20px; margin-bottom:20px;'>What's New This Month?</h2>
              <table width='100%' cellpadding='10'>
                <tr>
                  <td width='33%' style='text-align:center;'>
                    <img src='https://gotham-job-finder-app-bucket.s3.us-east-2.amazonaws.com/blog-media/8a1bd5da-2343-4524-b006-2c4ac9b0259a-514373869_122154613046590299_4659870919253531256_n.jpg' alt='Dashboard' style='border-radius:50%; width:80px; height:80px;'>
                    <p style='font-size:14px; color:#333; margin-top:10px;'><strong>New Dashboard</strong><br>Cleaner, faster, and easier to use.</p>
                  </td>
                  <td width='33%' style='text-align:center;'>
                    <img src='https://gotham-job-finder-app-bucket.s3.us-east-2.amazonaws.com/blog-media/7adf4ddf-dec3-4e8b-9655-aaad3b88d01d-zander.jpg' alt='Performance' style='border-radius:50%; width:80px; height:80px;'>
                    <p style='font-size:14px; color:#333; margin-top:10px;'><strong>Faster Performance</strong><br>Optimized for speed and reliability.</p>
                  </td>
                  <td width='33%' style='text-align:center;'>
                    <img src='https://gotham-job-finder-app-bucket.s3.us-east-2.amazonaws.com/blog-media/8a1bd5da-2343-4524-b006-2c4ac9b0259a-514373869_122154613046590299_4659870919253531256_n.jpg' alt='Integrations' style='border-radius:50%; width:80px; height:80px;'>
                    <p style='font-size:14px; color:#333; margin-top:10px;'><strong>More Integrations</strong><br>Seamless connections with your tools.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style='background:#f9f9f9; padding:30px; text-align:center; font-style:italic; color:#555;'>
              "This update has completely changed how I work with MyApp – it's faster, smarter, and easier than ever!" <br><br>
              <strong>- Alex J., Product Manager</strong>
            </td>
          </tr>
          <tr>
            <td style='padding:30px; text-align:center;'>
              <a href='https://myapp.com' style='background:#28a745; color:#ffffff; padding:14px 28px; border-radius:4px; text-decoration:none; font-weight:bold;'>Try the New Features</a>
            </td>
          </tr>
          <tr>
            <td style='padding:20px; text-align:center; font-size:14px; color:#777; background:#f4f4f4;'>
              <p>You are receiving this email because you subscribed to our newsletter.</p>
              <p>If you'd like to unsubscribe, <a href='https://myapp.com/unsubscribe' style='color:#007bff;'>click here</a>.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
};

interface NewsletterTemplateProps {
  data?: NewsletterData;
}

const NewsletterTemplate: React.FC<NewsletterTemplateProps> = ({ data = sampleNewsletterData }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Newsletter Preview */}
        <div className="border-b border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900">Newsletter Preview</h3>
          <p className="text-sm text-gray-600">Subject: {data.subject}</p>
          <p className="text-sm text-gray-600">
            From: {data.fromName} &lt;{data.fromAddress}&gt;
          </p>
        </div>

        <div className="p-4">
          <div className="border rounded-lg overflow-hidden" dangerouslySetInnerHTML={{ __html: data.content }} />
        </div>
      </div>
    </div>
  );
};

export default NewsletterTemplate;
