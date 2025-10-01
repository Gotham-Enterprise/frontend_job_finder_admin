import React from "react";
import { useNewsletter } from "../NewsletterContext";

const EditStep: React.FC = () => {
  const { state } = useNewsletter();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Newsletter Editor</h2>
          <p className="text-gray-600 mb-8">Edit and customize your newsletter content. This feature is coming soon.</p>

          {/* Preview of selected template */}
          {state.selectedTemplateId && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Template Preview</h3>
              <div className="bg-white rounded border p-4 max-h-96 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: state.newsletterData.content }} />
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-yellow-800 font-medium">Coming Soon</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              The newsletter editor is currently under development. This will include a drag-and-drop editor, rich text
              editing, image uploads, and more customization options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditStep;
