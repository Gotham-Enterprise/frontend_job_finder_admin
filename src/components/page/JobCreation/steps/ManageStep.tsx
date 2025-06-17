import React from 'react';
import { ManageStepProps } from '../../../../services/types/jobCreationSteps';
import { useQuestionManager } from './useQuestionManager';
import QuestionCard from './QuestionCard';
import QuestionDrawer from './QuestionDrawer';

const ManageStep: React.FC<ManageStepProps> = ({
  formData,
  onUpdateField
}) => {
  const {
    questions,
    isDrawerOpen,
    isDrawerVisible,
    editingQuestion,
    questionForm,
    isLoadingCommonQuestions,
    commonQuestionsError,
    questionToggle,
    openQuestionEditor,
    closeQuestionEditor,
    saveQuestion,
    deleteQuestion,
    updateQuestionForm,
    addOption,
    updateOption,
    removeOption
  } = useQuestionManager(formData.questions);

  const initToggle = (questionId: string) => {
    const updatedQuestions = questionToggle(questionId);
    onUpdateField('questions', updatedQuestions);
  };

  const initSave = () => {
    const updatedQuestions = saveQuestion();
    onUpdateField('questions', updatedQuestions);
  };

  const initDelete = (questionId: string) => {
    const updatedQuestions = deleteQuestion(questionId);
    onUpdateField('questions', updatedQuestions);
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Manage questions for candidates
          </h2>          {isLoadingCommonQuestions && (
            <p className="text-sm text-blue-600 mt-1">Loading default questions...</p>
          )}
          {commonQuestionsError && (
            <p className="text-sm text-amber-600 mt-1">Using fallback questions (API not available)</p>
          )}
        </div>
        <button
          onClick={() => openQuestionEditor()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Question
        </button>
      </div>
      
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Select from the suggested questions or add custom questions:
        </p>
        
        {isLoadingCommonQuestions ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onToggle={() => initToggle(question.id)}
              onEdit={() => openQuestionEditor(question)}
              onDelete={() => initDelete(question.id)}
            />
          ))
        )}
      </div>

      <QuestionDrawer
        isOpen={isDrawerOpen}
        isVisible={isDrawerVisible}
        editingQuestion={editingQuestion}
        questionForm={questionForm}
        onClose={closeQuestionEditor}
        onSave={initSave}
        onUpdateForm={updateQuestionForm}
        onAddOption={addOption}
        onUpdateOption={updateOption}
        onRemoveOption={removeOption}
      />
    </div>
  );
};

export default ManageStep;
