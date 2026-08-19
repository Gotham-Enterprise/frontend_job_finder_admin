"use client";

import React from "react";

interface NewsletterSubscribersHeaderProps {
  total: number;
}

const NewsletterSubscribersHeader: React.FC<NewsletterSubscribersHeaderProps> = ({
  total,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Job Seeker Newsletter
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {total} subscriber{total !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
};

export default NewsletterSubscribersHeader;
