import { ApiJobQuestion, QuestionType, QuestionSubtype, mapQuestionTypeIdToType, mapSubtypeIdToSubtype } from './jobQuestions';


export interface JobCreationQuestion {
  id: string;
  question: string;
  type: QuestionType;
  subtype?: QuestionSubtype;
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

export interface JobCreationFormData {
  postingDate: string;
  autoRenew: boolean;
  questions?: JobCreationQuestion[];
}

export interface ManageStepProps {
  formData: JobCreationFormData;
  onUpdateField: (field: keyof JobCreationFormData, value: any) => void;
}

export interface QuestionFormData {
  question: string;
  type: QuestionType;
  subtype?: QuestionSubtype;
  subtypeValue?: number; // For questionSubTypeValueId
  required: boolean;
  allowMultiple: boolean;
  options: string[];
}

export const mapApiQuestionToJobCreationQuestion = (apiQuestion: ApiJobQuestion): JobCreationQuestion => {
  const type = mapQuestionTypeIdToType(apiQuestion.questionTypeId);
  const subtype = mapSubtypeIdToSubtype(apiQuestion.questionSubTypeId, apiQuestion.questionSubTypeValueId);
  
  const allowMultiple = apiQuestion.questionSubTypeId === 1; 
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
    // Keep original API fields for reference
    originalId: apiQuestion.id,
    questionTypeId: apiQuestion.questionTypeId,
    questionSubTypeId: apiQuestion.questionSubTypeId,
    questionSubTypeValueId: apiQuestion.questionSubTypeValueId
  };
};

// Utility function to map internal Question back to API format
export const mapJobCreationQuestionToApiPayload = (question: JobCreationQuestion) => {
  // Determine questionTypeId based on type
  let questionTypeId = 1; // Default to Choice
  let questionSubTypeId = 2; // Default to Single Answer
  let questionSubTypeValueId: number | null = null;

  switch (question.type) {
    case 'choice':
      questionTypeId = 1;
      questionSubTypeId = question.allowMultiple ? 1 : 2; // 1 = Multiple Answer, 2 = Single Answer
      break;
    case 'text':
      questionTypeId = 2;
      questionSubTypeId = question.allowMultiple ? 4 : 3; // 3 = Short Answer, 4 = Long Answer
      // For short answer, include the subtype value
      if (!question.allowMultiple) {
        questionSubTypeValueId = question.questionSubTypeValueId || 1; // Default to plain text
      }
      break;
    case 'date':
      questionTypeId = 3;
      questionSubTypeId = 5; // Date Picker
      break;
    case 'file':
      questionTypeId = 4;
      questionSubTypeId = 6; // Upload File
      break;
    case 'rating':
      questionTypeId = 5;
      questionSubTypeId = 7; // Rating
      questionSubTypeValueId = 5; // 1-5 rating
      break;
  }

  return {
    questionText: question.question,
    questionTypeId,
    questionSubTypeId,
    questionSubTypeValueId,
    options: question.options && question.options.length > 0 ? question.options : undefined,
    required: question.required,
    isActive: question.isActive,
    isDefault: question.isDefault || false
  };
};
