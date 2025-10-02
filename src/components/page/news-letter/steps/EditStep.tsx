import React, { useState } from "react";
import { useNewsletter } from "../NewsletterContext";
import NewsletterEditor from "../components/NewsletterEditor";

const EditStep: React.FC = () => {
  const { state } = useNewsletter();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Main Editor */}
      <div className="flex-1 flex overflow-hidden">
        <NewsletterEditor />
      </div>
    </div>
  );
};

export default EditStep;
