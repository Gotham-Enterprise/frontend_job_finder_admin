"use client";
import React, { useState, useEffect } from "react";
import { unlayerApi } from "@/services/api/unlayer";

interface NewsletterThumbnailWrapperProps {
  content: string;
  design?: any;
  subject: string;
  children: (htmlContent: string, isLoading: boolean) => React.ReactNode;
}

/**
 * Wrapper component that handles HTML generation from design JSON
 * If content is empty but design exists, it generates HTML from the design
 */
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
      // If we already have content, use it
      if (content && content.trim().length > 0) {
        setHtmlContent(content);
        console.log(`✅ Using existing content for "${subject}"`);
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
            console.log(`✅ Generated HTML for "${subject}" (${result.html.length} chars)`);
          } else {
            console.warn(`⚠️ No HTML returned for "${subject}"`);
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
