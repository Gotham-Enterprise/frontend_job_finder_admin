import React from 'react';
import Checkbox from '@/components/form/input/Checkbox';
import { JobCreationQuestion } from '../../../../services/types/jobCreationSteps';
import QuestionPreview from './QuestionPreview';

interface QuestionCardProps {
  question: JobCreationQuestion;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isEditMode?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onToggle,
  onEdit,
  onDelete,
  isEditMode = false
}) => {
  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex items-center pt-0.5">
            <Checkbox
              checked={question.isActive}
              onChange={onToggle}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {question.question}
              </span>
              {question.required && (
                <span className="text-red-500">*</span>
              )}
              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                {question.type}
              </span>
            </div>
            
            {question.isActive && (
              <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <QuestionPreview question={question} />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onEdit}
            disabled={isEditMode}
            className={`p-2 rounded-lg transition-colors ${
              isEditMode 
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                : 'text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
            title={isEditMode ? "Editing disabled in edit mode" : "Edit question"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          {!question.isDefault && (
            <button
              onClick={onDelete}
              disabled={isEditMode}
              className={`p-2 rounded-lg transition-colors ${
                isEditMode 
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                  : 'text-gray-400 hover:text-red-600 dark:hover:text-red-400'
              }`}
              title={isEditMode ? "Deleting disabled in edit mode" : "Delete question"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
