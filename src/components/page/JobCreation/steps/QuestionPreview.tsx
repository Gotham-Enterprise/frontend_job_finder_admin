import React from 'react';
import { JobCreationQuestion } from '../../../../services/types/jobCreationSteps';

interface QuestionPreviewProps {
  question: JobCreationQuestion;
}

const QuestionPreview: React.FC<QuestionPreviewProps> = ({ question }) => {
  if (question.type === 'choice' && question.options) {
    const isMultiple = question.allowMultiple || question.subtype === 'multiple';
    
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Options:</p>
        <div className="space-y-2">
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-3">
              {isMultiple ? (
                <div className="w-4 h-4 border-2 border-gray-400 dark:border-gray-500 rounded"></div>
              ) : (
                <div className="w-4 h-4 border-2 border-gray-400 dark:border-gray-500 rounded-full"></div>
              )}
              <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
            </div>
          ))}
        </div>
        {isMultiple && (
          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Multiple answers allowed
            </p>
          </div>
        )}
      </div>
    );
  }

  if (question.type === 'text') {
    const isTextarea = question.subtype === 'textarea';
    const isNumber = question.subtype === 'number';
    const isCurrency = question.subtype === 'currency';
    
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
        {isTextarea ? (
          <textarea
            placeholder="Candidate will type their answer here..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none"
            rows={3}
            disabled
          />
        ) : (
          <input
            type={isNumber || isCurrency ? 'number' : 'text'}
            placeholder={
              isCurrency ? 'Enter salary amount...' :
              isNumber ? 'Enter number...' :
              'Candidate will type their answer here...'
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
            disabled
          />
        )}
        {(isNumber || isCurrency) && (
          <div className="mt-2">
            <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {isCurrency ? 'Currency/Salary input' : 'Numeric input only'}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (question.type === 'date') {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
        <div className="relative inline-block">
          <input
            type="date"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            defaultValue="2025-06-16"
            disabled
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Candidate will see a date picker</p>
      </div>
    );
  }

  if (question.type === 'file') {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center bg-gray-50 dark:bg-gray-800">
          <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Upload PDF file</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Click to browse or drag and drop</p>
        </div>
      </div>
    );  }

  if (question.type === 'rating') {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className="w-6 h-6 text-gray-300 dark:text-gray-600 hover:text-yellow-400 cursor-pointer transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          ))}
        </div>
        <div className="mt-2">
          <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Rate from 1 to 5 stars
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default QuestionPreview;
