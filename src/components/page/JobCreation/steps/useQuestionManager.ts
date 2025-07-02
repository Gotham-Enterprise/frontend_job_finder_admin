import { useState, useEffect } from 'react';
import { JobCreationQuestion, QuestionFormData, mapApiQuestionToJobCreationQuestion } from '../../../../services/types/jobCreationSteps';
import { defaultQuestions } from './defaultQuestions';
import { useCommonQuestions } from '../../../../services/hooks/useJobQuestions';

export const useQuestionManager = (initialQuestions?: JobCreationQuestion[]) => {
  const { data: commonQuestionsData, isLoading: isLoadingCommonQuestions, error: commonQuestionsError } = useCommonQuestions();
    const [questions, setQuestions] = useState<JobCreationQuestion[]>(() => {
    return (initialQuestions && initialQuestions.length > 0) ? initialQuestions : [];
  });
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<JobCreationQuestion | null>(null);  const [questionForm, setQuestionForm] = useState<QuestionFormData>({
    question: '',
    type: 'choice',
    subtypeValue: 1, 
    required: false,
    allowMultiple: false,
    isActive: true,
    isDefault: false,
    options: ['']
  });  useEffect(() => {
    const hasInitialQuestions = initialQuestions && initialQuestions.length > 0;
    
    if (commonQuestionsData?.success && commonQuestionsData.data && !hasInitialQuestions) {
      const apiQuestions = commonQuestionsData.data.map(mapApiQuestionToJobCreationQuestion);
      setQuestions(apiQuestions);
    } else if (commonQuestionsError && !hasInitialQuestions) {
      setQuestions(defaultQuestions);
    } else if (hasInitialQuestions) {
      setQuestions(initialQuestions);
    }
  }, [commonQuestionsData, commonQuestionsError, initialQuestions]);

  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      setQuestions(initialQuestions);
    }
  }, [initialQuestions]);

  const questionToggle = (questionId: string) => {
    const updatedQuestions = questions.map(q =>
      q.id === questionId ? { ...q, isActive: !q.isActive } : q
    );
    setQuestions(updatedQuestions);
    return updatedQuestions;
  };  const openQuestionEditor = (question?: JobCreationQuestion) => {
    if (question) {
      setEditingQuestion(question);
      setQuestionForm({
        question: question.question,
        type: question.type,
        subtypeValue: question.questionSubTypeValueId || 1,
        required: question.required,
        allowMultiple: question.allowMultiple, 
        isActive: question.isActive,
        isDefault: question.isDefault, 
        options: question.options || ['']
      });
    } else {
      setEditingQuestion(null);
      setQuestionForm({
        question: '',
        type: 'choice',
        subtypeValue: 1,
        required: false,
        allowMultiple: false,
        isActive: true,
        isDefault: false,
        options: ['']
      });
    }
    setIsDrawerOpen(true);
    setTimeout(() => {
      setIsDrawerVisible(true);
    }, 10);
  };

  const closeQuestionEditor = () => {
    setIsDrawerVisible(false);
    setTimeout(() => {
      setIsDrawerOpen(false);
      setEditingQuestion(null);
    }, 300);
  };
  const saveQuestion = () => {
    let updatedQuestions;
    if (editingQuestion) {
      updatedQuestions = questions.map(q =>
        q.id === editingQuestion.id
          ? {
              ...q,
              question: questionForm.question,
              type: questionForm.type,
              required: questionForm.required,
              allowMultiple: questionForm.allowMultiple,
              isActive: questionForm.isActive,
              isDefault: questionForm.isDefault,
              options: questionForm.type === 'choice' ? questionForm.options.filter(opt => opt.trim() !== '') : undefined,
              questionSubTypeValueId: questionForm.type === 'text' && !questionForm.allowMultiple ? questionForm.subtypeValue : null
            }
          : q
      );
    } else {
      const newQuestion: JobCreationQuestion = {
        id: `custom-${Date.now()}`,
        question: questionForm.question,
        type: questionForm.type,
        required: questionForm.required,
        allowMultiple: questionForm.allowMultiple,
        isActive: questionForm.isActive,
        isDefault: questionForm.isDefault,
        options: questionForm.type === 'choice' ? questionForm.options.filter(opt => opt.trim() !== '') : undefined,
        questionSubTypeValueId: questionForm.type === 'text' && !questionForm.allowMultiple ? questionForm.subtypeValue : null
      };
      updatedQuestions = [...questions, newQuestion];
    }
    
    setQuestions(updatedQuestions);
    closeQuestionEditor();
    return updatedQuestions;
  };

  const deleteQuestion = (questionId: string) => {
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    setQuestions(updatedQuestions);
    return updatedQuestions;
  };

  const updateQuestionForm = (updates: Partial<QuestionFormData>) => {
    setQuestionForm(prev => ({ ...prev, ...updates }));
  };

  const addOption = () => {
    setQuestionForm(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const updateOption = (index: number, value: string) => {
    setQuestionForm(prev => {
      const newOptions = [...prev.options];
      newOptions[index] = value;
      return { ...prev, options: newOptions };
    });
  };

  const removeOption = (index: number) => {
    if (questionForm.options.length > 1) {
      setQuestionForm(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };
  return {
    questions,
    setQuestions,
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
  };
};
