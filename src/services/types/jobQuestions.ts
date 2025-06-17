export interface ApiJobQuestion {
  id: number;
  questionText: string;
  questionTypeId: number;
  questionSubTypeId: number;
  questionSubTypeValueId: number | null;
  options: string[];
  required: boolean;
  isActive: boolean;
  isDefault: boolean;
}

export interface JobQuestionsApiResponse {
  success: boolean;
  data: ApiJobQuestion[];
  message?: string;
}


export const QUESTION_TYPES = {
  CHOICE: 1,
  TEXT: 2,
  DATE: 3,
  FILE: 4,
  RATING: 5
} as const;

export const QUESTION_SUBTYPES = {
  MULTIPLE_ANSWER: 1,   
  SINGLE_ANSWER: 2,   
  SHORT_ANSWER: 3,     
  LONG_ANSWER: 4,      
  DATE_PICKER: 5,      
  UPLOAD_FILE: 6,      
  RATING: 7            
} as const;

export const QUESTION_SUBTYPE_VALUES = {
  PLAIN_TEXT: 1,        
  EMAIL: 2,            
  URL: 3,              
  PHONE_NUMBER: 4,     
  RATING_1_TO_5: 5     
} as const;


export interface JobQuestionForm {
  id?: string;
  questionText: string;
  questionTypeId: number;
  questionSubTypeId: number;
  questionSubTypeValueId?: number | null;
  options: string[];
  required: boolean;
  isActive: boolean;
  isDefault?: boolean;
}


export type QuestionType = 'choice' | 'text' | 'date' | 'file' | 'rating';
export type QuestionSubtype = 'single' | 'multiple' | 'textarea' | 'number' | 'currency' | 'email' | 'url' | 'phone';


export const mapQuestionTypeIdToType = (typeId: number): QuestionType => {
  switch (typeId) {
    case QUESTION_TYPES.CHOICE: return 'choice';
    case QUESTION_TYPES.TEXT: return 'text';
    case QUESTION_TYPES.DATE: return 'date';
    case QUESTION_TYPES.FILE: return 'file';
    case QUESTION_TYPES.RATING: return 'rating';
    default: return 'text';
  }
};

export const mapSubtypeIdToSubtype = (subtypeId: number, subtypeValueId?: number | null): QuestionSubtype => {
  switch (subtypeId) {
    case QUESTION_SUBTYPES.SINGLE_ANSWER: return 'single';
    case QUESTION_SUBTYPES.MULTIPLE_ANSWER: return 'multiple';
    case QUESTION_SUBTYPES.SHORT_ANSWER:
      if (subtypeValueId === QUESTION_SUBTYPE_VALUES.EMAIL) return 'email';
      if (subtypeValueId === QUESTION_SUBTYPE_VALUES.URL) return 'url';
      if (subtypeValueId === QUESTION_SUBTYPE_VALUES.PHONE_NUMBER) return 'phone';
      return 'number';
    case QUESTION_SUBTYPES.LONG_ANSWER: return 'textarea';
    case QUESTION_SUBTYPES.DATE_PICKER: return 'single';
    case QUESTION_SUBTYPES.UPLOAD_FILE: return 'single';
    case QUESTION_SUBTYPES.RATING: return 'single';
    default: return 'single';
  }
};

export interface CreateJobQuestionPayload {
  questionText: string;
  questionTypeId: number;
  questionSubTypeId: number;
  questionSubTypeValueId?: number | null;
  options?: string[];
  required: boolean;
  isActive: boolean;
  isDefault: boolean;
}


export interface JobWithQuestions {

  title: string;
  occupationId: number;
  specialtyId?: number;

  questions: CreateJobQuestionPayload[];
}


export interface ApiQuestion {
  id: number;
  questionText: string;
  questionTypeId: number;
  questionSubTypeId: number;
  questionSubTypeValueId: number | null;
  options: string[];
  required: boolean;
  isActive: boolean;
  isDefault: boolean;
}

export interface CommonQuestionsResponse {
  success: boolean;
  data: ApiQuestion[];
  message?: string;
}

export const QUESTION_TYPE_MAPPING = {
  1: 'choice', 
  2: 'text',  
  3: 'date',   
  4: 'file'    
} as const;

export const QUESTION_SUBTYPE_MAPPING = {
  1: 'single',     
  2: 'single',    
  3: 'text',        
  4: 'textarea',   
  5: 'date',     
  6: 'multiple',  
  7: 'file'       
} as const;