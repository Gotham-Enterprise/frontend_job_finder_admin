import React, { useState } from "react";
import { useNewsletter } from "../NewsletterContext";
import NewsletterEditor from "../components/NewsletterEditor";

const EditStep: React.FC = () => {
  const { state } = useNewsletter();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
              Back
            </button>
            <div>
              <h1 className="text-lg font-medium text-gray-900">New email</h1>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">Autosaved</span>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              Preview and test
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700">
              Review and send
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <nav className="flex space-x-8 px-4">
          <button className="py-3 px-1 border-b-2 border-blue-500 text-sm font-medium text-blue-600">
            Edit
          </button>
          <button className="py-3 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700">
            Inbox
          </button>
          <button className="py-3 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700">
            Send to
          </button>
          <button className="py-3 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700">
            Schedule
          </button>
          <button className="py-3 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700">
            Setup
          </button>
          <button className="py-3 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700">
            Automate
          </button>
        </nav>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex overflow-hidden">
        <NewsletterEditor />
      </div>
    </div>
  );
};

export default EditStep;
