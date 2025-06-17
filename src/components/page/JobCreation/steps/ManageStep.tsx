import React from 'react';
import { ManageStepProps } from '../../../../services/types/jobCreationSteps';
import { useQuestionManager } from './useQuestionManager';
import { useDocumentManager } from './useDocumentManager';
import QuestionCard from './QuestionCard';
import QuestionDrawer from './QuestionDrawer';
import DocumentCard from './DocumentCard';
import DocumentDrawer from './DocumentDrawer';

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

  const {
    documents,
    isDrawerOpen: isDocumentDrawerOpen,
    isDrawerVisible: isDocumentDrawerVisible,
    editingDocument,
    documentForm,
    openDocumentEditor,
    closeDocumentEditor,
    saveDocument,
    deleteDocument,
    updateDocumentForm
  } = useDocumentManager(formData.documents);

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

  const initDocumentSave = () => {
    const updatedDocuments = saveDocument();
    onUpdateField('documents', updatedDocuments);
  };

  const initDocumentDelete = (documentId: string) => {
    const updatedDocuments = deleteDocument(documentId);
    onUpdateField('documents', updatedDocuments);
  };  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Manage questions for candidates
            </h2>          
            {isLoadingCommonQuestions && (
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

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Manage Onboarding Documents for Candidates
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Add documents that candidates will need to upload during the onboarding process.
            </p>
          </div>
          <button
            onClick={() => openDocumentEditor()}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Document
          </button>
        </div>
        
        <div className="space-y-4">
          {documents && documents.length > 0 ? (
            documents.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onEdit={() => openDocumentEditor(document)}
                onDelete={() => initDocumentDelete(document.id)}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No onboarding documents added yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Add documents that candidates will need to upload during onboarding.
              </p>
              <button
                onClick={() => openDocumentEditor()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Your First Document
              </button>
            </div>
          )}
        </div>

        <DocumentDrawer
          isOpen={isDocumentDrawerOpen}
          isVisible={isDocumentDrawerVisible}
          editingDocument={editingDocument}
          documentForm={documentForm}
          onClose={closeDocumentEditor}
          onSave={initDocumentSave}
          onUpdateForm={updateDocumentForm}
        />
      </div>
    </div>
  );
};

export default ManageStep;
