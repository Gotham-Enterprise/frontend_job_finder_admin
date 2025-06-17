import React from 'react';
import Label from '@/components/form/Label';
import Checkbox from '@/components/form/input/Checkbox';
import { JobCreationQuestion, QuestionFormData } from '../../../../services/types/jobCreationSteps';

interface QuestionDrawerProps {
  isOpen: boolean;
  isVisible: boolean;
  editingQuestion: JobCreationQuestion | null;
  questionForm: QuestionFormData;
  onClose: () => void;
  onSave: () => void;
  onUpdateForm: (updates: Partial<QuestionFormData>) => void;
  onAddOption: () => void;
  onUpdateOption: (index: number, value: string) => void;
  onRemoveOption: (index: number) => void;
}

const QuestionDrawer: React.FC<QuestionDrawerProps> = ({
  isOpen,
  isVisible,
  editingQuestion,
  questionForm,
  onClose,
  onSave,
  onUpdateForm,
  onAddOption,
  onUpdateOption,
  onRemoveOption
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      ></div>
      
      {/* Drawer Panel */}
      <div className={`absolute right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl transform transition-all duration-300 ease-out ${
        isVisible 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
      }`}>
        <div className="flex flex-col h-full shadow-[-20px_0_25px_-5px_rgba(0,0,0,0.1)] dark:shadow-[-20px_0_25px_-5px_rgba(0,0,0,0.3)]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {editingQuestion ? 'Modify existing question settings' : 'Create a new question for candidates'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Form Content */}
          <div className="flex-1 mt-5 px-6 py-6 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50">
            <div className="space-y-8">              {/* Question Type */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Question Type</Label>
                <div className="relative">                  <select
                    value={questionForm.type}
                    onChange={(e) => onUpdateForm({ type: e.target.value as 'choice' | 'text' | 'date' | 'file' | 'rating' })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer shadow-sm"
                  >
                    <option value="choice">Multiple Choice</option>
                    <option value="text">Text Input</option>
                    <option value="date">Date Picker</option>
                    <option value="file">File Upload</option>
                    <option value="rating">Rating (1-5 Stars)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Subtype Selection for Choice */}
              {questionForm.type === 'choice' && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Answer Format</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        !questionForm.allowMultiple 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                      }`}
                      onClick={() => onUpdateForm({ allowMultiple: false })}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 border-2 border-gray-400 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Single Choice</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Select one option</p>
                        </div>
                      </div>
                    </div>
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        questionForm.allowMultiple 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                      }`}
                      onClick={() => onUpdateForm({ allowMultiple: true })}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Multiple Choice</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Select multiple options</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}              {/* Subtype Selection for Text */}
              {questionForm.type === 'text' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Input Format</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div 
                        className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                          !questionForm.allowMultiple 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                        }`}
                        onClick={() => onUpdateForm({ allowMultiple: false })}
                      >
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Short Answer</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Single line input</p>
                        </div>
                      </div>
                      <div 
                        className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                          questionForm.allowMultiple 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                        }`}
                        onClick={() => onUpdateForm({ allowMultiple: true })}
                      >
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Long Answer</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Multi-line textarea</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Type Selection for Short Answer */}
                  {!questionForm.allowMultiple && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Input Type</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div 
                          className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                            (questionForm.subtypeValue === 1 || !questionForm.subtypeValue)
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                              : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                          }`}
                          onClick={() => onUpdateForm({ subtypeValue: 1 })}
                        >
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Plain Text</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Any text input</p>
                          </div>
                        </div>
                        <div 
                          className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                            questionForm.subtypeValue === 2
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                              : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                          }`}
                          onClick={() => onUpdateForm({ subtypeValue: 2 })}
                        >
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Email validation</p>
                          </div>
                        </div>
                        <div 
                          className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                            questionForm.subtypeValue === 3
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                              : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                          }`}
                          onClick={() => onUpdateForm({ subtypeValue: 3 })}
                        >
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">URL</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Website link</p>
                          </div>
                        </div>
                        <div 
                          className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                            questionForm.subtypeValue === 4
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                              : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                          }`}
                          onClick={() => onUpdateForm({ subtypeValue: 4 })}
                        >
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Phone Number</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Phone validation</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Question Text */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Question Text</Label>
                <textarea
                  value={questionForm.question}
                  onChange={(e) => onUpdateForm({ question: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none shadow-sm"
                  placeholder="Enter your question here..."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This question will be displayed to candidates during the application process.
                </p>
              </div>
              
              {/* Options for Choice type */}
              {questionForm.type === 'choice' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Answer Options</Label>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {questionForm.options.filter(opt => opt.trim() !== '').length} options
                    </span>
                  </div>
                  <div className="space-y-3">
                    {questionForm.options.map((option, index) => (
                      <div key={index} className="group relative">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                            {index + 1}
                          </div>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => onUpdateOption(index, e.target.value)}
                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                            placeholder={`Option ${index + 1}`}
                          />
                          <button
                            onClick={() => onRemoveOption(index)}
                            disabled={questionForm.options.length === 1}
                            className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                            title="Remove option"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={onAddOption}
                      className="w-full py-3 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200 flex items-center justify-center gap-2 group"
                    >
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Option
                    </button>
                  </div>
                </div>
              )}
              
              {/* Settings */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Settings</Label>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center pt-0.5">
                        <Checkbox
                          checked={questionForm.required}
                          onChange={(checked) => onUpdateForm({ required: checked })}
                        />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Required Question</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Candidates must answer this question</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {questionForm.required && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                          Required
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {questionForm.type === 'choice' && (
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-start space-x-3">
                        <div className="flex items-center pt-0.5">
                          <Checkbox
                            checked={questionForm.allowMultiple}
                            onChange={(checked) => onUpdateForm({ allowMultiple: checked })}
                          />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Multiple Selection</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Allow candidates to select multiple options</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {questionForm.allowMultiple && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            Multi-select
                          </span>                        )}
                      </div>
                    </div>
                  )}

                  {/* Active Setting */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center pt-0.5">                        <Checkbox
                          checked={questionForm.isActive}
                          onChange={(checked) => onUpdateForm({ isActive: checked })}
                        />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Active Question</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Question is enabled and visible to candidates</p>
                      </div>
                    </div>                    <div className="flex-shrink-0">
                      {!!questionForm.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Default Setting */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center pt-0.5">                        
                        <Checkbox
                          checked={questionForm.isDefault}
                          onChange={(checked) => onUpdateForm({ isDefault: checked })}
                        />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Default Question</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Question appears in all job postings by default</p>
                      </div>
                    </div>                    <div className="flex-shrink-0">
                      {!!questionForm.isDefault && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={!questionForm.question.trim()}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:shadow-none flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {editingQuestion ? 'Update Question' : 'Save Question'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDrawer;
