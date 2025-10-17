"use client";
import React, { useState, useEffect } from "react";
import { unlayerApi } from "@/services/api/unlayer";

interface NewsletterThumbnailWrapperProps {
  content: string;
  design?: any;
  subject: string;
  children: (htmlContent: string, isLoading: boolean) => React.ReactNode;
}

const NewsletterThumbnailWrapper: React.FC<NewsletterThumbnailWrapperProps> = ({
  content,
  design,
  subject,
  children,
}) => {
  const [htmlContent, setHtmlContent] = useState(content);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const generateHtml = async () => {
      if (content && content.trim().length > 0) {
        setHtmlContent(content);
        return;
      }

      // If no content but we have design, generate HTML
      if (design) {
        setIsLoading(true);
        console.log(`🔄 Generating HTML from design for "${subject}"...`);

        try {
          const result = await unlayerApi.exportHtml(design);
          if (result && result.html) {
            setHtmlContent(result.html);
          }
        } catch (error) {
          console.error(`❌ Failed to generate HTML for "${subject}":`, error);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.warn(`⚠️ No content or design available for "${subject}"`);
      }
    };

    generateHtml();
  }, [content, design, subject]);

  return <>{children(htmlContent, isLoading)}</>;
};

export default NewsletterThumbnailWrapper;
