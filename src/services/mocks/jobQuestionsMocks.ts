import {ApiQuestion, CommonQuestionsResponse, QUESTION_TYPE_MAPPING, QUESTION_SUBTYPE_MAPPING} from '../types/jobQuestions';


export const mockApiQuestions: ApiQuestion[] = [
  {
    id: 1,
    questionText: "Do you have the license required for this position?",
    questionTypeId: 1,
    questionSubTypeId: 2,
    questionSubTypeValueId: null,
    options: ["Yes", "No"],
    required: true,
    isActive: false,
    isDefault: true
  },
  {
    id: 2,
    questionText: "What is your annual salary requirement?",
    questionTypeId: 2,
    questionSubTypeId: 3,
    questionSubTypeValueId: 1,
    options: [],
    required: true,
    isActive: false,
    isDefault: true
  },
  {
    id: 3,
    questionText: "What is your earliest available start date?",
    questionTypeId: 3,
    questionSubTypeId: 5,
    questionSubTypeValueId: null,
    options: [],
    required: false,
    isActive: false,
    isDefault: true
  },
  {
    id: 4,
    questionText: "If needed, are you willing to relocate for this role?",
    questionTypeId: 1,
    questionSubTypeId: 2,
    questionSubTypeValueId: null,
    options: ["Yes", "No"],
    required: true,
    isActive: false,
    isDefault: true
  },
  {
    id: 5,
    questionText: "Do you have a state(s) license required for this position?",
    questionTypeId: 1,
    questionSubTypeId: 2,
    questionSubTypeValueId: null,
    options: ["Yes", "No"],
    required: true,
    isActive: false,
    isDefault: true
  },
  {
    id: 6,
    questionText: "What state are you currently licensed in?",
    questionTypeId: 2,
    questionSubTypeId: 3,
    questionSubTypeValueId: 1,
    options: [],
    required: false,
    isActive: false,
    isDefault: true
  },
  {
    id: 7,
    questionText: "Do you have the required degree to apply for this position?",
    questionTypeId: 1,
    questionSubTypeId: 2,
    questionSubTypeValueId: null,
    options: ["Yes", "No"],
    required: false,
    isActive: false,
    isDefault: true
  }
];

export const getMockCommonQuestions = (): Promise<CommonQuestionsResponse> => {
  return Promise.resolve({
    success: true,
    data: mockApiQuestions
  });
};
