import React from "react";
import { useNewsletter } from "../NewsletterContext";

const NewsletterSteps: React.FC = () => {
  const { state, goToStep } = useNewsletter();
  const { steps, currentStep } = state;

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="px-6 py-4">
        <nav className="flex space-x-8">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => goToStep(step.id)}
              className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                step.isActive
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : step.isCompleted
                    ? "text-green-600 hover:text-green-700"
                    : "text-gray-500 hover:text-gray-700"
              }`}
              disabled={!step.isCompleted && !step.isActive}
            >
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                  step.isActive
                    ? "bg-blue-600 text-white"
                    : step.isCompleted
                      ? "bg-green-600 text-white"
                      : "bg-gray-300 text-gray-600"
                }`}
              >
                {step.isCompleted ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <div className="text-left">
                <div className="font-medium">{step.title}</div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default NewsletterSteps;
