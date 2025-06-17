export interface Question {
  id: string;
  question: string;
  type: 'choice' | 'text' | 'date' | 'file';
  subtype?: 'single' | 'multiple' | 'textarea' | 'number' | 'currency';
  required: boolean;
  allowMultiple?: boolean;
  options?: string[];
  isDefault?: boolean;
  isActive: boolean;
  originalId?: number;
  questionTypeId?: number;
  questionSubTypeId?: number;
  questionSubTypeValueId?: number | null;
}

export interface FormData {
  postingDate: string;
  autoRenew: boolean;
  questions?: Question[];
}

export interface ManageStepProps {
  formData: FormData;
  onUpdateField: (field: keyof FormData, value: any) => void;
}

export interface QuestionFormData {
  question: string;
  type: 'choice' | 'text' | 'date' | 'file';
  required: boolean;
  allowMultiple: boolean;
  options: string[];
}

export const mapApiQuestionToQuestion = (apiQuestion: any): Question => {
  const typeMapping: Record<number, 'choice' | 'text' | 'date' | 'file'> = {
    1: 'choice',
    2: 'text',
    3: 'date',
    4: 'file'
  };
  const subtypeMapping: Record<number, 'single' | 'multiple' | 'textarea' | 'number' | 'currency'> = {
    1: 'single',      // Single choice
    2: 'single',      // Single choice (Yes/No)
    3: 'number',      // Text input (numbers, currency)
    4: 'textarea',    // Long text
    5: 'single',      // Date picker (use single for consistency)
    6: 'multiple',    // Multiple choice
    7: 'single'       // File upload (use single for consistency)
  };

  const type = typeMapping[apiQuestion.questionTypeId] || 'text';
  const subtype = subtypeMapping[apiQuestion.questionSubTypeId];
  
  const allowMultiple = apiQuestion.questionSubTypeId === 6;

  return {
    id: `api-${apiQuestion.id}`,
    question: apiQuestion.questionText,
    type,
    subtype,
    required: apiQuestion.required,
    allowMultiple,
    options: apiQuestion.options || [],
    isDefault: apiQuestion.isDefault,
    isActive: apiQuestion.isActive,
    originalId: apiQuestion.id,
    questionTypeId: apiQuestion.questionTypeId,
    questionSubTypeId: apiQuestion.questionSubTypeId,
    questionSubTypeValueId: apiQuestion.questionSubTypeValueId
  };
};
