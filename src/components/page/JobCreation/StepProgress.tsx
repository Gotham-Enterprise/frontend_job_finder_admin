import React from 'react';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepProgressProps {
  currentStep: number;
  steps: Step[];
}

const StepProgress: React.FC<StepProgressProps> = ({ currentStep, steps }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  currentStep > step.id
                    ? 'bg-green-500 border-green-500 text-white'
                    : currentStep === step.id
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                }`}
              >
                {currentStep > step.id ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id 
                    ? 'text-gray-900 dark:text-white' 
                    : 'text-gray-400'
                }`}>
                  {step.title}
                </p>
                <p className={`text-xs ${
                  currentStep >= step.id 
                    ? 'text-gray-600 dark:text-gray-400' 
                    : 'text-gray-400'
                }`}>
                  {step.description}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4">
                <div className={`h-0.5 ${
                  currentStep > step.id + 1 
                    ? 'bg-green-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepProgress;
