import { ApiJobQuestion, QuestionType, QuestionSubtype, mapQuestionTypeIdToType, mapSubtypeIdToSubtype } from './jobQuestions';

export interface JobCreationDocument {
  id: string;
  documentName: string;
  documentType: 'PDF' | 'DOC' | 'JPEG' | 'PNG';
  documentDescription: string;
}

export interface JobCreationQuestion {
  id: string;
  question: string;
  type: QuestionType;
  subtype?: QuestionSubtype;
  required: boolean;
  allowMultiple: boolean;
  options?: string[];
  isDefault: boolean;
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
  documents?: JobCreationDocument[];
}

export interface ManageStepProps {
  formData: JobCreationFormData;
  onUpdateField: (field: keyof JobCreationFormData, value: any) => void;
  isEditMode?: boolean;
}

export interface QuestionFormData {
  question: string;
  type: QuestionType;
  subtype?: QuestionSubtype;
  subtypeValue?: number; 
  required: boolean;
  allowMultiple: boolean;
  isActive: boolean;
  isDefault: boolean;
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
    required: apiQuestion.required ?? false, 
    allowMultiple: allowMultiple ?? false, 
    options: apiQuestion.options || [],
    isDefault: apiQuestion.isDefault ?? false, 
    isActive: apiQuestion.isActive ?? true, 
    originalId: apiQuestion.id,
    questionTypeId: apiQuestion.questionTypeId,
    questionSubTypeId: apiQuestion.questionSubTypeId,
    questionSubTypeValueId: apiQuestion.questionSubTypeValueId
  };
};


export const mapJobCreationQuestionToApiPayload = (question: JobCreationQuestion) => {
  let questionTypeId = 1; 
  let questionSubTypeId = 2; 
  let questionSubTypeValueId: number | null = null;

  switch (question.type) {
    case 'choice':
      questionTypeId = 1;
      questionSubTypeId = question.allowMultiple ? 1 : 2;
      break;
    case 'text':
      questionTypeId = 2;
      questionSubTypeId = question.allowMultiple ? 4 : 3; 
      if (!question.allowMultiple) {
        questionSubTypeValueId = question.questionSubTypeValueId || 1; 
      }
      break;
    case 'date':
      questionTypeId = 3;
      questionSubTypeId = 5; 
      break;
    case 'file':
      questionTypeId = 4;
      questionSubTypeId = 6; 
      break;
    case 'rating':
      questionTypeId = 5;
      questionSubTypeId = 7;
      questionSubTypeValueId = 5;
      break;
  }

  return {
    questionText: question.question,
    questionTypeId,
    questionSubTypeId,
    questionSubTypeValueId,
    options: (() => {
      // Handle options based on question type
      if (questionTypeId === 1) { // Choice questions
        // For choice questions, use the actual user-provided options
        // Only use options if they exist and are not empty
        if (question.options && question.options.length > 0) {
          return question.options.filter(opt => opt && opt.trim() !== '');
        } else {
          // If no valid options provided, this should be handled by validation
          // Don't add default options automatically
          return [];
        }
      } else {
        // Non-choice questions (text, date, file, rating) don't need options
        return question.options && question.options.length > 0 ? question.options : undefined;
      }
    })(),
    required: question.required,
    isActive: question.isActive,
    isDefault: question.isDefault || false
  };
};

export const mapJobCreationDocumentToApiPayload = (document: JobCreationDocument) => {
  return {
    documentName: document.documentName,
    documentType: document.documentType,
    documentDescription: document.documentDescription
  };
};
